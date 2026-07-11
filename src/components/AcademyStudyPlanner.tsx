import React, { useState } from "react";
import { UserAcademyProfile } from "../types/academy";
import { StudyPlan } from "../types/learningEngine";
import { CAREER_PATHWAYS } from "../data/learningEngineData";
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  User, 
  AlertCircle, 
  Info, 
  RefreshCw,
  Sliders,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface AcademyStudyPlannerProps {
  profile: UserAcademyProfile;
  studyPlan: StudyPlan | null;
  onUpdateStudyPlan: (plan: StudyPlan) => void;
  onNavigateToTab: (tab: string) => void;
  theme?: "light" | "dark";
}

export default function AcademyStudyPlanner({
  profile,
  studyPlan,
  onUpdateStudyPlan,
  onNavigateToTab,
  theme = "light"
}: AcademyStudyPlannerProps) {
  // Setup configuration states
  const [selectedGoal, setSelectedGoal] = useState<string>(studyPlan?.targetCareerId || "pentest");
  const [commitmentHours, setCommitmentHours] = useState<number>(studyPlan?.weeklyHours || 5);
  const [pace, setPace] = useState<"steady" | "balanced" | "intensive">(studyPlan?.pace || "balanced");
  const [weeklyAvailability, setWeeklyAvailability] = useState<{ [day: string]: number }>({
    "Monday": 45,
    "Tuesday": 45,
    "Wednesday": 45,
    "Thursday": 45,
    "Friday": 45,
    "Saturday": 60,
    "Sunday": 60
  });

  const [reminderActive, setReminderActive] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(!studyPlan);

  // Suggested daily schedule tasks based on selected goal
  const getTasksForGoal = () => {
    if (selectedGoal === "pentest") {
      return [
        { id: "task-1", title: "Complete HTTP Basics", completed: profile.completedLessonIds.includes("l1_1"), type: "Lesson" },
        { id: "task-2", title: "Review SQLi Concatenation Mechanics", completed: profile.completedLessonIds.includes("l1_2"), type: "Lab" },
        { id: "task-3", title: "Run SQLi Lab Terminal Simulator", completed: profile.completedLessonIds.includes("l1_2"), type: "Lab" },
        { id: "task-4", title: "Capture 'Broken Vault' flag", completed: profile.completedCtfIds.includes("ctf-1"), type: "CTF" }
      ];
    } else {
      return [
        { id: "task-1", title: "Review Linux Navigation", completed: true, type: "Lesson" },
        { id: "task-2", title: "Audit PAM auth logs", completed: false, type: "Lesson" },
        { id: "task-3", title: "Crack 'Cipher Everywhere' ciphertext", completed: profile.completedCtfIds.includes("ctf-2"), type: "CTF" },
        { id: "task-4", title: "Perform enterprise PCAP scan", completed: false, type: "Lab" }
      ];
    }
  };

  const handleSavePlan = () => {
    const newPlan: StudyPlan = {
      id: `plan-${Math.random().toString(36).substr(2, 9)}`,
      targetCareerId: selectedGoal,
      weeklyHours: commitmentHours,
      pace: pace,
      weeklyAvailability: weeklyAvailability,
      startDate: new Date().toLocaleDateString(),
      endDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString() // 30 days
    };
    onUpdateStudyPlan(newPlan);
    setShowConfig(false);
  };

  const currentCareerGoal = CAREER_PATHWAYS.find(p => p.id === selectedGoal) || CAREER_PATHWAYS[0];

  return (
    <div className="space-y-6 animate-fade-in text-left" id="academy-study-planner-view">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200/10 pb-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"} flex items-center gap-2`}>
            <Calendar className="h-5.5 w-5.5 text-blue-500 shrink-0" />
            AI Adaptive Study Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Customize daily schedules, track availability thresholds, and set alerts for upcoming labs.</p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            theme === "dark" 
              ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" /> 
          {showConfig ? "Show Schedule View" : "Re-Configure Planner"}
        </button>
      </div>

      {showConfig ? (
        /* ==================== SCREEN A: CONFIGURATION FORM ==================== */
        <div className={`border rounded-2xl p-6 md:p-8 space-y-6 ${
          theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"
        }`}>
          
          <div className="space-y-2 border-b border-slate-200/10 pb-4">
            <span className="text-[9px] font-mono font-bold text-blue-500 uppercase tracking-widest block">INITIALIZE_PLAN</span>
            <h2 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
              Assemble your Personalized Learning Path
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define your availability below, and the Cyber Adaptive Learning Engine will prioritize course syllabus milestones to match your targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Target Career Pathway */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> Target Professional Career Goal
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs outline-none transition cursor-pointer ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-blue-500" 
                    : "bg-slate-50 border-slate-250 text-slate-800 focus:border-blue-500"
                }`}
              >
                {CAREER_PATHWAYS.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 leading-normal block">
                Target Pathway: {currentCareerGoal?.description}
              </span>
            </div>

            {/* Pacing Speed */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Learning Velocity / Pacing
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "steady", label: "Steady", desc: "2-4 hrs/wk", class: "border-slate-300 dark:border-slate-800" },
                  { id: "balanced", label: "Balanced", desc: "5-8 hrs/wk", class: "border-slate-300 dark:border-slate-800" },
                  { id: "intensive", label: "Intensive", desc: "10+ hrs/wk", class: "border-slate-300 dark:border-slate-800" }
                ].map((item) => {
                  const active = pace === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPace(item.id as any);
                        setCommitmentHours(item.id === "steady" ? 3 : item.id === "balanced" ? 6 : 12);
                      }}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col justify-center items-center gap-1 ${
                        active 
                          ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold" 
                          : theme === "dark" ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white" : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs">{item.label}</span>
                      <span className="text-[9px] font-mono font-medium block text-slate-500">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Availability thresholds editor */}
          <div className="space-y-3.5 pt-4 border-t border-slate-200/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Daily availability parameters (Minutes)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {Object.keys(weeklyAvailability).map((day) => {
                const currentVal = weeklyAvailability[day];
                return (
                  <div 
                    key={day}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 ${
                      theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-bold block text-slate-500">{day.substr(0, 3)}</span>
                    <input 
                      type="number"
                      value={currentVal}
                      onChange={(e) => setWeeklyAvailability({ ...weeklyAvailability, [day]: Math.max(0, parseInt(e.target.value) || 0) })}
                      className={`w-14 p-1 rounded font-mono text-center text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-250 text-slate-950"
                      }`}
                    />
                    <span className="text-[8px] font-mono text-slate-400">mins</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save trigger */}
          <div className="pt-4 border-t border-slate-200/10 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Bell className="h-4 w-4 text-blue-500 animate-pulse" />
              <span>Reminders & alerts active</span>
            </div>
            <button
              onClick={handleSavePlan}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
            >
              Commit Study Calendar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      ) : (
        /* ==================== SCREEN B: SCHEDULE WORKSPACE ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Calendar Overview / Goals */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Study Path Details HUD */}
            <div className={`border rounded-2xl p-5 relative overflow-hidden ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200/10 pb-3 mb-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">ACTIVE_STRATEGY</span>
                  <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    {currentCareerGoal?.title} Pathway
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Pacing Mode</span>
                  <span className="text-xs font-bold font-mono text-blue-500 uppercase">{pace} ({commitmentHours} hrs/wk)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider font-bold">Plan Period</span>
                  <span className="font-bold block mt-1 text-slate-800 dark:text-slate-200">30-Day Operational Run</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider font-bold">Goal Target Date</span>
                  <span className="font-bold block mt-1 text-slate-800 dark:text-slate-200">{studyPlan?.endDate}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider font-bold">Next Lecture Target</span>
                  <span className="font-bold block mt-1 text-blue-500 truncate">OWASP SQLi Deep Dive</span>
                </div>
              </div>
            </div>

            {/* Today's schedule goals list */}
            <div className={`border rounded-2xl p-5 space-y-4.5 ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex justify-between items-center border-b border-slate-200/10 pb-2.5">
                <div>
                  <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    Today's Adaptive Training Goals
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Custom training tasks allocated based on active career targets.</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE_SLOT</span>
              </div>

              <div className="space-y-3">
                {getTasksForGoal().map((task) => (
                  <div 
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      task.completed 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-slate-400 opacity-60" 
                        : theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200 shadow-inner"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-400 text-transparent"
                      }`}>
                        {task.completed && <span className="text-[10px] font-black">✓</span>}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${task.completed ? "line-through text-slate-500" : ""}`}>
                          {task.title}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          [{task.type}]
                        </span>
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        onClick={() => {
                          if (task.type === "Lab") onNavigateToTab("labs");
                          else if (task.type === "CTF") onNavigateToTab("ctf");
                          else onNavigateToTab("courses");
                        }}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-0.5"
                      >
                        Launch <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Deadlines and Alerts */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upcoming Training Deadlines */}
            <div className={`border rounded-2xl p-5 space-y-4.5 ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Upcoming Lab Milestones
              </h3>

              <div className="space-y-3">
                {[
                  { title: "OWASP Vulnerability Audit", due: "Tomorrow, 6:00 PM", severity: "High" },
                  { title: "Linux Privilege escalation sandbox", due: "In 3 Days", severity: "Medium" },
                  { title: "Symmetric Encryption Decryption test", due: "In 6 Days", severity: "Low" }
                ].map((dl, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex gap-3 ${
                      theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <span className="font-bold block leading-snug">{dl.title}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">{dl.due}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase font-bold shrink-0 self-start ${
                      dl.severity === "High" ? "bg-red-500/10 text-red-400" :
                      dl.severity === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {dl.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Availability Heat HUD */}
            <div className={`border rounded-2xl p-5 space-y-3.5 ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Availability Thresholds
              </h3>
              
              <div className="space-y-2.5">
                {Object.keys(weeklyAvailability).map((day) => {
                  const minutes = weeklyAvailability[day];
                  const percentage = Math.min((minutes / 120) * 100, 100);
                  
                  return (
                    <div key={day} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[10px] font-semibold font-mono">
                        <span className="text-slate-500">{day}</span>
                        <span className="text-slate-400">{minutes} minutes</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
