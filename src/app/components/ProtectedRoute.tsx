import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper that redirects unauthenticated users to sign-in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setUserRole(null);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const email = user.primaryEmailAddress?.emailAddress || "";

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .or(`clerk_user_id.eq.${user.id},email.eq.${email}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Access check failed:", error);
          setUserRole(null);
        } else {
          setUserRole(data?.role ?? null);
        }
      } catch (err) {
        console.error("Unexpected access check error:", err);
        setUserRole(null);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || isCheckingAccess) {
    // Still loading auth state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (userRole === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  if (userRole !== "student") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">
            Your account is not registered by a teacher yet. Ask your teacher to invite you first.
          </p>
          <a href="/sign-in" className="text-primary hover:underline">Back to Sign In</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
