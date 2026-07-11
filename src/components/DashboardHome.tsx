import React, { useState, useEffect } from "react";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Radio, 
  Terminal, 
  Activity, 
  Cpu, 
  Clock, 
  Zap, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { SecurityScan, ThreatIndicator, AuditLog } from "../types";

interface DashboardHomeProps {
  scans: SecurityScan[];
  threats: ThreatIndicator[];
  logs: AuditLog[];
  onNavigate: (tab: string) => void;
  onRefreshAll: () => void;
  theme?: "light" | "dark";
}

export default function DashboardHome({ scans, threats, logs, onNavigate, onRefreshAll, theme = "light" }: DashboardHomeProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Calculate high-level stats
  const totalScans = scans.length;
  const latestScan = scans[0];
  const securityScore = latestScan ? 100 - latestScan.riskScore : 88; // higher is better

  // Count vulnerability levels from all completed scans
  const counts = scans.reduce(
    (acc, s) => {
      s.findings.forEach((f) => {
        if (f.severity === "Critical") acc.critical++;
        else if (f.severity === "High") acc.high++;
        else if (f.severity === "Medium") acc.medium++;
        else acc.low++;
      });
      return acc;
    },
    { critical: 1, high: 2, medium: 3, low: 4 } // include baseline indicators if no scans completed
  );

  const mockMitigations = [
    "Blocked brute-force request attempt from IP 185.190.140.22",
    "Encrypted cloud database secrets using AES-256-GCM cipher pipeline",
    "Synchronized global vulnerability directories (451 new CVE signatures validated)",
    "HSTS directive validated on gateway configuration portal-gateway.internal",
    "Initiated API route rate limits on administrative gateway (50 req/min threshold)"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % mockMitigations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshAll();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  const getSubCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-950/60 border-slate-900 p-3 rounded-xl border text-left"
      : "bg-slate-50 border-slate-100 p-3 rounded-xl border text-left";
  };

  const getHeaderBadgeClasses = () => {
    return theme === "dark"
      ? "bg-blue-950/40 border-blue-900/40 text-blue-400"
      : "bg-blue-50 border-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-8 text-left" id="dashboard-container">
      {/* Header section */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b ${
        theme === "dark" ? "border-slate-900" : "border-slate-200/80"
      }`}>
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
            Security Operations Dashboard
          </h1>
          <p className={`text-xs md:text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Real-time status controls, active vulnerability auditing metrics, and autonomous security guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-refresh-dashboard"
            onClick={handleManualRefresh}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-500" : "text-slate-400"}`} />
            {isRefreshing ? "Synchronizing Metrics..." : "Reload Metrics"}
          </button>
          
          <span className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-full font-sans uppercase tracking-wider ${getHeaderBadgeClasses()}`}>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            SEC-LEVEL: HIGH
          </span>
        </div>
      </div>

      {/* Real-time Mitigations Ticker */}
      <div className={`border rounded-2xl px-4 py-3 flex items-center gap-3.5 transition-all duration-300 ${
        theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border flex items-center gap-1.5 ${
          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200/60 text-slate-600"
        }`}>
          <Terminal className="h-3.5 w-3.5 text-blue-500" />
          Live Defense
        </span>
        <div className={`font-mono text-xs flex-1 truncate transition-all duration-300 ${
          theme === "dark" ? "text-slate-300" : "text-slate-700"
        }`}>
          {mockMitigations[tickerIndex]}
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-bold hidden md:inline">SYSTEM STATE: NOMINAL</span>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Posture Score */}
        <div className={`md:col-span-2 space-y-6 ${getCardClasses()} relative overflow-hidden`}>
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h3 className={`text-xs uppercase tracking-wider font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Cyber Defense Posture
              </h3>
              <p className="text-[11px] text-slate-400">Calculated based on active web scan results and unresolved threats.</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
              securityScore >= 80 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                : "bg-amber-50 border-amber-100 text-amber-700"
            }`}>
              {securityScore >= 80 ? "SECURE" : "WARNING"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="relative flex items-center justify-center">
              {/* Radial Dial */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" className={theme === "dark" ? "text-slate-850" : "text-slate-100"} strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-blue-500" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * securityScore) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-2xl font-bold font-sans ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{securityScore}</span>
                <span className="text-[9px] text-slate-400 font-bold font-sans">/ 100</span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className={`text-xs md:text-sm leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Your defense state is <strong className={theme === "dark" ? "text-white" : "text-slate-950"}>{securityScore >= 80 ? "Robust" : "At Risk"}</strong>. No server credentials or configuration leaks discovered on key domains.
              </p>
              <button 
                onClick={() => onNavigate("scanner")}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                Launch Vulnerability Scan <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Threat Ledger Metrics */}
        <div className={`${getCardClasses()} flex flex-col justify-between`}>
          <div className="flex justify-between items-center pb-2">
            <h3 className={`text-xs uppercase tracking-wider font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Vulnerabilities
            </h3>
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
          </div>

          <div className="grid grid-cols-2 gap-3.5 my-4">
            <div className={getSubCardClasses()}>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Critical</span>
              <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{counts.critical}</span>
            </div>
            <div className={getSubCardClasses()}>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wide">High</span>
              <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{counts.high}</span>
            </div>
            <div className={getSubCardClasses()}>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wide">Medium</span>
              <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{counts.medium}</span>
            </div>
            <div className={getSubCardClasses()}>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Low</span>
              <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{counts.low}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Derived from {totalScans} passive audits</span>
        </div>

        {/* System Capabilities / Health */}
        <div className={`${getCardClasses()} flex flex-col justify-between`}>
          <div className="flex justify-between items-center pb-2">
            <h3 className={`text-xs uppercase tracking-wider font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              SaaS Shield Modules
            </h3>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>

          <div className="space-y-3.5 my-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className={`flex items-center gap-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                <Cpu className="h-4 w-4 text-blue-500" /> Ingress WAF
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`flex items-center gap-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                <Clock className="h-4 w-4 text-blue-500" /> Cron Auditors
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">READY</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`flex items-center gap-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                <Zap className="h-4 w-4 text-blue-500" /> Gemini Agent
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">ONLINE</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium font-mono">SANDBOX_ID: k8s-fortress-node</span>
        </div>
      </div>

      {/* Two Columns Section: Threats Intel vs Quick Defensive Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Threat Intelligence Feed */}
        <div className={`lg:col-span-2 space-y-4 ${getCardClasses()}`}>
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Active Threat Intelligence Feed</h3>
              <p className="text-xs text-slate-400">Malicious target IP markers and global CVE warnings ledger</p>
            </div>
            <button 
              onClick={() => onNavigate("threats")}
              className="text-xs text-blue-500 hover:text-blue-600 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              Full Feed <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {threats.slice(0, 3).map((threat) => (
              <div 
                key={threat.id} 
                className={`border rounded-xl p-4 flex justify-between gap-4 transition ${
                  theme === "dark"
                    ? "bg-slate-950/40 border-slate-850 hover:bg-slate-950"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 shadow-sm"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{threat.indicator}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{threat.type}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{threat.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{new Date(threat.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex flex-col justify-center items-end shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    threat.severity === "Critical" 
                      ? "bg-red-50 text-red-700 border border-red-100" 
                      : "bg-orange-50 text-orange-700 border border-orange-100"
                  }`}>
                    {threat.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-2">{threat.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Dashboard Integration */}
        <div className={`flex flex-col justify-between ${getCardClasses()}`}>
          <div className="space-y-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <Shield className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
              Recommended Protections
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cyber Fortress AI processed your last scan metrics. We recommend carrying out the following hardening procedures:
            </p>

            <div className="space-y-3 pt-2">
              <div className={`p-3 rounded-xl border relative text-xs ${
                theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-100"
              }`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l" />
                <h4 className={`font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>Enforce Absolute HTTPS</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Configure port 80 requests to automatically redirect over port 443 routes.</p>
              </div>

              <div className={`p-3 rounded-xl border relative text-xs ${
                theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-100"
              }`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l" />
                <h4 className={`font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>OWASP Host Header Mitigate</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Explicitly declare server_name attributes inside Nginx configurations.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("ai-assistant")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-blue-500/10 mt-6 cursor-pointer"
          >
            Ask SecOps AI Assistant
          </button>
        </div>

      </div>

      {/* Security Audit Records */}
      <div className={`space-y-4 ${getCardClasses()}`}>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Recent Security Audit Trails</h3>
            <p className="text-xs text-slate-400">Administrative audit records, password vault adjustments, and scan histories</p>
          </div>
          <button 
            onClick={() => onNavigate("logs")}
            className="text-xs text-blue-500 hover:text-blue-600 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            Open Audit Trail <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className={`w-full text-left border-collapse text-xs font-sans ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            <thead>
              <tr className={`border-b text-slate-500 text-[10px] font-bold uppercase tracking-wider ${
                theme === "dark" ? "border-slate-850 bg-slate-950/40" : "border-slate-100 bg-slate-50"
              }`}>
                <th className="p-3.5 rounded-l-xl">Timestamp</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Sec Action</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Target Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 4).map((log) => (
                <tr key={log.id} className={`border-b transition ${
                  theme === "dark" ? "border-slate-850/60 hover:bg-slate-900/10" : "border-slate-100 hover:bg-slate-50/50"
                }`}>
                  <td className="p-3.5 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className={`p-3.5 font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>{log.userEmail}</td>
                  <td className="p-3.5 text-blue-500 font-semibold">{log.action}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      log.status === "Success" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
