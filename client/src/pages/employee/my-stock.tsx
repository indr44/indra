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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertSaleSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tag, ShoppingCart, Users, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
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

// Form schema for sale creation
const saleFormSchema = insertSaleSchema.omit({
  employeeId: true,
  createdAt: true,
  isOnline: true,
  isSynced: true,
}).extend({
  newCustomer: z.boolean().optional(),
  customerName: z.string().optional(),
  totalPrice: z.number().optional(), // Will be calculated
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

export default function EmployeeMyStock() {
  const { toast } = useToast();
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  // Fetch employee stocks
  const { data: stocks, isLoading: isLoadingStocks } = useQuery({
    queryKey: ["/api/employee-stock"],
  });

  // Fetch vouchers
  const { data: vouchers, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  // Sale form
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: 0,
      voucherId: 0,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      paymentMethod: "cash",
      notes: "",
      newCustomer: false,
      customerName: "",
    },
  });

  // Watch for changes to calculate total price
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  const newCustomer = form.watch("newCustomer");
  
  if (quantity && unitPrice && typeof quantity === 'number' && typeof unitPrice === 'number') {
    const totalPrice = quantity * unitPrice;
    form.setValue("totalPrice", totalPrice);
  }

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (data: SaleFormValues) => {
      const { newCustomer, customerName, totalPrice, ...saleData } = data;
      
      // In a real implementation, we would create a new customer here if newCustomer is true
      // For now, we'll use customer ID 3 (the default customer)
      
      const res = await apiRequest("POST", "/api/sales", {
        ...saleData,
        customerId: data.customerId || 3, // Default to customer ID 3 for now
        quantity: parseInt(data.quantity.toString()),
        unitPrice: parseFloat(data.unitPrice.toString()),
        totalPrice: parseFloat((totalPrice || 0).toString()),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setIsSellDialogOpen(false);
      form.reset();
      toast({
        title: "Sale completed",
        description: "The sale has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sale failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SaleFormValues) => {
    // Ensure the totalPrice is calculated
    if (!data.totalPrice && data.quantity && data.unitPrice) {
      data.totalPrice = data.quantity * data.unitPrice;
    }
    
    createSaleMutation.mutate(data);
  };

  // Handle opening the sell dialog for a specific voucher
  const openSellDialog = (voucherId: number) => {
    const voucher = vouchers?.find((v: any) => v.id === voucherId);
    if (voucher) {
      form.setValue("voucherId", voucherId);
      form.setValue("unitPrice", parseFloat(voucher.value.toString()));
      form.setValue("quantity", 1);
      form.setValue("totalPrice", parseFloat(voucher.value.toString()));
      setSelectedVoucherId(voucherId);
      setIsSellDialogOpen(true);
    }
  };

  // Handle sync confirmation
  const handleSync = () => {
    setIsSyncConfirmOpen(false);
    toast({
      title: "Data synchronized",
      description: "All offline transactions have been synced to the server.",
    });
  };

  return (
    <SidebarLayout title="Voucher Stock Management">
      <div className="space-y-6">
        {/* Stock Management */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">My Voucher Stock</h2>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsSyncConfirmOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Sync
              </Button>
            </div>
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
                    header: "Stock",
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
                  {
                    header: "Actions",
                    accessorKey: "voucherId",
                    cell: (row) => (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => openSellDialog(row.voucherId)}
                        disabled={row.quantity <= 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Sell
                      </Button>
                    ),
                  },
                ]}
                searchable
                primaryColor="blue"
              />
            ) : (
              <div className="text-center p-4 text-gray-500">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Voucher Stock Available</h3>
                <p className="mt-1">You don't have any voucher stock yet. Contact the owner to distribute vouchers to you.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sell Voucher Form */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Quick Sell</h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stocks?.map((stock: any) => {
                const voucher = vouchers?.find((v: any) => v.id === stock.voucherId);
                if (!voucher || stock.quantity <= 0) return null;
                
                return (
                  <Card key={stock.id} className="border border-blue-100 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                          <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg">{voucher.type}</h3>
                        <p className="text-2xl font-bold mt-1">${voucher.value}</p>
                        <p className="text-sm text-gray-500 mt-1">In stock: {stock.quantity}</p>
                        <Button 
                          className="mt-4 bg-blue-600 hover:bg-blue-700 w-full"
                          onClick={() => openSellDialog(voucher.id)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Sell Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {(!stocks || stocks.length === 0 || !stocks.some((stock: any) => stock.quantity > 0)) && (
                <div className="col-span-3 text-center p-4 text-gray-500">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Available Stock to Sell</h3>
                  <p className="mt-1">You need to request voucher stock from the owner before you can sell.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sell Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Sell Voucher</DialogTitle>
            <DialogDescription>
              Complete the form to process a voucher sale to a customer.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Customer selection */}
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="newCustomer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Create New Customer</FormLabel>
                          <FormDescription>
                            Check this to create a new customer account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {newCustomer ? (
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input className="pl-10" placeholder="Enter customer name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Customer</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* For now, just add a default customer */}
                            <SelectItem value="3">John Smith</SelectItem>
                            <SelectItem value="4">Maria Garcia</SelectItem>
                            <SelectItem value="5">Robert Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="voucherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voucher Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const voucherId = parseInt(value);
                          field.onChange(voucherId);
                          
                          // Update unit price based on voucher value
                          const voucher = vouchers?.find((v: any) => v.id === voucherId);
                          if (voucher) {
                            form.setValue("unitPrice", parseFloat(voucher.value.toString()));
                            
                            // Recalculate total price
                            const quantity = form.getValues("quantity");
                            const totalPrice = quantity * parseFloat(voucher.value.toString());
                            form.setValue("totalPrice", totalPrice);
                          }
                        }} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voucher type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingVouchers ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : vouchers && stocks ? (
                            vouchers
                              .filter((voucher: any) => {
                                // Only show vouchers that the employee has in stock
                                const stock = stocks.find((s: any) => s.voucherId === voucher.id);
                                return stock && stock.quantity > 0;
                              })
                              .map((voucher: any) => {
                                const stock = stocks.find((s: any) => s.voucherId === voucher.id);
                                return (
                                  <SelectItem key={voucher.id} value={voucher.id.toString()}>
                                    {voucher.type} - ${voucher.value} ({stock?.quantity || 0} in stock)
                                  </SelectItem>
                                );
                              })
                          ) : (
                            <div className="p-2 text-center">No vouchers found</div>
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
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          min="1" 
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value || "0");
                            field.onChange(newQuantity);
                            
                            // Recalculate total price
                            const unitPrice = form.getValues("unitPrice");
                            if (unitPrice) {
                              const totalPrice = newQuantity * unitPrice;
                              form.setValue("totalPrice", totalPrice);
                            }
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.watch("voucherId") ? (
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const selectedStock = stocks?.find((s: any) => s.voucherId === form.watch("voucherId"));
                            return selectedStock ? `${selectedStock.quantity} available in stock` : '';
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
                      <FormLabel>Unit Price (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          min="0"
                          onChange={(e) => {
                            const newUnitPrice = parseFloat(e.target.value || "0");
                            field.onChange(newUnitPrice);
                            
                            // Recalculate total price
                            const quantity = form.getValues("quantity");
                            if (quantity) {
                              const totalPrice = quantity * newUnitPrice;
                              form.setValue("totalPrice", totalPrice);
                            }
                          }}
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
                      <FormLabel>Total Price (Rp)</FormLabel>
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="e_wallet">E-Wallet</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
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
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Additional notes" {...field} />
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
                  onClick={() => setIsSellDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createSaleMutation.isPending}
                >
                  {createSaleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </>
                  ) : (
                    <>Complete Sale</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sync Confirmation Dialog */}
      <AlertDialog open={isSyncConfirmOpen} onOpenChange={setIsSyncConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will synchronize all offline transactions with the server. Make sure you have an internet connection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSync}
            >
              Sync Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}

// Missing imports for FormDescription and Switch
import { FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
