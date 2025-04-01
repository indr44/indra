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
      paymentMethod: "",
      paymentStatus: "pending",
      notes: "",
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
            <h2 className="font-semibold text-gray-800">Distribute Vouchers to Employee</h2>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsDistributeOpen(true)}
            >
              Distribute Vouchers
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              <p>Distribute vouchers to your employees by selecting an employee, a voucher type, and specifying the quantity.</p>
              <p>Track payment status and keep notes for future reference.</p>
            </div>

            {/* Distribution History */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Distribution History</h3>
              <DataTable
                data={isLoading ? [] : distributions || []}
                columns={[
                  {
                    header: "ID",
                    accessorKey: "id",
                    cell: (row) => `D-${row.id.toString().padStart(3, '0')}`,
                  },
                  {
                    header: "Date",
                    accessorKey: "createdAt",
                    cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                  },
                  {
                    header: "Employee",
                    accessorKey: (row) => {
                      const employee = employees?.find((e: any) => e.id === row.employeeId);
                      return employee ? employee.fullName : `Employee #${row.employeeId}`;
                    },
                  },
                  {
                    header: "Voucher Type",
                    accessorKey: (row) => {
                      const voucher = vouchers?.find((v: any) => v.id === row.voucherId);
                      return voucher ? `${voucher.type} ($${voucher.value})` : `Voucher #${row.voucherId}`;
                    },
                  },
                  {
                    header: "Quantity",
                    accessorKey: "quantity",
                  },
                  {
                    header: "Total Amount",
                    accessorKey: "totalPrice",
                    cell: (row) => `$${row.totalPrice}`,
                  },
                  {
                    header: "Payment Status",
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
                          {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
                        </span>
                      );
                    },
                  },
                  {
                    header: "Actions",
                    accessorKey: (row) => row.id,
                    cell: (row) => (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => viewDistributionDetails(row)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
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
            <DialogTitle>Distribute Vouchers to Employee</DialogTitle>
            <DialogDescription>
              Select an employee and voucher type to distribute vouchers.
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
                      <FormLabel>Select Employee</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingEmployees ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : employees && employees.length > 0 ? (
                            employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No employees found</div>
                          )}
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
                      <FormLabel>Voucher Type</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voucher type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingVouchers ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : vouchers && vouchers.length > 0 ? (
                            vouchers
                              .filter((voucher: any) => voucher.currentStock > 0)
                              .map((voucher: any) => (
                                <SelectItem key={voucher.id} value={voucher.id.toString()}>
                                  {voucher.type} - ${voucher.value} ({voucher.currentStock} in stock)
                                </SelectItem>
                              ))
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
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0"))}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.watch("voucherId") ? (
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const selectedVoucher = vouchers?.find((v: any) => v.id === form.watch("voucherId"));
                            return selectedVoucher ? `${selectedVoucher.currentStock} available in stock` : '';
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
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="credit">Credit (Due in 30 days)</SelectItem>
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
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this distribution" 
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
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createDistributionMutation.isPending}
                >
                  {createDistributionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </>
                  ) : (
                    <>Distribute</>
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
            <DialogTitle>Distribution Details</DialogTitle>
          </DialogHeader>
          {selectedDistribution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Distribution ID</h4>
                  <p className="text-sm">D-{selectedDistribution.id.toString().padStart(3, '0')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="text-sm">{new Date(selectedDistribution.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                  <p className="text-sm">
                    {(() => {
                      const employee = employees?.find((e: any) => e.id === selectedDistribution.employeeId);
                      return employee ? employee.fullName : `Employee #${selectedDistribution.employeeId}`;
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Voucher Type</h4>
                  <p className="text-sm">
                    {(() => {
                      const voucher = vouchers?.find((v: any) => v.id === selectedDistribution.voucherId);
                      return voucher ? `${voucher.type} ($${voucher.value})` : `Voucher #${selectedDistribution.voucherId}`;
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                  <p className="text-sm">{selectedDistribution.quantity}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Unit Price</h4>
                  <p className="text-sm">${selectedDistribution.unitPrice}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                  <p className="text-sm">${selectedDistribution.totalPrice}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p className="text-sm">{selectedDistribution.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                  <div className="mt-1">
                    {(() => {
                      let className = "";
                      switch (selectedDistribution.paymentStatus) {
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
                          {selectedDistribution.paymentStatus.charAt(0).toUpperCase() + selectedDistribution.paymentStatus.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                {selectedDistribution.notes && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <p className="text-sm">{selectedDistribution.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDistributionDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    toast({
                      title: "Print Receipt",
                      description: "Print functionality is coming soon",
                    });
                  }}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
