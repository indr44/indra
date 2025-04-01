import { useState, useRef } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Trash2, Calendar, Upload, Save, FileSpreadsheet, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema untuk voucher
const voucherFormSchema = z.object({
  namaBarang: z.string().min(1, "Nama barang harus diisi"),
  hargaBarang: z.number().min(1, "Harga barang harus lebih dari 0"),
});

// Form schema untuk kode voucher
const voucherCodeSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

type VoucherFormValues = z.infer<typeof voucherFormSchema>;
type VoucherCodeValues = z.infer<typeof voucherCodeSchema>;

type StockVoucher = {
  id: number;
  namaBarang: string;
  hargaBarang: number;
  belumTerjual: number;
  belumTerjualRp: number;
  terjual: number;
  terjualRp: number;
  retur: number;
  returRp: number;
  status: string;
};

type DataVoucher = {
  id: number;
  voucherId: number;
  username: string;
  password: string;
  status: string;
  tanggalAktif: string;
  tanggalJual: string | null;
  aksi: string;
};

export default function OwnerVoucherStock() {
  const { toast } = useToast();
  const [showDataVoucher, setShowDataVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<StockVoucher | null>(null);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isAddVoucherCodeOpen, setIsAddVoucherCodeOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
  const [voucherCodes, setVoucherCodes] = useState<VoucherCodeValues[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contoh data stock voucher
  const stockVouchers: StockVoucher[] = [
    {
      id: 1,
      namaBarang: "Voucher Diskon Premium",
      hargaBarang: 750000,
      belumTerjual: 100,
      belumTerjualRp: 75000000,
      terjual: 50,
      terjualRp: 37500000,
      retur: 2,
      returRp: 1500000,
      status: "Aktif"
    },
    {
      id: 2,
      namaBarang: "Voucher Diskon Standar",
      hargaBarang: 350000,
      belumTerjual: 150,
      belumTerjualRp: 52500000,
      terjual: 75,
      terjualRp: 26250000,
      retur: 5,
      returRp: 1750000,
      status: "Aktif"
    },
    {
      id: 3,
      namaBarang: "Voucher Diskon Dasar",
      hargaBarang: 150000,
      belumTerjual: 200,
      belumTerjualRp: 30000000,
      terjual: 100,
      terjualRp: 15000000,
      retur: 3,
      returRp: 450000,
      status: "Aktif"
    }
  ];

  // Contoh data voucher
  const dataVouchers: DataVoucher[] = [
    {
      id: 1,
      voucherId: 1,
      username: "premium001",
      password: "pass123",
      status: "Belum Terjual",
      tanggalAktif: "2023-12-01",
      tanggalJual: null,
      aksi: ""
    },
    {
      id: 2,
      voucherId: 1,
      username: "premium002",
      password: "pass456",
      status: "Terjual",
      tanggalAktif: "2023-12-02",
      tanggalJual: "2024-01-15",
      aksi: ""
    },
    {
      id: 3,
      voucherId: 1,
      username: "premium003",
      password: "pass789",
      status: "Retur",
      tanggalAktif: "2023-12-03",
      tanggalJual: "2024-01-20",
      aksi: ""
    }
  ];

  // Form untuk menambah voucher baru
  const voucherForm = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      namaBarang: "",
      hargaBarang: 0,
    },
  });

  // Form untuk menambah kode voucher
  const voucherCodeForm = useForm<VoucherCodeValues>({
    resolver: zodResolver(voucherCodeSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Fungsi untuk menambahkan voucher baru
  const onSubmitVoucher = (data: VoucherFormValues) => {
    toast({
      title: "Voucher baru ditambahkan",
      description: `${data.namaBarang} dengan harga Rp ${data.hargaBarang.toLocaleString('id-ID')} berhasil dibuat.`,
    });
    setIsAddVoucherOpen(false);
    voucherForm.reset();
  };

  // Fungsi untuk menambahkan kode voucher
  const onSubmitVoucherCode = (data: VoucherCodeValues) => {
    setVoucherCodes([...voucherCodes, data]);
    voucherCodeForm.reset();
    
    toast({
      title: "Kode voucher ditambahkan",
      description: `Username: ${data.username}, Password: ${data.password} berhasil ditambahkan.`,
    });
  };

  // Fungsi untuk menyimpan semua kode voucher
  const saveAllVoucherCodes = () => {
    toast({
      title: "Semua kode voucher disimpan",
      description: `${voucherCodes.length} kode voucher berhasil disimpan.`,
    });
    setVoucherCodes([]);
    setIsAddVoucherCodeOpen(false);
  };

  // Fungsi untuk mengimpor kode voucher
  const importVoucherCodes = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler untuk file yang diupload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulasi membaca file
      const sampleCodes = [
        { username: "import001", password: "pass001" },
        { username: "import002", password: "pass002" },
        { username: "import003", password: "pass003" },
      ];
      setVoucherCodes([...voucherCodes, ...sampleCodes]);
      toast({
        title: "File berhasil diimpor",
        description: `File ${file.name} berhasil diimpor dengan ${sampleCodes.length} kode voucher`,
      });
    }
  };

  // Fungsi untuk menghapus voucher
  const confirmDeleteVoucher = () => {
    toast({
      title: "Voucher dihapus",
      description: "Voucher berhasil dihapus dari database.",
    });
    setIsDeleteDialogOpen(false);
  };

  // Fungsi untuk menampilkan data voucher
  const showVoucherDetails = (voucher: StockVoucher) => {
    setSelectedVoucher(voucher);
    setShowDataVoucher(true);
  };

  return (
    <SidebarLayout title="Stok Voucher">
      <div className="space-y-6">
        {!showDataVoucher ? (
          // Tampilkan Stok Voucher
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Stok Voucher</h2>
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
                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Filter Status:</label>
                    <Select defaultValue="all" onValueChange={(value) => {
                      toast({
                        title: "Filter Diubah",
                        description: `Filter status: ${value}`,
                      });
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Belum Terjual">Belum Terjual</SelectItem>
                        <SelectItem value="Terjual">Terjual</SelectItem>
                        <SelectItem value="Retur">Retur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                        <Input placeholder="contoh: Voucher Diskon Premium" {...field} />
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
                          placeholder="contoh: 750000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                  onClick={() => setIsAddVoucherOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Simpan Voucher
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Kode Voucher */}
      <Dialog open={isAddVoucherCodeOpen} onOpenChange={setIsAddVoucherCodeOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Tambah Kode Voucher</DialogTitle>
            <DialogDescription>
              Tambahkan username dan password untuk voucher {selectedVoucher?.namaBarang}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="manual">
            <TabsList className="mb-4">
              <TabsTrigger value="manual">Input Manual</TabsTrigger>
              <TabsTrigger value="import">Import Massal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <Form {...voucherCodeForm}>
                <form onSubmit={voucherCodeForm.handleSubmit(onSubmitVoucherCode)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Tambah ke Daftar
                  </Button>
                </form>
              </Form>
              
              {voucherCodes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Daftar Kode Voucher ({voucherCodes.length})</h3>
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">No</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Username</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {voucherCodes.map((code, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-xs text-gray-500 text-center">{index + 1}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">{code.username}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">{code.password}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="import">
              <div className="py-8 text-center border-2 border-dashed rounded-lg">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">Klik untuk memilih file atau drop file CSV/Excel di sini</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => importVoucherCodes()}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Pilih File
                </Button>
                {/* Input file tersembunyi */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-700 flex items-center">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> 
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {voucherCodes.length} kode voucher berhasil diparsing dari file
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                *Format file: CSV atau Excel dengan kolom Username dan Password
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddVoucherCodeOpen(false);
                setVoucherCodes([]);
              }}
            >
              Batal
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700"
              onClick={saveAllVoucherCodes}
              disabled={voucherCodes.length === 0}
            >
              <Save className="mr-2 h-4 w-4" /> Simpan Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen
              dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteVoucher}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}
