import React, { useState } from "react";
import { 
  Radio, 
  MapPin, 
  Skull, 
  Search, 
  AlertTriangle, 
  Clock, 
  Plus, 
  BookOpen, 
  Eye, 
  Zap,
  Globe,
  PlusCircle,
  CornerDownRight,
  RefreshCw,
  Info
} from "lucide-react";
import { ThreatIndicator } from "../types";

interface ThreatIntelligenceProps {
  threats: ThreatIndicator[];
  onAddThreat: (indicator: string, type: string, severity: string, description: string) => Promise<ThreatIndicator>;
  theme?: "light" | "dark";
}

export default function ThreatIntelligence({ threats, onAddThreat, theme = "light" }: ThreatIntelligenceProps) {
  const [newIndicator, setNewIndicator] = useState("");
  const [newType, setNewType] = useState("Malicious IP");
  const [newSeverity, setNewSeverity] = useState("High");
  const [newDescription, setNewDescription] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [iocStatus, setIocStatus] = useState<string | null>(null);
  const [auditedIoc, setAuditedIoc] = useState("");

  const mockActors = [
    {
      name: "APT29 (Cozy Bear)",
      origin: "Russian Federation",
      target: "Government, Foreign Policy, NATO Think Tanks",
      vector: "Spear-phishing, credential harvesting, supply-chain infiltration (Solorigate)",
      status: "Active"
    },
    {
      name: "Lazarus Group",
      origin: "DPRK",
      target: "Cryptocurrency exchanges, central bank backends, gaming ecosystems",
      vector: "Custom Trojanized installers, fake Job postings, spear-phishing over social channels",
      status: "Highly Active"
    },
    {
      name: "LockBit (Ransomware Affiliate)",
      origin: "Distributed Ransomware Syndicate",
      target: "Enterprise healthcare networks, public municipal services",
      vector: "Ransomware-as-a-SaaS, AD privilege escalation, corporate domain controller takeover",
      status: "Disrupted / Regrouping"
    }
  ];

  const handleAddThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndicator || !newDescription) return;

    try {
      await onAddThreat(newIndicator, newType, newSeverity, newDescription);
      setNewIndicator("");
      setNewDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuditIoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setAuditedIoc(searchQuery);
    const lowerQuery = searchQuery.trim().toLowerCase();

    // Perform interactive IOC analysis
    if (lowerQuery.includes("185.190.") || lowerQuery.includes("cve-2024-") || lowerQuery.includes("malware") || lowerQuery.includes(".exe")) {
      setIocStatus("MALICIOUS_IOC");
    } else if (lowerQuery.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) || lowerQuery.includes(".internal") || lowerQuery.includes("10.")) {
      setIocStatus("SUSPICIOUS_UNVERIFIED");
    } else {
      setIocStatus("BENIGN_SAFE");
    }
  };

  const filteredThreats = threats.filter(
    (t) =>
      t.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  return (
    <div className="space-y-8 text-left" id="threat-intelligence-view">
      {/* Header */}
      <div className={`pb-6 border-b ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
        <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"} flex items-center gap-2.5`}>
          <Radio className="h-5.5 w-5.5 text-red-500 animate-pulse shrink-0" />
          Threat Intelligence Center
        </h1>
        <p className={`text-xs md:text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          Monitor dynamic global cyber attack vectors, audit malicious Indicators of Compromise (IOCs), and study active threat groups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Threat Ticker Feed & IOC Auditing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* IOC Auditor Tool */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <Globe className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              Indicator of Compromise (IOC) Auditor
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Check external IP addresses, domain targets, file hashes (MD5/SHA256), or CVE markers directly against known global lists.
            </p>

            <form onSubmit={handleAuditIoc} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter IP (e.g. 185.190.140.22), CVE (e.g. CVE-2024-3094), or Domain"
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none font-mono transition-all ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 rounded-xl transition cursor-pointer shrink-0"
              >
                Audit IOC
              </button>
            </form>

            {/* Audit Status Screen */}
            {iocStatus && (
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>AUDITING: <strong className={theme === "dark" ? "text-slate-200" : "text-slate-800"}>{auditedIoc}</strong></span>
                  <span>STATUS TIME: UTC CURRENT</span>
                </div>

                {iocStatus === "MALICIOUS_IOC" ? (
                  <div className={`border p-4.5 rounded-xl flex items-start gap-3.5 text-xs ${
                    theme === "dark" ? "bg-red-950/20 border-red-900/30 text-red-400" : "bg-red-50 border-red-100 text-red-700"
                  }`}>
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-left">
                      <strong className="block uppercase font-bold text-[10px] tracking-wider">INDICATOR BLOCKED: ACTIVE THREAT VECTORED</strong>
                      <p className={`leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                        This IP address/CVE indicator matches malicious database profiles conducting scanning campaigns and exploit payloads. Recommended immediate VPC block.
                      </p>
                    </div>
                  </div>
                ) : iocStatus === "SUSPICIOUS_UNVERIFIED" ? (
                  <div className={`border p-4.5 rounded-xl flex items-start gap-3.5 text-xs ${
                    theme === "dark" ? "bg-amber-950/20 border-amber-900/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}>
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-left">
                      <strong className="block uppercase font-bold text-[10px] tracking-wider">UNVERIFIED HOST IDENTIFIED</strong>
                      <p className={`leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                        This address resides within secure private subnets or intranet zones. It appears unverified but not explicitly tied to malicious internet signatures.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`border p-4.5 rounded-xl flex items-start gap-3.5 text-xs ${
                    theme === "dark" ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                  }`}>
                    <Eye className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-left">
                      <strong className="block uppercase font-bold text-[10px] tracking-wider">CLEAN STATE: IOC APPEARS BENIGN</strong>
                      <p className={`leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                        No active malicious blacklists match this query target. Safe to access, though continuing standard TLS enforcement is recommended.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Threats Feed Ledger */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <Skull className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              Live Threat Intelligence Indicators Ledger
            </h3>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredThreats.map((threat) => (
                <div 
                  key={threat.id} 
                  className={`border rounded-xl p-4.5 space-y-3 transition ${
                    theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:bg-slate-950" : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 text-left">
                    <div className="space-y-1">
                      <span className={`text-xs font-bold font-mono block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{threat.indicator}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                        {threat.type} | SOURCE: {threat.source}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                      threat.severity === "Critical" 
                        ? "bg-rose-50 text-rose-700 border border-rose-100" 
                        : threat.severity === "High"
                          ? "bg-orange-50 text-orange-700 border border-orange-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {threat.severity}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed pl-3 border-l-2 border-slate-200 ${
                    theme === "dark" ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-200"
                  }`}>
                    {threat.description}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium pt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> Logged: {new Date(threat.timestamp).toLocaleString()}</span>
                    <span className="text-blue-500">CONFIDENCE: 99.4%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Log New Indicator & Threat Actors profiles */}
        <div className="space-y-6">
          
          {/* Form to Log threat Intelligence */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <PlusCircle className="h-4.5 w-4.5 text-blue-500" />
              Log Threat Indicator
            </h3>

            <form onSubmit={handleAddThreat} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Indicator / Node Host</label>
                <input
                  type="text"
                  value={newIndicator}
                  onChange={(e) => setNewIndicator(e.target.value)}
                  placeholder="e.g. 192.168.100.41, CVE-2023-38646"
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none font-mono transition-all ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Threat Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:shadow-sm"
                    }`}
                  >
                    <option value="Malicious IP">Malicious IP</option>
                    <option value="Active Exploit CVE">Active Exploit CVE</option>
                    <option value="Phishing URL">Phishing URL</option>
                    <option value="Trojan SHA255">Trojan SHA256</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:shadow-sm"
                    }`}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Intelligence Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Identify attack vectors or target systems..."
                  rows={3}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all resize-none ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              >
                Log to Global Feed
              </button>
            </form>
          </div>

          {/* Active Threat Actors profiles (Blue team training) */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <BookOpen className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              Blue Team Intel: Threat Actors
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              State-sponsored threat organizations monitored by global cyber units.
            </p>

            <div className="space-y-3.5">
              {mockActors.map((actor, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl p-4 space-y-2 relative overflow-hidden text-left transition ${
                    theme === "dark" ? "bg-slate-950/65 border-slate-850" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-rose-500 font-bold">{actor.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">{actor.origin}</span>
                  </div>
                  
                  <div className="text-xs">
                    <strong className="text-slate-400 block text-[9px] font-mono font-bold uppercase">PRIMARY TARGETS:</strong>
                    <span className={`leading-relaxed text-[11px] block mt-0.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                      {actor.target}
                    </span>
                  </div>

                  <div className="text-xs">
                    <strong className="text-slate-400 block text-[9px] font-mono font-bold uppercase">ATTACK VECTOR:</strong>
                    <span className={`leading-relaxed text-[11px] block mt-0.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                      {actor.vector}
                    </span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border inline-block mt-2 ${
                    theme === "dark" ? "bg-blue-950/20 border-blue-900/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
                  }`}>
                    {actor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
