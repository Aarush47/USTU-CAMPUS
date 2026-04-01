import { useClerk, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface CanteenRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper for canteen staff access.
 * Checks if user is signed in AND has canteen role in database.
 */
export function CanteenRoute({ children }: CanteenRouteProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [isCanteenStaff, setIsCanteenStaff] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [hasAccountRecord, setHasAccountRecord] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const handleLoginAgain = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

  useEffect(() => {
    const checkCanteenRole = async () => {
      if (!isSignedIn || !user?.emailAddresses[0]?.emailAddress) {
        setIsChecking(false);
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.error("Supabase credentials missing");
          setIsChecking(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const normalizedEmail = user.emailAddresses[0].emailAddress.trim().toLowerCase();

        // Prefer Clerk user ID lookup, fallback to email for legacy rows.
        const { data, error } = await supabase
          .from("users")
          .select("role, is_active, is_approved, is_banned")
          .or(`clerk_user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error checking user role:", error);
          setIsChecking(false);
          return;
        }

        if (data) {
          setHasAccountRecord(true);
          setIsCanteenStaff(data.role === "canteen");
          setIsActive(data.is_active ?? true);
          setIsApproved(data.is_approved ?? true);
          setIsBanned(data.is_banned ?? false);
        } else {
          // Auto-create record for new users with pending approval
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              clerk_user_id: user.id,
              email: normalizedEmail,
              name: user.firstName + " " + (user.lastName || ""),
              role: "canteen", // Default to canteen for this portal
              is_active: true,
              is_approved: false, // Require admin approval
              is_banned: false,
            });

          if (insertError) {
            console.error("Error creating user record:", insertError);
          }
        }
      } catch (error) {
        console.error("Error in checkCanteenRole:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCanteenRole();
  }, [isSignedIn, user]);

  // Show loading spinner while checking
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign-in if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Show pending approval message
  if (hasAccountRecord && !isApproved && !isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Account Pending Approval</h2>
            <p className="text-muted-foreground mb-6">
              Your canteen staff account is pending administrator approval. Please contact the administrator to get access.
            </p>
            <button
              onClick={handleLoginAgain}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Out & Try Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show banned message
  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Banned</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been banned. Please contact the administrator for more information.
            </p>
            <button
              onClick={handleLoginAgain}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not canteen staff
  if (!isCanteenStaff) {
    return <Navigate to="/student" replace />;
  }

  // Show inactive message
  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Account Inactive</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been deactivated. Please contact the administrator to reactivate your account.
            </p>
            <button
              onClick={handleLoginAgain}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}