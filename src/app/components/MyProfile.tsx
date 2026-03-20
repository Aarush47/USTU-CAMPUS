import { Mail, Phone, MapPin, Calendar, Award, GraduationCap, BookOpen, Edit } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type StudentProfile = {
  name: string;
  roll_no?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  blood_group?: string;
  department?: string;
  semester?: string;
  batch?: string;
  admission_date?: string;
};

type AcademicInfo = {
  current_cgpa?: string | number;
  total_credits?: string | number;
  attendance?: string;
  rank?: string;
};

type SkillItem = {
  id?: number;
  name: string;
};

type AchievementItem = {
  id?: number;
  title: string;
  date?: string;
  type?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const achievementIcon = (type?: string) => {
  const normalized = type?.toLowerCase();
  if (normalized === "academic") return GraduationCap;
  if (normalized === "research") return BookOpen;
  return Award;
};

export function MyProfile() {
  const { data: profiles } = useSupabaseTable<StudentProfile>(["student_profile", "profile", "students"], {
    fallbackData: [],
  });
  const { data: academics } = useSupabaseTable<AcademicInfo>(
    ["academic_info", "student_academics", "academics"],
    {
      fallbackData: [],
    },
  );
  const { data: skills } = useSupabaseTable<SkillItem>(["student_skills", "skills"], {
    fallbackData: [],
  });
  const { data: achievements } = useSupabaseTable<AchievementItem>(
    ["student_achievements", "achievements"],
    {
      fallbackData: [],
    },
  );

  const studentInfo = profiles[0];
  const academicInfo = academics[0];
  const initials = studentInfo?.name
    ? studentInfo.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">My Profile</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-white">{initials}</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">{studentInfo?.name ?? "No profile found"}</h2>
            <p className="text-muted-foreground mb-2">{studentInfo?.roll_no ?? "-"}</p>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {studentInfo?.department ?? "-"}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{studentInfo?.email ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{studentInfo?.phone ?? "-"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{studentInfo?.address ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{formatDate(studentInfo?.date_of_birth)}</span>
            </div>
          </div>
        </Card>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Academic Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current CGPA</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo?.current_cgpa ?? "-"}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Credits</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo?.total_credits ?? "-"}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Attendance</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo?.attendance ?? "-"}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Class Rank</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo?.rank ?? "-"}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Semester</p>
                <p className="text-base font-medium text-foreground">{studentInfo?.semester ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Batch</p>
                <p className="text-base font-medium text-foreground">{studentInfo?.batch ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                <p className="text-base font-medium text-foreground">{studentInfo?.blood_group ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Admission Date</p>
                <p className="text-base font-medium text-foreground">{formatDate(studentInfo?.admission_date)}</p>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id ?? skill.name}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills found in database.</p>}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Achievements & Awards</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievementIcon(achievement.type);
                return (
                  <div key={achievement.id ?? achievement.title} className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                    <div className="p-3 bg-primary rounded-lg">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(achievement.date)}</p>
                    </div>
                  </div>
                );
              })}
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground">No achievements found in database.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}