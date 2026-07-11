import React, { useState, useEffect } from "react";
import { UserAcademyProfile } from "../types/academy";
import { ACADEMY_COURSES, CTF_CHALLENGES } from "../data/academyCourses";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Import custom sub-views
import AcademyDashboard from "./AcademyDashboard";
import AcademyCourses from "./AcademyCourses";
import AcademyCTF from "./AcademyCTF";
import AcademyAIMentor from "./AcademyAIMentor";
import AcademyCertificates from "./AcademyCertificates";
import AcademyInstructor from "./AcademyInstructor";
import AcademyAdmin from "./AcademyAdmin";
import AcademyLabs from "./AcademyLabs";
import AcademySkillTree from "./AcademySkillTree";
import AcademyStudyPlanner from "./AcademyStudyPlanner";
import AcademyShop from "./AcademyShop";

import { 
  Trophy, 
  BookOpen, 
  Radio, 
  Sparkles, 
  Award, 
  Settings, 
  Shield, 
  Menu, 
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Terminal,
  Calendar,
  ShoppingBag,
  Compass
} from "lucide-react";

interface AcademyProps {
  currentUser: { id: string; fullName: string; email: string; role: string; orgName: string };
  theme?: "light" | "dark";
}

export default function Academy({ currentUser, theme = "light" }: AcademyProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [profile, setProfile] = useState<UserAcademyProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // For navigating with item context from Dashboard continue button
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<any>(null);

  useEffect(() => {
    fetchAcademyProfileAndStats();
  }, [currentUser]);

  const fetchAcademyProfileAndStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Academy Profile
      const profileDoc = await getDoc(doc(db, "academyProfiles", currentUser.id));
      let currentProfile: UserAcademyProfile;

      if (profileDoc.exists()) {
        currentProfile = profileDoc.data() as UserAcademyProfile;
        let hasMigration = false;
        if (currentProfile.coins === undefined) { currentProfile.coins = 120; hasMigration = true; }
        if (!currentProfile.inventory) { currentProfile.inventory = ["item-lab-hint-token"]; hasMigration = true; }
        if (currentProfile.activeTitle === undefined) { currentProfile.activeTitle = "Clearance Cadet"; hasMigration = true; }
        if (currentProfile.activeBannerClass === undefined) { currentProfile.activeBannerClass = ""; hasMigration = true; }
        if (currentProfile.activeCareerGoalId === undefined) { currentProfile.activeCareerGoalId = null; hasMigration = true; }
        if (currentProfile.studyPlan === undefined) { currentProfile.studyPlan = null; hasMigration = true; }
        
        if (hasMigration) {
          await setDoc(doc(db, "academyProfiles", currentUser.id), currentProfile);
        }
        setProfile(currentProfile);
      } else {
        // Build base default academy profile
        currentProfile = {
          xp: 120,
          level: 1,
          streak: 3,
          rank: "Clearance Cadet",
          completedLessonIds: ["l1_1"],
          completedCourseIds: [],
          completedCtfIds: [],
          unlockedBadges: ["badge-novice"],
          earnedCertificates: [],
          weeklyStudyMinutes: 45,
          dailyGoalMinutes: 15,
          coins: 120,
          inventory: ["item-lab-hint-token"],
          activeTitle: "Clearance Cadet",
          activeBannerClass: "",
          activeCareerGoalId: null,
          studyPlan: null
        };
        await setDoc(doc(db, "academyProfiles", currentUser.id), currentProfile);
        setProfile(currentProfile);
      }

      // 2. Compute live leaderboard standing dynamically across all registered users
      const [profilesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "academyProfiles")),
        getDocs(collection(db, "users"))
      ]);

      const profilesMap: { [key: string]: any } = {};
      profilesSnapshot.forEach(doc => {
        profilesMap[doc.id] = doc.data();
      });

      const leaderData: any[] = [];
      usersSnapshot.forEach(doc => {
        const uData = doc.data();
        const uId = doc.id;
        const prof = profilesMap[uId] || {
          xp: 120,
          level: 1,
          rank: "Clearance Cadet",
          streak: 3
        };
        leaderData.push({
          userId: uId,
          fullName: uData.fullName || "Anonymous Analyst",
          email: uData.email || "",
          xp: prof.xp,
          level: prof.level,
          rank: prof.rank,
          streak: prof.streak
        });
      });

      // Sort leaderboard descending by XP points
      leaderData.sort((a, b) => b.xp - a.xp);
      setLeaderboard(leaderData);

    } catch (err) {
      console.error("Failure synchronizing SecOps Academy profiles from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (courseId: string, lessonId: string, xpReward: number) => {
    setSyncing(true);
    try {
      const currentProfile = profile || {
        xp: 120,
        level: 1,
        streak: 3,
        rank: "Clearance Cadet",
        completedLessonIds: ["l1_1"],
        completedCourseIds: [],
        completedCtfIds: [],
        unlockedBadges: ["badge-novice"],
        earnedCertificates: [],
        weeklyStudyMinutes: 45,
        dailyGoalMinutes: 15
      };

      const completedLessonIds = [...currentProfile.completedLessonIds];
      let xp = currentProfile.xp;
      let level = currentProfile.level;
      let rank = currentProfile.rank;
      const completedCourseIds = [...currentProfile.completedCourseIds];
      const earnedCertificates = [...currentProfile.earnedCertificates];
      const unlockedBadges = [...currentProfile.unlockedBadges];
      let weeklyStudyMinutes = currentProfile.weeklyStudyMinutes || 45;

      if (!completedLessonIds.includes(lessonId)) {
        completedLessonIds.push(lessonId);
        xp += xpReward || 50;
        weeklyStudyMinutes += Math.floor(Math.random() * 10) + 10;
        
        level = Math.floor(xp / 300) + 1;
        if (level >= 10) {
          rank = "Sovereign Threat Hunter";
        } else if (level >= 5) {
          rank = "SecOps Senior Responder";
        } else if (level >= 3) {
          rank = "Junior Cyber Defender";
        } else {
          rank = "Clearance Cadet";
        }

        // Course completion logic
        const courseRequirements: { [key: string]: string[] } = {
          "course-1": ["l1_1", "l1_2", "l2_1"],
          "course-2": ["l2_1_1", "l2_1_2"]
        };

        if (courseId && courseRequirements[courseId]) {
          const reqs = courseRequirements[courseId];
          const completedAll = reqs.every(id => completedLessonIds.includes(id));
          if (completedAll && !completedCourseIds.includes(courseId)) {
            completedCourseIds.push(courseId);
            xp += 150;
            
            const certId = `CERT-CF-${Math.floor(Math.random() * 900000 + 100000)}`;
            const courseTitles: { [key: string]: string } = {
              "course-1": "OWASP Top 10 & Web Security Vulnerabilities",
              "course-2": "Linux Operating System Hardening"
            };
            const courseInstructors: { [key: string]: string } = {
              "course-1": "Sarah Vance, Principal Security Architect",
              "course-2": "Marcus Aurelius, Blue Team Lead"
            };

            const newCert = {
              id: `cert-${Math.random().toString(36).substr(2, 9)}`,
              courseId,
              courseName: courseTitles[courseId] || "Advanced Systems Security",
              studentName: currentUser.fullName,
              completedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
              verificationId: certId,
              instructor: courseInstructors[courseId] || "Cyber Fortress Academy Board"
            };
            
            earnedCertificates.push(newCert);

            // Create compliance audit trace log
            const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
            await setDoc(doc(db, "auditLogs", logId), {
              id: logId,
              userId: currentUser.id,
              userEmail: currentUser.email,
              action: "Certificate Earned",
              details: `Successfully completed course: "${newCert.courseName}". Certificate ID: ${certId} issued.`,
              status: "Success",
              timestamp: new Date().toISOString()
            });
          }
        }

        // Sandbox lab badge validations
        const labLessonIds = ["l1_2", "l2_1_2"];
        const completedLabsCount = labLessonIds.filter(id => completedLessonIds.includes(id)).length;
        if (completedLabsCount >= 2 && !unlockedBadges.includes("badge-lab-slayer")) {
          unlockedBadges.push("badge-lab-slayer");
          const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
          await setDoc(doc(db, "auditLogs", logId), {
            id: logId,
            userId: currentUser.id,
            userEmail: currentUser.email,
            action: "Badge Unlocked",
            details: "Earned badge: Terminal Sandbox Wizard for resolving multiple laboratory challenges",
            status: "Success",
            timestamp: new Date().toISOString()
          });
        }

        const updatedProfile = {
          ...currentProfile,
          xp,
          level,
          rank,
          completedLessonIds,
          completedCourseIds,
          earnedCertificates,
          unlockedBadges,
          weeklyStudyMinutes
        };

        await setDoc(doc(db, "academyProfiles", currentUser.id), updatedProfile);
        setProfile(updatedProfile);

        // Add transaction audit logs
        const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, "auditLogs", logId), {
          id: logId,
          userId: currentUser.id,
          userEmail: currentUser.email,
          action: "Academy Lesson Complete",
          details: `Logged course module progress. Awarded +${xpReward || 50} XP.`,
          status: "Success",
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failure saving completed lesson state to Firestore:", err);
    } finally {
      setSyncing(false);
      fetchAcademyProfileAndStats(); // Reload profile & leaderboard
    }
  };

  const handleCtfSubmit = async (challengeId: string, flag: string) => {
    const challengeFlags: { [key: string]: { flag: string, points: number, xp: number, title: string } } = {
      "ctf-1": { flag: "CF{vault_gate_bypassed_99}", points: 100, xp: 200, title: "The Broken Vault Gate" },
      "ctf-2": { flag: "CF{crypto_scheme_decrypted_44}", points: 250, xp: 350, title: "Cipher Cipher Everywhere" },
      "ctf-3": { flag: "CF{forensics_ip_sweep_hunted_12}", points: 400, xp: 500, title: "Ghost in the Shell Logs" }
    };

    const chall = challengeFlags[challengeId];
    if (!chall) {
      throw new Error("Security challenge record not found.");
    }

    const cleanFlag = flag.trim();
    if (cleanFlag !== chall.flag) {
      // Add audit log for CTF failure
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "CTF Submission Failure",
        details: `Incorrect flag submission for "${chall.title}". Attempted input length: ${cleanFlag.length} chars`,
        status: "Failure",
        timestamp: new Date().toISOString()
      });
      throw new Error("Incorrect flag payload structure. Audit trail logged.");
    }

    const currentProfile = profile || {
      xp: 120,
      level: 1,
      streak: 3,
      rank: "Clearance Cadet",
      completedLessonIds: ["l1_1"],
      completedCourseIds: [],
      completedCtfIds: [],
      unlockedBadges: ["badge-novice"],
      earnedCertificates: [],
      weeklyStudyMinutes: 45,
      dailyGoalMinutes: 15
    };

    const completedCtfIds = [...currentProfile.completedCtfIds];
    let xp = currentProfile.xp;
    let level = currentProfile.level;
    let rank = currentProfile.rank;
    const unlockedBadges = [...currentProfile.unlockedBadges];
    let badgeUnlocked = null;

    if (!completedCtfIds.includes(challengeId)) {
      completedCtfIds.push(challengeId);
      xp += chall.xp;

      if (!unlockedBadges.includes("badge-ctf-hunter")) {
        unlockedBadges.push("badge-ctf-hunter");
        badgeUnlocked = "badge-ctf-hunter";
        const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, "auditLogs", logId), {
          id: logId,
          userId: currentUser.id,
          userEmail: currentUser.email,
          action: "Badge Unlocked",
          details: "Earned badge: Flag Capturer for solving an official CTF security challenge",
          status: "Success",
          timestamp: new Date().toISOString()
        });
      }

      level = Math.floor(xp / 300) + 1;
      if (level >= 10) {
        rank = "Sovereign Threat Hunter";
      } else if (level >= 5) {
        rank = "SecOps Senior Responder";
      } else if (level >= 3) {
        rank = "Junior Cyber Defender";
      } else {
        rank = "Clearance Cadet";
      }

      const updatedProfile = {
        ...currentProfile,
        xp,
        level,
        rank,
        completedCtfIds,
        unlockedBadges
      };

      await setDoc(doc(db, "academyProfiles", currentUser.id), updatedProfile);
      setProfile(updatedProfile);

      // Add audit log for CTF solve
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "CTF Flag Solved",
        details: `Correct flag verified for "${chall.title}". Awarded +${chall.xp} XP.`,
        status: "Success",
        timestamp: new Date().toISOString()
      });
    }

    // Refresh metrics & standings asynchronously
    fetchAcademyProfileAndStats();

    return {
      success: true,
      badgeUnlocked,
      message: `Flag confirmed! Awarded +${chall.points} Points and +${chall.xp} XP.`
    };
  };

  const handleNavigateWithContext = (tab: string, item?: any) => {
    setActiveSubTab(tab);
    if (tab === "courses" && item) {
      // Pass course selection down if continuing course from Dashboard
      setSelectedCourseForSyllabus(item);
    }
  };

  const handleSetCareerGoal = async (goalId: string) => {
    if (!profile) return;
    setSyncing(true);
    try {
      const updated = { ...profile, activeCareerGoalId: goalId };
      await setDoc(doc(db, "academyProfiles", currentUser.id), updated);
      setProfile(updated);
    } catch (err) {
      console.error("Error setting career goal:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStudyPlan = async (plan: any) => {
    if (!profile) return;
    setSyncing(true);
    try {
      const updated = { ...profile, studyPlan: plan };
      await setDoc(doc(db, "academyProfiles", currentUser.id), updated);
      setProfile(updated);
    } catch (err) {
      console.error("Error saving study plan:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleBuyItem = async (item: any) => {
    if (!profile) return;
    const currentCoins = profile.coins ?? 120;
    const currentInventory = profile.inventory ?? ["item-lab-hint-token"];
    
    if (currentCoins < item.cost) return;
    
    setSyncing(true);
    try {
      const updatedInventory = [...currentInventory];
      if (item.category !== "hint" && !updatedInventory.includes(item.id)) {
        updatedInventory.push(item.id);
      } else if (item.category === "hint") {
        updatedInventory.push(item.id); // consumable hint token
      }

      const updated = { 
        ...profile, 
        coins: currentCoins - item.cost, 
        inventory: updatedInventory 
      };
      await setDoc(doc(db, "academyProfiles", currentUser.id), updated);
      setProfile(updated);
    } catch (err) {
      console.error("Error purchasing clearance item:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleEquipTitle = async (title: string) => {
    if (!profile) return;
    setSyncing(true);
    try {
      const updated = { ...profile, activeTitle: title };
      await setDoc(doc(db, "academyProfiles", currentUser.id), updated);
      setProfile(updated);
    } catch (err) {
      console.error("Error equipping title:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleEquipBanner = async (bannerClass: string) => {
    if (!profile) return;
    setSyncing(true);
    try {
      const updated = { ...profile, activeBannerClass: bannerClass };
      await setDoc(doc(db, "academyProfiles", currentUser.id), updated);
      setProfile(updated);
    } catch (err) {
      console.error("Error equipping banner theme:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
          SEC_ACADEMY: Synchronizing credentials profile state...
        </span>
      </div>
    );
  }

  // Define authorization guards
  const isInstructor = currentUser.role.toLowerCase().includes("instructor") || currentUser.role.toLowerCase().includes("teacher") || currentUser.role.toLowerCase().includes("analyst") || currentUser.role.toLowerCase().includes("admin");
  const isAdmin = currentUser.role.toLowerCase().includes("administrator") || currentUser.role.toLowerCase().includes("admin");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 text-left" id="cyber-academy-root">
      
      {/* 1. Sidebar Nav Hub */}
      <div className="lg:col-span-3 space-y-4">
        <div className={`border rounded-2xl p-4 space-y-5 sticky top-24 ${
          theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-200/10 pb-3">
            <div className={`p-1.5 rounded-lg border ${
              theme === "dark" ? "bg-blue-950/40 border-blue-800/40 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
            }`}>
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-xs font-black block tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                Academy Terminal
              </h3>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider block uppercase">NAV_CONTROL_MODULES</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard Hub", icon: <Trophy className="h-4 w-4" /> },
              { id: "courses", label: "Syllabus & Labs", icon: <BookOpen className="h-4 w-4" /> },
              { id: "labs", label: "Cyber Range Labs", icon: <Terminal className="h-4 w-4" /> },
              { id: "ctf", label: "CTF Exploits Arena", icon: <Radio className="h-4 w-4" /> },
              { id: "skill_tree", label: "Skill Trees & Roadmaps", icon: <Compass className="h-4 w-4" /> },
              { id: "study_planner", label: "Study Planner & Goals", icon: <Calendar className="h-4 w-4" /> },
              { id: "shop", label: "Clearance Store", icon: <ShoppingBag className="h-4 w-4" /> },
              { id: "mentor", label: "AI Mentor Guidance", icon: <Sparkles className="h-4 w-4" /> },
              { id: "certificates", label: "Clearance Certificates", icon: <Award className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                  activeSubTab === tab.id
                    ? theme === "dark"
                      ? "bg-slate-850 text-white border border-slate-800"
                      : "bg-blue-50 text-blue-600 border border-blue-100 shadow-inner"
                    : theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-850/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-40" />
              </button>
            ))}

            {/* Privileged Portals */}
            {isInstructor && (
              <div className="pt-4 border-t border-slate-200/10 mt-2 space-y-1">
                <span className="text-[9px] text-slate-500 font-mono tracking-wider font-extrabold uppercase block px-3 mb-1.5">Privileged Areas</span>
                
                <button
                  onClick={() => setActiveSubTab("instructor")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeSubTab === "instructor"
                      ? theme === "dark"
                        ? "bg-slate-850 text-white border border-slate-800"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white hover:bg-slate-850/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    <span>Instructor Portal</span>
                  </div>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setActiveSubTab("admin")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                      activeSubTab === "admin"
                        ? theme === "dark"
                          ? "bg-slate-850 text-white border border-slate-800"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-850/50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-slate-500" />
                      <span>Admin Control</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Module Workspace */}
      <div className="lg:col-span-9 relative">
        {syncing && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-3 py-1.5 rounded-lg border border-slate-800 z-50 flex items-center gap-1.5 shadow-md">
            <Loader2 className="h-3 w-3 animate-spin text-blue-400" /> SYNCING_LEDGER...
          </div>
        )}

        {profile && activeSubTab === "dashboard" && (
          <AcademyDashboard 
            profile={profile}
            courses={ACADEMY_COURSES}
            leaderboard={leaderboard}
            currentUser={currentUser}
            onNavigateToTab={handleNavigateWithContext}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "courses" && (
          <AcademyCourses 
            courses={ACADEMY_COURSES}
            profile={profile}
            userId={currentUser.id}
            onLessonComplete={handleLessonComplete}
            onNavigateToTab={(tab) => handleNavigateWithContext(tab)}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "ctf" && (
          <AcademyCTF 
            challenges={CTF_CHALLENGES}
            profile={profile}
            userId={currentUser.id}
            onCtfSubmit={handleCtfSubmit}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "labs" && (
          <AcademyLabs 
            currentUser={currentUser}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "skill_tree" && (
          <AcademySkillTree
            profile={profile}
            activeCareerGoalId={profile.activeCareerGoalId ?? null}
            onSetCareerGoal={handleSetCareerGoal}
            onNavigateToTab={handleNavigateWithContext}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "study_planner" && (
          <AcademyStudyPlanner
            profile={profile}
            studyPlan={profile.studyPlan ?? null}
            onUpdateStudyPlan={handleUpdateStudyPlan}
            onNavigateToTab={handleNavigateWithContext}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "shop" && (
          <AcademyShop
            profile={profile}
            coins={profile.coins ?? 120}
            inventory={profile.inventory ?? ["item-lab-hint-token"]}
            activeTitle={profile.activeTitle ?? "Clearance Cadet"}
            onBuyItem={handleBuyItem}
            onEquipTitle={handleEquipTitle}
            onEquipBanner={handleEquipBanner}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "mentor" && (
          <AcademyAIMentor 
            profile={profile}
            userId={currentUser.id}
            theme={theme}
          />
        )}

        {profile && activeSubTab === "certificates" && (
          <AcademyCertificates 
            certificates={profile.earnedCertificates}
            theme={theme}
          />
        )}

        {isInstructor && activeSubTab === "instructor" && (
          <AcademyInstructor 
            courses={ACADEMY_COURSES}
            theme={theme}
          />
        )}

        {isAdmin && activeSubTab === "admin" && (
          <AcademyAdmin 
            courses={ACADEMY_COURSES}
            theme={theme}
          />
        )}
      </div>

    </div>
  );
}
