import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import { useEffect } from "react";

// Owner pages
import OwnerDashboard from "@/pages/owner/dashboard";
import OwnerVoucherStock from "@/pages/owner/voucher-stock";
import OfflineVoucherStock from "@/pages/owner/offline-voucher-stock";
import OwnerDistribution from "@/pages/owner/distribution";
import OwnerEmployees from "@/pages/owner/employees";
import OwnerCustomers from "@/pages/owner/customers";
import OwnerStock from "@/pages/owner/stock-owner";
import EmployeeStock from "@/pages/owner/employee-stock";
import CustomerStock from "@/pages/owner/customer-stock";

// Employee pages
import EmployeeDashboard from "@/pages/employee/dashboard";
import EmployeeMyStock from "@/pages/employee/my-stock";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />

      {/* Main route - redirects to role-specific dashboard */}
      <ProtectedRoute path="/" component={HomePage} />

      {/* Owner routes */}
      <ProtectedRoute path="/owner/dashboard" component={OwnerDashboard} />
      <ProtectedRoute
        path="/owner/voucher-stock"
        component={OwnerVoucherStock}
      />
      <ProtectedRoute
        path="/owner/offline-voucher-stock"
        component={OfflineVoucherStock}
      />
      <ProtectedRoute
        path="/owner/distribution"
        component={OwnerDistribution}
      />
      <ProtectedRoute path="/owner/employees" component={OwnerEmployees} />
      <ProtectedRoute path="/owner/customers" component={OwnerCustomers} />
      <ProtectedRoute path="/owner/stock-owner" component={OwnerStock} />
      <ProtectedRoute path="/owner/employee-stock" component={EmployeeStock} />
      <ProtectedRoute path="/owner/customer-stock" component={CustomerStock} />

      {/* Employee routes */}
      <ProtectedRoute
        path="/employee/dashboard"
        component={EmployeeDashboard}
      />
      <ProtectedRoute path="/employee/my-stock" component={EmployeeMyStock} />

      {/* Customer routes */}
      <ProtectedRoute
        path="/customer/dashboard"
        component={CustomerDashboard}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Tempo Devtools
  useEffect(() => {
    // Tempo initialization removed to fix errors
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
