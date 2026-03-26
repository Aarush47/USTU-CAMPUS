import { useEffect } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";

const SESSION_KEY = "ustu_session_active";

/**
 * Enforces fresh-auth behavior: on a new browser/tab session, any persisted
 * Clerk session is signed out automatically, requiring login again.
 */
export function SessionEnforcer() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    const hasActiveSession = sessionStorage.getItem(SESSION_KEY) === "1";

    // Fresh visit with persisted auth cookie -> force sign out.
    if (isSignedIn && !hasActiveSession) {
      void signOut({ redirectUrl: "/sign-in" });
      return;
    }

    // Mark this tab/session as active once user is signed out or authenticated.
    if (!hasActiveSession) {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, [isLoaded, isSignedIn, signOut]);

  return null;
}
