import React from "react";
import { UserAcademyProfile, Course } from "../types/academy";
import { 
  Trophy, 
  Flame, 
  Award, 
  Compass, 
  Terminal, 
  ArrowRight, 
  Zap, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  GraduationCap, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Target,
  ChevronRight 
} from "lucide-react";

interface AcademyDashboardProps {
  profile: UserAcademyProfile;
  courses: Course[];
  leaderboard: any[];
  currentUser: { fullName: string; email: string };
  onNavigateToTab: (tab: string, item?: any) => void;
  theme?: "light" | "dark";
}

export default function AcademyDashboard({ 
  profile, 
  courses, 
  leaderboard,
  currentUser,
  onNavigateToTab,
  theme = "light" 
}: AcademyDashboardProps) {

  // Load custom extended profile parameters safely
  const coins = profile.coins ?? 120;
  const activeTitle = profile.activeTitle ?? "Clearance Cadet";
  const activeBanner = profile.activeBannerClass ?? "";
  const careerGoalId = profile.activeCareerGoalId ?? null;

  // Find user rank index
  const myRankIndex = leaderboard.findIndex(item => item.email === currentUser.email) + 1 || 1;

  // Find next upcoming course
  const upcomingCourse = courses.find(c => !profile.completedCourseIds.includes(c.id)) || courses[0];

  // XP Progress calculation
  const xpPercentage = Math.min(Math.floor(((profile.xp % 300) / 300) * 100), 100);

  // Daily goals percentage
  const dailyGoalPercentage = Math.min(Math.floor((profile.weeklyStudyMinutes / (profile.dailyGoalMinutes * 7 || 105)) * 100), 100);

  // Calculate Course Completion statistics
  const totalCoursesCount = courses.length || 1;
  const completedCoursesCount = profile.completedCourseIds.length;
  const overallCourseCompletionPercent = Math.round((completedCoursesCount / totalCoursesCount) * 100);

  // Domain Skill Mastery scores calculation
  const getDomainScore = (domainId: string) => {
    // Basic calculation based on lessons completed
    if (domainId === "web_sec") {
      const isL1Done = profile.completedLessonIds.includes("l1_1") ? 40 : 0;
      const isL2Done = profile.completedLessonIds.includes("l1_2") ? 40 : 0;
      const isL3Done = profile.completedLessonIds.includes("l2_1") ? 20 : 0;
      return isL1Done + isL2Done + isL3Done;
    }
    if (domainId === "linux_hard") {
      return profile.completedLessonIds.includes("l1_2") ? 65 : 20;
    }
    if (domainId === "crypto") {
      return profile.completedCtfIds.includes("ctf-2") ? 80 : 30;
    }
    if (domainId === "net_sec") {
      return profile.completedLessonIds.includes("l1_1") ? 45 : 15;
    }
    return profile.completedCtfIds.includes("ctf-3") ? 75 : 25; // forensics
  };

  const domainMasteries = [
    { id: "web_sec", name: "Web Security", score: getDomainScore("web_sec") },
    { id: "linux_hard", name: "Linux Hardening", score: getDomainScore("linux_hard") },
    { id: "crypto", name: "Cryptology", score: getDomainScore("crypto") },
    { id: "net_sec", name: "Network Auditing", score: getDomainScore("net_sec") },
    { id: "forensics", name: "Incident Response", score: getDomainScore("forensics") }
  ];

  // Group into Strengths & Weaknesses
  const strengths = [...domainMasteries].sort((a, b) => b.score - a.score).slice(0, 2);
  const weakSkills = [...domainMasteries].sort((a, b) => a.score - b.score).slice(0, 2);

  // Custom adaptive AI Recommendation block
  const getAiRecommendation = () => {
    const weakest = weakSkills[0];
    if (weakest.id === "web_sec") {
      return {
        text: "We detected lower activity levels in Web Application parameters. Focus on SQL Injection bypass mechanisms in Course 1.",
        lesson: "OWASP Top 10 SQLi",
        actionTab: "courses"
      };
    }
    if (weakest.id === "linux_hard") {
      return {
        text: "Your server security score is under-audited. We suggest launching the Linux SUID Privilege Escalation training simulation.",
        lesson: "Linux SUID Lab",
        actionTab: "labs"
      };
    }
    return {
      text: "Based on security standings, we suggest diving into standard Cryptographic cipher analysis inside the CTF Arena.",
      lesson: "CTF Cipher challenge",
      actionTab: "ctf"
    };
  };

  const aiRec = getAiRecommendation();

  // Draw custom high-fidelity SVG Skill Radar Map
  // Calculates polar coordinates dynamically for Web, Linux, Crypto, Network, Forensics
  const radarPoints = domainMasteries.map((m, idx) => {
    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2; // 5-sided polar spacing
    const radius = 35 + (m.score / 100) * 45; // scale to fit inside 100px radius
    const x = Math.round(100 + radius * Math.cos(angle));
    const y = Math.round(100 + radius * Math.sin(angle));
    return { x, y, name: m.name };
  });

  const radarPath = radarPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans" id="academy-dashboard-view">
      
      {/* 1. Header Hero Welcome Card with Optional Shop Banner Overlay */}
      <div className={`border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg bg-gradient-to-r ${
        activeBanner ? activeBanner : theme === "dark" 
          ? "from-slate-900/60 via-slate-950 to-slate-900/60 border-slate-800" 
          : "from-blue-50/40 via-white to-blue-50/20 border-slate-200/80"
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-40 w-40 text-blue-500" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              theme === "dark" ? "bg-blue-950/40 border-blue-900/40 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
            }`}>
              <Zap className="h-3 w-3 animate-pulse" /> Active Clearance Title: {activeTitle}
            </span>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Welcome back, {currentUser.fullName}!
            </h1>
            <p className={`text-xs max-w-xl ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Secure learning environment is active. Practice terminal network analysis, remediate logic flaws, and manage security credentials.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateToTab("courses")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              Launch Courses <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab("shop")}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              Clearance Store <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Level & XP Progression HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200/10 relative z-10">
          <div className="space-y-1">
            <span className={`text-[10px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Clearance Level</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>LVL {profile.level}</span>
              <span className="text-[10px] text-blue-500 font-bold">({profile.xp} XP total)</span>
            </div>
            <div className={`h-1.5 w-full rounded-full overflow-hidden mt-1 bg-slate-200 ${theme === "dark" ? "bg-slate-850" : "bg-slate-250"}`}>
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${xpPercentage}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">{300 - (profile.xp % 300)} XP to Next Level</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${theme === "dark" ? "bg-amber-950/20 border-amber-900/30 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className={`text-[10px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Active Streak</span>
              <span className={`text-lg font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{profile.streak} Days Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${theme === "dark" ? "bg-purple-950/20 border-purple-900/30 text-purple-400" : "bg-purple-50 border-purple-100 text-purple-700"}`}>
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className={`text-[10px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Earned Coins</span>
              <span className={`text-lg font-bold block ${theme === "dark" ? "text-purple-300" : "text-purple-800"}`}>{coins} Coins</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${theme === "dark" ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className={`text-[10px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Leaderboard</span>
              <span className={`text-lg font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Rank #{myRankIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Learning Goals & Continue Learning & Adaptive AI Rec Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Learning Goals (Study Planner summary) & Continue Course */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Today's Goals widget */}
            <div className={`border rounded-2xl p-5 space-y-3.5 ${
              theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                  Today's Goals
                </h3>
                <span className="text-[10px] font-mono text-blue-500 font-bold">15 Mins / Daily Goal</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-xs">
                  <span className="font-semibold">Interactive Practice</span>
                  <span className="text-slate-400 font-mono text-[10px]">10m left</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-xs">
                  <span className="font-semibold">Review AI Explanations</span>
                  <span className="text-emerald-400 font-bold font-mono">Completed</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab("study_planner")}
                className="w-full text-center py-2 border rounded-xl text-[11px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 cursor-pointer"
              >
                Go to Study Planner
              </button>
            </div>

            {/* Continue Learning card */}
            {upcomingCourse && (
              <div className={`border rounded-2xl p-5 space-y-3.5 ${
                theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                    Active Assignment
                  </h3>
                  <span className="text-[10px] text-blue-500 font-mono font-bold uppercase tracking-wider">In Progress</span>
                </div>

                <div className="space-y-1">
                  <h4 className={`text-xs font-bold truncate ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    {upcomingCourse.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    Estimated time remaining: {upcomingCourse.estimatedTime}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigateToTab("courses", upcomingCourse)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    Launch Lesson <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* AI Mentor Recommendations Callout */}
          <div className={`border rounded-2xl p-4.5 flex gap-4 ${
            theme === "dark" ? "bg-purple-950/10 border-purple-900/20 text-purple-300" : "bg-purple-50 border-purple-100 text-purple-950"
          }`}>
            <Sparkles className="h-6 w-6 text-purple-500 shrink-0 animate-pulse mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold block font-mono text-[10px] uppercase text-purple-400">AI Mentor Guidance</span>
              <p className="leading-relaxed font-medium">
                "{aiRec.text}"
              </p>
              <button
                onClick={() => onNavigateToTab(aiRec.actionTab)}
                className="text-[10px] font-black underline text-purple-500 hover:text-purple-400 flex items-center gap-1 mt-1 cursor-pointer"
              >
                Launch Recommended Area: "{aiRec.lesson}" <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Strengths & Weak Skills */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              Domain Skill Mastery
            </h3>

            <div className="space-y-4 text-xs">
              {/* Strengths */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Top Strengths</span>
                {strengths.map(st => (
                  <div key={st.id} className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <span className="font-semibold text-emerald-400">⚡ {st.name}</span>
                    <span className="font-mono font-extrabold text-emerald-400">{st.score}%</span>
                  </div>
                ))}
              </div>

              {/* Weak Skills */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Needs Audit Attention</span>
                {weakSkills.map(wk => (
                  <div key={wk.id} className="flex justify-between items-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="font-semibold text-red-400">⚠️ {wk.name}</span>
                    <span className="font-mono font-extrabold text-red-400">{wk.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Skill Radar Chart & Study Time / XP Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Skill Radar Graphic (Bespoke SVG) */}
        <div className="lg:col-span-6">
          <div className={`border rounded-2xl p-5 space-y-4 flex flex-col justify-between ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Adaptive Skill Radar Map
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time graphic representation of your multi-domain SecOps skill matrix.</p>
            </div>

            {/* Bespoke Interactive Radar SVG */}
            <div className="flex items-center justify-center py-4">
              <svg className="w-48 h-48 max-w-full overflow-visible" viewBox="0 0 200 200">
                {/* Radial circular grid rings */}
                <circle cx="100" cy="100" r="80" fill="none" stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="none" stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="none" stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                
                {/* 5-axis polar lines */}
                {domainMasteries.map((m, idx) => {
                  const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                  const x = Math.round(100 + 80 * Math.cos(angle));
                  const y = Math.round(100 + 80 * Math.sin(angle));
                  return (
                    <line key={idx} x1="100" y1="100" x2={x} y2={y} stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                  );
                })}

                {/* Radar Data Polygon Area */}
                <polygon 
                  points={radarPath} 
                  fill="rgba(59, 130, 246, 0.15)" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                />

                {/* Plot dots for actual points */}
                {radarPoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke={theme === "dark" ? "#0f172a" : "#fff"} strokeWidth="1" />
                ))}

                {/* Axis text labels */}
                {radarPoints.map((p, idx) => {
                  const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                  const labelRadius = 94; // place outside ring
                  const lx = Math.round(100 + labelRadius * Math.cos(angle));
                  const ly = Math.round(100 + labelRadius * Math.sin(angle));
                  return (
                    <text 
                      key={idx} 
                      x={lx} 
                      y={ly} 
                      fontSize="7.5" 
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle" 
                      fill={theme === "dark" ? "#94a3b8" : "#475569"}
                    >
                      {p.name.substr(0, 8)}..
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Study stats & Learning velocity */}
        <div className="lg:col-span-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Total Study Time & Consistency widget */}
            <div className={`border rounded-2xl p-5 space-y-3 ${
              theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Study metrics</span>
              <h4 className={`text-sm font-extrabold ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Operational Study consistency
              </h4>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {profile.weeklyStudyMinutes}
                </span>
                <span className="text-xs text-slate-400 font-semibold">minutes studied</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+12% vs previous run</span>
              </div>
            </div>

            {/* Learning Velocity (modules count completed) */}
            <div className={`border rounded-2xl p-5 space-y-3 ${
              theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Velocity</span>
              <h4 className={`text-sm font-extrabold ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Clearance execution speed
              </h4>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {profile.completedLessonIds.length}
                </span>
                <span className="text-xs text-slate-400 font-semibold">modules complete</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 block leading-tight">
                Includes laboratory sessions and interactive audits
              </span>
            </div>

          </div>

          {/* XP Milestones bar chart mock (Bespoke SVG representation) */}
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <div className="flex justify-between items-center border-b border-slate-200/10 pb-2">
              <h4 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                Chronological XP milestones (Weekly & Monthly)
              </h4>
              <span className="text-[9px] font-mono text-slate-500">XP Gains</span>
            </div>

            {/* SVG Spark Bar chart */}
            <div className="flex items-end justify-between gap-2.5 h-20 pt-2">
              {[
                { label: "Mon", xp: 50 },
                { label: "Tue", xp: 0 },
                { label: "Wed", xp: 120 },
                { label: "Thu", xp: 30 },
                { label: "Fri", xp: 80 },
                { label: "Sat", xp: 150 },
                { label: "Sun", xp: profile.xp % 100 }
              ].map((bar, idx) => {
                const heightPercent = Math.max((bar.xp / 150) * 100, 6);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center space-y-1.5">
                    <div className="w-full bg-blue-600/15 rounded-md relative flex items-end overflow-hidden h-14">
                      <div 
                        className="w-full bg-blue-600 rounded-md transition-all duration-500" 
                        style={{ height: `${heightPercent}%` }} 
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Complete Status & Suggested Challenges & Recent Certificates Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Course completion percentage gauge & Career progress */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4.5 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              Syllabus clearances progress
            </h3>

            <div className="flex items-center gap-4 text-xs">
              {/* Circular progress SVG */}
              <div className="relative shrink-0 w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray={`${overallCourseCompletionPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs text-slate-800 dark:text-white">
                  {overallCourseCompletionPercent}%
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold block leading-tight">Course Execution progress</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  You have completed {completedCoursesCount} of {totalCoursesCount} total training courses available in the catalog.
                </p>
              </div>
            </div>

            {/* Career target status */}
            <div className="pt-3 border-t border-slate-200/10 text-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider font-bold">Career goal target:</span>
              {careerGoalId ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-600/5 border border-blue-500/10 mt-1">
                  <span className="font-bold text-blue-400 capitalize">{careerGoalId} Analyst</span>
                  <button
                    onClick={() => onNavigateToTab("skill_tree")}
                    className="text-[10px] text-blue-500 underline cursor-pointer"
                  >
                    View roadmap
                  </button>
                </div>
              ) : (
                <div className="p-2 border border-dashed rounded-lg border-slate-200 dark:border-slate-850 mt-1 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">No active career goals declared.</span>
                  <button
                    onClick={() => onNavigateToTab("skill_tree")}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] px-2 py-1 rounded transition cursor-pointer"
                  >
                    Declare Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested labs / challenges / articles */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              Suggested Training targets
            </h3>

            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => onNavigateToTab("labs")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold truncate">Practice Lab: SQLi Escape</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateToTab("ctf")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold truncate">CTF: Broken Vault Gate</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <a
                href="https://owasp.org/www-project-top-ten/"
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="font-semibold truncate">Article: OWASP official briefing</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Recent Certificates checklist */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              Verifiable Credentials
            </h3>

            <div className="space-y-2 text-xs">
              {profile.earnedCertificates.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-semibold italic">
                  No certificates generated yet. Complete Course 1!
                </div>
              ) : (
                profile.earnedCertificates.slice(0, 2).map(cert => (
                  <div key={cert.id} className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                    <div className="space-y-0.5 truncate pr-2">
                      <span className="font-bold block truncate text-emerald-400">{cert.courseName}</span>
                      <span className="text-[8px] font-mono text-slate-500 block">ID: {cert.verificationId}</span>
                    </div>
                    <button
                      onClick={() => onNavigateToTab("certificates")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1.5 rounded transition cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
