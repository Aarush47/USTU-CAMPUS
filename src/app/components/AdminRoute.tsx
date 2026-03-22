import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isSignedIn || !user?.emailAddresses[0]?.emailAddress) {
        setIsChecking(false);
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setIsChecking(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .or(`clerk_user_id.eq.${user.id},email.eq.${user.emailAddresses[0].emailAddress}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === "admin");
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminRole();
  }, [isSignedIn, user]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">Only administration accounts can access this portal.</p>
          <a href="/" className="text-primary hover:underline">Go to Home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
