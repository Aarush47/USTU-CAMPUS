import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { Mail, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type SignupMode = "role-select" | "teacher" | "student";

export function UpdatedSignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<SignupMode>("role-select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationValid, setInvitationValid] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Validate email domain
  const isValidDomain = (email: string) => {
    return email.endsWith("@ustu.edu.in");
  };

  // Check if student invitation exists
  const validateInvitation = async (code: string, studentEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("student_invitations")
        .select("*")
        .eq("reference_code", code)
        .eq("email", studentEmail)
        .eq("status", "pending")
        .single();

      if (error) {
        setInvitationValid(false);
        setError("Invalid reference code or email doesn't match invitation");
        return false;
      }

      if (data) {
        setInvitationValid(true);
        setSuccess("✅ Invitation verified! Ready to signup.");
        return true;
      }
    } catch (err) {
      console.error("Error validating invitation:", err);
    }
    return false;
  };

  const handleCheckInvitation = async () => {
    if (!email || !referenceCode) {
      setError("Please enter both email and reference code");
      return;
    }

    if (!isValidDomain(email)) {
      setError("❌ Email must be in @ustu.edu.in domain");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const isValid = await validateInvitation(referenceCode, email);
    setIsLoading(false);

    if (!isValid) {
      setInvitationValid(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent, role: "teacher" | "student") => {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;

    // Validate domain
    if (!isValidDomain(email)) {
      setError("❌ Email must be @ustu.edu.in to register");
      return;
    }

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // For students: verify invitation
    if (role === "student" && !invitationValid) {
      setError("❌ Please verify your invitation first");
      return;
    }

    // Enforce admin pre-registration for both teacher and student accounts.
    const { data: preRegisteredUser, error: preRegError } = await supabase
      .from("users")
      .select("role, is_active")
      .eq("email", email)
      .maybeSingle();

    if (preRegError) {
      setError("Unable to verify account access. Please try again.");
      return;
    }

    if (!preRegisteredUser) {
      setError("❌ This email is not authorized by administration yet");
      return;
    }

    if (!preRegisteredUser.is_active) {
      setError("❌ This account is deactivated by administration");
      return;
    }

    if (preRegisteredUser.role !== role) {
      setError(`❌ This email is registered as ${preRegisteredUser.role}, not ${role}`);
      return;
    }

    setIsLoading(true);

    try {
      // Create Clerk account
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        // Set user metadata with role
        await signUp.update({
          unsafeMetadata: {
            role,
            referenceCode: role === "student" ? referenceCode : null,
          },
        });

        // Create user record in database
        const { error: userError } = await supabase
          .from("users")
          .upsert([
            {
              clerk_user_id: result.createdUserId,
              email,
              role,
              name: email.split("@")[0],
              domain_verified: true,
              email_verified: true,
            },
          ], { onConflict: "email" });

        if (userError) {
          console.error("Error creating user record:", userError);
          // Continue anyway - user exists in Clerk
        }

        // If student: mark invitation as accepted
        if (role === "student") {
          const { error: updateError } = await supabase
            .from("student_invitations")
            .update({
              status: "accepted",
              accepted_at: new Date().toISOString(),
            })
            .eq("reference_code", referenceCode)
            .eq("email", email);

          if (updateError) {
            console.error("Error updating invitation:", updateError);
          }
        }

        setSuccess("✅ Account created successfully! Redirecting...");
        setTimeout(() => navigate("/sign-in"), 2000);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            USTU CAMPUS
          </h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        {/* Role Selection */}
        {mode === "role-select" && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Select your role
            </h2>

            <button
              onClick={() => setMode("teacher")}
              className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <p className="font-semibold text-foreground">👨‍🏫 Teacher</p>
              <p className="text-sm text-muted-foreground">
                Manage classes and students
              </p>
            </button>

            <button
              onClick={() => setMode("student")}
              className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <p className="font-semibold text-foreground">👨‍🎓 Student</p>
              <p className="text-sm text-muted-foreground">
                Join classes and learn
              </p>
            </button>
          </div>
        )}

        {/* Teacher Signup */}
        {mode === "teacher" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <button
              onClick={() => setMode("role-select")}
              className="text-primary text-sm mb-4 hover:underline"
            >
              ← Back
            </button>

            <form onSubmit={(e) => handleSignUp(e, "teacher")} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email (@ustu.edu.in)
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@ustu.edu.in"
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                Sign up as Teacher
              </button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <a href="/sign-in" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        )}

        {/* Student Signup */}
        {mode === "student" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <button
              onClick={() => setMode("role-select")}
              className="text-primary text-sm mb-4 hover:underline"
            >
              ← Back
            </button>

            {!invitationValid ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckInvitation();
                }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-foreground mb-4">
                  Get your invitation details from your teacher
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email (@ustu.edu.in)
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@ustu.edu.in"
                      className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reference Code (from teacher)
                  </label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    placeholder="USTU-ABC123"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Verify Invitation
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => handleSignUp(e, "student")}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-600">Invitation verified!</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 bg-accent border border-border rounded-lg text-foreground opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg focus-within:border-primary">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Complete Signup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInvitationValid(false);
                    setReferenceCode("");
                  }}
                  className="w-full py-2 px-4 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  Use Different Code
                </button>
              </form>
            )}

            <p className="text-sm text-muted-foreground text-center mt-4">
              Already have an account?{" "}
              <a href="/sign-in" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
