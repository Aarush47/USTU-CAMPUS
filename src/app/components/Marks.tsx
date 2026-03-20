import { Card } from "./ui/card";
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type SemesterMark = {
  subject: string;
  internal1: number;
  internal2: number;
  internal3: number;
  assignment: number;
  total: number;
  maxMarks: number;
  grade: string;
};

type PreviousSemester = {
  semester: number;
  sgpa: number;
  subjects: number;
  totalMarks: number;
  maxMarks: number;
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-emerald-500";
  if (grade.startsWith("B")) return "bg-blue-500";
  if (grade.startsWith("C")) return "bg-amber-500";
  return "bg-gray-500";
};

export function Marks() {
  const { data: semesterMarks } = useSupabaseTable<SemesterMark>(["semester_marks", "marks"], {
    fallbackData: [],
  });

  const { data: previousSemesters } = useSupabaseTable<PreviousSemester>(["previous_semesters", "semesters"], {
    fallbackData: [],
    orderBy: { column: "semester", ascending: false },
  });

  const currentSemesterTotal = semesterMarks.reduce((sum, subject) => sum + subject.total, 0);
  const currentSemesterMax = semesterMarks.reduce((sum, subject) => sum + subject.maxMarks, 0);
  const currentPercentage = currentSemesterMax ? (currentSemesterTotal / currentSemesterMax) * 100 : 0;
  const currentCGPA = 8.6;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Academic Performance</h1>
        <p className="text-muted-foreground mt-1">View your marks and grades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current CGPA</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">{currentCGPA}</h3>
              <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +0.3 from last sem
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Semester</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">8.9</h3>
              <p className="text-sm text-muted-foreground mt-1">SGPA (Predicted)</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">
                {currentPercentage.toFixed(1)}%
              </h3>
              <p className="text-sm text-muted-foreground mt-1">This Semester</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">12</h3>
              <p className="text-sm text-muted-foreground mt-1">out of 120</p>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 bg-secondary">
          <TabsTrigger value="current">Current Semester</TabsTrigger>
          <TabsTrigger value="previous">Previous Semesters</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Semester 6 - Internal Marks</h2>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Obtained</p>
                <p className="text-lg font-semibold text-foreground">
                  {currentSemesterTotal} / {currentSemesterMax}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Internal 1</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Internal 2</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Internal 3</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Assignment</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Grade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterMarks.map((subject, idx) => {
                    const percentage = (subject.total / subject.maxMarks) * 100;
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{subject.subject}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{subject.internal1}/25</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{subject.internal2}/25</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{subject.internal3}/25</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{subject.assignment}/10</td>
                        <td className="py-4 px-4 text-center font-semibold text-foreground">
                          {subject.total}/{subject.maxMarks}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${getGradeColor(
                              subject.grade
                            )} text-white font-semibold`}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-24">
                            <Progress value={percentage} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="previous" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousSemesters.map((sem) => {
              const percentage = (sem.totalMarks / sem.maxMarks) * 100;
              const prevSem = previousSemesters.find((s) => s.semester === sem.semester - 1);
              const sgpaDiff = prevSem ? sem.sgpa - prevSem.sgpa : 0;

              return (
                <Card key={sem.semester} className="p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Semester {sem.semester}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{sem.subjects} Subjects</p>
                    </div>
                    {sgpaDiff !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          sgpaDiff > 0 ? "text-emerald-600" : sgpaDiff < 0 ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        {sgpaDiff > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : sgpaDiff < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        <span>{Math.abs(sgpaDiff).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-semibold text-foreground">{sem.sgpa}</span>
                        <span className="text-sm text-muted-foreground">SGPA</span>
                      </div>
                      <Progress value={(sem.sgpa / 10) * 100} />
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Marks</span>
                        <span className="font-medium text-foreground">
                          {sem.totalMarks} / {sem.maxMarks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Percentage</span>
                        <span className="font-medium text-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
