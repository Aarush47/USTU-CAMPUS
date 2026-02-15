import { User, Mail, Phone, MapPin, Calendar, Award, GraduationCap, BookOpen, Edit } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const studentInfo = {
  name: "Arjun Sharma",
  rollNo: "CS2023001",
  email: "arjun.sharma@college.edu",
  phone: "+91 98765 43210",
  address: "123, Green Park, New Delhi, India - 110016",
  dateOfBirth: "2004-08-15",
  bloodGroup: "O+",
  department: "Computer Science",
  semester: "6th Semester",
  batch: "2023-2027",
  admissionDate: "2023-07-15",
};

const academicInfo = {
  currentCGPA: "8.5",
  totalCredits: "120",
  attendance: "92%",
  rank: "12 / 120",
};

const achievements = [
  { title: "First Prize - Hackathon 2025", date: "Dec 2025", icon: Award },
  { title: "Best Project Award - DSA", date: "Nov 2025", icon: GraduationCap },
  { title: "Research Paper Published", date: "Sep 2025", icon: BookOpen },
];

const skills = [
  "React.js", "Node.js", "Python", "Java", "C++", "SQL",
  "Machine Learning", "Data Structures", "Algorithms"
];

export function MyProfile() {
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
              <span className="text-4xl font-bold text-white">AS</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">{studentInfo.name}</h2>
            <p className="text-muted-foreground mb-2">{studentInfo.rollNo}</p>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {studentInfo.department}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{studentInfo.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{studentInfo.phone}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{studentInfo.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">
                {new Date(studentInfo.dateOfBirth).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </span>
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
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo.currentCGPA}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Credits</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo.totalCredits}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Attendance</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo.attendance}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Class Rank</p>
                <p className="text-2xl font-semibold text-accent-foreground">{academicInfo.rank}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Semester</p>
                <p className="text-base font-medium text-foreground">{studentInfo.semester}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Batch</p>
                <p className="text-base font-medium text-foreground">{studentInfo.batch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                <p className="text-base font-medium text-foreground">{studentInfo.bloodGroup}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Admission Date</p>
                <p className="text-base font-medium text-foreground">
                  {new Date(studentInfo.admissionDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Achievements & Awards</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                    <div className="p-3 bg-primary rounded-lg">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}