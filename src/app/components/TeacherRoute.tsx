import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface TeacherRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper for teacher-only access.
 * Checks if user is signed in AND has teacher role in database.
 */
export function TeacherRoute({ children }: TeacherRouteProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTeacherRole = async () => {
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

        // Prefer Clerk user ID lookup, fallback to email for legacy rows.
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .or(`clerk_user_id.eq.${user.id},email.eq.${user.emailAddresses[0].emailAddress}`)
          .single();

        if (error) {
          console.error("Error checking teacher role:", error);
          setIsTeacher(false);
        } else {
          setIsTeacher(data?.role === "teacher");
        }
      } catch (err) {
        console.error("Error:", err);
        setIsTeacher(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkTeacherRole();
  }, [isSignedIn, user]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need teacher permissions to access this portal.</p>
          <a href="/" className="text-primary hover:underline">Return to Student Portal</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
