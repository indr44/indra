import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if the path matches the user's role
  const pathSegments = path.split('/');
  if (pathSegments.length > 1 && pathSegments[1] !== user.role && path !== '/') {
    return (
      <Route path={path}>
        <Redirect to={`/${user.role}/dashboard`} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />
}
