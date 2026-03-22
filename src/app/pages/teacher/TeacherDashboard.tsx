import { useUser } from "@clerk/clerk-react";
import { Users, BookOpen, Calendar, ClipboardList } from "lucide-react";

export function TeacherDashboard() {
  const { user } = useUser();

  const stats = [
    {
      label: "My Classes",
      value: "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Students",
      value: "0",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      label: "Pending Assignments",
      value: "0",
      icon: ClipboardList,
      color: "bg-orange-500",
    },
    {
      label: "Today's Classes",
      value: "0",
      icon: Calendar,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Welcome back, {user?.firstName || "Teacher"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your classes today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-2">Create a Class</h3>
            <p className="text-sm text-muted-foreground">
              Set up a new class and invite students to join
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-2">Mark Attendance</h3>
            <p className="text-sm text-muted-foreground">
              Record daily attendance for your students
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-2">Create Assignment</h3>
            <p className="text-sm text-muted-foreground">
              Post assignments and track submissions
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h3 className="font-semibold text-foreground mb-2">Upload Resources</h3>
            <p className="text-sm text-muted-foreground">
              Share study materials with your classes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
