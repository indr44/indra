import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      if (user.role === "owner") {
        setLocation("/owner/dashboard");
      } else if (user.role === "employee") {
        setLocation("/employee/dashboard");
      } else if (user.role === "customer") {
        setLocation("/customer/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-border" />
    </div>
  );
}
