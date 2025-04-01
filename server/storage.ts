import { users, 
  vouchers, 
  distributions, 
  employeeStocks, 
  sales, 
  customerVouchers, 
  type User, 
  type InsertUser,
  type Voucher,
  type InsertVoucher,
  type Distribution,
  type InsertDistribution,
  type EmployeeStock,
  type InsertEmployeeStock,
  type Sale,
  type InsertSale,
  type CustomerVoucher,
  type InsertCustomerVoucher 
} from "@shared/schema";

import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Define interface for all storage operations
export interface IStorage {
  // Session store
  sessionStore: any; // Using 'any' for session store type

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getAllEmployees(): Promise<User[]>;
  getAllCustomers(): Promise<User[]>;

  // Voucher operations
  createVoucher(voucher: InsertVoucher): Promise<Voucher>;
  getVoucher(id: number): Promise<Voucher | undefined>;
  getAllVouchers(): Promise<Voucher[]>;
  updateVoucher(id: number, data: Partial<Voucher>): Promise<Voucher>;
  deleteVoucher(id: number): Promise<boolean>;

  // Distribution operations
  createDistribution(distribution: InsertDistribution): Promise<Distribution>;
  getAllDistributions(): Promise<Distribution[]>;

  // Employee stock operations
  createEmployeeStock(stock: InsertEmployeeStock): Promise<EmployeeStock>;
  getEmployeeStocks(employeeId: number): Promise<EmployeeStock[]>;
  getEmployeeStockByVoucherId(employeeId: number, voucherId: number): Promise<EmployeeStock | undefined>;
  updateEmployeeStock(id: number, data: Partial<EmployeeStock>): Promise<EmployeeStock>;

  // Sales operations
  createSale(sale: InsertSale): Promise<Sale>;
  getEmployeeSales(employeeId: number): Promise<Sale[]>;

  // Customer voucher operations
  createCustomerVoucher(voucher: InsertCustomerVoucher): Promise<CustomerVoucher>;
  getCustomerVouchers(customerId: number): Promise<CustomerVoucher[]>;
  getCustomerVoucher(id: number): Promise<CustomerVoucher | undefined>;
  updateCustomerVoucher(id: number, data: Partial<CustomerVoucher>): Promise<CustomerVoucher>;
  getCustomerTransactions(customerId: number): Promise<Sale[]>;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private voucherStore: Map<number, Voucher>;
  private distributionStore: Map<number, Distribution>;
  private employeeStockStore: Map<number, EmployeeStock>;
  private saleStore: Map<number, Sale>;
  private customerVoucherStore: Map<number, CustomerVoucher>;
  
  sessionStore: any;
  currentUserId: number;
  currentVoucherId: number;
  currentDistributionId: number;
  currentEmployeeStockId: number;
  currentSaleId: number;
  currentCustomerVoucherId: number;

  constructor() {
    this.userStore = new Map();
    this.voucherStore = new Map();
    this.distributionStore = new Map();
    this.employeeStockStore = new Map();
    this.saleStore = new Map();
    this.customerVoucherStore = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.currentUserId = 1;
    this.currentVoucherId = 1;
    this.currentDistributionId = 1;
    this.currentEmployeeStockId = 1;
    this.currentSaleId = 1;
    this.currentCustomerVoucherId = 1;

    // Initialize with some sample users
    this.seedInitialUsers();
  }

