import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertVoucherSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Trash2, Calendar, AlertCircle } from "lucide-react";
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

// Form schema for voucher creation
const voucherFormSchema = insertVoucherSchema.extend({
  expiryDate: z.string().min(1, "Expiry date is required"),
}).omit({ currentStock: true });

type VoucherFormValues = z.infer<typeof voucherFormSchema>;

export default function OwnerVoucherStock() {
  const { toast } = useToast();
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  // Fetch vouchers
  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["/api/vouchers"],
  });

  // Form for adding new vouchers
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      code: "",
      type: "",
      value: 0,
      initialStock: 0,
      expiryDate: "",
      supplier: "",
    },
  });

  // Create voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: async (data: VoucherFormValues) => {
      const res = await apiRequest("POST", "/api/vouchers", {
        ...data,
        value: parseFloat(data.value.toString()),
        initialStock: parseInt(data.initialStock.toString()),
        expiryDate: new Date(data.expiryDate).toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vouchers"] });
      setIsAddVoucherOpen(false);
      form.reset();
      toast({
        title: "Voucher created",
        description: "The voucher has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create voucher",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete voucher mutation
  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vouchers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vouchers"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Voucher deleted",
        description: "The voucher has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete voucher",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: VoucherFormValues) => {
    createVoucherMutation.mutate(data);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (selectedVoucherId !== null) {
      deleteVoucherMutation.mutate(selectedVoucherId);
    }
  };

  return (
    <SidebarLayout title="Voucher Stock Management">
      <div className="space-y-6">
        {/* Add New Voucher Form */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Voucher Stock Management</h2>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsAddVoucherOpen(true)}
            >
              + Add New Voucher
            </Button>
          </div>
          <CardContent className="p-6">
            <DataTable
              data={isLoading ? [] : vouchers || []}
              columns={[
                {
                  header: "Voucher Code",
                  accessorKey: "code",
                },
                {
                  header: "Type",
                  accessorKey: "type",
                },
                {
                  header: "Value",
                  accessorKey: "value",
                  cell: (row) => `$${row.value}`,
                },
                {
                  header: "Stock",
                  accessorKey: "currentStock",
                },
                {
                  header: "Created",
                  accessorKey: "createdAt",
                  cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                },
                {
                  header: "Expires",
                  accessorKey: "expiryDate",
                  cell: (row) => new Date(row.expiryDate).toLocaleDateString(),
                },
                {
                  header: "Status",
                  accessorKey: (row) => {
                    if (new Date(row.expiryDate) < new Date()) {
                      return "Expired";
                    }
                    if (row.currentStock <= 0) {
                      return "Out of Stock";
                    }
                    if (row.currentStock < row.initialStock * 0.2) {
                      return "Low Stock";
                    }
                    return "Active";
                  },
                  cell: (row) => {
                    const status = 
                      new Date(row.expiryDate) < new Date()
                        ? "Expired"
                        : row.currentStock <= 0
                        ? "Out of Stock"
                        : row.currentStock < row.initialStock * 0.2
                        ? "Low Stock"
                        : "Active";
                    
                    let className = "bg-green-100 text-green-800";
                    
                    if (status === "Low Stock") {
                      className = "bg-yellow-100 text-yellow-800";
                    } else if (status === "Out of Stock" || status === "Expired") {
                      className = "bg-red-100 text-red-800";
                    }
                    
                    return (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                        {status}
                      </span>
                    );
                  },
                },
                {
                  header: "Actions",
                  accessorKey: (row) => row.id,
                  cell: (row) => (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => toast({
                          title: "Edit Voucher",
                          description: "Edit feature is coming soon",
                        })}
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
              filterable
              exportable
              primaryColor="green"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Voucher Dialog */}
      <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Voucher</DialogTitle>
            <DialogDescription>
              Create a new voucher type to add to your inventory.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voucher Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. PREMIUM50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voucher Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voucher type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Premium">Premium Discount</SelectItem>
                          <SelectItem value="Standard">Standard Discount</SelectItem>
                          <SelectItem value="Basic">Basic Discount</SelectItem>
                          <SelectItem value="Special">Special Event</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="initialStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input type="date" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier name" {...field} />
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
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createVoucherMutation.isPending}
                >
                  {createVoucherMutation.isPending ? "Saving..." : "Save Voucher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the voucher
              and remove it from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              {deleteVoucherMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}
