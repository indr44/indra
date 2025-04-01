import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertVoucherSchema,
  insertDistributionSchema,
  insertSaleSchema,
  insertEmployeeStockSchema,
  insertCustomerVoucherSchema,
  insertUserSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const { isOwner, isEmployee, isCustomer } = setupAuth(app);

  // === OWNER ROUTES ===
  
  // Get all vouchers
  app.get("/api/vouchers", isOwner, async (req, res) => {
    try {
      const vouchers = await storage.getAllVouchers();
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vouchers" });
    }
  });

  // Create a new voucher
  app.post("/api/vouchers", isOwner, async (req, res) => {
    try {
      const voucherData = insertVoucherSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
        currentStock: req.body.initialStock
      });
      const voucher = await storage.createVoucher(voucherData);
      res.status(201).json(voucher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create voucher" });
    }
  });

  // Get an individual voucher
  app.get("/api/vouchers/:id", isOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const voucher = await storage.getVoucher(id);
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      res.json(voucher);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voucher" });
    }
  });

  // Update a voucher
  app.patch("/api/vouchers/:id", isOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const voucher = await storage.getVoucher(id);
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      
      const updatedVoucher = await storage.updateVoucher(id, req.body);
      res.json(updatedVoucher);
    } catch (error) {
      res.status(500).json({ error: "Failed to update voucher" });
    }
  });

  // Delete a voucher
  app.delete("/api/vouchers/:id", isOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVoucher(id);
      if (!deleted) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete voucher" });
    }
  });

  // Get all employees
  app.get("/api/employees", isOwner, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });
  
  // Get all customers
  app.get("/api/customers", isOwner, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  
  // Create new employee
  app.post("/api/employees", isOwner, async (req, res) => {
    try {
      // Set role to employee
      const userData = insertUserSchema.parse({
        ...req.body,
        role: "employee"
      });
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });
  
  // Create new customer
  app.post("/api/customers", isOwner, async (req, res) => {
    try {
      // Set role to customer
      const userData = insertUserSchema.parse({
        ...req.body,
        role: "customer"
      });
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });
  
  // Update user (employee or customer)
  app.patch("/api/users/:id", isOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Prevent changing role
      if (req.body.role && req.body.role !== user.role) {
        return res.status(400).json({ error: "Cannot change user role" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Delete user (employee or customer)
  app.delete("/api/users/:id", isOwner, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Prevent deleting owner account
      if (user.role === "owner") {
        return res.status(403).json({ error: "Cannot delete owner account" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Distribute vouchers to employee
  app.post("/api/distributions", isOwner, async (req, res) => {
    try {
      const distributionData = insertDistributionSchema.parse({
        ...req.body,
        ownerId: req.user!.id
      });
      
      // Verify stock availability
      const voucher = await storage.getVoucher(distributionData.voucherId);
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      
      if (voucher.currentStock < distributionData.quantity) {
        return res.status(400).json({ error: "Insufficient voucher stock" });
      }
      
      // Process distribution
      const distribution = await storage.createDistribution(distributionData);
      
      // Update voucher stock
      await storage.updateVoucher(voucher.id, {
        currentStock: voucher.currentStock - distributionData.quantity
      });
      
      // Add or update employee stock
      const existingStock = await storage.getEmployeeStockByVoucherId(
        distributionData.employeeId,
        distributionData.voucherId
      );
      
      if (existingStock) {
        await storage.updateEmployeeStock(
          existingStock.id,
          { quantity: existingStock.quantity + distributionData.quantity }
        );
      } else {
        await storage.createEmployeeStock({
          employeeId: distributionData.employeeId,
          voucherId: distributionData.voucherId,
          quantity: distributionData.quantity
        });
      }
      
      res.status(201).json(distribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to distribute vouchers" });
    }
  });

  // Get all distributions
  app.get("/api/distributions", isOwner, async (req, res) => {
    try {
      const distributions = await storage.getAllDistributions();
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch distributions" });
    }
  });

  // === EMPLOYEE ROUTES ===
  
  // Get employee stock
  app.get("/api/employee-stock", isEmployee, async (req, res) => {
    try {
      const stocks = await storage.getEmployeeStocks(req.user!.id);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee stock" });
    }
  });

  // Process a sale to customer
  app.post("/api/sales", isEmployee, async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse({
        ...req.body,
        employeeId: req.user!.id
      });
      
      // Verify employee stock availability
      const employeeStock = await storage.getEmployeeStockByVoucherId(
        req.user!.id,
        saleData.voucherId
      );
      
      if (!employeeStock || employeeStock.quantity < saleData.quantity) {
        return res.status(400).json({ error: "Insufficient voucher stock" });
      }
      
      // Process sale
      const sale = await storage.createSale(saleData);
      
      // Update employee stock
      await storage.updateEmployeeStock(
        employeeStock.id,
        { quantity: employeeStock.quantity - saleData.quantity }
      );
      
      // Create customer vouchers
      for (let i = 0; i < saleData.quantity; i++) {
        await storage.createCustomerVoucher({
          customerId: saleData.customerId,
          voucherId: saleData.voucherId,
          saleId: sale.id,
          isUsed: false
        });
      }
      
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to process sale" });
    }
  });

  // Get employee's sales
  app.get("/api/sales", isEmployee, async (req, res) => {
    try {
      const sales = await storage.getEmployeeSales(req.user!.id);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  // === CUSTOMER ROUTES ===
  
  // Get customer's vouchers
  app.get("/api/customer-vouchers", isCustomer, async (req, res) => {
    try {
      const vouchers = await storage.getCustomerVouchers(req.user!.id);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer vouchers" });
    }
  });

  // Mark a voucher as used
  app.patch("/api/customer-vouchers/:id/use", isCustomer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const voucher = await storage.getCustomerVoucher(id);
      
      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }
      
      if (voucher.customerId !== req.user!.id) {
        return res.status(403).json({ error: "You don't own this voucher" });
      }
      
      if (voucher.isUsed) {
        return res.status(400).json({ error: "Voucher already used" });
      }
      
      const updatedVoucher = await storage.updateCustomerVoucher(id, {
        isUsed: true,
        usedAt: new Date()
      });
      
      res.json(updatedVoucher);
    } catch (error) {
      res.status(500).json({ error: "Failed to use voucher" });
    }
  });

  // Get customer's transaction history
  app.get("/api/customer-transactions", isCustomer, async (req, res) => {
    try {
      const transactions = await storage.getCustomerTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
