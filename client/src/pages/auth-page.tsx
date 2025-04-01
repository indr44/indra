import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Store, UserCog, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<"owner" | "employee" | "customer">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Handle role selection
  const handleRoleSelect = (role: "owner" | "employee" | "customer") => {
    setSelectedRole(role);
  };

  // Handle direct login
  const handleDirectLogin = () => {
    setIsLoading(true);
    
    // Simple timeout to simulate login process
    setTimeout(() => {
      if (selectedRole === "owner") {
        setLocation("/owner/dashboard");
      } else if (selectedRole === "employee") {
        setLocation("/employee/dashboard");
      } else {
        setLocation("/customer/dashboard");
      }
    }, 500);
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Simplified Authentication Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">VoucherStock</CardTitle>
            <CardDescription>
              Pilih jenis pengguna untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Silahkan Pilih Jenis Pengguna</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Owner Button */}
                <Button
                  onClick={() => handleRoleSelect("owner")}
                  className={`flex flex-col items-center py-6 ${
                    selectedRole === "owner"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  <Store className="h-8 w-8 mb-2" />
                  <span>Owner</span>
                </Button>

                {/* Employee Button */}
                <Button
                  onClick={() => handleRoleSelect("employee")}
                  className={`flex flex-col items-center py-6 ${
                    selectedRole === "employee"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  <UserCog className="h-8 w-8 mb-2" />
                  <span>Employee</span>
                </Button>

                {/* Customer Button */}
                <Button
                  onClick={() => handleRoleSelect("customer")}
                  className={`flex flex-col items-center py-6 ${
                    selectedRole === "customer"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  <User className="h-8 w-8 mb-2" />
                  <span>Customer</span>
                </Button>
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleDirectLogin}
                className={`w-full py-6 text-lg font-medium ${
                  selectedRole === "owner"
                    ? "bg-green-600 hover:bg-green-700"
                    : selectedRole === "employee"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                Masuk Sebagai {selectedRole === "owner" ? "Owner" : 
                              selectedRole === "employee" ? "Employee" : "Customer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="md:w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-6">Voucher Management System</h1>
          <p className="text-xl mb-8">
            Solusi lengkap untuk mengelola stok voucher, distribusi, dan penjualan.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Untuk Pemilik (Owner)</h3>
                <p>Kelola stok voucher, distribusikan ke karyawan, dan pantau kinerja penjualan.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Untuk Karyawan (Employee)</h3>
                <p>Kelola voucher yang diberikan, proses penjualan, dan bekerja baik online maupun offline.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Untuk Pelanggan (Customer)</h3>
                <p>Telusuri, beli, dan kelola voucher kamu dalam satu tempat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
