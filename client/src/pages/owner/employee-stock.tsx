import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export default function EmployeeStock() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch employees with stock information
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["/api/employees-stock"],
    queryFn: async () => {
      // Mock data for the example
      return [
        {
          id: 1,
          username: "employee1",
          fullName: "Karyawan Satu",
          initialStock: 80,
          addedStock: 40,
          sales: 25,
          returns: 3
        },
        {
          id: 2,
          username: "employee2",
          fullName: "Karyawan Dua",
          initialStock: 60,
          addedStock: 30,
          sales: 15,
          returns: 2
        }
      ];
    }
  });

  // Fetch employee stock details
  const { data: employeeStockDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/employees-stock/details", selectedEmployee?.id],
    enabled: !!selectedEmployee,
    queryFn: async () => {
      // Mock data for the example
      return [
        {
          id: 1,
          type: "Online",
          productName: "Voucher Data 10GB",
          price: 50000,
          initialStock: 40,
          addedStock: 20,
          sales: 12,
          returns: 1
        },
        {
          id: 2,
          type: "Offline",
          productName: "Voucher Game A",
          price: 100000,
          initialStock: 40,
          addedStock: 20,
          sales: 13,
          returns: 2
        }
      ];
    }
  });

  const viewDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDetailsOpen(true);
  };

  return (
    <SidebarLayout title="Stok Karyawan">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Daftar Stok Karyawan</h3>
            <DataTable
              data={isLoadingEmployees ? [] : employees || []}
              columns={[
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
                  )
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
                  accessorKey: (row) => row.initialStock + row.addedStock - row.sales - row.returns,
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

      {/* Employee Stock Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detail Stok {selectedEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <DataTable
              data={isLoadingDetails ? [] : employeeStockDetails || []}
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
                  cell: (row) => `Rp ${row.price.toLocaleString('id-ID')}`,
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
                  accessorKey: (row) => row.initialStock + row.addedStock - row.sales - row.returns,
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