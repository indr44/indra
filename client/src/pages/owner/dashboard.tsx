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
                  <p className="text-sm font-medium text-gray-500">Total Vouchers</p>
                  <p className="text-2xl font-bold text-gray-900">1,254</p>
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
                  <p className="text-sm font-medium text-gray-500">Active Employees</p>
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
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$24,780</p>
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
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
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
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
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
                View all activity
                <ArrowUp className="ml-1 h-4 w-4 rotate-90" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Voucher Stock Overview */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Voucher Stock Overview</h2>
            <Button 
              className="text-white bg-green-600 hover:bg-green-700"
              onClick={() => toast({
                title: "Coming Soon",
                description: "Add voucher feature is under development",
              })}
            >
              <Tags className="mr-2 h-4 w-4" /> Add Voucher
            </Button>
          </div>
          <CardContent className="p-6">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                <TabsTrigger value="all">All Vouchers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4">
                <VoucherCard 
                  title="Premium Discount"
                  value="$50 OFF"
                  expiryDate="Dec 31, 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "View Voucher Details",
                    description: "Displaying voucher details is coming soon",
                  })}
                  actionLabel="View Details"
                />
                
                <VoucherCard 
                  title="Standard Discount"
                  value="$25 OFF"
                  expiryDate="Dec 31, 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "View Voucher Details",
                    description: "Displaying voucher details is coming soon",
                  })}
                  actionLabel="View Details"
                />
              </TabsContent>
              
              <TabsContent value="low-stock">
                <VoucherCard 
                  title="Basic Discount"
                  value="$10 OFF"
                  expiryDate="Dec 31, 2023"
                  status="active"
                  variant="owner"
                  onAction={() => toast({
                    title: "Low Stock Alert",
                    description: "Only 5 vouchers remaining. Do you want to create more?",
                    variant: "destructive",
                  })}
                  actionLabel="Restock"
                />
              </TabsContent>
              
              <TabsContent value="out-of-stock">
                <VoucherCard 
                  title="Special Event"
                  value="$100 OFF"
                  expiryDate="Nov 15, 2023"
                  status="expired"
                  variant="owner"
                  onAction={() => toast({
                    title: "Create New Batch",
                    description: "Create a new batch of this voucher type?",
                  })}
                  actionLabel="Create New"
                />
              </TabsContent>
              
              <TabsContent value="all">
                <DataTable 
                  data={[
                    { 
                      type: 'Premium Discount', 
                      value: '$50', 
                      stock: 250, 
                      expiry: 'Dec 31, 2023', 
                      status: 'Active'
                    },
                    { 
                      type: 'Standard Discount', 
                      value: '$25', 
                      stock: 125, 
                      expiry: 'Dec 31, 2023', 
                      status: 'Active'
                    },
                    { 
                      type: 'Basic Discount', 
                      value: '$10', 
                      stock: 50, 
                      expiry: 'Dec 31, 2023', 
                      status: 'Low Stock'
                    },
                    { 
                      type: 'Special Event', 
                      value: '$100', 
                      stock: 0, 
                      expiry: 'Nov 15, 2023', 
                      status: 'Out of Stock'
                    },
                  ]}
                  columns={[
                    {
                      header: "Voucher Type",
                      accessorKey: "type",
                    },
                    {
                      header: "Value",
                      accessorKey: "value",
                    },
                    {
                      header: "Current Stock",
                      accessorKey: "stock",
                    },
                    {
                      header: "Expiry Date",
                      accessorKey: "expiry",
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: (row) => {
                        const status = row.status;
                        let className = "bg-green-100 text-green-800";
                        
                        if (status === "Low Stock") {
                          className = "bg-yellow-100 text-yellow-800";
                        } else if (status === "Out of Stock") {
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
