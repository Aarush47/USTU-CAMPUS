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
        const roleFromMetadata =
          (user.unsafeMetadata?.role as string | undefined) ||
          (user.publicMetadata?.role as string | undefined);

        const normalizedMetadataRole =
          roleFromMetadata && ["student", "teacher", "admin"].includes(roleFromMetadata)
            ? roleFromMetadata
            : null;

        const primaryEmail = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();
        const displayName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || "User";

        // Preserve existing role from DB to avoid accidental teacher->student downgrades.
        const { data: existingUser } = await supabase
          .from("users")
          .select("role")
          .or(`clerk_user_id.eq.${user.id},email.ilike.${primaryEmail}`)
          .limit(1)
          .maybeSingle();

        const role = existingUser?.role || normalizedMetadataRole || "student";

        // Keep users table in sync for role-based routing (student/teacher/admin).
        const { error: usersUpsertError } = await supabase
          .from("users")
          .upsert(
            {
              clerk_user_id: user.id,
              email: primaryEmail,
              name: displayName,
              role,
              email_verified: true,
              domain_verified: primaryEmail.endsWith("@ustu.edu.in"),
            },
            { onConflict: "email" }
          );

        if (usersUpsertError) {
          console.error("Users sync error:", usersUpsertError);
        }

        // Teachers/admins don't need student_profile for core teacher routing.
        if (role !== "student") {
          return;
        }

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
              email: primaryEmail,
              name: displayName,
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
