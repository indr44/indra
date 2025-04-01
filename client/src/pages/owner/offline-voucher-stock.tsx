import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Tipe data untuk stok voucher
interface StockVoucher {
  id: number;
  namaBarang: string;
  hargaBarang: number;
  belumTerjual: number;
  belumTerjualRp: number;
  terjual: number;
  terjualRp: number;
  retur: number;
  returRp: number;
}

// Tipe data untuk data voucher
interface DataVoucher {
  id: number;
  voucherId: number;
  username: string;
  password: string;
  status: "Belum Terjual" | "Terjual" | "Retur";
  tanggalAktif: string;
  tanggalJual: string | null;
}

// Schema validasi untuk tambah voucher
const voucherSchema = z.object({
  namaBarang: z.string().min(1, "Nama barang wajib diisi"),
  hargaBarang: z.coerce.number().min(1, "Harga barang harus lebih dari 0"),
});

// Schema validasi untuk tambah kode voucher
const voucherCodeSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  status: z.enum(["Belum Terjual", "Terjual", "Retur"]).default("Belum Terjual"),
  tanggalAktif: z.string().min(1, "Tanggal aktif wajib diisi"),
});

export default function OfflineVoucherStock() {
  const { toast } = useToast();
  const [stockVouchers, setStockVouchers] = useState<StockVoucher[]>([
    {
      id: 1,
      namaBarang: "Voucher Game A",
      hargaBarang: 50000,
      belumTerjual: 10,
      belumTerjualRp: 500000,
      terjual: 5,
      terjualRp: 250000,
      retur: 2,
      returRp: 100000
    },
    {
      id: 2,
      namaBarang: "Voucher Game B",
      hargaBarang: 100000,
      belumTerjual: 8,
      belumTerjualRp: 800000,
      terjual: 12,
      terjualRp: 1200000,
      retur: 0,
      returRp: 0
    },
    {
      id: 3,
      namaBarang: "Voucher Game C",
      hargaBarang: 25000,
      belumTerjual: 15,
      belumTerjualRp: 375000,
      terjual: 20,
      terjualRp: 500000,
      retur: 5,
      returRp: 125000
    }
  ]);
  
  const [dataVouchers, setDataVouchers] = useState<DataVoucher[]>([
    {
      id: 1,
      voucherId: 1,
      username: "user123",
      password: "pass123",
      status: "Belum Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: null
    },
    {
      id: 2,
      voucherId: 1,
      username: "user124",
      password: "pass124",
      status: "Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: "2025-04-02"
    },
    {
      id: 3,
      voucherId: 2,
      username: "userB1",
      password: "passB1",
      status: "Belum Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: null
    }
  ]);

  const [showDataVoucher, setShowDataVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<StockVoucher | null>(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isAddVoucherCodeOpen, setIsAddVoucherCodeOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form untuk tambah voucher
  const voucherForm = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      namaBarang: "",
      hargaBarang: 0,
    },
  });

  // Form untuk tambah kode voucher
  const voucherCodeForm = useForm<z.infer<typeof voucherCodeSchema>>({
    resolver: zodResolver(voucherCodeSchema),
    defaultValues: {
      username: "",
      password: "",
      status: "Belum Terjual",
      tanggalAktif: new Date().toISOString().slice(0, 10),
    },
  });

  // Handle submit tambah voucher
  const onSubmitVoucher = (values: z.infer<typeof voucherSchema>) => {
    const newVoucher: StockVoucher = {
      id: stockVouchers.length + 1,
      namaBarang: values.namaBarang,
      hargaBarang: values.hargaBarang,
      belumTerjual: 0,
      belumTerjualRp: 0,
      terjual: 0,
      terjualRp: 0,
      retur: 0,
      returRp: 0
    };
    
    setStockVouchers([...stockVouchers, newVoucher]);
    setIsAddVoucherOpen(false);
    voucherForm.reset();
    
    toast({
      title: "Berhasil",
      description: "Voucher baru telah ditambahkan",
    });
  };

  // Handle submit tambah kode voucher
  const onSubmitVoucherCode = (values: z.infer<typeof voucherCodeSchema>) => {
    if (!selectedVoucher) return;
    
    const newVoucherCode: DataVoucher = {
      id: dataVouchers.length + 1,
      voucherId: selectedVoucher.id,
      username: values.username,
      password: values.password,
      status: values.status,
      tanggalAktif: values.tanggalAktif,
      tanggalJual: values.status === "Terjual" ? new Date().toISOString().slice(0, 10) : null
    };
    
    setDataVouchers([...dataVouchers, newVoucherCode]);
    
    // Update jumlah voucher di stok
    const updatedStockVouchers = stockVouchers.map(stock => {
      if (stock.id === selectedVoucher.id) {
        let newBelumTerjual = stock.belumTerjual;
        let newTerjual = stock.terjual;
        let newRetur = stock.retur;
        
        if (values.status === "Belum Terjual") {
          newBelumTerjual += 1;
        } else if (values.status === "Terjual") {
          newTerjual += 1;
        } else if (values.status === "Retur") {
          newRetur += 1;
        }
        
        return {
          ...stock,
          belumTerjual: newBelumTerjual,
          belumTerjualRp: newBelumTerjual * stock.hargaBarang,
          terjual: newTerjual,
          terjualRp: newTerjual * stock.hargaBarang,
          retur: newRetur,
          returRp: newRetur * stock.hargaBarang
        };
      }
      return stock;
    });
    
    setStockVouchers(updatedStockVouchers);
    setIsAddVoucherCodeOpen(false);
    voucherCodeForm.reset();
    
    toast({
      title: "Berhasil",
      description: "Kode voucher telah ditambahkan",
    });
  };

  // Tampilkan detail voucher ketika nama barang di-klik
  const showVoucherDetails = (voucher: StockVoucher) => {
    setSelectedVoucher(voucher);
    setShowDataVoucher(true);
  };

  // Handle hapus voucher atau kode voucher
  const handleDelete = () => {
    if (showDataVoucher && selectedCodeId) {
      // Hapus kode voucher
      const deletedCode = dataVouchers.find(code => code.id === selectedCodeId);
      const filteredCodes = dataVouchers.filter(code => code.id !== selectedCodeId);
      setDataVouchers(filteredCodes);
      
      // Update jumlah voucher di stok
      if (deletedCode && selectedVoucher) {
        const updatedStockVouchers = stockVouchers.map(stock => {
          if (stock.id === selectedVoucher.id) {
            let newBelumTerjual = stock.belumTerjual;
            let newTerjual = stock.terjual;
            let newRetur = stock.retur;
            
            if (deletedCode.status === "Belum Terjual") {
              newBelumTerjual = Math.max(0, newBelumTerjual - 1);
            } else if (deletedCode.status === "Terjual") {
              newTerjual = Math.max(0, newTerjual - 1);
            } else if (deletedCode.status === "Retur") {
              newRetur = Math.max(0, newRetur - 1);
            }
            
            return {
              ...stock,
              belumTerjual: newBelumTerjual,
              belumTerjualRp: newBelumTerjual * stock.hargaBarang,
              terjual: newTerjual,
              terjualRp: newTerjual * stock.hargaBarang,
              retur: newRetur,
              returRp: newRetur * stock.hargaBarang
            };
          }
          return stock;
        });
        
        setStockVouchers(updatedStockVouchers);
      }
      
      toast({
        title: "Berhasil Dihapus",
        description: "Kode voucher telah dihapus",
      });
    } else if (selectedVoucherId) {
      // Hapus voucher
      setStockVouchers(stockVouchers.filter(v => v.id !== selectedVoucherId));
      // Hapus semua kode voucher terkait
      setDataVouchers(dataVouchers.filter(v => v.voucherId !== selectedVoucherId));
      
      toast({
        title: "Berhasil Dihapus",
        description: "Voucher telah dihapus",
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedVoucherId(null);
    setSelectedCodeId(null);
  };

  return (
    <SidebarLayout title="Stok Voucher Offline">
      <div className="space-y-6">
        {!showDataVoucher ? (
          // Tampilkan Stok Voucher Offline
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Stok Voucher Offline</h2>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsAddVoucherOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Barang
              </Button>
            </div>
            <CardContent className="p-6">
              <DataTable
                data={stockVouchers}
                columns={[
                  {
                    header: "Nama Barang",
                    accessorKey: "namaBarang",
                    cell: (row) => (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                        onClick={() => showVoucherDetails(row)}
                      >
                        {row.namaBarang}
                      </Button>
                    )
                  },
                  {
                    header: "Harga Barang",
                    accessorKey: "hargaBarang",
                    cell: (row) => `Rp ${row.hargaBarang.toLocaleString('id-ID')}`,
                  },
                  {
                    header: "Belum Terjual",
                    accessorKey: "belumTerjual",
                  },
                  {
                    header: "Belum Terjual (Rp)",
                    accessorKey: "belumTerjualRp",
                    cell: (row) => `Rp ${row.belumTerjualRp.toLocaleString('id-ID')}`,
                  },
                  {
                    header: "Terjual",
                    accessorKey: "terjual",
                  },
                  {
                    header: "Terjual (Rp)",
                    accessorKey: "terjualRp",
                    cell: (row) => `Rp ${row.terjualRp.toLocaleString('id-ID')}`,
                  },
                  {
                    header: "Retur",
                    accessorKey: "retur",
                  },
                  {
                    header: "Retur (Rp)",
                    accessorKey: "returRp",
                    cell: (row) => `Rp ${row.returRp.toLocaleString('id-ID')}`,
                  },
                  {
                    header: "Opsi",
                    accessorKey: "id",
                    cell: (row) => (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            toast({
                              title: "Edit Voucher",
                              description: "Fitur edit sedang dikembangkan.",
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedVoucherId(row.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                searchable
                pagination
                primaryColor="green"
              />
            </CardContent>
          </Card>
        ) : (
          // Tampilkan Data Voucher
          <div className="space-y-6">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDataVoucher(false)}
                    className="mr-2"
                  >
                    ← Kembali
                  </Button>
                  <h2 className="font-semibold text-gray-800">
                    Data Voucher - {selectedVoucher?.namaBarang}
                  </h2>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setIsAddVoucherCodeOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kode Voucher
                </Button>
              </div>
              <CardContent className="p-6">
                {/* Status summary boxes */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <h3 className="text-xl font-semibold text-green-800">
                      {dataVouchers.filter(v => v.voucherId === selectedVoucher?.id).length}
                    </h3>
                    <p className="text-sm text-green-700">Semua</p>
                    <p className="text-xs text-green-600 mt-1">
                      Rp {(dataVouchers.filter(v => v.voucherId === selectedVoucher?.id).length * (selectedVoucher?.hargaBarang || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                    <h3 className="text-xl font-semibold text-blue-800">
                      {dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Belum Terjual").length}
                    </h3>
                    <p className="text-sm text-blue-700">Belum Terjual</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Rp {(dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Belum Terjual").length * (selectedVoucher?.hargaBarang || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4 text-center">
                    <h3 className="text-xl font-semibold text-red-800">
                      {dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Terjual").length}
                    </h3>
                    <p className="text-sm text-red-700">Terjual</p>
                    <p className="text-xs text-red-600 mt-1">
                      Rp {(dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Terjual").length * (selectedVoucher?.hargaBarang || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                    <h3 className="text-xl font-semibold text-yellow-800">
                      {dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Retur").length}
                    </h3>
                    <p className="text-sm text-yellow-700">Retur</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Rp {(dataVouchers.filter(v => v.voucherId === selectedVoucher?.id && v.status === "Retur").length * (selectedVoucher?.hargaBarang || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                
                {/* Filter toggle button */}
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="mb-2"
                  >
                    {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                  </Button>
                </div>
                
                {/* Filter Controls */}
                {showFilters && (
                  <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Tanggal Aktif:</label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="date" 
                          className="w-[150px]" 
                          onChange={(e) => {
                            if (e.target.value) {
                              toast({
                                title: "Filter Diubah",
                                description: `Filter tanggal aktif dari: ${e.target.value}`,
                              });
                            }
                          }} 
                        />
                        <span>-</span>
                        <Input 
                          type="date" 
                          className="w-[150px]" 
                          onChange={(e) => {
                            if (e.target.value) {
                              toast({
                                title: "Filter Diubah",
                                description: `Filter tanggal aktif sampai: ${e.target.value}`,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Tanggal Jual:</label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="date" 
                          className="w-[150px]" 
                          onChange={(e) => {
                            if (e.target.value) {
                              toast({
                                title: "Filter Diubah",
                                description: `Filter tanggal jual dari: ${e.target.value}`,
                              });
                            }
                          }}
                        />
                        <span>-</span>
                        <Input 
                          type="date" 
                          className="w-[150px]" 
                          onChange={(e) => {
                            if (e.target.value) {
                              toast({
                                title: "Filter Diubah",
                                description: `Filter tanggal jual sampai: ${e.target.value}`,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Filter Direset",
                          description: "Semua filter telah dihapus",
                        });
                      }}
                    >
                      Reset Filter
                    </Button>
                  </div>
                )}
                
                <DataTable
                  data={dataVouchers.filter(v => v.voucherId === selectedVoucher?.id)}
                  columns={[
                    {
                      header: "Username",
                      accessorKey: "username",
                    },
                    {
                      header: "Password",
                      accessorKey: "password",
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: (row) => {
                        let className = "bg-blue-100 text-blue-800";
                        
                        if (row.status === "Terjual") {
                          className = "bg-green-100 text-green-800";
                        } else if (row.status === "Retur") {
                          className = "bg-red-100 text-red-800";
                        }
                        
                        return (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                            {row.status}
                          </span>
                        );
                      },
                    },
                    {
                      header: "Tanggal Aktif",
                      accessorKey: "tanggalAktif",
                      cell: (row) => new Date(row.tanggalAktif).toLocaleDateString('id-ID'),
                    },
                    {
                      header: "Tanggal Jual",
                      accessorKey: "tanggalJual",
                      cell: (row) => row.tanggalJual ? new Date(row.tanggalJual).toLocaleDateString('id-ID') : "-",
                    },
                    {
                      header: "Opsi",
                      accessorKey: "id",
                      cell: (row) => (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              toast({
                                title: "Edit Kode Voucher",
                                description: "Fitur edit sedang dikembangkan.",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedCodeId(row.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  searchable
                  pagination
                  primaryColor="green"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog Tambah Voucher */}
      <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Tambah Voucher Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi untuk menambahkan produk voucher baru
            </DialogDescription>
          </DialogHeader>
          <Form {...voucherForm}>
            <form onSubmit={voucherForm.handleSubmit(onSubmitVoucher)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={voucherForm.control}
                  name="namaBarang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Barang</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama barang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={voucherForm.control}
                  name="hargaBarang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Barang (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsAddVoucherOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Kode Voucher */}
      <Dialog open={isAddVoucherCodeOpen} onOpenChange={setIsAddVoucherCodeOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Tambah Kode Voucher</DialogTitle>
            <DialogDescription>
              Masukkan informasi untuk menambahkan kode voucher baru
            </DialogDescription>
          </DialogHeader>
          <Form {...voucherCodeForm}>
            <form onSubmit={voucherCodeForm.handleSubmit(onSubmitVoucherCode)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={voucherCodeForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={voucherCodeForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={voucherCodeForm.control}
                  name="tanggalAktif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Aktif</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsAddVoucherCodeOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}