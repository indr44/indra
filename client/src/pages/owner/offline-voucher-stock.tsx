import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  stokAkhir?: number;
  stokAkhirRp?: number;
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
  status: z
    .enum(["Belum Terjual", "Terjual", "Retur"])
    .default("Belum Terjual"),
  tanggalAktif: z.string().min(1, "Tanggal aktif wajib diisi"),
});

// Schema validasi untuk tambah stok
const addStockSchema = z.object({
  voucherId: z.number().min(1, "Pilih barang terlebih dahulu"),
  quantity: z.coerce.number().min(1, "Jumlah stok minimal 1"),
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
      returRp: 100000,
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
      returRp: 0,
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
      returRp: 125000,
    },
  ]);

  const [dataVouchers, setDataVouchers] = useState<DataVoucher[]>([
    {
      id: 1,
      voucherId: 1,
      username: "user123",
      password: "pass123",
      status: "Belum Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: null,
    },
    {
      id: 2,
      voucherId: 1,
      username: "user124",
      password: "pass124",
      status: "Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: "2025-04-02",
    },
    {
      id: 3,
      voucherId: 2,
      username: "userB1",
      password: "passB1",
      status: "Belum Terjual",
      tanggalAktif: "2025-04-01",
      tanggalJual: null,
    },
  ]);

  // Menghapus state showDataVoucher karena tidak perlu menampilkan tabel data voucher
  const [selectedVoucher, setSelectedVoucher] = useState<StockVoucher | null>(
    null,
  );
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isAddVoucherCodeOpen, setIsAddVoucherCodeOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stockHistoryData, setStockHistoryData] = useState<
    {
      date: string;
      belumTerjual: number;
      terjual: number;
      retur: number;
      stokAkhir: number;
    }[]
  >([]);

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

  // Form untuk tambah stok
  const addStockForm = useForm<z.infer<typeof addStockSchema>>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      voucherId: 0,
      quantity: 1,
    },
  });

  // Handle submit tambah voucher
  const onSubmitVoucher = (values: z.infer<typeof voucherSchema>) => {
    const newVoucher: StockVoucher = {
      id:
        stockVouchers.length > 0
          ? Math.max(...stockVouchers.map((v) => v.id)) + 1
          : 1,
      namaBarang: values.namaBarang,
      hargaBarang: values.hargaBarang,
      belumTerjual: 0,
      belumTerjualRp: 0,
      terjual: 0,
      terjualRp: 0,
      retur: 0,
      returRp: 0,
      stokAkhir: 0,
      stokAkhirRp: 0,
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
      id:
        dataVouchers.length > 0
          ? Math.max(...dataVouchers.map((v) => v.id)) + 1
          : 1,
      voucherId: selectedVoucher.id,
      username: values.username,
      password: values.password,
      status: values.status,
      tanggalAktif: values.tanggalAktif,
      tanggalJual:
        values.status === "Terjual"
          ? new Date().toISOString().slice(0, 10)
          : null,
    };

    setDataVouchers([...dataVouchers, newVoucherCode]);

    // Update jumlah voucher di stok
    const updatedStockVouchers = stockVouchers.map((stock) => {
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

        // Calculate stokAkhir using the formula: belumTerjual - terjual - retur = stokAkhir
        const newStokAkhir = newBelumTerjual - newTerjual - newRetur;
        const newStokAkhirRp = newStokAkhir * stock.hargaBarang;

        return {
          ...stock,
          belumTerjual: newBelumTerjual,
          belumTerjualRp: newBelumTerjual * stock.hargaBarang,
          terjual: newTerjual,
          terjualRp: newTerjual * stock.hargaBarang,
          retur: newRetur,
          returRp: newRetur * stock.hargaBarang,
          stokAkhir: newStokAkhir,
          stokAkhirRp: newStokAkhirRp,
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

  // Handle submit tambah stok
  const onSubmitAddStock = (values: z.infer<typeof addStockSchema>) => {
    const selectedStock = stockVouchers.find(
      (stock) => stock.id === values.voucherId,
    );
    if (!selectedStock) return;

    // Update stock voucher
    const updatedStockVouchers = stockVouchers.map((stock) => {
      if (stock.id === values.voucherId) {
        const newBelumTerjual = stock.belumTerjual + values.quantity;
        const newBelumTerjualRp = newBelumTerjual * stock.hargaBarang;
        // Calculate stokAkhir using the formula: belumTerjual - terjual - retur = stokAkhir
        const newStokAkhir = newBelumTerjual - stock.terjual - stock.retur;
        const newStokAkhirRp = newStokAkhir * stock.hargaBarang;

        return {
          ...stock,
          belumTerjual: newBelumTerjual,
          belumTerjualRp: newBelumTerjualRp,
          stokAkhir: newStokAkhir,
          stokAkhirRp: newStokAkhirRp,
        };
      }
      return stock;
    });

    setStockVouchers(updatedStockVouchers);

    // Add to history data
    const today = new Date().toISOString().slice(0, 10);
    const existingHistoryIndex = stockHistoryData.findIndex(
      (item) => item.date === today,
    );

    if (existingHistoryIndex >= 0) {
      // Update existing history entry
      const updatedHistory = [...stockHistoryData];
      const entry = updatedHistory[existingHistoryIndex];
      updatedHistory[existingHistoryIndex] = {
        ...entry,
        belumTerjual: entry.belumTerjual + values.quantity,
        stokAkhir: entry.stokAkhir + values.quantity,
      };
      setStockHistoryData(updatedHistory);
    } else {
      // Create new history entry
      const updatedStock = updatedStockVouchers.find(
        (stock) => stock.id === values.voucherId,
      );
      if (updatedStock) {
        setStockHistoryData([
          ...stockHistoryData,
          {
            date: today,
            belumTerjual: values.quantity,
            terjual: 0,
            retur: 0,
            stokAkhir: values.quantity,
          },
        ]);
      }
    }

    setIsAddStockOpen(false);
    addStockForm.reset();

    toast({
      title: "Berhasil",
      description: `${values.quantity} stok berhasil ditambahkan ke ${selectedStock.namaBarang}`,
    });
  };

  // Function untuk menampilkan pesan notifikasi
  const showNotification = (title: string, message: string) => {
    toast({
      title,
      description: message,
    });
  };

  // Handle hapus voucher atau kode voucher
  const handleDelete = () => {
    if (selectedVoucherId) {
      // Hapus voucher
      setStockVouchers(stockVouchers.filter((v) => v.id !== selectedVoucherId));
      // Hapus semua kode voucher terkait
      setDataVouchers(
        dataVouchers.filter((v) => v.voucherId !== selectedVoucherId),
      );

      toast({
        title: "Berhasil Dihapus",
        description: "Voucher telah dihapus",
      });
    }

    setIsDeleteDialogOpen(false);
    setSelectedVoucherId(null);
    setSelectedCodeId(null);
  };

  // Function to show history dialog
  const showHistoryDialog = (voucher: StockVoucher) => {
    setSelectedVoucher(voucher);
    setSelectedVoucherId(voucher.id);

    // Generate some history data if empty
    if (stockHistoryData.length === 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      setStockHistoryData([
        {
          date: twoDaysAgo.toISOString().slice(0, 10),
          belumTerjual: 10,
          terjual: 2,
          retur: 1,
          stokAkhir: 7,
        },
        {
          date: yesterday.toISOString().slice(0, 10),
          belumTerjual: 12,
          terjual: 3,
          retur: 1,
          stokAkhir: 8,
        },
        {
          date: today.toISOString().slice(0, 10),
          belumTerjual: 15,
          terjual: 5,
          retur: 2,
          stokAkhir: 8,
        },
      ]);
    }

    setIsHistoryOpen(true);
  };

  return (
    <SidebarLayout title="Stok Voucher Offline">
      <div className="space-y-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              Stok Voucher Offline
            </h2>
            <div className="flex space-x-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsAddStockOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Stok
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsAddVoucherOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Barang
              </Button>
            </div>
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
                      onClick={() => showHistoryDialog(row)}
                    >
                      {row.namaBarang}
                    </Button>
                  ),
                },
                {
                  header: "Harga Barang",
                  accessorKey: "hargaBarang",
                  cell: (row) => (
                    <span>Rp {row.hargaBarang.toLocaleString("id-ID")}</span>
                  ),
                },
                {
                  header: "Belum Terjual",
                  accessorKey: "belumTerjual",
                },
                {
                  header: "Belum Terjual (Rp)",
                  accessorKey: "belumTerjualRp",
                  cell: (row) => (
                    <span>Rp {row.belumTerjualRp.toLocaleString("id-ID")}</span>
                  ),
                },
                {
                  header: "Terjual",
                  accessorKey: "terjual",
                },
                {
                  header: "Terjual (Rp)",
                  accessorKey: "terjualRp",
                  cell: (row) => (
                    <span>Rp {row.terjualRp.toLocaleString("id-ID")}</span>
                  ),
                },
                {
                  header: "Retur",
                  accessorKey: "retur",
                },
                {
                  header: "Retur (Rp)",
                  accessorKey: "returRp",
                  cell: (row) => (
                    <span>Rp {row.returRp.toLocaleString("id-ID")}</span>
                  ),
                },
                {
                  header: "Stok Akhir",
                  accessorKey: "stokAkhir",
                  cell: (row) => {
                    // Calculate stokAkhir on the fly using the formula
                    const stokAkhir =
                      row.belumTerjual - row.terjual - row.retur;
                    return <span>{stokAkhir}</span>;
                  },
                },
                {
                  header: "Stok Akhir (Rp)",
                  accessorKey: "stokAkhirRp",
                  cell: (row) => {
                    // Calculate stokAkhirRp on the fly
                    const stokAkhir =
                      row.belumTerjual - row.terjual - row.retur;
                    const stokAkhirRp = stokAkhir * row.hargaBarang;
                    return (
                      <span>Rp {stokAkhirRp.toLocaleString("id-ID")}</span>
                    );
                  },
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
                        onClick={() => showHistoryDialog(row)}
                      >
                        Detail
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
            <form
              onSubmit={voucherForm.handleSubmit(onSubmitVoucher)}
              className="space-y-6"
            >
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddVoucherOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Kode Voucher */}
      <Dialog
        open={isAddVoucherCodeOpen}
        onOpenChange={setIsAddVoucherCodeOpen}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Tambah Kode Voucher</DialogTitle>
            <DialogDescription>
              Masukkan informasi untuk menambahkan kode voucher baru
            </DialogDescription>
          </DialogHeader>
          <Form {...voucherCodeForm}>
            <form
              onSubmit={voucherCodeForm.handleSubmit(onSubmitVoucherCode)}
              className="space-y-6"
            >
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddVoucherCodeOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Simpan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Tambah Stok */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Tambah Stok Voucher</DialogTitle>
            <DialogDescription>
              Pilih voucher dan tambahkan stok
            </DialogDescription>
          </DialogHeader>
          <Form {...addStockForm}>
            <form
              onSubmit={addStockForm.handleSubmit(onSubmitAddStock)}
              className="space-y-6"
            >
              {stockVouchers.length > 0 ? (
                <div className="space-y-4">
                  <FormField
                    control={addStockForm.control}
                    name="voucherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Barang</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih barang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stockVouchers.map((stock) => (
                              <SelectItem
                                key={stock.id}
                                value={stock.id.toString()}
                              >
                                {stock.namaBarang} - Rp{" "}
                                {stock.hargaBarang.toLocaleString("id-ID")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addStockForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Stok</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <Label>Total Harga</Label>
                      <Input
                        type="text"
                        disabled
                        value={(() => {
                          const voucherId = addStockForm.watch("voucherId");
                          const quantity = addStockForm.watch("quantity") || 0;
                          const selectedVoucher = stockVouchers.find(
                            (s) => s.id === voucherId,
                          );
                          if (selectedVoucher) {
                            return `Rp ${(selectedVoucher.hargaBarang * quantity).toLocaleString("id-ID")}`;
                          }
                          return "Rp 0";
                        })()}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Tidak ada barang tersedia. Tambahkan barang terlebih dahulu.
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddStockOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!addStockForm.watch("voucherId")}
                >
                  Tambah Stok
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog History Perubahan */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Histori Perubahan {selectedVoucher?.namaBarang}
            </DialogTitle>
            <DialogDescription>
              Riwayat perubahan stok per hari (direset setiap bulan)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {stockHistoryData.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Tanggal</th>
                    <th className="border px-4 py-2 text-center">
                      Belum Terjual
                    </th>
                    <th className="border px-4 py-2 text-center">Terjual</th>
                    <th className="border px-4 py-2 text-center">Retur</th>
                    <th className="border px-4 py-2 text-center">Stok Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistoryData.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border px-4 py-2">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.belumTerjual}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.terjual}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.retur}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.stokAkhir}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Tidak ada data histori tersedia.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsHistoryOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
