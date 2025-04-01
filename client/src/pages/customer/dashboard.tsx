import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { VoucherCard } from "@/components/ui/voucher-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TicketIcon, 
  DollarSign,
  Award,
  ArrowRight,
  QrCode,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useState } from "react";

export default function CustomerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  
  // Fetch customer vouchers
  const { data: vouchers, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["/api/customer-vouchers"],
  });

  // Fetch all available vouchers
  const { data: allVouchers, isLoading: isLoadingAllVouchers } = useQuery({
    queryKey: ["/api/vouchers"],
  });
  
  // Handler for viewing voucher QR code
  const handleViewCode = (voucher: any) => {
    setSelectedVoucher(voucher);
    setIsQrCodeOpen(true);
  };
  
  // Handler for purchasing a voucher
  const handlePurchase = (voucher: any) => {
    toast({
      title: "Purchase Request Sent",
      description: `Your purchase request for ${voucher.type} - $${voucher.value} has been sent.`,
    });
  };
  
  // Process vouchers for display
  const activeVouchers = vouchers?.filter((v: any) => !v.isUsed) || [];
  const usedVouchers = vouchers?.filter((v: any) => v.isUsed) || [];
  
  // Count active vouchers and calculate total savings
  const activeVoucherCount = activeVouchers.length;
  const totalSavings = activeVouchers.reduce((total: number, v: any) => {
    const voucher = allVouchers?.find((av: any) => av.id === v.voucherId);
    return total + (voucher ? parseFloat(voucher.value.toString()) : 0);
  }, 0);

  return (
    <SidebarLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-white">Welcome back, {user?.fullName || "Customer"}!</h2>
              <p className="text-yellow-100 mt-1">
                You have {activeVoucherCount} active voucher{activeVoucherCount !== 1 ? 's' : ''} ready to use
              </p>
            </div>
            <div>
              <Button 
                className="bg-white text-yellow-600 font-medium shadow hover:bg-gray-100"
                onClick={() => toast({
                  title: "View My Vouchers",
                  description: "My Vouchers page is coming soon",
                })}
              >
                <TicketIcon className="mr-2 h-4 w-4" />
                View My Vouchers
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Vouchers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingVouchers ? "..." : activeVoucherCount}
                  </p>
                </div>
                <div className="bg-yellow-100 bg-opacity-80 rounded-full p-3">
                  <TicketIcon className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="link" 
                  className="text-yellow-600 hover:text-yellow-700 p-0 h-auto"
                  onClick={() => toast({
                    title: "View All Vouchers",
                    description: "My Vouchers page is coming soon",
                  })}
                >
                  View all vouchers <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingVouchers || isLoadingAllVouchers ? "..." : `$${totalSavings}`}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">+$25 </span>
                <span className="text-gray-500 text-sm">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Loyalty Points</p>
                  <p className="text-2xl font-bold text-gray-900">150</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-gray-500 text-sm">50 more points until next reward</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* My Vouchers */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
            <h2 className="font-semibold text-gray-800">My Vouchers</h2>
            <Button 
              variant="link" 
              className="text-yellow-600 hover:text-yellow-700"
              onClick={() => toast({
                title: "View All",
                description: "My Vouchers page is coming soon",
              })}
            >
              View All
            </Button>
          </div>
          <CardContent className="p-6">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="used">Used</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {isLoadingVouchers || isLoadingAllVouchers ? (
                  <div className="text-center p-4">Loading vouchers...</div>
                ) : activeVouchers.length > 0 ? (
                  <div className="space-y-4">
                    {activeVouchers.slice(0, 3).map((customerVoucher: any) => {
                      const voucher = allVouchers?.find((v: any) => v.id === customerVoucher.voucherId);
                      if (!voucher) return null;
                      
                      return (
                        <VoucherCard 
                          key={customerVoucher.id}
                          title={voucher.type}
                          value={`$${voucher.value} OFF`}
                          expiryDate={new Date(voucher.expiryDate).toLocaleDateString()}
                          status="active"
                          variant="customer"
                          onAction={() => handleViewCode(customerVoucher)}
                          actionLabel="View Code"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No Active Vouchers</h3>
                    <p className="mt-1">You don't have any active vouchers right now.</p>
                    <Button
                      className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => toast({
                        title: "Browse Vouchers",
                        description: "Voucher marketplace is coming soon",
                      })}
                    >
                      Browse Available Vouchers
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="used">
                {isLoadingVouchers || isLoadingAllVouchers ? (
                  <div className="text-center p-4">Loading vouchers...</div>
                ) : usedVouchers.length > 0 ? (
                  <div className="space-y-4">
                    {usedVouchers.map((customerVoucher: any) => {
                      const voucher = allVouchers?.find((v: any) => v.id === customerVoucher.voucherId);
                      if (!voucher) return null;
                      
                      return (
                        <VoucherCard 
                          key={customerVoucher.id}
                          title={voucher.type}
                          value={`$${voucher.value} OFF`}
                          expiryDate={new Date(voucher.expiryDate).toLocaleDateString()}
                          status="used"
                          variant="customer"
                          onAction={() => toast({
                            title: "Voucher Used",
                            description: `This voucher was used on ${new Date(customerVoucher.usedAt).toLocaleDateString()}`,
                          })}
                          actionLabel="View Details"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No Used Vouchers</h3>
                    <p className="mt-1">You haven't used any vouchers yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Available Vouchers */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Available Vouchers</h2>
          </div>
          <CardContent className="p-6">
            {isLoadingAllVouchers ? (
              <div className="text-center p-4">Loading vouchers...</div>
            ) : allVouchers && allVouchers.length > 0 ? (
              <div className="space-y-4">
                {allVouchers
                  .filter((v: any) => v.currentStock > 0)
                  .slice(0, 2)
                  .map((voucher: any) => (
                    <VoucherCard 
                      key={voucher.id}
                      title={voucher.type}
                      value={`$${voucher.value} OFF`}
                      expiryDate={new Date(voucher.expiryDate).toLocaleDateString()}
                      isAvailable={true}
                      price={`$${(voucher.value * 0.9).toFixed(2)}`}
                      onAction={() => handlePurchase(voucher)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Vouchers Available</h3>
                <p className="mt-1">There are no vouchers available for purchase at the moment.</p>
              </div>
            )}
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                onClick={() => toast({
                  title: "Browse More Vouchers",
                  description: "Voucher marketplace is coming soon",
                })}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse More Vouchers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrCodeOpen} onOpenChange={setIsQrCodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Voucher Code</DialogTitle>
            <DialogDescription>
              Show this code to the cashier to redeem your voucher.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="bg-white p-2 rounded">
                  <svg className="h-48 w-48 mx-auto" viewBox="0 0 100 100">
                    <path d="M 10 10 h 80 v 80 h -80 z" fill="none" stroke="black" strokeWidth="5"/>
                    <path d="M 20 20 h 20 v 20 h -20 z" fill="none" stroke="black" strokeWidth="5"/>
                    <path d="M 60 20 h 20 v 20 h -20 z" fill="none" stroke="black" strokeWidth="5"/>
                    <path d="M 20 60 h 20 v 20 h -20 z" fill="none" stroke="black" strokeWidth="5"/>
                    <rect x="40" y="40" width="20" height="20" fill="black"/>
                    <path d="M 65 65 h 10 v 10 h -10 z" fill="black"/>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Voucher ID: {selectedVoucher.id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Valid until: {(() => {
                    const voucher = allVouchers?.find((v: any) => v.id === selectedVoucher.voucherId);
                    return voucher ? new Date(voucher.expiryDate).toLocaleDateString() : 'Unknown';
                  })()}
                </p>
              </div>
              
              <Button 
                className="mt-6 bg-yellow-600 hover:bg-yellow-700"
                onClick={() => {
                  // Mark voucher as used
                  toast({
                    title: "Voucher Marked as Used",
                    description: "This functionality will actually mark the voucher as used when implemented",
                  });
                  setIsQrCodeOpen(false);
                }}
              >
                <TicketIcon className="mr-2 h-4 w-4" /> Mark as Used
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
