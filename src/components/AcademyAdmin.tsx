import React, { useState } from "react";
import { Course } from "../types/academy";
import { 
  ShieldAlert, 
  Settings, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Save, 
  Lock 
} from "lucide-react";

interface AcademyAdminProps {
  courses: Course[];
  theme?: "light" | "dark";
}

export default function AcademyAdmin({
  courses,
  theme = "light"
}: AcademyAdminProps) {
  const [allowPublicReg, setAllowPublicReg] = useState<boolean>(true);
  const [requirePasscodes, setRequirePasscodes] = useState<boolean>(false);
  const [labTimeoutMins, setLabTimeoutMins] = useState<number>(30);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="academy-admin-view">
      
      {/* Overview */}
      <div className="space-y-1">
        <h2 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          SaaS Admin Control Dashboard
        </h2>
        <p className="text-xs text-slate-500">
          Enforce authentication limits, moderate published courses, adjust laboratory container timeouts, and review platform logging statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column Settings form */}
        <div className="lg:col-span-7">
          <div className={`border rounded-2xl p-6 md:p-8 space-y-6 ${
            theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <form onSubmit={handleSettingsSubmit} className="space-y-5">
              <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                <Settings className="h-4.5 w-4.5 text-blue-500" /> Platform Configurations
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/5">
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      Allow Operator Self-Registration
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-none">Enable independent signup bypass controls.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPublicReg}
                    onChange={(e) => setAllowPublicReg(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/5">
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      Enforce Security Clearance Passcodes
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-none">Require secret administrator codes for active labs.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requirePasscodes}
                    onChange={(e) => setRequirePasscodes(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Simulated Container Timeout Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={labTimeoutMins}
                    onChange={(e) => setLabTimeoutMins(Number(e.target.value))}
                    className={`border rounded-xl px-3 py-2 text-xs outline-none w-32 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
                    }`}
                  />
                  <p className="text-[9px] text-slate-400 font-mono mt-1">Automatic docker isolation payload timeout parameters.</p>
                </div>
              </div>

              {isSaved && (
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-xs font-mono font-bold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle className="h-4.5 w-4.5" /> PLATFORM POLICY COMPLIANCE PARAMS UPDATED!
                </div>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Save className="h-3.5 w-3.5" /> Save Policies
              </button>
            </form>
          </div>
        </div>

        {/* Right column system telemetry */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Moderation Logs */}
          <div className={`border rounded-2xl p-5 space-y-4 ${
            theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-800"}`}>
              <ShieldAlert className="h-4 w-4 text-red-500" /> Administrative Telemetry
            </h3>

            <div className="space-y-2.5">
              {[
                { time: "16:11:42", log: "SEC_CONTAINER: Isolated sandbox docker container 'sql-target' idle cycle trigger.", tag: "Sys" },
                { time: "15:45:10", log: "CERT_VERIFIER: Certificate database checksum sequence verified successfully.", tag: "Auth" },
                { time: "14:22:04", log: "COMPLIANCE_LOGGER: User login 'analyst@cyberfortress.com' recorded from host 10.14.0.51.", tag: "Sec" }
              ].map((row, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/5 text-[10px] leading-relaxed space-y-0.5 border border-slate-200/5 text-left">
                  <div className="flex justify-between font-mono text-[9px] text-slate-500">
                    <span>{row.time}</span>
                    <span className="font-bold uppercase text-blue-500">[{row.tag}]</span>
                  </div>
                  <p className="font-mono text-slate-700 dark:text-slate-400">{row.log}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
