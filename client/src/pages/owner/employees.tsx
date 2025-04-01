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

// Form schema for employee creation/edit
const employeeFormSchema = insertUserSchema.extend({
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function OwnerEmployees() {
  const { toast } = useToast();
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Employee form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: "employee",
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
      role: "employee",
      whatsapp: "",
      address: "",
      location: "",
      profileImage: "",
    });
  };

  // Open dialog for creating a new employee
  const openCreateDialog = () => {
    setIsEditMode(false);
    resetForm();
    setIsEmployeeDialogOpen(true);
  };

  // Open dialog for editing an employee
  const openEditDialog = (employee: any) => {
    setIsEditMode(true);
    setSelectedEmployee(employee);
    form.reset({
      username: employee.username,
      password: "", // Don't show the password
      fullName: employee.fullName,
      role: "employee",
      whatsapp: employee.whatsapp || "",
      address: employee.address || "",
      location: employee.location || "",
      profileImage: employee.profileImage || "",
    });
    setIsEmployeeDialogOpen(true);
  };

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEmployeeDialogOpen(false);
      resetForm();
      toast({
        title: "Karyawan berhasil ditambahkan",
        description: "Data karyawan baru telah tersimpan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/users/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsEmployeeDialogOpen(false);
      resetForm();
      toast({
        title: "Karyawan berhasil diperbarui",
        description: "Data karyawan telah diperbarui.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Karyawan berhasil dihapus",
        description: "Data karyawan telah dihapus dari sistem.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: EmployeeFormValues) => {
    if (isEditMode && selectedEmployee) {
      updateEmployeeMutation.mutate({ ...data, id: selectedEmployee.id });
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  // Handle employee deletion with confirmation
  const handleDeleteEmployee = (employee: any) => {
    if (confirm(`Anda yakin ingin menghapus karyawan "${employee.fullName}"?`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  return (
    <SidebarLayout title="Data Karyawan">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Data Karyawan</h2>
          <Button 
            onClick={openCreateDialog}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500 mb-4">
              <p>Kelola data karyawan termasuk username, password, dan informasi kontak.</p>
            </div>

            {/* Employee Table */}
            <div className="mt-8">
              <DataTable
                data={isLoading ? [] : employees || []}
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
                          onClick={() => handleDeleteEmployee(row)}
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

      {/* Employee Form Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Karyawan" : "Tambah Karyawan Baru"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Edit informasi karyawan yang sudah ada."
                : "Tambahkan karyawan baru dengan mengisi formulir di bawah ini."
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
                            <Input value="employee" readOnly className="bg-gray-100" {...field} />
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
                              placeholder="Alamat lengkap karyawan" 
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
                            URL dari Google Maps untuk lokasi karyawan
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
                  onClick={() => setIsEmployeeDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending || updateEmployeeMutation.isPending ? (
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