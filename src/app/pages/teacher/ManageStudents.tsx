import { useState } from "react";
import { Plus, Copy, CheckCircle, Clock, X, Trash2 } from "lucide-react";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/clerk-react";
import { BackButton } from "../../components/BackButton";

type StudentInvitation = {
  id: number;
  email: string;
  reference_code: string;
  name: string;
  roll_no: string;
  department: string;
  semester: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  accepted_at: string | null;
};

export function ManageStudents() {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    roll_no: "",
    department: "",
    semester: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch invitations
  const { data: invitations = [] } = useSupabaseTable<StudentInvitation>(
    ["student_invitations"],
    { fallbackData: [] }
  );

  // Generate reference code
  const generateCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "USTU-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Validate email domain
  const isValidDomain = (email: string) => {
    return email.endsWith("@ustu.edu.in");
  };

  // Handle invite student
  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!formData.email || !formData.name) {
      setError("Email and name are required");
      return;
    }

    if (!isValidDomain(formData.email)) {
      setError("Email must be in @ustu.edu.in domain");
      return;
    }

    setIsLoading(true);

    try {
      // Get teacher ID from users table
      const { data: teacherData, error: teacherError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user?.id)
        .single();

      if (teacherError || !teacherData) {
        setError("Could not find your teacher profile");
        setIsLoading(false);
        return;
      }

      // Generate reference code
      const referenceCode = generateCode();

      // Insert invitation
      const { data, error: inviteError } = await supabase
        .from("student_invitations")
        .insert([
          {
            teacher_id: teacherData.id,
            email: formData.email,
            reference_code: referenceCode,
            name: formData.name,
            roll_no: formData.roll_no || null,
            department: formData.department || null,
            semester: formData.semester || null,
            status: "pending",
          },
        ]);

      if (inviteError) {
        if (inviteError.message.includes("unique")) {
          setError("❌ This student email has already been invited");
        } else {
          setError("Error creating invitation: " + inviteError.message);
        }
      } else {
        setSuccess(`✅ Invitation sent! Code: ${referenceCode}`);
        setFormData({ email: "", name: "", roll_no: "", department: "", semester: "" });
        setShowForm(false);
        // Refresh list - in real app would refetch
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Delete invitation
  const deleteInvitation = async (id: number) => {
    if (!window.confirm("Delete this invitation?")) return;

    try {
      const { error } = await supabase
        .from("student_invitations")
        .delete()
        .eq("id", id);

      if (error) {
        setError("Error deleting invitation");
      } else {
        setSuccess("✅ Invitation deleted");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </div>
        );
      case "accepted":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Accepted
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-sm">
            <X className="w-4 h-4" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Manage Students</h1>
          <p className="text-muted-foreground">
            Invite students to your classes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Invite Student
        </button>
      </div>

      {/* Invite Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Invite New Student</h2>
          <form onSubmit={handleInviteStudent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email (@ustu.edu.in) *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="student@ustu.edu.in"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Roll No
                </label>
                <input
                  type="text"
                  value={formData.roll_no}
                  onChange={(e) =>
                    setFormData({ ...formData, roll_no: e.target.value })
                  }
                  placeholder="CS2024001"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Computer Science"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  placeholder="6th Semester"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Creating..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No students invited yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Invite First Student
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Reference Code
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-foreground">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.roll_no && `Roll: ${inv.roll_no}`}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">
                      {inv.email}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-accent rounded text-sm text-foreground">
                          {inv.reference_code}
                        </code>
                        <button
                          onClick={() => copyCode(inv.reference_code)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy
                            className={`w-4 h-4 ${
                              copiedCode === inv.reference_code
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => deleteInvitation(inv.id)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        title="Delete invitation"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Invitations</p>
          <p className="text-2xl font-bold text-foreground">{invitations.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-2xl font-bold text-green-600">
            {invitations.filter((i) => i.status === "accepted").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {invitations.filter((i) => i.status === "pending").length}
          </p>
        </div>
      </div>
    </div>
  );
}
