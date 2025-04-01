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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Dialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, UserPlus, MapPin, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for customer creation/edit
const customerFormSchema = insertUserSchema.extend({
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function OwnerCustomers() {
  const { toast } = useToast();
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Customer form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: "customer",
      whatsapp: "",
      address: "",
      location: "",
      profileImage: "",
    },
  });

  // Reset form when dialog is opened/closed
  const resetForm = () => {
    form.reset({
      username: "",
      password: "",
      fullName: "",
      role: "customer",
      whatsapp: "",
      address: "",
      location: "",
      profileImage: "",
    });
  };

  // Open dialog for creating a new customer
  const openCreateDialog = () => {
    setIsEditMode(false);
    resetForm();
    setIsCustomerDialogOpen(true);
  };

  // Open dialog for editing a customer
  const openEditDialog = (customer: any) => {
    setIsEditMode(true);
    setSelectedCustomer(customer);
    form.reset({
      username: customer.username,
      password: "", // Don't show the password
      fullName: customer.fullName,
      role: "customer",
      whatsapp: customer.whatsapp || "",
      address: customer.address || "",
      location: customer.location || "",
      profileImage: customer.profileImage || "",
    });
    setIsCustomerDialogOpen(true);
  };

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCustomerDialogOpen(false);
      resetForm();
      toast({
        title: "Pelanggan berhasil ditambahkan",
        description: "Data pelanggan baru telah tersimpan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/users/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCustomerDialogOpen(false);
      resetForm();
      toast({
        title: "Pelanggan berhasil diperbarui",
        description: "Data pelanggan telah diperbarui.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Pelanggan berhasil dihapus",
        description: "Data pelanggan telah dihapus dari sistem.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CustomerFormValues) => {
    if (isEditMode && selectedCustomer) {
      updateCustomerMutation.mutate({ ...data, id: selectedCustomer.id });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  // Handle customer deletion with confirmation
  const handleDeleteCustomer = (customer: any) => {
    if (confirm(`Anda yakin ingin menghapus pelanggan "${customer.fullName}"?`)) {
      deleteCustomerMutation.mutate(customer.id);
    }
  };

  return (
    <SidebarLayout title="Data Pelanggan">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Data Pelanggan</h2>
          <Button 
            onClick={openCreateDialog}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              <p>Kelola data pelanggan termasuk username, password, dan informasi kontak.</p>
            </div>

            {/* Customer Table */}
            <div className="mt-8">
              <DataTable
                data={isLoading ? [] : customers || []}
                columns={[
                  {
                    header: "Foto Profil",
                    accessorKey: "profileImage",
                    cell: (row) => (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {row.profileImage ? (
                          <img 
                            src={row.profileImage} 
                            alt={row.fullName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-500 flex items-center justify-center w-full h-full">
                            {row.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Username",
                    accessorKey: "username",
                  },
                  {
                    header: "Nama Lengkap",
                    accessorKey: "fullName",
                  },
                  {
                    header: "WhatsApp",
                    accessorKey: "whatsapp",
                    cell: (row) => (
                      <div className="flex items-center">
                        {row.whatsapp ? (
                          <>
                            <Phone className="h-4 w-4 mr-1 text-green-600" />
                            {row.whatsapp}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Alamat",
                    accessorKey: "address",
                    cell: (row) => row.address || "-",
                  },
                  {
                    header: "Lokasi",
                    accessorKey: "location",
                    cell: (row) => (
                      <div className="flex items-center">
                        {row.location ? (
                          <>
                            <MapPin className="h-4 w-4 mr-1 text-red-500" />
                            <span className="text-blue-600 hover:underline">Lihat Map</span>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: "Opsi",
                    accessorKey: (row) => row.id,
                    cell: (row) => (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEditDialog(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCustomer(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Customer Form Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Edit informasi pelanggan yang sudah ada."
                : "Tambahkan pelanggan baru dengan mengisi formulir di bawah ini."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Akun</TabsTrigger>
                  <TabsTrigger value="profile">Profil & Kontak</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username*</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isEditMode ? "Password Baru (opsional)" : "Password*"}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "password"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap*</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role*</FormLabel>
                          <FormControl>
                            <Input value="customer" readOnly className="bg-gray-100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Foto Profil</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-gray-500 mt-1">
                            URL gambar dari internet atau server internal
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="62812xxxxxxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Alamat lengkap pelanggan" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Lokasi (Google Maps URL)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://maps.google.com/?q=..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-gray-500 mt-1">
                            URL dari Google Maps untuk lokasi pelanggan
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCustomerDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                    <>Menyimpan...</>
                  ) : (
                    <>{isEditMode ? "Perbarui" : "Simpan"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}