import { Shield, Users, UserCheck, GraduationCap } from "lucide-react";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";
import { BackButton } from "../../components/BackButton";

type UserRow = {
  id: number;
  role: "admin" | "teacher" | "student";
  is_active: boolean;
};

export function AdminDashboard() {
  const { data: users = [] } = useSupabaseTable<UserRow>("users", { fallbackData: [] });

  const activeUsers = users.filter((u) => u.is_active);

  const adminCount = activeUsers.filter((u) => u.role === "admin").length;
  const teacherCount = activeUsers.filter((u) => u.role === "teacher").length;
  const studentCount = activeUsers.filter((u) => u.role === "student").length;

  const cards = [
    { label: "Admins", value: adminCount, icon: Shield, color: "bg-slate-700" },
    { label: "Teachers", value: teacherCount, icon: UserCheck, color: "bg-blue-600" },
    { label: "Students", value: studentCount, icon: GraduationCap, color: "bg-green-600" },
    { label: "Total Active", value: activeUsers.length, icon: Users, color: "bg-purple-600" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Administration Dashboard</h1>
        <p className="text-muted-foreground">Manage teachers, students, and access policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Role Model</h2>
        <p className="text-muted-foreground">
          Admin can create teacher and student accounts. Teachers can handle classes, attendance,
          assignments, and resources. Students can access only student portal features.
        </p>
      </div>
    </div>
  );
}
