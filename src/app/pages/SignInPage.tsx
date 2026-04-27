import { SignIn } from "@clerk/clerk-react";
import { BackButton } from "../components/BackButton";

export function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fd] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col items-center justify-center">
        <div className="mb-4 w-full max-w-[360px]">
          <BackButton fallbackPath="/" />
        </div>

        <div className="w-full max-w-[360px] rounded-3xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-slate-200/70">
          <SignIn
            appearance={{
              baseTheme: undefined,
              elements: {
                rootBox: "w-full",
                card: "w-full bg-transparent border-0 shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                logoBox: "hidden",
                logoImage: "hidden",
              },
            }}
            fallbackRedirectUrl="/student"
            forceRedirectUrl="/student"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
