import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SaleReport = {
  id: number;
  employeeId: number;
  employeeName: string;
  customerId: number;
  customerName: string;
  voucherId: number;
  voucherName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  isOnline: boolean;
};

type VoucherReport = {
  id: number;
  name: string;
  provider: string;
  initialStock: number;
  currentStock: number;
  soldCount: number;
  price: number;
  createdAt: string;
};

export default function Reports() {
  const [salesData, setSalesData] = useState<SaleReport[]>([]);
  const [voucherData, setVoucherData] = useState<VoucherReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from your API
    // For now, we'll use mock data
    const mockSalesData: SaleReport[] = [
      {
        id: 1,
        employeeId: 2,
        employeeName: "Sarah Johnson",
        customerId: 3,
        customerName: "John Smith",
        voucherId: 1,
        voucherName: "Telkomsel 50K",
        quantity: 2,
        totalPrice: 100000,
        createdAt: new Date().toISOString(),
        isOnline: true,
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Johnson",
        customerId: 3,
        customerName: "John Smith",
        voucherId: 2,
        voucherName: "Indosat 25K",
        quantity: 1,
        totalPrice: 25000,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        isOnline: true,
      },
    ];

    const mockVoucherData: VoucherReport[] = [
      {
        id: 1,
        name: "Telkomsel 50K",
        provider: "Telkomsel",
        initialStock: 100,
        currentStock: 80,
        soldCount: 20,
        price: 50000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Indosat 25K",
        provider: "Indosat",
        initialStock: 50,
        currentStock: 45,
        soldCount: 5,
        price: 25000,
        createdAt: new Date().toISOString(),
      },
    ];

    setSalesData(mockSalesData);
    setVoucherData(mockVoucherData);
    setIsLoading(false);
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SidebarLayout title="Laporan">
      <div className="space-y-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">Laporan Penjualan</TabsTrigger>
            <TabsTrigger value="vouchers">Laporan Stok Voucher</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Memuat data...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Karyawan</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Voucher</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Tipe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center h-24">
                              Tidak ada data penjualan
                            </TableCell>
                          </TableRow>
                        ) : (
                          salesData.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>
                                {formatDate(sale.createdAt)}
                              </TableCell>
                              <TableCell>{sale.employeeName}</TableCell>
                              <TableCell>{sale.customerName}</TableCell>
                              <TableCell>{sale.voucherName}</TableCell>
                              <TableCell>{sale.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(sale.totalPrice)}
                              </TableCell>
                              <TableCell>
                                {sale.isOnline ? "Online" : "Offline"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Stok Voucher</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Memuat data...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Voucher</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Stok Awal</TableHead>
                          <TableHead>Stok Saat Ini</TableHead>
                          <TableHead>Terjual</TableHead>
                          <TableHead>Harga</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {voucherData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                              Tidak ada data voucher
                            </TableCell>
                          </TableRow>
                        ) : (
                          voucherData.map((voucher) => (
                            <TableRow key={voucher.id}>
                              <TableCell>{voucher.name}</TableCell>
                              <TableCell>{voucher.provider}</TableCell>
                              <TableCell>{voucher.initialStock}</TableCell>
                              <TableCell>{voucher.currentStock}</TableCell>
                              <TableCell>{voucher.soldCount}</TableCell>
                              <TableCell>
                                {formatCurrency(voucher.price)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
