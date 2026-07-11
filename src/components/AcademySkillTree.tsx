import React, { useState } from "react";
import { UserAcademyProfile } from "../types/academy";
import { SKILL_TREE_NODES, CAREER_PATHWAYS, SECURITY_DOMAINS } from "../data/learningEngineData";
import { SkillTreeNode, CareerPathway } from "../types/learningEngine";
import { 
  Compass, 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  Target, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Terminal, 
  Award, 
  ShieldCheck, 
  Cloud, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

interface AcademySkillTreeProps {
  profile: UserAcademyProfile;
  activeCareerGoalId: string | null;
  onSetCareerGoal: (goalId: string) => void;
  onNavigateToTab: (tab: string, item?: any) => void;
  theme?: "light" | "dark";
}

export default function AcademySkillTree({
  profile,
  activeCareerGoalId,
  onSetCareerGoal,
  onNavigateToTab,
  theme = "light"
}: AcademySkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"tree" | "roadmaps">("tree");

  // Helper to check if a node is unlocked based on dependencies
  const isNodeUnlocked = (node: SkillTreeNode) => {
    if (node.dependencies.length === 0) return true;
    return node.dependencies.every(depId => {
      const depNode = SKILL_TREE_NODES.find(n => n.id === depId);
      if (!depNode) return true;
      // In our academy, a skill node is complete if its linked lessons are completed.
      // If it doesn't have lessons, it is unlocked if its dependencies are complete.
      return depNode.lessonIds.length === 0 || depNode.lessonIds.every(lessonId => profile.completedLessonIds.includes(lessonId));
    });
  };

  // Helper to check if a node is completed
  const isNodeCompleted = (node: SkillTreeNode) => {
    if (node.lessonIds.length === 0) {
      // Completed if unlocked and parent completed
      return isNodeUnlocked(node);
    }
    return node.lessonIds.every(lessonId => profile.completedLessonIds.includes(lessonId));
  };

  // Compute Career Pathway progress
  const getPathwayProgress = (pathway: CareerPathway) => {
    if (pathway.requiredNodeIds.length === 0) return 100;
    const completedCount = pathway.requiredNodeIds.filter(nodeId => {
      const node = SKILL_TREE_NODES.find(n => n.id === nodeId);
      return node ? isNodeCompleted(node) : false;
    }).length;
    return Math.round((completedCount / pathway.requiredNodeIds.length) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left" id="academy-skill-tree-view">
      
      {/* View Switcher Controls */}
      <div className="flex justify-between items-center border-b border-slate-200/10 pb-4">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"} flex items-center gap-2`}>
            <Compass className="h-5.5 w-5.5 text-blue-500 shrink-0" />
            Learning Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Visualize your interactive security skill trees and map your professional SecOps career path.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
          <button
            onClick={() => setActiveSubTab("tree")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === "tree"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Skill Trees
          </button>
          <button
            onClick={() => setActiveSubTab("roadmaps")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === "roadmaps"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Career Roadmaps
          </button>
        </div>
      </div>

      {activeSubTab === "tree" ? (
        /* ==================== SUB-VIEW: SKILL TREE ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Visual Interactive Map Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Domain Group Categories */}
            {SECURITY_DOMAINS.map((domain) => {
              const domainNodes = SKILL_TREE_NODES.filter(n => n.domainId === domain.id);
              
              return (
                <div 
                  key={domain.id} 
                  className={`border rounded-2xl p-5 space-y-4 ${
                    theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  {/* Domain Header */}
                  <div className="border-b border-slate-200/10 pb-2.5">
                    <span className="text-[9px] font-mono font-black text-blue-500 uppercase tracking-widest block">SEC_DOMAIN</span>
                    <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{domain.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{domain.description}</p>
                  </div>

                  {/* Flow Layout for Nodes */}
                  <div className="flex flex-wrap gap-4 items-center">
                    {domainNodes.map((node, index) => {
                      const completed = isNodeCompleted(node);
                      const unlocked = isNodeUnlocked(node);
                      const isSelected = selectedNode?.id === node.id;

                      let nodeStyle = theme === "dark"
                        ? "bg-slate-950/60 border-slate-850 hover:bg-slate-900 text-slate-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600";

                      if (completed) {
                        nodeStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20";
                      } else if (!unlocked) {
                        nodeStyle = "opacity-50 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-900 cursor-not-allowed";
                      } else {
                        nodeStyle = "bg-blue-600/5 border-blue-500/20 text-blue-500 hover:bg-blue-600/10";
                      }

                      if (isSelected) {
                        nodeStyle += " ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950";
                      }

                      return (
                        <div key={node.id} className="flex items-center gap-1.5">
                          {/* Sibling Link Connector Line Mock */}
                          {index > 0 && (
                            <div className="h-0.5 w-3 bg-slate-300 dark:bg-slate-800" />
                          )}
                          
                          <button
                            onClick={() => unlocked && setSelectedNode(node)}
                            disabled={!unlocked}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 ${nodeStyle}`}
                          >
                            {!unlocked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            )}
                            <span>{node.title}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Inspector Side Panel */}
          <div className="lg:col-span-4 sticky top-24">
            {selectedNode ? (
              <div className={`border rounded-2xl p-5 space-y-4 animate-fade-in ${
                theme === "dark" ? "bg-slate-900/40 border-slate-850 text-white" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="flex justify-between items-start border-b border-slate-200/10 pb-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Node Metadata</span>
                    <h4 className="text-sm font-black mt-0.5">{selectedNode.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    isNodeCompleted(selectedNode) ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {isNodeCompleted(selectedNode) ? "Mastered" : "Active"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedNode.description}
                </p>

                {/* Requirements & Linkings list */}
                <div className="space-y-3 pt-1 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Parent Dependencies:</span>
                    {selectedNode.dependencies.length === 0 ? (
                      <span className="text-slate-400 font-mono text-[10px]">None (Entry Node)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.dependencies.map(depId => {
                          const dep = SKILL_TREE_NODES.find(n => n.id === depId);
                          return (
                            <span key={depId} className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-850 font-mono text-[9px]">
                              {dep?.title || depId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Clearance Assignments:</span>
                    {selectedNode.lessonIds.length === 0 ? (
                      <span className="text-slate-400 font-mono text-[10px]">No linked lessons required.</span>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedNode.lessonIds.map(lessonId => {
                          const completed = profile.completedLessonIds.includes(lessonId);
                          return (
                            <div key={lessonId} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 text-[11px]">
                              <span className="truncate pr-2 font-semibold">Course Module {lessonId}</span>
                              <span className={`font-bold font-mono text-[9px] uppercase ${completed ? "text-emerald-400" : "text-blue-500"}`}>
                                {completed ? "SUCCESS" : "INCOMPLETE"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab("courses")}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  Launch Course Sandbox <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className={`border border-dashed rounded-2xl p-6 text-center ${
                theme === "dark" ? "bg-slate-900/10 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                <Info className="h-8 w-8 mx-auto mb-2 opacity-30 text-blue-500 animate-pulse" />
                <h4 className="text-xs font-bold">Clearance Node Inspector</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Select any unlocked skill node on the map to audit dependencies, track requirements, and launch lessons.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== SUB-VIEW: CAREER ROADMAPS ==================== */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_PATHWAYS.map((path) => {
              const isActive = activeCareerGoalId === path.id;
              const progress = getPathwayProgress(path);
              
              return (
                <div 
                  key={path.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    isActive 
                      ? "ring-2 ring-blue-500 bg-blue-600/5 border-blue-500/20 shadow-md" 
                      : theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Cyber Path</span>
                        <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                          {path.title}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        isActive 
                          ? "bg-blue-600/15 border-blue-500/20 text-blue-400" 
                          : theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}>
                        {path.id === "soc" ? <Briefcase className="h-5 w-5" /> :
                         path.id === "pentest" ? <Terminal className="h-5 w-5" /> :
                         path.id === "cloud-engineer" ? <Cloud className="h-5 w-5" /> :
                         <Sparkles className="h-5 w-5" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {path.description}
                    </p>

                    {/* Completion Gauge HUD */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-bold font-mono">
                        <span className="text-slate-400 uppercase">Clearance Progress</span>
                        <span className="text-blue-500">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Target Modules and Lessons list */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/10">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Focus Syllabus Core</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {path.focusDomains.map(domId => {
                          const domainObj = SECURITY_DOMAINS.find(d => d.id === domId);
                          return (
                            <span key={domId} className="bg-slate-100 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-850 font-semibold truncate">
                              🔑 {domainObj?.name || domId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 flex gap-3 mt-4 border-t border-slate-200/10">
                    <button
                      onClick={() => onSetCareerGoal(path.id)}
                      className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" /> Active Learning Goal
                        </>
                      ) : (
                        <>
                          <Target className="h-3.5 w-3.5" /> Set Active Career Goal
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onNavigateToTab("courses")}
                      className={`px-3 py-2.5 rounded-xl border transition text-xs cursor-pointer ${
                        theme === "dark" 
                          ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Navigate to active courses catalog"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
