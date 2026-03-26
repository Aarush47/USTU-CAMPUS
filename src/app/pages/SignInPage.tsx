import { SignIn } from "@clerk/clerk-react";
import { BackButton } from "../components/BackButton";

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton fallbackPath="/" />
        </div>
        <SignIn
          appearance={{
            baseTheme: undefined,
            elements: {
              rootBox: "flex justify-center",
              card: "bg-card border border-border rounded-lg",
            },
          }}
          redirectUrl="/student"
        />
      </div>
    </div>
  );
}
