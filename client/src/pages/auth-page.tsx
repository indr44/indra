import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Loader2, Store, UserCog, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Register schema extends the insert schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Login schema is simpler
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<"owner" | "employee" | "customer">("customer");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Register form with validation
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "customer",
    },
  });

  // Login form with validation
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Effect to update the role field in the register form
  useEffect(() => {
    registerForm.setValue("role", selectedRole);
  }, [selectedRole, registerForm]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "owner") {
        setLocation("/owner/dashboard");
      } else if (user.role === "employee") {
        setLocation("/employee/dashboard");
      } else {
        setLocation("/customer/dashboard");
      }
    }
  }, [user, setLocation]);

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Handle login form submission
  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  // Handle role selection
  const handleRoleSelect = (role: "owner" | "employee" | "customer") => {
    setSelectedRole(role);
  };

  // If already logged in, show loading until redirect happens
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Authentication Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">VoucherStock</CardTitle>
            <CardDescription>
              {tab === "login" ? "Sign in to access your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="text-center mb-6">
                  <h3 className="text-md font-medium text-gray-700">Select User Type</h3>
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
                    <Store className="h-6 w-6 mb-2" />
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
                    <UserCog className="h-6 w-6 mb-2" />
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
                    <User className="h-6 w-6 mb-2" />
                    <span>Customer</span>
                  </Button>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className={`w-full mt-4 ${
                        selectedRole === "owner"
                          ? "bg-green-600 hover:bg-green-700"
                          : selectedRole === "employee"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }`}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className={`w-full mt-4 ${
                        registerForm.watch("role") === "owner"
                          ? "bg-green-600 hover:bg-green-700"
                          : registerForm.watch("role") === "employee"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }`}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="block text-center text-sm text-gray-600">
            {tab === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="underline text-primary hover:text-primary/90"
                  onClick={() => setTab("register")}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="underline text-primary hover:text-primary/90"
                  onClick={() => setTab("login")}
                >
                  Sign in
                </button>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="md:w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-6">Voucher Management System</h1>
          <p className="text-xl mb-8">
            The complete solution for managing voucher stocks, distribution, and sales.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Owners</h3>
                <p>Manage voucher stocks, distribute to employees, and track sales performance.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Employees</h3>
                <p>Manage assigned vouchers, process sales, and work both online and offline.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Customers</h3>
                <p>Browse, purchase, and manage your vouchers all in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
