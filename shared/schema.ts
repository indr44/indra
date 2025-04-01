import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["owner", "employee", "customer"] }).notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Voucher table for managing voucher stock
export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  initialStock: integer("initial_stock").notNull(),
  currentStock: integer("current_stock").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(), // ID of the owner who created it
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
});

export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Voucher = typeof vouchers.$inferSelect;

// Distribution table for tracking voucher distribution to employees
export const distributions = pgTable("distributions", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // ID of the owner distributing the vouchers
  employeeId: integer("employee_id").notNull(), // ID of the employee receiving the vouchers
  voucherId: integer("voucher_id").notNull(), // ID of the voucher being distributed
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status", { enum: ["paid", "pending", "credit"] }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDistributionSchema = createInsertSchema(distributions).omit({
  id: true,
  createdAt: true,
});

export type InsertDistribution = z.infer<typeof insertDistributionSchema>;
export type Distribution = typeof distributions.$inferSelect;

// Employee Stock table to track vouchers held by employees
export const employeeStocks = pgTable("employee_stocks", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  voucherId: integer("voucher_id").notNull(),
  quantity: integer("quantity").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmployeeStockSchema = createInsertSchema(employeeStocks).omit({
  id: true,
  updatedAt: true,
});

export type InsertEmployeeStock = z.infer<typeof insertEmployeeStockSchema>;
export type EmployeeStock = typeof employeeStocks.$inferSelect;

// Sales table to track voucher sales to customers
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  customerId: integer("customer_id").notNull(),
  voucherId: integer("voucher_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isOnline: boolean("is_online").notNull().default(true), // Flag for online/offline transaction
  isSynced: boolean("is_synced").notNull().default(true), // Flag for synced status
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Customer Vouchers table to track vouchers owned by customers
export const customerVouchers = pgTable("customer_vouchers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  voucherId: integer("voucher_id").notNull(),
  saleId: integer("sale_id").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerVoucherSchema = createInsertSchema(customerVouchers).omit({
  id: true,
  usedAt: true,
  createdAt: true,
});

export type InsertCustomerVoucher = z.infer<typeof insertCustomerVoucherSchema>;
export type CustomerVoucher = typeof customerVouchers.$inferSelect;
