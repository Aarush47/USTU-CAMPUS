import { useClerk, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [hasAccountRecord, setHasAccountRecord] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const handleLoginAgain = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

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
        const normalizedEmail = user.emailAddresses[0].emailAddress.trim().toLowerCase();
        const { data, error } = await supabase
          .from("users")
          .select("role, is_active, is_approved, is_banned")
          .or(`clerk_user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          setIsAdmin(false);
          setIsActive(false);
          setIsApproved(false);
          setIsBanned(false);
          setHasAccountRecord(false);
        } else {
          setHasAccountRecord(Boolean(data));
          setIsAdmin(data?.role === "admin");
          setIsActive(Boolean(data?.is_active));
          setIsApproved(Boolean(data?.is_approved));
          setIsBanned(Boolean(data?.is_banned));
        }
      } catch {
        setIsAdmin(false);
        setIsActive(false);
        setIsApproved(false);
        setIsBanned(false);
        setHasAccountRecord(false);
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

  if (hasAccountRecord && !isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Deactivated</h1>
          <p className="text-muted-foreground mb-4">Your admin account has been disabled.</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
            >
              Go to Dashboard
            </a>
            <button
              type="button"
              onClick={handleLoginAgain}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccountRecord && isBanned) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Banned</h1>
          <p className="text-muted-foreground mb-4">Your admin account has been banned.</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
            >
              Go to Dashboard
            </a>
            <button
              type="button"
              onClick={handleLoginAgain}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccountRecord && !isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Approval Pending</h1>
          <p className="text-muted-foreground mb-4">Your admin account is waiting for higher-level approval.</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
            >
              Go to Dashboard
            </a>
            <button
              type="button"
              onClick={handleLoginAgain}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">Only administration accounts can access this portal.</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
            >
              Go to Dashboard
            </a>
            <button
              type="button"
              onClick={handleLoginAgain}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
