import React, { useState } from "react";
import { 
  Globe, 
  Play, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  PlusCircle, 
  CornerDownRight, 
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { SecurityScan, Finding } from "../types";

interface WebScannerProps {
  scans: SecurityScan[];
  onTriggerScan: (target: string, scanType: string) => Promise<SecurityScan>;
  onNavigateToAi: (contextPrompt: string) => void;
  theme?: "light" | "dark";
}

export default function WebScanner({ scans, onTriggerScan, onNavigateToAi, theme = "light" }: WebScannerProps) {
  const [targetUrl, setTargetUrl] = useState("");
  const [scanProfile, setScanProfile] = useState("Passive Web Audit");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(scans[0] || null);

  const simulateLogs = [
    "[*] Initializing Cyber Fortress passive vulnerability engine v2.4...",
    "[*] Resolving domain DNS host targets...",
    "[+] Target IP resolved: 104.22.18.51 (Cloudflare Edge proxy detected)",
    "[*] Initiating TLS/SSL handshake analysis...",
    "[!] WARN: Target supports TLSv1.0 & TLSv1.1 protocols (deprecations suggested)",
    "[*] Requesting web root '/' endpoints...",
    "[*] Analyzing response headers for HTTP security enforcement...",
    "[!] ALERT: 'Content-Security-Policy' header is absent",
    "[!] ALERT: 'Strict-Transport-Security' header is absent",
    "[*] Querying active port nodes (80, 443, 8080, 8443)...",
    "[+] Web service identified on standard port 443 (HTTPS)",
    "[*] Simulating OWASP Top 10 payload checks (SQLi, XSS, Path Traversal)...",
    "[+] Passive assessment completed. Generating secure report metrics..."
  ];

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsScanning(true);
    setScanStep(0);
    setTerminalLines([]);

    // Simulate real-time console scanning output
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < simulateLogs.length) {
        setTerminalLines((prev) => [...prev, simulateLogs[currentStep]]);
        currentStep++;
        setScanStep(currentStep);
      } else {
        clearInterval(interval);
        triggerActualBackendScan();
      }
    }, 250);
  };

  const triggerActualBackendScan = async () => {
    try {
      const newScanResult = await onTriggerScan(targetUrl, scanProfile);
      setSelectedScan(newScanResult);
      setTargetUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "High":
        return "bg-orange-50 text-orange-700 border border-orange-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-100";
    }
  };

  const handleExplainWithAi = (finding: Finding) => {
    const promptText = `Can you audit and explain the following vulnerability finding in detail?
    
Vulnerability: ${finding.title}
CVE: ${finding.cve}
Severity: ${finding.severity}
Description: ${finding.description}
Remediation: ${finding.remediation}

Please provide exact steps, secure configurations, and linux commands required to mitigate this risk.`;
    
    onNavigateToAi(promptText);
  };

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  return (
    <div className="space-y-8 text-left" id="web-scanner-view">
      {/* View Header */}
      <div className={`pb-6 border-b ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
        <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          Website Posture Audit Scanner
        </h1>
        <p className={`text-xs md:text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          Perform passive security header validation, TLS cipher handshake checks, and general OWASP compliance audits.
        </p>
      </div>

      {/* Launcher & Terminal Console in Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Input Panel */}
        <div className={`lg:col-span-2 space-y-5 h-full flex flex-col justify-between ${getCardClasses()}`}>
          <form onSubmit={handleScanSubmit} className="space-y-4">
            <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Target Configuration</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Target URL / Host</label>
              <div className="relative">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://vulnerable-test-app.fortress.internal"
                  disabled={isScanning}
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none font-mono transition-all ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Scan Profile Category</label>
              <select
                value={scanProfile}
                onChange={(e) => setScanProfile(e.target.value)}
                disabled={isScanning}
                className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500" 
                    : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:shadow-sm"
                }`}
              >
                <option value="Passive Web Audit">Passive Web Audit (HTTP, DNS, SSL)</option>
                <option value="OWASP Top 10 Check">OWASP Top 10 Injection Check</option>
                <option value="Quick Port Audit">Quick Service Port Scan</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isScanning || !targetUrl}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isScanning || !targetUrl
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg hover:shadow-blue-500/10"
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  Audit in Progress...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current text-white" />
                  Initiate Security Scan
                </>
              )}
            </button>
          </form>

          <div className={`border-t pt-4 mt-4 space-y-2.5 text-xs font-semibold ${
            theme === "dark" ? "border-slate-800/80 text-slate-400" : "border-slate-100 text-slate-500"
          }`}>
            <span className="text-slate-400 uppercase font-bold tracking-wider text-[9px] block">Audit parameters:</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Authorized Passive Agent Auditing
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Fully Compliant with SOC2 framework
            </div>
          </div>
        </div>

        {/* Right Side: Terminal / Scan Log Progress */}
        <div className={`border p-5 flex flex-col h-[320px] lg:h-auto justify-between rounded-2xl ${
          theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-950 border-slate-900 shadow-xl"
        }`}>
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-400 animate-pulse" />
              SEC-ENGINE CONSOLE
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {isScanning ? `STEP ${scanStep}/${simulateLogs.length}` : "STANDBY"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5 my-4 bg-slate-900/30 p-4 rounded-xl border border-slate-900 scrollbar-thin">
            {terminalLines.length === 0 ? (
              <div className="text-slate-500 italic h-full flex items-center justify-center text-center px-4 leading-relaxed">
                Configure target web parameters on the left and trigger a scanning execution run.
              </div>
            ) : (
              terminalLines.map((line, idx) => {
                let colorClass = "text-slate-300";
                if (line.startsWith("[+]")) colorClass = "text-emerald-400";
                if (line.startsWith("[!] ALERT")) colorClass = "text-rose-400 font-bold";
                if (line.startsWith("[!] WARN")) colorClass = "text-amber-400";
                return (
                  <div key={idx} className={`${colorClass} leading-5`}>
                    {line}
                  </div>
                );
              })
            )}
          </div>

          {/* Real-time Progress Bar */}
          <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(scanStep / simulateLogs.length) * 100}%` }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Half: Scan Reports and Finding Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Historical Scans List */}
        <div className={`space-y-4 ${getCardClasses()}`}>
          <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Historical Audits</h3>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {scans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  selectedScan?.id === scan.id
                    ? theme === "dark"
                      ? "bg-slate-850 border-blue-900/50"
                      : "bg-blue-50/50 border-blue-200/60 shadow-sm"
                    : theme === "dark"
                      ? "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-xs font-bold font-mono truncate block max-w-[170px] ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}>
                    {scan.target}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    scan.riskScore >= 70 
                      ? "text-red-700 bg-red-50 border border-red-100" 
                      : "text-emerald-700 bg-emerald-50 border border-emerald-100"
                  }`}>
                    RISK: {scan.riskScore}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-3">
                  <span>{scan.type}</span>
                  <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Selected Scan Findings Details */}
        <div className={`lg:col-span-2 space-y-4 ${getCardClasses()}`}>
          {selectedScan ? (
            <div className="space-y-4">
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${
                theme === "dark" ? "border-slate-800" : "border-slate-100"
              }`}>
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    Posture Report: {selectedScan.target}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Scan UUID: {selectedScan.id} | Run time: {new Date(selectedScan.createdAt).toLocaleString()}
                  </span>
                </div>

                <span className={`border font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                  theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  {selectedScan.findings.length} Finding(s) detected
                </span>
              </div>

              {/* Findings Expand list */}
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                {selectedScan.findings.map((finding) => (
                  <div key={finding.id} className={`border rounded-xl p-4.5 space-y-3.5 transition ${
                    theme === "dark" ? "bg-slate-950/70 border-slate-850" : "bg-slate-50/70 border-slate-100 hover:shadow-sm hover:bg-slate-50"
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1.5">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>
                          <CornerDownRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {finding.title}
                        </span>
                        {finding.cve !== "N/A" && (
                          <span className="bg-red-50 text-red-700 border border-red-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {finding.cve}
                          </span>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${getSeverityBadgeClass(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed pl-5">
                      {finding.description}
                    </p>

                    <div className={`rounded-xl p-3.5 pl-4 text-xs font-sans space-y-1.5 relative border ${
                      theme === "dark" ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/60 shadow-sm"
                    }`}>
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl" />
                      <span className="text-blue-500 text-[10px] font-extrabold block uppercase tracking-wider">Audit Remediation Guide:</span>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${
                        theme === "dark" ? "text-slate-300" : "text-slate-600 font-medium"
                      }`}>
                        {finding.remediation}
                      </p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleExplainWithAi(finding)}
                        className={`rounded px-3 py-1.5 text-xs font-bold flex items-center gap-2 transition cursor-pointer border ${
                          theme === "dark"
                            ? "bg-blue-950/30 border-blue-900/40 text-blue-400 hover:bg-blue-950"
                            : "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100/50"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse shrink-0" />
                        Explain Finding with SecOps AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic py-12">
              No posture report loaded. Configure a target URL above to start.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
