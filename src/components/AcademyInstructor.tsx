import React, { useState } from "react";
import { Course } from "../types/academy";
import { 
  Plus, 
  BookOpen, 
  Terminal, 
  Settings, 
  User, 
  BarChart, 
  CheckCircle, 
  Edit, 
  Award, 
  HelpCircle,
  FileText,
  ChevronRight
} from "lucide-react";

interface AcademyInstructorProps {
  courses: Course[];
  theme?: "light" | "dark";
}

export default function AcademyInstructor({
  courses,
  theme = "light"
}: AcademyInstructorProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "metrics">("dashboard");
  const [isCreated, setIsCreated] = useState<boolean>(false);

  // Form states for creating course
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Web Security");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Beginner");
  const [estimatedTime, setEstimatedTime] = useState<string>("2h 30m");

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsCreated(true);
    setTimeout(() => {
      setIsCreated(false);
      setActiveTab("dashboard");
      setTitle("");
      setDescription("");
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="academy-instructor-view">
      
      {/* 1. Header Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/10 pb-4">
        <div>
          <h2 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            SaaS Instructor Management Portal
          </h2>
          <p className="text-xs text-slate-500">
            Publish courses, configure lab environments, manage training quizzes, and audit active student progression.
          </p>
        </div>

        <div className={`flex p-1 rounded-xl border ${
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200/60"
        }`}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: "create", label: "Create Course", icon: <Plus className="h-3.5 w-3.5" /> },
            { id: "metrics", label: "Student Metrics", icon: <BarChart className="h-3.5 w-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? theme === "dark"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SUBTAB: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Active Courses", val: courses.length, label: "Published on portal" },
              { title: "Student Enrolled", val: "312", label: "Fortress operators" },
              { title: "Average Rating", val: "4.85 ★", label: "System satisfaction" },
              { title: "Certificates Issued", val: "84", label: "Cleared operators" }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className={`border rounded-2xl p-4 space-y-1 ${
                  theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <span className="text-[10px] text-slate-500 font-mono block uppercase font-bold">{stat.title}</span>
                <span className={`text-xl font-black block ${theme === "dark" ? "text-white" : "text-slate-950"}`}>{stat.val}</span>
                <span className="text-[9px] text-slate-400 font-mono block">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Courses List Managed */}
          <div className="space-y-3">
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>
              Your Courses Directory
            </h3>

            <div className="space-y-3">
              {courses.map(course => (
                <div 
                  key={course.id}
                  className={`border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    theme === "dark" ? "bg-slate-900/20 border-slate-850" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] text-blue-500 font-mono font-bold uppercase block">{course.category}</span>
                    <h4 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      {course.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{course.description}</p>
                  </div>

                  <div className="flex gap-2.5 items-center shrink-0">
                    <button
                      className={`p-2 rounded-xl border transition ${
                        theme === "dark" 
                          ? "bg-slate-900 border-slate-850 text-slate-400 hover:text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Edit Course syllabus"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-blue-500/15 hover:border-transparent transition flex items-center gap-1 cursor-pointer"
                    >
                      Manage Syllabus <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: CREATE COURSE */}
      {activeTab === "create" && (
        <div className={`border rounded-2xl p-6 md:p-8 ${
          theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <form onSubmit={handleCreateCourseSubmit} className="space-y-5">
            <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
              Draft New Operational Training Course
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Identity and Access Management Hardening"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Category Pathway</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                  }`}
                >
                  <option>Web Security</option>
                  <option>Linux</option>
                  <option>AWS Security</option>
                  <option>Cryptography</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Syllabus Overview Description</label>
              <textarea
                required
                rows={3}
                placeholder="Brief description of learning objectives, target vulnerabilities and architectural focus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border rounded-xl p-3 text-xs outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                  }`}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Estimated Study Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 3h 15m"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">XP Completion Reward</label>
                <input
                  type="number"
                  placeholder="e.g. 400"
                  defaultValue={400}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                  }`}
                />
              </div>
            </div>

            {isCreated && (
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-xs font-mono font-bold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="h-4.5 w-4.5" /> COURSE DRAFT REGISTERED! Syncing course metadata.
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md hover:shadow-lg hover:shadow-blue-500/10"
            >
              Publish Active Course
            </button>
          </form>
        </div>
      )}

      {/* 4. SUBTAB: METRICS */}
      {activeTab === "metrics" && (
        <div className={`border rounded-2xl p-5 space-y-4 ${
          theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <h3 className={`text-xs font-extrabold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>
            Active Student Completions Ledger
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-200/10 text-[10px] uppercase font-bold text-slate-500">
                  <th className="py-2">Student Name</th>
                  <th className="py-2">Course Target</th>
                  <th className="py-2 text-center">Score / Status</th>
                  <th className="py-2 text-right">Completions Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/5">
                {[
                  { name: "Alex Rivera", target: "OWASP Top 10", score: "92% - Complete", date: "Jul 10, 2026" },
                  { name: "Sovereign Operator", target: "Linux Hardening", score: "100% - Lab Flag", date: "Jul 08, 2026" },
                  { name: "Security Analyst", target: "OWASP Top 10", score: "In Progress", date: "Jul 05, 2026" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/5">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="py-3 font-mono text-[11px]">{row.target}</td>
                    <td className="py-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        row.score.includes("In Progress") ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>{row.score}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
