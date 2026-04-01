import { useClerk, useUser } from "@clerk/clerk-react";
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
  const { signOut } = useClerk();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [hasAccountRecord, setHasAccountRecord] = useState(false);

  const handleLoginAgain = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setUserRole(null);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const email = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

        const { data, error } = await supabase
          .from("users")
          .select("role, is_active, is_approved, is_banned")
          .or(`clerk_user_id.eq.${user.id},email.ilike.${email}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Access check failed:", error);
          setUserRole(null);
          setIsActive(false);
          setIsApproved(false);
          setIsBanned(false);
          setHasAccountRecord(false);
        } else {
          if (!data) {
            const roleFromMetadata =
              (user.unsafeMetadata?.role as string | undefined) ||
              (user.publicMetadata?.role as string | undefined);
            const requestedRole =
              roleFromMetadata && ["student", "teacher", "admin"].includes(roleFromMetadata)
                ? roleFromMetadata
                : "student";

            const { error: requestError } = await supabase.from("users").upsert(
              {
                clerk_user_id: user.id,
                email,
                role: requestedRole,
                name: user.fullName || email.split("@")[0],
                email_verified: true,
                domain_verified: email.endsWith("@ustu.edu.in"),
                is_active: true,
                is_approved: false,
                is_banned: false,
                requested_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            );

            if (!requestError) {
              setHasAccountRecord(true);
              setUserRole(requestedRole);
              setIsActive(true);
              setIsApproved(false);
              setIsBanned(false);
              return;
            }
          }

          setHasAccountRecord(Boolean(data));
          setUserRole(data?.role ?? null);
          setIsActive(Boolean(data?.is_active));
          setIsApproved(Boolean(data?.is_approved));
          setIsBanned(Boolean(data?.is_banned));
        }
      } catch (err) {
        console.error("Unexpected access check error:", err);
        setUserRole(null);
        setIsActive(false);
        setIsApproved(false);
        setIsBanned(false);
        setHasAccountRecord(false);
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

  if (hasAccountRecord && !isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Deactivated</h1>
          <p className="text-muted-foreground mb-4">
            Your account has been deactivated by administration. Contact admin for access.
          </p>
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
          <p className="text-muted-foreground mb-4">
            Your account has been banned by administration.
          </p>
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
          <p className="text-muted-foreground mb-4">
            Your account was created successfully and is waiting for admin approval.
          </p>
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

  if (userRole !== "student") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">
            Your account is not approved by admin yet. Ask administration to add your email first.
          </p>
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
