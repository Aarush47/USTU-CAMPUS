import { Link } from "react-router";
import { GraduationCap, ShieldCheck, UserCheck, Users } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">USTU CAMPUS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/sign-in"
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Smart Campus Access
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Administration controls onboarding, teachers manage academic workflows,
            and students get secure access only after authorized registration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/sign-in"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue to Portal
            </Link>
            <Link
              to="/sign-up"
              className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <ShieldCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Administration</h3>
            <p className="text-sm text-muted-foreground">
              Add and authorize teacher/student emails, and supervise full platform access.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <UserCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Teachers</h3>
            <p className="text-sm text-muted-foreground">
              Manage classes, attendance, assignments, and resources.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Students</h3>
            <p className="text-sm text-muted-foreground">
              Access the portal only when approved and pre-registered by administration.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
