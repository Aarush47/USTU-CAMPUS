import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Shield, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";
import { BackButton } from "../../components/BackButton";
import { useUser } from "@clerk/clerk-react";

type AccountRole = "teacher" | "student";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "teacher" | "student";
  is_active: boolean;
  created_at: string;
};

export function AdminAccounts() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AccountRole>("teacher");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usersState, setUsersState] = useState<UserRow[]>([]);
  const [adminActorId, setAdminActorId] = useState<number | null>(null);

  const { data: users = [] } = useSupabaseTable<UserRow>("users", {
    fallbackData: [],
    orderBy: { column: "created_at", ascending: false },
  });

  useEffect(() => {
    setUsersState(users);
  }, [users]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const isValidDomain = (mail: string) => mail.endsWith("@ustu.edu.in");

  const activeAdminsCount = useMemo(
    () => usersState.filter((u) => u.role === "admin" && u.is_active).length,
    [usersState]
  );

  useEffect(() => {
    const resolveActor = async () => {
      if (!user?.id) return;
      const email = user.primaryEmailAddress?.emailAddress || "";

      const { data } = await supabase
        .from("users")
        .select("id")
        .or(`clerk_user_id.eq.${user.id},email.eq.${email}`)
        .limit(1)
        .maybeSingle();

      setAdminActorId(data?.id ?? null);
    };

    void resolveActor();
  }, [user?.id]);

  const writeAuditLog = async (
    action: string,
    targetUserId: number,
    metadata: Record<string, unknown>
  ) => {
    if (!adminActorId) return;

    await supabase.from("admin_audit_logs").insert({
      actor_user_id: adminActorId,
      target_user_id: targetUserId,
      action,
      metadata,
    });
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidDomain(email)) {
      setError("Email must be in @ustu.edu.in domain");
      return;
    }

    setIsLoading(true);

    const { error: upsertError } = await supabase.from("users").upsert(
      {
        email,
        name: name || null,
        role,
        is_active: true,
        domain_verified: true,
        email_verified: true,
      },
      { onConflict: "email" }
    );

    setIsLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    const { data: insertedUser } = await supabase
      .from("users")
      .select("id, email, name, role, is_active, created_at")
      .eq("email", email)
      .maybeSingle();

    if (insertedUser) {
      setUsersState((prev) => {
        const existing = prev.find((u) => u.id === insertedUser.id);
        if (existing) {
          return prev.map((u) => (u.id === insertedUser.id ? insertedUser : u));
        }

        return [insertedUser, ...prev];
      });

      await writeAuditLog("account_added", insertedUser.id, {
        email: insertedUser.email,
        role: insertedUser.role,
      });
    }

    setSuccess(`${role} account pre-registered successfully`);
    setEmail("");
    setName("");
  };

  const handleRoleChange = async (target: UserRow, newRole: AccountRole | "admin") => {
    setError("");
    setSuccess("");

    if (target.role === newRole) {
      return;
    }

    if (target.role === "admin" && newRole !== "admin" && activeAdminsCount <= 1) {
      setError("Cannot change role of the last active admin");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, role: newRole } : u))
    );
    setSuccess("Role updated successfully");

    await writeAuditLog("role_changed", target.id, {
      from: target.role,
      to: newRole,
      email: target.email,
    });
  };

  const handleToggleActive = async (target: UserRow) => {
    setError("");
    setSuccess("");

    if (target.role === "admin" && target.is_active && activeAdminsCount <= 1) {
      setError("Cannot deactivate the last active admin");
      return;
    }

    const nextStatus = !target.is_active;
    const confirmed = window.confirm(
      nextStatus ? `Activate ${target.email}?` : `Deactivate ${target.email}?`
    );
    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: nextStatus })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, is_active: nextStatus } : u))
    );

    setSuccess(nextStatus ? "Account activated" : "Account deactivated");

    await writeAuditLog(nextStatus ? "account_activated" : "account_deactivated", target.id, {
      email: target.email,
      role: target.role,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/admin" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Manage Accounts</h1>
        <p className="text-muted-foreground">Add teacher and student email IDs with role access.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add Account</h2>
        <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@ustu.edu.in"
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            required
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AccountRole)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Saving..." : "Add"}
          </button>
        </form>

        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersState.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="px-6 py-3 text-sm text-foreground">{u.email}</td>
                <td className="px-6 py-3 text-sm text-foreground">{u.name || "-"}</td>
                <td className="px-6 py-3 text-sm text-foreground capitalize">
                  <div className="flex items-center gap-2 justify-start">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u, e.target.value as AccountRole | "admin")
                      }
                      className="px-2 py-1 bg-background border border-border rounded-md text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                    {!u.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        Inactive
                      </span>
                    )}
                    {u.role === "admin" && (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      {u.is_active ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
