import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export default function CustomerStock() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch customers with stock information
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["/api/customers-stock"],
    queryFn: async () => {
      // Mock data for the example
      return [
        {
          id: 1,
          username: "customer1",
          fullName: "Pelanggan Satu",
          initialStock: 20,
          addedStock: 15,
          sales: 10,
          returns: 2,
          isOnline: true,
        },
        {
          id: 2,
          username: "customer2",
          fullName: "Pelanggan Dua",
          initialStock: 15,
          addedStock: 10,
          sales: 5,
          returns: 1,
          isOnline: false,
        },
      ];
    },
  });

  // Fetch customer stock details
  const { data: customerStockDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/customers-stock/details", selectedCustomer?.id],
    enabled: !!selectedCustomer,
    queryFn: async () => {
      // Mock data for the example
      return [
        {
          id: 1,
          type: "Online",
          productName: "Voucher Data 10GB",
          price: 50000,
          initialStock: 10,
          addedStock: 7,
          sales: 5,
          returns: 1,
        },
        {
          id: 2,
          type: "Offline",
          productName: "Voucher Game A",
          price: 100000,
          initialStock: 10,
          addedStock: 8,
          sales: 5,
          returns: 1,
        },
      ];
    },
  });

  const viewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  return (
    <SidebarLayout title="Stok Pelanggan">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Daftar Stok Pelanggan</h3>
            <DataTable
              data={isLoadingCustomers ? [] : customers || []}
              columns={[
                {
                  header: "Status",
                  accessorKey: "status",
                  cell: (row) => {
                    const isOnline = row.isOnline || false;
                    return (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    );
                  },
                },
                {
                  header: "Nama User",
                  accessorKey: "fullName",
                  cell: (row) => (
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                      onClick={() => viewDetails(row)}
                    >
                      {row.fullName}
                    </Button>
                  ),
                },
                {
                  header: "Stok Awal",
                  accessorKey: "initialStock",
                },
                {
                  header: "Tambah Stok",
                  accessorKey: "addedStock",
                },
                {
                  header: "Penjualan",
                  accessorKey: "sales",
                },
                {
                  header: "Retur",
                  accessorKey: "returns",
                },
                {
                  header: "Stok Akhir",
                  accessorKey: (row) =>
                    row.initialStock + row.addedStock - row.sales - row.returns,
                },
                {
                  header: "Opsi",
                  accessorKey: "id",
                  cell: (row) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => viewDetails(row)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detail
                    </Button>
                  ),
                },
              ]}
              searchable
              filterable
              primaryColor="blue"
            />
          </CardContent>
        </Card>
      </div>

      {/* Customer Stock Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Stok {selectedCustomer?.fullName}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <DataTable
              data={isLoadingDetails ? [] : customerStockDetails || []}
              columns={[
                {
                  header: "Jenis Barang",
                  accessorKey: "type",
                },
                {
                  header: "Nama Barang",
                  accessorKey: "productName",
                },
                {
                  header: "Harga Barang",
                  accessorKey: "price",
                  cell: (row) => `Rp ${row.price.toLocaleString("id-ID")}`,
                },
                {
                  header: "Stok Awal",
                  accessorKey: "initialStock",
                },
                {
                  header: "Tambah Stok",
                  accessorKey: "addedStock",
                },
                {
                  header: "Penjualan",
                  accessorKey: "sales",
                },
                {
                  header: "Retur",
                  accessorKey: "returns",
                },
                {
                  header: "Stok Akhir",
                  accessorKey: (row) =>
                    row.initialStock + row.addedStock - row.sales - row.returns,
                },
                {
                  header: "Opsi",
                  accessorKey: "id",
                  cell: (row) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detail
                    </Button>
                  ),
                },
              ]}
              searchable
              filterable
              primaryColor="blue"
            />
          </div>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
