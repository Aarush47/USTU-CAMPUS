import { useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";

type AccountRole = "teacher" | "student";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "teacher" | "student";
  created_at: string;
};

export function AdminAccounts() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AccountRole>("teacher");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: users = [] } = useSupabaseTable<UserRow>("users", {
    fallbackData: [],
    orderBy: { column: "created_at", ascending: false },
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const isValidDomain = (mail: string) => mail.endsWith("@ustu.edu.in");

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

    setSuccess(`${role} account pre-registered successfully`);
    setEmail("");
    setName("");
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="px-6 py-3 text-sm text-foreground">{u.email}</td>
                <td className="px-6 py-3 text-sm text-foreground">{u.name || "-"}</td>
                <td className="px-6 py-3 text-sm text-foreground capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