  private seedInitialUsers() {
    const adminPass = "$2a$10$JqZkkRA1V9.L8E9fHYEcgOSZ8Qf.Wn9TBbQQft.HjJMYXdDlgWTvS.bb49c02b86c23dc9d3fd95428e71f65";
    const userPass = "$2a$10$JqZkkRA1V9.L8E9fHYEcgOSZ8Qf.Wn9TBbQQft.HjJMYXdDlgWTvS.bb49c02b86c23dc9d3fd95428e71f65";
    
    this.userStore.set(1, {
      id: 1,
      username: "owner",
      password: adminPass,
      fullName: "Admin Owner",
      role: "owner",
      whatsapp: "628111222333",
      address: "Jalan Utama No. 1, Jakarta Pusat",
      location: "https://maps.google.com/?q=-6.175110,106.865036",
      profileImage: "https://i.pravatar.cc/300?img=1",
      createdAt: new Date()
    });
    
    this.userStore.set(2, {
      id: 2,
      username: "employee",
      password: userPass,
      fullName: "Sarah Johnson",
      role: "employee",
      whatsapp: "628222333444",
      address: "Jalan Harapan No. 23, Jakarta Selatan",
      location: "https://maps.google.com/?q=-6.260697,106.781612",
      profileImage: "https://i.pravatar.cc/300?img=5",
      createdAt: new Date()
    });
    
    this.userStore.set(3, {
      id: 3,
      username: "customer",
      password: userPass,
      fullName: "John Smith",
      role: "customer",
      whatsapp: "628333444555",
      address: "Jalan Damai No. 45, Jakarta Barat",
      location: "https://maps.google.com/?q=-6.198582,106.800603",
      profileImage: "https://i.pravatar.cc/300?img=8",
      createdAt: new Date()
    });
    
    this.currentUserId = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    
    // Ensure all required fields are set with proper defaults
    const user: User = { 
      ...userData, 
      id, 
      createdAt: new Date(), 
      role: userData.role || "customer", 
      whatsapp: userData.whatsapp || null,
      address: userData.address || null,
      location: userData.location || null,
      profileImage: userData.profileImage || null
    };
    
    this.userStore.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.userStore.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...data };
    this.userStore.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userStore.delete(id);
  }

  async getAllEmployees(): Promise<User[]> {
    return Array.from(this.userStore.values()).filter(
      (user) => user.role === "employee"
    );
  }

  async getAllCustomers(): Promise<User[]> {
    return Array.from(this.userStore.values()).filter(
      (user) => user.role === "customer"
    );
  }

  // Voucher operations
  async createVoucher(voucherData: InsertVoucher): Promise<Voucher> {
    const id = this.currentVoucherId++;
    const voucher: Voucher = { 
      ...voucherData, 
      id, 
      createdAt: new Date(),
      supplier: voucherData.supplier || null
    };
    this.voucherStore.set(id, voucher);
    return voucher;
  }

  async getVoucher(id: number): Promise<Voucher | undefined> {
    return this.voucherStore.get(id);
  }

  async getAllVouchers(): Promise<Voucher[]> {
    return Array.from(this.voucherStore.values());
  }

  async updateVoucher(id: number, data: Partial<Voucher>): Promise<Voucher> {
    const voucher = this.voucherStore.get(id);
    if (!voucher) throw new Error("Voucher not found");
    
    const updatedVoucher = { ...voucher, ...data };
    this.voucherStore.set(id, updatedVoucher);
    return updatedVoucher;
  }

  async deleteVoucher(id: number): Promise<boolean> {
    return this.voucherStore.delete(id);
  }

  // Distribution operations
  async createDistribution(distributionData: InsertDistribution): Promise<Distribution> {
    const id = this.currentDistributionId++;
    const distribution: Distribution = { 
      ...distributionData, 
      id, 
      createdAt: new Date(),
      notes: distributionData.notes || null
    };
    this.distributionStore.set(id, distribution);
    return distribution;
  }

  async getAllDistributions(): Promise<Distribution[]> {
    return Array.from(this.distributionStore.values());
  }

  // Employee stock operations
  async createEmployeeStock(stockData: InsertEmployeeStock): Promise<EmployeeStock> {
    const id = this.currentEmployeeStockId++;
    const stock: EmployeeStock = { ...stockData, id, updatedAt: new Date() };
    this.employeeStockStore.set(id, stock);
    return stock;
  }

  async getEmployeeStocks(employeeId: number): Promise<EmployeeStock[]> {
    return Array.from(this.employeeStockStore.values()).filter(
      (stock) => stock.employeeId === employeeId
    );
  }

  async getEmployeeStockByVoucherId(employeeId: number, voucherId: number): Promise<EmployeeStock | undefined> {
    return Array.from(this.employeeStockStore.values()).find(
      (stock) => stock.employeeId === employeeId && stock.voucherId === voucherId
    );
  }

  async updateEmployeeStock(id: number, data: Partial<EmployeeStock>): Promise<EmployeeStock> {
    const stock = this.employeeStockStore.get(id);
    if (!stock) throw new Error("Employee stock not found");
    
    const updatedStock = { ...stock, ...data, updatedAt: new Date() };
    this.employeeStockStore.set(id, updatedStock);
    return updatedStock;
  }

  // Sales operations
  async createSale(saleData: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = { 
      ...saleData, 
      id, 
      createdAt: new Date(),
      notes: saleData.notes || null,
      isOnline: saleData.isOnline ?? true,
      isSynced: saleData.isSynced ?? true 
    };
    this.saleStore.set(id, sale);
    return sale;
  }

  async getEmployeeSales(employeeId: number): Promise<Sale[]> {
    return Array.from(this.saleStore.values()).filter(
      (sale) => sale.employeeId === employeeId
    );
  }

  // Customer voucher operations
  async createCustomerVoucher(voucherData: InsertCustomerVoucher): Promise<CustomerVoucher> {
    const id = this.currentCustomerVoucherId++;
    const voucher: CustomerVoucher = { 
      ...voucherData, 
      id, 
      createdAt: new Date(),
      usedAt: null
    };
    this.customerVoucherStore.set(id, voucher);
    return voucher;
  }

  async getCustomerVouchers(customerId: number): Promise<CustomerVoucher[]> {
    return Array.from(this.customerVoucherStore.values()).filter(
      (voucher) => voucher.customerId === customerId
    );
  }

  async getCustomerVoucher(id: number): Promise<CustomerVoucher | undefined> {
    return this.customerVoucherStore.get(id);
  }

  async updateCustomerVoucher(id: number, data: Partial<CustomerVoucher>): Promise<CustomerVoucher> {
    const voucher = this.customerVoucherStore.get(id);
    if (!voucher) throw new Error("Customer voucher not found");
    
    const updatedVoucher = { ...voucher, ...data };
    this.customerVoucherStore.set(id, updatedVoucher);
    return updatedVoucher;
  }

  async getCustomerTransactions(customerId: number): Promise<Sale[]> {
    return Array.from(this.saleStore.values()).filter(
      (sale) => sale.customerId === customerId
    );
  }
}

export const storage = new MemStorage();
