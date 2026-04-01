import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { Mail, Phone, MapPin, Calendar, Edit, Save, X, UserRound } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { BackButton } from "./BackButton";
import { supabase } from "../lib/supabase";

type UserProfile = {
  id: number;
  email: string;
  name: string | null;
  role: "student" | "teacher" | "admin";
  phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  department?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
};

type EditableProfile = {
  name: string;
  phone: string;
  address: string;
  date_of_birth: string;
  blood_group: string;
  department: string;
  bio: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const defaultForm: EditableProfile = {
  name: "",
  phone: "",
  address: "",
  date_of_birth: "",
  blood_group: "",
  department: "",
  bio: "",
};

export function MyProfile() {
  const { user } = useUser();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>(defaultForm);

  const fallbackPath = useMemo(() => {
    if (location.pathname.startsWith("/teacher")) return "/teacher";
    if (location.pathname.startsWith("/admin")) return "/admin";
    return "/student";
  }, [location.pathname]);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const normalizedEmail = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

    const { data, error: profileError } = await supabase
      .from("users")
      .select("id, email, name, role, phone, address, date_of_birth, blood_group, department, bio, created_at, updated_at")
      .or(`clerk_user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      const roleFromMetadata =
        (user.unsafeMetadata?.role as string | undefined) ||
        (user.publicMetadata?.role as string | undefined);
      const resolvedRole =
        roleFromMetadata && ["student", "teacher", "admin"].includes(roleFromMetadata)
          ? (roleFromMetadata as "student" | "teacher" | "admin")
          : "student";

      const { data: created, error: createError } = await supabase
        .from("users")
        .upsert(
          {
            clerk_user_id: user.id,
            email: normalizedEmail,
            role: resolvedRole,
            name: user.fullName || normalizedEmail.split("@")[0],
            email_verified: true,
            domain_verified: normalizedEmail.endsWith("@ustu.edu.in"),
            is_active: true,
            is_approved: false,
            is_banned: false,
          },
          { onConflict: "email" }
        )
        .select("id, email, name, role, phone, address, date_of_birth, blood_group, department, bio, created_at, updated_at")
        .single();

      if (createError || !created) {
        setError(createError?.message || "Could not create profile record.");
        setLoading(false);
        return;
      }

      setProfile(created as UserProfile);
      setForm({
        name: created.name || "",
        phone: created.phone || "",
        address: created.address || "",
        date_of_birth: created.date_of_birth || "",
        blood_group: created.blood_group || "",
        department: created.department || "",
        bio: created.bio || "",
      });
      setLoading(false);
      return;
    }

    const row = data as UserProfile;
    setProfile(row);
    setForm({
      name: row.name || "",
      phone: row.phone || "",
      address: row.address || "",
      date_of_birth: row.date_of_birth || "",
      blood_group: row.blood_group || "",
      department: row.department || "",
      bio: row.bio || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    void fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      date_of_birth: form.date_of_birth || null,
      blood_group: form.blood_group.trim() || null,
      department: form.department.trim() || null,
      bio: form.bio.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.from("users").update(payload).eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Profile updated successfully.");
    setIsEditing(false);
    await fetchProfile();
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      date_of_birth: profile.date_of_birth || "",
      blood_group: profile.blood_group || "",
      department: profile.department || "",
      bio: profile.bio || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const initials = useMemo(() => {
    const source = profile?.name || profile?.email || "NA";
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name, profile?.email]);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <BackButton fallbackPath={fallbackPath} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading profile...</p>}

      {!loading && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{profile.name || "No name"}</h2>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
              <span className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {profile.department || "Department not set"}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.phone || "-"}</span>
              </div>
              <div className="flex items-start gap-3 text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{profile.address || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(profile.date_of_birth)}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <UserRound className="w-4 h-4 text-muted-foreground" />
                <span>Blood Group: {profile.blood_group || "-"}</span>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Blood Group</label>
                <input
                  type="text"
                  value={form.blood_group}
                  onChange={(e) => setForm((prev) => ({ ...prev, blood_group: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="A+, O-, ..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg disabled:opacity-70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg disabled:opacity-70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-1">Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg resize-none disabled:opacity-70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg resize-none disabled:opacity-70"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
