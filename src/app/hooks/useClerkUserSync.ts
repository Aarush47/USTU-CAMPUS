import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

/**
 * Hook to sync Clerk user to Supabase student_profile on first login.
 * Creates or updates profile with clerk_user_id for secure per-user queries.
 */
export function useClerkUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUserToSupabase = async () => {
      try {
        // Check if profile already exists for this Clerk ID
        const { data: existing, error: fetchError } = await supabase
          .from("student_profile")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows returned (expected on first signup)
          console.error("Profile fetch error:", fetchError);
          return;
        }

        if (existing) {
          // Profile already synced, skip
          return;
        }

        // First time login: create or update profile
        const { error: upsertError } = await supabase
          .from("student_profile")
          .upsert(
            {
              clerk_user_id: user.id,
              email: user.primaryEmailAddress?.emailAddress || "",
              name: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username || "Student",
            },
            { onConflict: "clerk_user_id" }
          );

        if (upsertError) {
          console.error("Profile sync error:", upsertError);
          return;
        }

        toast.success("Profile synced with authentication!");
      } catch (err) {
        console.error("Unexpected error during user sync:", err);
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded]);
}
