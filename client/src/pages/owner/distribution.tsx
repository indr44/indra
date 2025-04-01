import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertDistributionSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Dialog } from "@/components/ui/dialog";
import { Eye, Download, ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";

// Form schema for distribution creation
const distributionFormSchema = insertDistributionSchema.omit({
  ownerId: true,
  createdAt: true,
}).extend({
  totalPrice: z.number().optional(), // Will be calculated
  voucherType: z.enum(["online", "offline"]), // Online or Offline voucher type
});

type DistributionFormValues = z.infer<typeof distributionFormSchema>;

export default function OwnerDistribution() {
  const { toast } = useToast();
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [isDistributionDetailsOpen, setIsDistributionDetailsOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<any>(null);

  // Fetch distributions
  const { data: distributions, isLoading: isLoadingDistributions } = useQuery({
    queryKey: ["/api/distributions"],
  });

  // Fetch employees
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Fetch vouchers
  const { data: vouchers, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  // Distribution form
  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      employeeId: 0,
      voucherId: 0,
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      // Removed paymentMethod field
      paymentStatus: "pending",
      notes: "",
      voucherType: "online", // Default to online
    },
  });

  // Calculate total price when quantity or unit price changes
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  
  if (quantity && unitPrice && typeof quantity === 'number' && typeof unitPrice === 'number') {
    const totalPrice = quantity * unitPrice;
    form.setValue("totalPrice", totalPrice);
  }

  // Create distribution mutation
  const createDistributionMutation = useMutation({
    mutationFn: async (data: DistributionFormValues) => {
      const res = await apiRequest("POST", "/api/distributions", {
        ...data,
        quantity: parseInt(data.quantity.toString()),
        unitPrice: parseFloat(data.unitPrice.toString()),
        totalPrice: parseFloat((data.totalPrice || 0).toString()),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/distributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vouchers"] });
      setIsDistributeOpen(false);
      form.reset();
      toast({
        title: "Distribution completed",
        description: "Vouchers have been distributed to the employee successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Distribution failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: DistributionFormValues) => {
    // Ensure the totalPrice is calculated
    if (!data.totalPrice && data.quantity && data.unitPrice) {
      data.totalPrice = data.quantity * data.unitPrice;
    }
    
    createDistributionMutation.mutate(data);
  };

  // Handle view distribution details
  const viewDistributionDetails = (distribution: any) => {
    setSelectedDistribution(distribution);
    setIsDistributionDetailsOpen(true);
  };

  // Check if any of the data is still loading
  const isLoading = isLoadingDistributions || isLoadingEmployees || isLoadingVouchers;

  return (
    <SidebarLayout title="Voucher Distribution">
      <div className="space-y-6">
        {/* Distribution Form */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Form Tembak Stok</h2>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsDistributeOpen(true)}
            >
              Tembak Stok
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              <p>Distribute vouchers to your employees by selecting an employee, a voucher type, and specifying the quantity.</p>
              <p>Track payment status and keep notes for future reference.</p>
            </div>

            {/* Distribution History */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Riwayat Distribusi</h3>
              <DataTable
                data={isLoading ? [] : distributions || []}
                columns={[
                  {
                    header: "ID",
                    accessorKey: "id",
                    cell: (row) => `D-${row.id.toString().padStart(3, '0')}`,
                  },
                  {
                    header: "Tanggal",
                    accessorKey: "createdAt",
                    cell: (row) => new Date(row.createdAt).toLocaleDateString('id-ID'),
                  },
                  {
                    header: "Karyawan",
                    accessorKey: (row) => {
                      const employee = employees?.find((e: any) => e.id === row.employeeId);
                      return employee ? employee.fullName : `Karyawan #${row.employeeId}`;
                    },
                  },
                  {
                    header: "Nama Barang",
                    accessorKey: (row) => {
                      const voucher = vouchers?.find((v: any) => v.id === row.voucherId);
                      return voucher ? `${voucher.namaBarang || voucher.type}` : `Voucher #${row.voucherId}`;
                    },
                  },
                  {
                    header: "Jenis Stok",
                    accessorKey: "voucherType",
                    cell: (row) => row.voucherType === "online" ? "Stok Voucher Online" : "Stok Voucher Offline",
                  },
                  {
                    header: "Jumlah",
                    accessorKey: "quantity",
                  },
                  {
                    header: "Total Harga",
                    accessorKey: "totalPrice",
                    cell: (row) => `Rp ${parseInt(row.totalPrice).toLocaleString('id-ID')}`,
                  },
                  {
                    header: "Status Pembayaran",
                    accessorKey: "paymentStatus",
                    cell: (row) => {
                      let className = "";
                      switch (row.paymentStatus) {
                        case "paid":
                          className = "bg-green-100 text-green-800";
                          break;
                        case "pending":
                          className = "bg-yellow-100 text-yellow-800";
                          break;
                        case "credit":
                          className = "bg-blue-100 text-blue-800";
                          break;
                        default:
                          className = "bg-gray-100 text-gray-800";
                      }
                      
                      return (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                          {row.paymentStatus === "paid" ? "Lunas" : 
                           row.paymentStatus === "pending" ? "Belum Bayar" : 
                           row.paymentStatus === "credit" ? "Kredit (30 hari)" : 
                           row.paymentStatus}
                        </span>
                      );
                    },
                  },
                  {
                    header: "Aksi",
                    accessorKey: (row) => row.id,
                    cell: (row) => (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => viewDistributionDetails(row)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Detail
                      </Button>
                    ),
                  },
                ]}
                searchable
                exportable
                filterable
                primaryColor="green"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Form Dialog */}
      <Dialog open={isDistributeOpen} onOpenChange={setIsDistributeOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Form Tembak Stok</DialogTitle>
            <DialogDescription>
              Pilih karyawan dan barang untuk distribusi stok.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Karyawan</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih karyawan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingEmployees ? (
                            <div className="p-2 text-center">Memuat...</div>
                          ) : employees && employees.length > 0 ? (
                            employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">Tidak ada karyawan</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="voucherType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Stok</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis stok" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online">Stok Voucher Online</SelectItem>
                          <SelectItem value="offline">Stok Voucher Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="voucherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Barang</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih barang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingVouchers ? (
                            <div className="p-2 text-center">Memuat...</div>
                          ) : vouchers && vouchers.length > 0 ? (
                            vouchers
                              .filter((voucher: any) => 
                                voucher.currentStock > 0 && 
                                ((form.watch("voucherType") === "online" && !voucher.isOffline) || 
                                 (form.watch("voucherType") === "offline" && voucher.isOffline))
                              )
                              .map((voucher: any) => (
                                <SelectItem key={voucher.id} value={voucher.id.toString()}>
                                  {voucher.namaBarang || voucher.type} ({voucher.currentStock} stok tersedia)
                                </SelectItem>
                              ))
                          ) : (
                            <div className="p-2 text-center">Tidak ada barang</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          min="1" 
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0"))}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.watch("voucherId") ? (
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const selectedVoucher = vouchers?.find((v: any) => v.id === form.watch("voucherId"));
                            return selectedVoucher ? `${selectedVoucher.currentStock} stok tersedia` : '';
                          })()}
                        </p>
                      ) : null}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga per Unit (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          step="1" 
                          min="0"
                          onChange={(e) => field.onChange(parseFloat(e.target.value || "0"))}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-gray-100" 
                          readOnly 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Pembayaran</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status pembayaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Lunas</SelectItem>
                          <SelectItem value="pending">Belum Bayar</SelectItem>
                          <SelectItem value="credit">Kredit (30 hari)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Catatan tambahan tentang distribusi ini" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDistributeOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createDistributionMutation.isPending}
                >
                  {createDistributionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Memproses...
                    </>
                  ) : (
                    <>Tembak Stok</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Distribution Details Dialog */}
      <Dialog open={isDistributionDetailsOpen} onOpenChange={setIsDistributionDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Distribusi</DialogTitle>
          </DialogHeader>
          {selectedDistribution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ID Distribusi</h4>
                  <p className="text-sm">D-{selectedDistribution.id.toString().padStart(3, '0')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tanggal</h4>
                  <p className="text-sm">{new Date(selectedDistribution.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Karyawan</h4>
                  <p className="text-sm">
                    {(() => {
                      const employee = employees?.find((e: any) => e.id === selectedDistribution.employeeId);
                      return employee ? employee.fullName : `Karyawan #${selectedDistribution.employeeId}`;
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nama Barang</h4>
                  <p className="text-sm">
                    {(() => {
                      const voucher = vouchers?.find((v: any) => v.id === selectedDistribution.voucherId);
                      return voucher ? (voucher.namaBarang || voucher.type) : `Barang #${selectedDistribution.voucherId}`;
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Jenis Stok</h4>
                  <p className="text-sm">
                    {selectedDistribution.voucherType === "online" ? "Stok Voucher Online" : "Stok Voucher Offline"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Jumlah</h4>
                  <p className="text-sm">{selectedDistribution.quantity}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Harga per Unit</h4>
                  <p className="text-sm">Rp {parseInt(selectedDistribution.unitPrice).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Harga</h4>
                  <p className="text-sm">Rp {parseInt(selectedDistribution.totalPrice).toLocaleString('id-ID')}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Status Pembayaran</h4>
                  <div className="mt-1">
                    {(() => {
                      let className = "";
                      let statusText = "";
                      switch (selectedDistribution.paymentStatus) {
                        case "paid":
                          className = "bg-green-100 text-green-800";
                          statusText = "Lunas";
                          break;
                        case "pending":
                          className = "bg-yellow-100 text-yellow-800";
                          statusText = "Belum Bayar";
                          break;
                        case "credit":
                          className = "bg-blue-100 text-blue-800";
                          statusText = "Kredit (30 hari)";
                          break;
                        default:
                          className = "bg-gray-100 text-gray-800";
                          statusText = selectedDistribution.paymentStatus;
                      }
                      
                      return (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                          {statusText}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                {selectedDistribution.notes && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Catatan</h4>
                    <p className="text-sm">{selectedDistribution.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDistributionDetailsOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    toast({
                      title: "Cetak Nota",
                      description: "Fitur cetak akan segera tersedia",
                    });
                  }}
                >
                  Cetak Nota
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
