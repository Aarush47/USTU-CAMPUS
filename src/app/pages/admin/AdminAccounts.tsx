import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Shield, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";
import { BackButton } from "../../components/BackButton";
import { useUser } from "@clerk/clerk-react";

type AccountRole = "teacher" | "student" | "canteen";
type UserRole = "admin" | AccountRole;

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  is_banned: boolean;
  canteen_access: boolean;
  requested_at?: string;
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
    select: "id, email, name, role, is_active, is_approved, is_banned, canteen_access, requested_at, created_at",
  });

  useEffect(() => {
    setUsersState(users);
  }, [users]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const isValidDomain = (mail: string) => mail.trim().toLowerCase().endsWith("@ustu.edu.in");

  const activeAdminsCount = useMemo(
    () => usersState.filter((u) => u.role === "admin" && u.is_active).length,
    [usersState]
  );

  const pendingRequestsCount = useMemo(
    () => usersState.filter((u) => !u.is_approved && !u.is_banned).length,
    [usersState]
  );

  useEffect(() => {
    const resolveActor = async () => {
      if (!user?.id) return;
      const email = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

      const { data } = await supabase
        .from("users")
        .select("id")
        .or(`clerk_user_id.eq.${user.id},email.ilike.${email}`)
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
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidDomain(normalizedEmail)) {
      setError("Email must be in @ustu.edu.in domain");
      return;
    }

    setIsLoading(true);

    const { error: upsertError } = await supabase.from("users").upsert(
      {
        email: normalizedEmail,
        name: name || null,
        role,
        is_active: true,
        is_approved: true,
        is_banned: false,
        canteen_access: true,
        approved_at: new Date().toISOString(),
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
      .select("id, email, name, role, is_active, is_approved, is_banned, canteen_access, requested_at, created_at")
      .ilike("email", normalizedEmail)
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

  const handleRoleChange = async (target: UserRow, newRole: UserRole) => {
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

  const handlePermanentDelete = async (target: UserRow) => {
    setError("");
    setSuccess("");

    const currentAdminEmail = (user?.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

    if (target.email.toLowerCase() === currentAdminEmail) {
      setError("You cannot permanently delete your own account.");
      return;
    }

    if (target.role === "admin" && target.is_active && activeAdminsCount <= 1) {
      setError("Cannot permanently delete the last active admin.");
      return;
    }

    const typed = window.prompt(
      `Type the exact email to permanently delete this account:\n\n${target.email}`
    );

    if ((typed || "").trim().toLowerCase() !== target.email.toLowerCase()) {
      setError("Email confirmation did not match. Delete cancelled.");
      return;
    }

    // Write audit log before delete because target row will no longer exist.
    await writeAuditLog("account_deleted_permanently", target.id, {
      email: target.email,
      role: target.role,
      was_active: target.is_active,
    });

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", target.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setUsersState((prev) => prev.filter((u) => u.id !== target.id));
    setSuccess("Account permanently deleted.");
  };

  const handleApproveAccount = async (target: UserRow) => {
    setError("");
    setSuccess("");

    if (target.is_approved) {
      setSuccess("Account is already approved.");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_approved: true,
        is_banned: false,
        is_active: true,
        approved_at: new Date().toISOString(),
        banned_at: null,
      })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) =>
        u.id === target.id ? { ...u, is_approved: true, is_banned: false, is_active: true } : u
      )
    );
    setSuccess("Account approved successfully.");

    await writeAuditLog("account_approved", target.id, {
      email: target.email,
      role: target.role,
    });
  };

  const handleBanAccount = async (target: UserRow) => {
    setError("");
    setSuccess("");

    const currentAdminEmail = (user?.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();
    if (target.email.toLowerCase() === currentAdminEmail) {
      setError("You cannot ban your own account.");
      return;
    }

    if (target.role === "admin" && target.is_active && activeAdminsCount <= 1) {
      setError("Cannot ban the last active admin.");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_banned: true,
        is_approved: false,
        is_active: false,
        banned_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) =>
        u.id === target.id ? { ...u, is_banned: true, is_approved: false, is_active: false } : u
      )
    );
    setSuccess("Account banned successfully.");

    await writeAuditLog("account_banned", target.id, {
      email: target.email,
      role: target.role,
    });
  };

  const handleUnbanAccount = async (target: UserRow) => {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_banned: false,
        is_approved: false,
        is_active: true,
        banned_at: null,
      })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) =>
        u.id === target.id ? { ...u, is_banned: false, is_approved: false, is_active: true } : u
      )
    );
    setSuccess("Account unbanned. Approve to allow portal access.");

    await writeAuditLog("account_unbanned", target.id, {
      email: target.email,
      role: target.role,
    });
  };

  const handleToggleCanteenAccess = async (target: UserRow) => {
    setError("");
    setSuccess("");

    const nextStatus = !target.canteen_access;
    const confirmed = window.confirm(
      nextStatus ? `Enable canteen access for ${target.email}?` : `Disable canteen access for ${target.email}?`
    );
    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("users")
      .update({ canteen_access: nextStatus })
      .eq("id", target.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsersState((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, canteen_access: nextStatus } : u))
    );

    setSuccess(nextStatus ? "Canteen access enabled" : "Canteen access disabled");

    await writeAuditLog(nextStatus ? "canteen_access_enabled" : "canteen_access_disabled", target.id, {
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
        <p className="text-muted-foreground">Add teacher, student, and canteen email IDs with role access.</p>
        <p className="text-sm text-amber-600 mt-2">Pending requests: {pendingRequestsCount}</p>
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
            <option value="canteen">Canteen</option>
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
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Canteen Access</th>
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
                        handleRoleChange(u, e.target.value as UserRole)
                      }
                      className="px-2 py-1 bg-background border border-border rounded-md text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="canteen">Canteen</option>
                    </select>
                    {!u.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        Inactive
                      </span>
                    )}
                    {!u.is_approved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        Pending Approval
                      </span>
                    )}
                    {u.is_banned && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                        Banned
                      </span>
                    )}
                    {u.role === "admin" && (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-center">
                  {(u.role === "student" || u.role === "teacher") && (
                    <button
                      type="button"
                      onClick={() => handleToggleCanteenAccess(u)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        u.canteen_access ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          u.canteen_access ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                  {u.role === "admin" && (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {!u.is_banned && !u.is_approved && (
                      <button
                        type="button"
                        onClick={() => handleApproveAccount(u)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 transition-colors text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {!u.is_banned ? (
                      <button
                        type="button"
                        onClick={() => handleBanAccount(u)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-600 hover:bg-red-500/10 transition-colors text-sm"
                      >
                        Ban
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnbanAccount(u)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-600 hover:bg-amber-500/10 transition-colors text-sm"
                      >
                        Unban
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm"
                    >
                      {u.is_active ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(u)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
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
