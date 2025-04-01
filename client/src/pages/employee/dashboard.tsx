import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Tags, ShoppingCart, DollarSign, AlertTriangle, ArrowUp } from "lucide-react";

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch employee stocks
  const { data: stocks, isLoading: isLoadingStocks } = useQuery({
    queryKey: ["/api/employee-stock"],
  });

  // Fetch employee sales
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["/api/sales"],
  });

  // Fetch vouchers (to get details of each stock item)
  const { data: vouchers, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  // Calculate today's sales
  const todaySales = sales?.filter((sale: any) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    return saleDate.getDate() === today.getDate() &&
           saleDate.getMonth() === today.getMonth() &&
           saleDate.getFullYear() === today.getFullYear();
  });

  // Calculate today's revenue
  const todayRevenue = todaySales?.reduce((total: number, sale: any) => {
    return total + (sale.totalPrice || 0);
  }, 0);

  // Find low stock alerts
  const lowStockItems = stocks?.filter((stock: any) => {
    const voucher = vouchers?.find((v: any) => v.id === stock.voucherId);
    if (voucher) {
      // Consider low stock if less than 20% of original distribution
      return stock.quantity < 5;
    }
    return false;
  });

  return (
    <SidebarLayout title="Dashboard">
      <div className="space-y-6">
        {/* Online Status Banner (only visible when in online mode) */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-medium text-green-800">Online Mode</h3>
              <p className="text-sm text-green-600">All changes are being synced in real-time</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => toast({
              title: "Offline Mode",
              description: "Offline mode functionality is coming soon",
            })}
          >
            Switch to Offline Mode
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">My Voucher Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStocks ? "..." : 
                      stocks?.reduce((total: number, stock: any) => total + stock.quantity, 0) || 0}
                  </p>
                </div>
                <div className="bg-blue-100 bg-opacity-80 rounded-full p-3">
                  <Tags className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-gray-500 text-sm">
                  {isLoadingStocks ? "Loading..." : 
                    `Across ${stocks?.length || 0} voucher types`}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingSales ? "..." : todaySales?.length || 0}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {!isLoadingSales && todaySales?.length > 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium ml-1">+{todaySales.length} </span>
                    <span className="text-gray-500 text-sm ml-1">today</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No sales today</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingSales ? "..." : `$${todayRevenue || 0}`}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {!isLoadingSales && todayRevenue > 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 text-sm font-medium ml-1">+15% </span>
                    <span className="text-gray-500 text-sm ml-1">from yesterday</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No revenue today</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStocks ? "..." : lowStockItems?.length || 0}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                {!isLoadingStocks && lowStockItems?.length > 0 ? (
                  <span className="text-yellow-500 text-sm font-medium">
                    {(() => {
                      const item = lowStockItems[0];
                      const voucher = vouchers?.find((v: any) => v.id === item.voucherId);
                      return voucher ? `${voucher.type} Vouchers` : 'Some vouchers';
                    })()} running low
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">All stock levels are good</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Stock Overview */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">My Voucher Stock</h2>
            <Link href="/employee/my-stock">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Manage Stock
              </Button>
            </Link>
          </div>
          <CardContent className="p-6">
            {isLoadingStocks || isLoadingVouchers ? (
              <div className="text-center p-4">Loading stock data...</div>
            ) : stocks?.length > 0 ? (
              <DataTable 
                data={stocks.map((stock: any) => {
                  const voucher = vouchers?.find((v: any) => v.id === stock.voucherId);
                  return {
                    ...stock,
                    voucherType: voucher?.type || 'Unknown',
                    value: voucher?.value || 0,
                    expiryDate: voucher?.expiryDate || 'Unknown',
                    status: stock.quantity <= 5 ? 'Low Stock' : 'Active'
                  };
                })}
                columns={[
                  {
                    header: "Voucher Type",
                    accessorKey: "voucherType",
                  },
                  {
                    header: "Value",
                    accessorKey: "value",
                    cell: (row) => `$${row.value}`,
                  },
                  {
                    header: "Current Stock",
                    accessorKey: "quantity",
                  },
                  {
                    header: "Expiry Date",
                    accessorKey: "expiryDate",
                    cell: (row) => new Date(row.expiryDate).toLocaleDateString(),
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: (row) => {
                      const className = row.status === 'Low Stock' 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800";
                      
                      return (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                          {row.status}
                        </span>
                      );
                    },
                  },
                ]}
                primaryColor="blue"
              />
            ) : (
              <div className="text-center p-4 text-gray-500">
                You don't have any voucher stock yet. Contact the owner to distribute vouchers to you.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Sales */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
            <h2 className="font-semibold text-gray-800">Recent Sales</h2>
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => toast({
                title: "View All Sales",
                description: "Sales history page is coming soon",
              })}
            >
              View All
            </Button>
          </div>
          <CardContent className="p-6">
            {isLoadingSales || isLoadingVouchers ? (
              <div className="text-center p-4">Loading sales data...</div>
            ) : sales?.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {sales.slice(0, 3).map((sale: any) => {
                    const voucher = vouchers?.find((v: any) => v.id === sale.voucherId);
                    const saleDate = new Date(sale.createdAt);
                    const now = new Date();
                    
                    // Format the time display
                    let timeDisplay = '';
                    const diffMs = now.getTime() - saleDate.getTime();
                    const diffMins = Math.round(diffMs / 60000);
                    const diffHours = Math.round(diffMs / 3600000);
                    const diffDays = Math.round(diffMs / 86400000);
                    
                    if (diffMins < 60) {
                      timeDisplay = `${diffMins}m ago`;
                    } else if (diffHours < 24) {
                      timeDisplay = `${diffHours}h ago`;
                    } else {
                      timeDisplay = `${diffDays}d ago`;
                    }
                    
                    return (
                      <li key={sale.id} className="py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-yellow-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Customer #{sale.customerId}</p>
                            <p className="text-sm text-gray-500">
                              Purchased {voucher ? voucher.type : 'Voucher'} (${voucher?.value || sale.unitPrice})
                            </p>
                          </div>
                          <div>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">{timeDisplay}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {sales.length > 3 && (
                  <div className="mt-6">
                    <Button 
                      variant="link" 
                      className="w-full text-blue-600 hover:text-blue-800"
                      onClick={() => toast({
                        title: "View All Sales",
                        description: "Sales history page is coming soon",
                      })}
                    >
                      View more sales
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">
                No sales recorded yet. Start selling vouchers to customers.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

// Adding missing User icon 
import { User } from "lucide-react";
