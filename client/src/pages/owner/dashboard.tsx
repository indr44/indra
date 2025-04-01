import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { VoucherCard } from "@/components/ui/voucher-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { BarChart, ArrowUp, ArrowDown, Users, Tags, DollarSign, AlertTriangle } from "lucide-react";

// Placeholder data
const recentActivities = [
  {
    id: 1,
    activity: "New voucher batch created",
    details: "Added 100 discount vouchers for $10",
    time: "2h ago",
    type: "voucher",
  },
  {
    id: 2,
    activity: "Stock distributed to employee",
    details: "Sarah received 20 premium vouchers",
    time: "5h ago",
    type: "distribution",
  },
  {
    id: 3,
    activity: "Payment received",
    details: "John paid $2,500 for voucher bundle",
    time: "1d ago",
    type: "payment",
  },
];

export default function OwnerDashboard() {
  const { toast } = useToast();

  // Fetch vouchers
  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  // Format activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "voucher":
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><Tags className="h-5 w-5 text-green-600" /></div>;
      case "distribution":
        return <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Users className="h-5 w-5 text-blue-600" /></div>;
      case "payment":
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><DollarSign className="h-5 w-5 text-green-600" /></div>;
      default:
        return <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"><BarChart className="h-5 w-5 text-gray-600" /></div>;
    }
  };
  
  return (
    <SidebarLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Voucher</p>
                  <p className="text-2xl font-bold text-gray-900">1.254</p>
                </div>
                <div className="bg-green-100 bg-opacity-80 rounded-full p-3">
                  <Tags className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium ml-1">5.2% </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Karyawan Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="bg-blue-100 bg-opacity-80 rounded-full p-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium ml-1">2 </span>
                <span className="text-gray-500 text-sm ml-1">new this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900">Rp 24.780.000</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium ml-1">8.1% </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pembayaran Tertunda</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500 text-sm font-medium ml-1">2 </span>
                <span className="text-gray-500 text-sm ml-1">since yesterday</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Aktivitas Terbaru</h2>
          </div>
          <CardContent className="p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="py-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Button 
                variant="link" 
                className="flex justify-center items-center text-sm font-medium text-green-600 hover:text-green-700 w-full"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "This feature is under development",
                })}
              >
                Lihat semua aktivitas
                <ArrowUp className="ml-1 h-4 w-4 rotate-90" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Voucher Stock Overview */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Ikhtisar Stok Voucher</h2>
            <Button 
              className="text-white bg-green-600 hover:bg-green-700"
              onClick={() => toast({
                title: "Segera Hadir",
                description: "Fitur tambah voucher sedang dalam pengembangan",
              })}
            >
              <Tags className="mr-2 h-4 w-4" /> Tambah Voucher
            </Button>
          </div>
          <CardContent className="p-6">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Aktif</TabsTrigger>
                <TabsTrigger value="low-stock">Stok Rendah</TabsTrigger>
                <TabsTrigger value="out-of-stock">Stok Habis</TabsTrigger>
                <TabsTrigger value="all">Semua Voucher</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4">
                <VoucherCard 
                  title="Diskon Premium"
                  value="Rp 750.000 OFF"
                  expiryDate="31 Des 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "Lihat Detail Voucher",
                    description: "Menampilkan detail voucher segera hadir",
                  })}
                  actionLabel="Lihat Detail"
                />
                
                <VoucherCard 
                  title="Diskon Standar"
                  value="Rp 350.000 OFF"
                  expiryDate="31 Des 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "Lihat Detail Voucher",
                    description: "Menampilkan detail voucher segera hadir",
                  })}
                  actionLabel="Lihat Detail"
                />
              </TabsContent>
              
              <TabsContent value="low-stock">
                <VoucherCard 
                  title="Diskon Dasar"
                  value="Rp 150.000 OFF"
                  expiryDate="31 Des 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "Peringatan Stok Rendah",
                    description: "Hanya tersisa 5 voucher. Apakah Anda ingin membuat lebih banyak?",
                    variant: "destructive",
                  })}
                  actionLabel="Isi Ulang"
                />
              </TabsContent>
              
              <TabsContent value="out-of-stock">
                <VoucherCard 
                  title="Acara Spesial"
                  value="Rp 1.500.000 OFF"
                  expiryDate="15 Nov 2023"
                  status="expired"
                  variant="owner"
                  onAction={() => toast({
                    title: "Buat Batch Baru",
                    description: "Buat batch baru untuk tipe voucher ini?",
                  })}
                  actionLabel="Buat Baru"
                />
              </TabsContent>
              
              <TabsContent value="all">
                <DataTable 
                  data={[
                    { 
                      type: 'Diskon Premium', 
                      value: 'Rp 750.000', 
                      stock: 250, 
                      expiry: '31 Des 2023', 
                      status: 'Aktif'
                    },
                    { 
                      type: 'Diskon Standar', 
                      value: 'Rp 350.000', 
                      stock: 125, 
                      expiry: '31 Des 2023', 
                      status: 'Aktif'
                    },
                    { 
                      type: 'Diskon Dasar', 
                      value: 'Rp 150.000', 
                      stock: 50, 
                      expiry: '31 Des 2023', 
                      status: 'Stok Rendah'
                    },
                    { 
                      type: 'Acara Spesial', 
                      value: 'Rp 1.500.000', 
                      stock: 0, 
                      expiry: '15 Nov 2023', 
                      status: 'Stok Habis'
                    },
                  ]}
                  columns={[
                    {
                      header: "Tipe Voucher",
                      accessorKey: "type",
                    },
                    {
                      header: "Nilai",
                      accessorKey: "value",
                    },
                    {
                      header: "Stok Saat Ini",
                      accessorKey: "stock",
                    },
                    {
                      header: "Tanggal Kadaluarsa",
                      accessorKey: "expiry",
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: (row) => {
                        const status = row.status;
                        let className = "bg-green-100 text-green-800";
                        
                        if (status === "Low Stock" || status === "Stok Rendah") {
                          className = "bg-yellow-100 text-yellow-800";
                        } else if (status === "Out of Stock" || status === "Stok Habis") {
                          className = "bg-red-100 text-red-800";
                        }
                        
                        return (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                            {status}
                          </span>
                        );
                      }
                    },
                  ]}
                  searchable
                  primaryColor="green"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
