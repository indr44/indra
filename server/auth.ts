import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "voucher-management-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // For development environment, create a mock user
    if (process.env.NODE_ENV !== 'production') {
      // Check URL referer to determine role
      const referer = req.headers.referer || '';
      let role = 'owner'; // default role
      
      if (referer.includes('/employee/')) {
        role = 'employee';
      } else if (referer.includes('/customer/')) {
        role = 'customer';
      } else if (referer.includes('/owner/')) {
        role = 'owner';
      }
      
      // Return a mock user based on the referer path
      return res.json({
        id: role === 'owner' ? 1 : role === 'employee' ? 2 : 3,
        username: `dev_${role}`,
        fullName: `Development ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role,
        createdAt: new Date()
      });
    }
    
    // Production check
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Authorization middleware for different roles
  const isOwner = (req: Request, res: Response, next: NextFunction) => {
    // For development environment, bypass authentication
    if (process.env.NODE_ENV !== 'production') {
      // Create a mock user if not authenticated
      if (!req.isAuthenticated()) {
        // Mock user based on the path
        (req as any).user = {
          id: 1,
          role: "owner",
          fullName: "Development Owner",
          username: "dev_owner"
        };
      }
      return next();
    }
    
    // Production environment authentication check
    if (!req.isAuthenticated() || req.user?.role !== "owner") {
      return res.status(403).json({ message: "Unauthorized: Owner access required" });
    }
    next();
  };

  const isEmployee = (req: Request, res: Response, next: NextFunction) => {
    // For development environment, bypass authentication
    if (process.env.NODE_ENV !== 'production') {
      // Create a mock user if not authenticated
      if (!req.isAuthenticated()) {
        // Mock user based on the path
        (req as any).user = {
          id: 2,
          role: "employee",
          fullName: "Development Employee",
          username: "dev_employee"
        };
      }
      return next();
    }
    
    // Production environment authentication check
    if (!req.isAuthenticated() || req.user?.role !== "employee") {
      return res.status(403).json({ message: "Unauthorized: Employee access required" });
    }
    next();
  };

  const isCustomer = (req: Request, res: Response, next: NextFunction) => {
    // For development environment, bypass authentication
    if (process.env.NODE_ENV !== 'production') {
      // Create a mock user if not authenticated
      if (!req.isAuthenticated()) {
        // Mock user based on the path
        (req as any).user = {
          id: 3,
          role: "customer",
          fullName: "Development Customer",
          username: "dev_customer"
        };
      }
      return next();
    }
    
    // Production environment authentication check
    if (!req.isAuthenticated() || req.user?.role !== "customer") {
      return res.status(403).json({ message: "Unauthorized: Customer access required" });
    }
    next();
  };

  // Export middleware for use in routes
  return { isOwner, isEmployee, isCustomer };
}
