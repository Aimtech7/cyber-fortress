import React, { useState } from "react";
import { CtfChallenge, UserAcademyProfile } from "../types/academy";
import { 
  Trophy, 
  Terminal, 
  Radio, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  ExternalLink,
  Flame,
  Award
} from "lucide-react";

interface AcademyCTFProps {
  challenges: CtfChallenge[];
  profile: UserAcademyProfile;
  userId: string;
  onCtfSubmit: (challengeId: string, flag: string) => Promise<{
    success: boolean;
    badgeUnlocked: string | null;
    message: string;
  }>;
  theme?: "light" | "dark";
}

export default function AcademyCTF({
  challenges,
  profile,
  userId,
  onCtfSubmit,
  theme = "light"
}: AcademyCTFProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedChallenge, setSelectedChallenge] = useState<CtfChallenge | null>(null);
  
  // Submit state
  const [flagInput, setFlagInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  // Active Hints state
  const [hintsUnlocked, setHintsUnlocked] = useState<{ [key: string]: boolean }>({});

  const categories = ["All", "Web", "Crypto", "Forensics"];

  const filteredChallenges = activeCategory === "All"
    ? challenges
    : challenges.filter(c => c.category === activeCategory);

  const handleSelectChallenge = (chall: CtfChallenge) => {
    setSelectedChallenge(chall);
    setFlagInput("");
    setSuccessMsg(null);
    setErrorMsg(null);
    setUnlockedBadge(null);
  };

  const toggleUnlockHint = (challId: string, hintIdx: number) => {
    setHintsUnlocked(prev => ({
      ...prev,
      [`${challId}-${hintIdx}`]: true
    }));
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !flagInput.trim()) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setUnlockedBadge(null);

    try {
      const res = await onCtfSubmit(selectedChallenge.id, flagInput.trim());
      if (res.success) {
        setSuccessMsg(res.message);
        if (res.badgeUnlocked) {
          setUnlockedBadge(res.badgeUnlocked);
        }
      } else {
        setErrorMsg("Incorrect cryptographic flag structure. Keep auditing local parameters!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failure checking flag payload.");
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (challId: string) => {
    return profile.completedCtfIds.includes(challId);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="academy-ctf-view">
      
      {/* HUD Header Bar */}
      <div className={`border rounded-2xl p-5 relative overflow-hidden ${
        theme === "dark" 
          ? "bg-slate-900/60 border-slate-800" 
          : "bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 border-slate-200"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className={`text-lg font-black flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <Radio className="h-5 w-5 text-amber-500 animate-pulse" /> Capturing The Flag (CTF) Arena
            </h2>
            <p className="text-xs text-slate-500">
              Audit cyber parameters, extract system hashes, decrypt cipher flags, and record achievements on the corporate security scoreboard.
            </p>
          </div>

          <div className="flex gap-4">
            <div className={`border px-3 py-1.5 rounded-xl text-center font-mono ${
              theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-white border-slate-200"
            }`}>
              <span className="text-[9px] text-slate-500 block uppercase font-sans">Active Solves</span>
              <span className={`text-base font-bold ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                {profile.completedCtfIds.length} / {challenges.length}
              </span>
            </div>

            <div className={`border px-3 py-1.5 rounded-xl text-center font-mono ${
              theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-white border-slate-200"
            }`}>
              <span className="text-[9px] text-slate-500 block uppercase font-sans">Level Score</span>
              <span className={`text-base font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {profile.completedCtfIds.length * 100} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left list panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Categories select tab */}
          <div className={`flex p-1 rounded-xl border w-fit ${
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200/60"
          }`}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat
                    ? theme === "dark"
                      ? "bg-slate-800 text-white"
                      : "bg-white text-amber-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredChallenges.map(chall => {
              const done = isCompleted(chall.id);
              const isActive = selectedChallenge?.id === chall.id;
              
              const diffColors: { [key: string]: string } = {
                "Easy": "text-blue-500 border-blue-500/10 bg-blue-500/5",
                "Medium": "text-amber-500 border-amber-500/10 bg-amber-500/5",
                "Hard": "text-red-500 border-red-500/10 bg-red-500/5",
                "Expert": "text-purple-500 border-purple-500/10 bg-purple-500/5"
              };

              return (
                <button
                  key={chall.id}
                  onClick={() => handleSelectChallenge(chall)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    isActive
                      ? theme === "dark"
                        ? "bg-slate-900 border-amber-500/30 text-white shadow"
                        : "bg-amber-50/40 border-amber-500/50 text-amber-900 shadow-sm"
                      : theme === "dark"
                        ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900/60 text-slate-300"
                        : "bg-white border-slate-200 hover:bg-slate-50/50 text-slate-700 shadow-sm"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border ${
                        diffColors[chall.difficulty] || "text-slate-500 border-slate-200"
                      }`}>
                        {chall.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">+{chall.points} PTS</span>
                    </div>

                    <h3 className="text-xs font-black truncate max-w-[210px]">{chall.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    {done ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Terminal className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right challenge board panel */}
        <div className="lg:col-span-7">
          {selectedChallenge ? (
            <div className={`border rounded-2xl p-6 md:p-8 space-y-6 ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              
              {/* Challenge title */}
              <div className="flex justify-between items-start border-b border-slate-200/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-500 font-bold tracking-wider font-mono uppercase block">
                    {selectedChallenge.category} Security Challenge | +{selectedChallenge.points} PTS
                  </span>
                  <h2 className={`text-base font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    {selectedChallenge.title}
                  </h2>
                </div>

                {isCompleted(selectedChallenge.id) && (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 uppercase">
                    <CheckCircle className="h-3.5 w-3.5" /> Solved
                  </span>
                )}
              </div>

              {/* Challenge description */}
              <div className={`space-y-3 text-xs leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                <p>{selectedChallenge.description}</p>

                {selectedChallenge.connectionDetails && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 text-blue-400 font-mono text-[10px] break-all leading-normal">
                    <span className="text-slate-500 block uppercase text-[8px] font-sans font-bold tracking-wider">Operational connection:</span>
                    {selectedChallenge.connectionDetails}
                  </div>
                )}
              </div>

              {/* Hints Box */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Clearance Hint Logs</h4>
                
                <div className="space-y-2">
                  {selectedChallenge.hints.map((hint, hIdx) => {
                    const isUnlocked = hintsUnlocked[`${selectedChallenge.id}-${hIdx}`];
                    return (
                      <div 
                        key={hIdx}
                        className={`p-3 rounded-xl border text-xs transition ${
                          isUnlocked 
                            ? theme === "dark" 
                              ? "bg-slate-950/60 border-slate-850 text-slate-300" 
                              : "bg-amber-50/30 border-amber-100 text-slate-700"
                            : "border-dashed border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {isUnlocked ? (
                          <div className="flex items-start gap-2.5">
                            <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="leading-normal">{hint}</p>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-slate-500 font-medium">Hint #{hIdx + 1} Encrypted</span>
                            <button
                              type="button"
                              onClick={() => toggleUnlockHint(selectedChallenge.id, hIdx)}
                              className="text-[10px] bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-amber-500 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              Decrypt Hint log
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit panel */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
              }`}>
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block">
                  Submit Target Flag (Format: CF&#123;...&#125;)
                </label>
                
                <form onSubmit={handleSubmitFlag} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="CF{cryptographic_compromise_key_here}"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
                    }`}
                    disabled={isCompleted(selectedChallenge.id) || loading}
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4.5 py-2 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
                    disabled={isCompleted(selectedChallenge.id) || loading || !flagInput.trim()}
                  >
                    {loading ? "Decrypting..." : "Submit Flag"}
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-[10px] text-red-500 font-mono font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> {errorMsg}
                  </p>
                )}

                {successMsg && (
                  <div className="space-y-2.5">
                    <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-lg text-xs font-mono font-bold border border-emerald-500/20 flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                      {successMsg}
                    </div>

                    {unlockedBadge && (
                      <div className="bg-purple-500/10 text-purple-400 p-3.5 rounded-lg text-xs font-bold border border-purple-500/20 flex items-center gap-3 animate-pulse">
                        <Award className="h-5 w-5 text-purple-500" />
                        <div>
                          <strong className="block uppercase text-[10px] text-purple-300">NEW ACHIEVEMENT EARNED!</strong>
                          <span>Unlocked badge: **Flag Capturer** for resolving your first CTF challenge!</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className={`border rounded-2xl p-8 text-center space-y-4 ${
              theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="mx-auto w-fit p-3.5 rounded-xl bg-amber-600/10 text-amber-500 border border-amber-500/20">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  Challenge Registry Selector
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Select a Capture The Flag vulnerability puzzle on the sidebar directory to connect simulated containers and begin exploitation attempts.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
