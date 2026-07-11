import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Terminal, 
  User, 
  LogOut, 
  Lock, 
  Globe, 
  Radio, 
  Sparkles, 
  Cpu, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Menu, 
  X, 
  LockKeyhole, 
  ArrowRight, 
  Fingerprint, 
  Info, 
  Layers, 
  ChevronDown, 
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  LockKeyholeOpen,
  ArrowUpRight
} from "lucide-react";

// Import modules
import DashboardHome from "./components/DashboardHome";
import WebScanner from "./components/WebScanner";
import ThreatIntelligence from "./components/ThreatIntelligence";
import PasswordVault from "./components/PasswordVault";
import AiAssistant from "./components/AiAssistant";
import AuditLogs from "./components/AuditLogs";
import ForgotPassword from "./components/ForgotPassword";
import Academy from "./components/Academy";

import { User as UserType, SecurityScan, ThreatIndicator, AuditLog } from "./types";

// Firebase Integration imports
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDoc
} from "firebase/firestore";
import { auth, db, OperationType, handleFirestoreError } from "./firebase";

export default function App() {
  // Theme Management
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("cf_theme");
    return (stored as "light" | "dark") || "light";
  });

  // Navigation & Authentication
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("landing"); // landing, dashboard, scanner, threats, vault, ai-assistant, logs
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState("Security Analyst");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App Sync State
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [vault, setVault] = useState<any[]>([]);

  // Cross-component Context State (Transfer scan finding explaining to AI)
  const [aiContextPrompt, setAiContextPrompt] = useState("");

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active FAQ accordion trackers
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Save Theme to localStorage
  useEffect(() => {
    localStorage.setItem("cf_theme", theme);
  }, [theme]);

  // Listen to Firebase Authentication state change
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profile;
          if (userDoc.exists()) {
            profile = userDoc.data();
          } else {
            // Fallback default profile if not present in Firestore yet
            profile = {
              email: firebaseUser.email || "",
              role: "Security Analyst",
              fullName: firebaseUser.displayName || "Security Professional",
              orgName: "Fortress Enterprise Ltd",
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profile);
          }
          
          const activeUser: UserType = {
            id: firebaseUser.uid,
            email: profile.email,
            role: profile.role,
            fullName: profile.fullName,
            orgName: profile.orgName,
            createdAt: profile.createdAt
          };
          
          setCurrentUser(activeUser);
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
          localStorage.setItem("cf_user", JSON.stringify(activeUser));
          localStorage.setItem("cf_token", token);
          if (currentTab === "landing") {
            setCurrentTab("dashboard");
          }
        } catch (err) {
          console.error("Auth state profile fetch failure:", err);
        }
      } else {
        setCurrentUser(null);
        setAuthToken(null);
        localStorage.removeItem("cf_user");
        localStorage.removeItem("cf_token");
      }
    });
    
    return () => unsubscribeAuth();
  }, [currentTab]);

  // Real-time Firestore synchronized listeners (active only when logged in)
  useEffect(() => {
    if (!currentUser) {
      setScans([]);
      setThreats([]);
      setLogs([]);
      setVault([]);
      return;
    }

    // 1. Scans Real-time Listener
    const unsubscribeScans = onSnapshot(collection(db, "scans"), (snapshot) => {
      const scansList: SecurityScan[] = [];
      snapshot.forEach((doc) => {
        scansList.push(doc.data() as SecurityScan);
      });
      // Sort by createdAt descending
      scansList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setScans(scansList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "scans");
    });

    // 2. Threat Feed Real-time Listener
    const unsubscribeThreats = onSnapshot(collection(db, "threats"), (snapshot) => {
      const threatsList: ThreatIndicator[] = [];
      snapshot.forEach((doc) => {
        threatsList.push(doc.data() as ThreatIndicator);
      });
      threatsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setThreats(threatsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "threats");
    });

    // 3. Audit Logs Real-time Listener
    const unsubscribeLogs = onSnapshot(collection(db, "auditLogs"), (snapshot) => {
      const logsList: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logsList.push(doc.data() as AuditLog);
      });
      logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(logsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "auditLogs");
    });

    // 4. Secure Credentials Vault Real-time Listener (Filtered to ownerId for zero-trust compliance)
    const vaultQuery = query(collection(db, "vault"), where("ownerId", "==", currentUser.id));
    const unsubscribeVault = onSnapshot(vaultQuery, (snapshot) => {
      const vaultList: any[] = [];
      snapshot.forEach((doc) => {
        vaultList.push(doc.data());
      });
      vaultList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setVault(vaultList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "vault");
    });

    return () => {
      unsubscribeScans();
      unsubscribeThreats();
      unsubscribeLogs();
      unsubscribeVault();
    };
  }, [currentUser]);

  // Trigger scan action
  const handleTriggerScan = async (target: string, scanType: string) => {
    // Client-side simulation matching server.ts behavior
    const cleanTarget = target.trim();
    const isHttps = cleanTarget.startsWith("https://");
    const isLocal = cleanTarget.includes("local") || cleanTarget.includes(".internal") || cleanTarget.includes("localhost") || cleanTarget.includes("127.0.0.1");

    const findings = [];
    let riskScore = 15;

    if (!isHttps) {
      riskScore += 25;
      findings.push({
        id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
        title: "Insecure Plaintext HTTP Protocol Enforced",
        severity: "High" as const,
        cve: "N/A",
        description: "The targeted endpoint uses plaintext HTTP communication. Credentials, tokens, and data are transmitted without payload encryption.",
        remediation: "Deploy TLS/SSL certificates and redirect all HTTP traffic to port 443 HTTPS."
      });
    }

    if (isLocal) {
      riskScore += 15;
      findings.push({
        id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
        title: "Internal Infrastructure Name Disclosure",
        severity: "Low" as const,
        cve: "N/A",
        description: "The scanning targeted an internal host, potentially leaking private DNS names or intranet routing topologies.",
        remediation: "Limit exposure of internal hostnames in production certificates or HTTP redirect pathways."
      });
    }

    findings.push({
      id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
      title: "Missing X-Content-Type-Options Protection Header",
      severity: "Low" as const,
      cve: "N/A",
      description: "The anti-sniffing HTTP response header X-Content-Type-Options is missing, allowing browsers to interpret files differently from their declared MIME types.",
      remediation: "Add the header: 'X-Content-Type-Options: nosniff' to all response payloads."
    });

    findings.push({
      id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
      title: "Potential CSRF Vulnerability on Action Endpoints",
      severity: "Medium" as const,
      cve: "N/A",
      description: "No anti-CSRF cookies or request headers (e.g. SameSite configuration or anti-forgery tokens) were actively noticed on form action tags.",
      remediation: "Enforce SameSite=Lax or Strict cookie flag, and inject randomized cryptographic CSRF validation tokens."
    });

    const randNum = Math.random();
    if (randNum > 0.5) {
      riskScore += 35;
      findings.push({
        id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
        title: "Log4j RCE Vulnerability (CVE-2021-44228)",
        severity: "Critical" as const,
        cve: "CVE-2021-44228",
        description: "Apache Log4j2 JNDI features do not protect against attacker-controlled LDAP endpoints, allowing complete remote code execution (RCE).",
        remediation: "Update apache log4j dependency to version 2.17.1 or disable JNDI lookups."
      });
    } else {
      riskScore += 15;
      findings.push({
        id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
        title: "CORS Wildcard Configuration Vulnerability",
        severity: "Medium" as const,
        cve: "N/A",
        description: "Access-Control-Allow-Origin response headers are configured with wildcard '*' while allowing credentials, exposing resource endpoints to malicious origins.",
        remediation: "Specify authorized cross-origin endpoints instead of using broad wildcards."
      });
    }

    riskScore = Math.min(riskScore, 100);
    const scanId = `scn-${Math.random().toString(36).substr(2, 9)}`;

    const newScan = {
      id: scanId,
      target: cleanTarget,
      type: scanType || "Website Security",
      status: "Completed",
      riskScore,
      findingsCount: findings.length,
      findings,
      scannedBy: currentUser?.id || "anonymous",
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "scans", scanId), newScan);
      
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser?.id || "anonymous",
        userEmail: currentUser?.email || "anonymous@cyberfortress.com",
        action: "Vulnerability Scan",
        details: `Completed ${scanType} scan on target ${cleanTarget}. Score: ${riskScore}`,
        status: "Warning",
        timestamp: new Date().toISOString()
      });
      return newScan;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `scans/${scanId}`);
    }
  };

  // Add Threat Intelligence indicator
  const handleAddThreat = async (indicator: string, type: string, severity: string, description: string) => {
    const threatId = `tht-${Math.random().toString(36).substr(2, 9)}`;
    const newThreat: ThreatIndicator = {
      id: threatId,
      source: "User Generated Intelligence",
      indicator,
      type,
      severity: (severity as any) || "Medium",
      description: description || "",
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "threats", threatId), newThreat);
      
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser?.id || "anonymous",
        userEmail: currentUser?.email || "anonymous@cyberfortress.com",
        action: "Threat Intel Action",
        details: `Logged new threat indicator: ${indicator}`,
        status: "Warning",
        timestamp: new Date().toISOString()
      });
      return newThreat;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `threats/${threatId}`);
    }
  };

  // Add Credential item to Vault
  const handleAddVaultItem = async (item: any) => {
    const itemId = `vlt-${Math.random().toString(36).substr(2, 9)}`;
    const newItem = {
      ...item,
      id: itemId,
      ownerId: currentUser?.id || "anonymous",
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "vault", itemId), newItem);
      
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser?.id || "anonymous",
        userEmail: currentUser?.email || "anonymous@cyberfortress.com",
        action: "Credential Added",
        details: `Stored credentials for ${item.title} under vault entry ${itemId}`,
        status: "Success",
        timestamp: new Date().toISOString()
      });
      return newItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vault/${itemId}`);
    }
  };

  // Delete Credential item from Vault
  const handleDeleteVaultItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "vault", id));
      
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: currentUser?.id || "anonymous",
        userEmail: currentUser?.email || "anonymous@cyberfortress.com",
        action: "Credential Deleted",
        details: `Removed vault entry ID: ${id}`,
        status: "Warning",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vault/${id}`);
    }
  };

  // Perform Register / Sign Up API request
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userRole = role || "Security Analyst";

      const userProfile = {
        email: email.toLowerCase(),
        role: userRole,
        fullName,
        orgName: orgName || "Independent Professional",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

      // Create Audit Log
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: firebaseUser.uid,
        userEmail: email.toLowerCase(),
        action: "User Registration",
        details: `Created account with role: ${userRole}`,
        status: "Success",
        timestamp: new Date().toISOString()
      });

      const activeUser: UserType = {
        id: firebaseUser.uid,
        ...userProfile
      };

      setCurrentUser(activeUser);
      const token = await firebaseUser.getIdToken();
      setAuthToken(token);
      localStorage.setItem("cf_user", JSON.stringify(activeUser));
      localStorage.setItem("cf_token", token);
      setCurrentTab("dashboard");

      // Clear inputs
      setEmail("");
      setPassword("");
      setFullName("");
      orgName && setOrgName("");
    } catch (err: any) {
      setAuthError(err.message || "An unknown registration exception occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Perform Login API request
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user profile
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      let profile = userDoc.exists() ? userDoc.data() : null;

      if (!profile) {
        profile = {
          email: email.toLowerCase(),
          role: "Security Analyst",
          fullName: "Security Professional",
          orgName: "Fortress Enterprise Ltd",
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", firebaseUser.uid), profile);
      }

      // Create Audit Log
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "auditLogs", logId), {
        id: logId,
        userId: firebaseUser.uid,
        userEmail: email.toLowerCase(),
        action: "User Login Success",
        details: `Authentication successful. Role: ${profile.role}`,
        status: "Success",
        timestamp: new Date().toISOString()
      });

      const activeUser: UserType = {
        id: firebaseUser.uid,
        email: profile.email,
        role: profile.role,
        fullName: profile.fullName,
        orgName: profile.orgName,
        createdAt: profile.createdAt
      };

      setCurrentUser(activeUser);
      const token = await firebaseUser.getIdToken();
      setAuthToken(token);
      localStorage.setItem("cf_user", JSON.stringify(activeUser));
      localStorage.setItem("cf_token", token);
      setCurrentTab("dashboard");

      // Clear inputs
      setEmail("");
      setPassword("");
    } catch (err: any) {
      // Log login failure
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      try {
        await setDoc(doc(db, "auditLogs", logId), {
          id: logId,
          userId: "anonymous",
          userEmail: email.toLowerCase() || "unknown",
          action: "User Login Failure",
          details: `Authentication failed. Reason: ${err.message}`,
          status: "Failure",
          timestamp: new Date().toISOString()
        });
      } catch (logErr) {
        console.error("Failed to log audit entry:", logErr);
      }
      setAuthError(err.message || "Invalid authentication credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("cf_user");
    localStorage.removeItem("cf_token");
    setCurrentTab("landing");
  };

  const handleNavigateToAi = (contextPrompt: string) => {
    setAiContextPrompt(contextPrompt);
    setCurrentTab("ai-assistant");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Landing Page FAQs
  const landingFaqs = [
    {
      q: "Does Cyber Fortress scan my network actively or passively?",
      a: "Our core compliance modules focus on passive footprint vulnerability checks, inspecting exposed HTTP/TLS certificates, response headers, DNS leakages, and known CVE indicators safely. Our advanced modules support parameterized port audits and OWASP top 10 criteria."
    },
    {
      q: "Is my corporate password vault encrypted?",
      a: "Absolutely. Cyber Fortress maintains an isolated, cryptographically persistent datastore. Credentials remain masked on load and are fully decrypted client-side on-demand, reducing vectors of network leaks."
    },
    {
      q: "How does the AI Cyber Assistant analyze my server logs?",
      a: "The assistant is powered securely by Google Gemini 3.5 Flash server-side. It audits submitted log strings directly against known Indicators of Compromise (IOCs), parses status anomalies, and outputs actionable shell hardening scripts."
    },
    {
      q: "Can I assign custom roles to security teams?",
      a: "Yes. Cyber Fortress includes Role-Based Access Control (RBAC), supporting guest access, standard registered operator access, designated Security Analysts, and complete System Administrators."
    }
  ];

  const getThemeClasses = () => {
    return theme === "dark" 
      ? "min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white" 
      : "min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-slate-900";
  };

  return (
    <div className={`${getThemeClasses()} flex flex-col font-sans relative antialiased transition-colors duration-200`}>
      
      {/* Premium background gradient decoration */}
      {theme === "dark" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent pointer-events-none z-0" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.04))] from-blue-200/20 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {/* Global Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 md:px-8 py-3.5 flex justify-between items-center transition-all ${
        theme === "dark" 
          ? "bg-slate-950/80 border-slate-900/80" 
          : "bg-white/80 border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      }`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab(currentUser ? "dashboard" : "landing")}>
          <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
            theme === "dark"
              ? "bg-blue-950/40 border-blue-800/40 text-blue-400"
              : "bg-blue-50 border-blue-200 text-blue-600"
          }`}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className={`font-bold text-base tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>CYBER FORTRESS</span>
            <span className="text-[9px] text-blue-500 font-semibold block tracking-wider uppercase">Enterprise Defense</span>
          </div>
        </div>

        {/* Desktop Navigation Link Block */}
        {currentUser ? (
          <nav className={`hidden lg:flex items-center gap-1.5 p-1 rounded-xl border ${
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200/60"
          }`}>
            {[
              { id: "dashboard", label: "Dashboard", icon: <Layers className="h-3.5 w-3.5" /> },
              { id: "scanner", label: "Web Scanner", icon: <Globe className="h-3.5 w-3.5" /> },
              { id: "threats", label: "Threat Intel", icon: <Radio className="h-3.5 w-3.5" /> },
              { id: "vault", label: "Secrets Vault", icon: <LockKeyhole className="h-3.5 w-3.5" /> },
              { id: "academy", label: "SecOps Academy", icon: <Award className="h-3.5 w-3.5" /> },
              { id: "ai-assistant", label: "AI Assistant", icon: <Sparkles className="h-3.5 w-3.5" /> },
              { id: "logs", label: "Audit Trails", icon: <Terminal className="h-3.5 w-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  currentTab === tab.id
                    ? theme === "dark"
                      ? "bg-slate-850 text-white shadow"
                      : "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-850/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className={`transition-colors ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>Features</a>
            <a href="#whychose" className={`transition-colors ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>Capabilities</a>
            <a href="#pricing" className={`transition-colors ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>Pricing</a>
            <a href="#faq" className={`transition-colors ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>FAQ</a>
          </nav>
        )}

        {/* User control buttons / Auth triggers / Theme Toggler */}
        <div className="flex items-center gap-3">
          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-750" 
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 hover:shadow-sm"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>{currentUser.fullName}</span>
                <span className="text-[9px] text-blue-500 font-mono tracking-wider font-extrabold uppercase mt-0.5">{currentUser.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className={`border p-2 rounded-xl transition cursor-pointer ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                }`}
                title="Secure logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthMode("login"); setCurrentTab("auth"); }}
                className={`text-xs font-semibold px-3.5 py-2 transition cursor-pointer ${
                  theme === "dark" ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("register"); setCurrentTab("auth"); }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              >
                Launch Console
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden border p-2 rounded-xl transition cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile navigation drawer menu */}
      {mobileMenuOpen && currentUser && (
        <div className={`lg:hidden border-b p-4 space-y-2 flex flex-col z-40 relative ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <Layers className="h-4 w-4" /> },
            { id: "scanner", label: "Web Scanner", icon: <Globe className="h-4 w-4" /> },
            { id: "threats", label: "Threat Intelligence", icon: <Radio className="h-4 w-4" /> },
            { id: "vault", label: "Secrets Vault", icon: <LockKeyhole className="h-4 w-4" /> },
            { id: "academy", label: "SecOps Academy", icon: <Award className="h-4 w-4" /> },
            { id: "ai-assistant", label: "SecOps AI Assistant", icon: <Sparkles className="h-4 w-4" /> },
            { id: "logs", label: "Audit Logs", icon: <Terminal className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setCurrentTab(tab.id); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left ${
                currentTab === tab.id
                  ? theme === "dark"
                    ? "bg-slate-900 text-white border border-slate-850"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Workspaces Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10 flex flex-col justify-start">
        
        {/* VIEW 1: LANDING PAGE */}
        {currentTab === "landing" && (
          <div className="space-y-32 py-10" id="landing-container">
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 relative">
              <div className="lg:col-span-7 space-y-8 text-left">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                  theme === "dark"
                    ? "bg-blue-950/30 border-blue-900/50 text-blue-400"
                    : "bg-blue-50 border-blue-100 text-blue-700"
                }`}>
                  <Fingerprint className="h-3.5 w-3.5" />
                  SaaS Web Auditing & Posture Shield
                </span>

                <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  One Platform.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500">
                    Total Cyber Defense.
                  </span>
                </h1>

                <p className={`text-base md:text-lg max-w-xl leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Cyber Fortress equips sovereign operations with dynamic passive web audits, active threat indicator intelligence logs, client-side encrypted credentials, and server-side SecOps AI.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => { setAuthMode("register"); setCurrentTab("auth"); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Create Security Account
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => { setAuthMode("login"); setCurrentTab("auth"); }}
                    className={`font-semibold text-sm px-6 py-3 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    Access Sandbox Console
                  </button>
                </div>

                {/* Grid of highlights */}
                <div className={`grid grid-cols-3 gap-6 border-t pt-8 text-left ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
                  <div>
                    <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>99.8%</span>
                    <span className={`text-[11px] font-medium block mt-1 uppercase tracking-wider ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>Audit Success</span>
                  </div>
                  <div>
                    <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>SOC2</span>
                    <span className={`text-[11px] font-medium block mt-1 uppercase tracking-wider ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>Compliance Compliant</span>
                  </div>
                  <div>
                    <span className={`text-2xl font-bold block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Gemini</span>
                    <span className={`text-[11px] font-medium block mt-1 uppercase tracking-wider ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>AI Intelligence</span>
                  </div>
                </div>
              </div>

              {/* Right Col: High-Fidelity UI Preview Mockup */}
              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20" />
                <div className={`relative border rounded-xl overflow-hidden shadow-2xl transition ${
                  theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200"
                }`}>
                  {/* macOS Dots Header */}
                  <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${
                    theme === "dark" ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}>
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                    <span className={`text-[11px] font-mono ml-4 truncate font-semibold ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      portal.fortress.internal/dashboard
                    </span>
                  </div>

                  {/* Simulated App Screen */}
                  <div className="p-5 space-y-4 font-sans text-left">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-semibold tracking-wider ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>POSTURE COMPLIANCE</span>
                        <h4 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Secure System Ledger</h4>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <CheckCircle className="h-2.5 w-2.5 text-emerald-600" /> SEC-LEVEL: NOMINAL
                      </span>
                    </div>

                    {/* Simple Dial chart and statistics representation */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                      theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-14 h-14 transform -rotate-90">
                          <circle cx="28" cy="28" r="22" stroke="currentColor" className={theme === "dark" ? "text-slate-800" : "text-slate-200"} strokeWidth="4" fill="transparent" />
                          <circle cx="28" cy="28" r="22" stroke="currentColor" className="text-blue-500" strokeWidth="4" fill="transparent" strokeDasharray="138.2" strokeDashoffset="138.2 - (138.2 * 92) / 100" strokeLinecap="round" />
                        </svg>
                        <span className={`absolute text-xs font-mono font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>92</span>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                          SaaS posture is <strong className={theme === "dark" ? "text-white" : "text-slate-950"}>Excellent</strong>.
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          0 critical alerts and 1 passive CVE vulnerability found in current audit cycle.
                        </p>
                      </div>
                    </div>

                    {/* Progress bars representation */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>WAF INGRESS RATE:</span>
                        <span className="text-blue-500">45 req/sec (Secure)</span>
                      </div>
                      <div className={`h-1.5 rounded overflow-hidden ${theme === "dark" ? "bg-slate-900" : "bg-slate-100"}`}>
                        <div className="h-full bg-blue-500 rounded-full w-2/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trusted By showcase */}
            <section className="text-center space-y-4">
              <span className={`text-[11px] font-bold tracking-widest uppercase block ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}>
                TRUSTED BY COMPLIANCE TEAMS GLOBALLY
              </span>
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
                {["Stripe", "Vercel", "Datadog", "Cloudflare", "CrowdStrike"].map((partner) => (
                  <span 
                    key={partner} 
                    className={`font-bold text-lg tracking-tight font-sans ${
                      theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                    } transition-colors`}
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </section>

            {/* Feature Cards Grid */}
            <section id="features" className="space-y-16">
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-mono font-bold text-blue-500 tracking-wider">DEFENSIVE SUITE</span>
                <h2 className={`text-2xl md:text-4xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Enterprise-Grade Security Architecture
                </h2>
                <p className={`text-sm max-w-xl mx-auto leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Full-stack security tooling designed to audit, harden, and securely record operational postures without exposing access keys.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Feature 1 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-blue-950/40 border-blue-900/40 text-blue-400"
                      : "bg-blue-50 border-blue-100 text-blue-600"
                  }`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Vulnerability & SSL Web Scanner</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Execute authorized website audits. Inspect TLS version certificates, Content-Security-Policy responses, and prevent OWASP host injection parameters dynamically.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-sky-950/40 border-sky-900/40 text-sky-400"
                      : "bg-sky-50 border-sky-100 text-sky-600"
                  }`}>
                    <Radio className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Active Threat Intelligence</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Monitor live Indicators of Compromise (IOCs) such as malicious external IP addresses and global CVE advisories. Audit system endpoints securely in real-time.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-400"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600"
                  }`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Gemini SecOps Assistant</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Query our Google Gemini-backed secure assistant to inspect complex proxy servers configurations, parse system threat logs, and write shell scripts.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-blue-950/40 border-blue-900/40 text-blue-400"
                      : "bg-blue-50 border-blue-100 text-blue-600"
                  }`}>
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Credential Security Vault</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Store corporate secret tokens inside a persistent client-side decrypted vault. Evaluate exact secret complexity with a cryptographic entropy dial.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-sky-950/40 border-sky-900/40 text-sky-400"
                      : "bg-sky-50 border-sky-100 text-sky-600"
                  }`}>
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Compliance Audit Trails</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Satisfy SOC2 regulatory requirements and HIPAA security rules. Review detailed administrator activities trails and export spreadsheet logs instantly.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className={`border p-6 rounded-2xl hover:shadow-lg transition-all relative overflow-hidden group ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-slate-200/50"
                }`}>
                  <div className={`p-3 rounded-xl border w-fit ${
                    theme === "dark"
                      ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-400"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600"
                  }`}>
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold mt-5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Role-Based Gates (RBAC)</h3>
                  <p className={`text-xs leading-relaxed mt-2.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Maintain secure boundary parameters. Seamlessly isolate clearances between regular Operators, dedicated security Analysts, and Administrators.
                  </p>
                </div>

              </div>
            </section>

            {/* Why Choose Cyber Fortress */}
            <section id="whychose" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 text-left">
                <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-widest block">ARCHITECTURAL FIDELITY</span>
                <h2 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Sovereign Corporate Security Posture
                </h2>
                <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Cyber Fortress isn't a mere landing template — it represents a real full-stack dashboard constructed on resilient, audited security frameworks.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-xl border h-fit shrink-0 ${
                      theme === "dark" ? "bg-emerald-950/50 border-emerald-900/30 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                      <CheckCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>Isolated Storage Databases</h4>
                      <p className={`text-xs mt-1 leading-normal ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        All administrative audit logs, active threat indicators, web scan histories, and passwords reside safely inside persistent, secured disk caches.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`p-2 rounded-xl border h-fit shrink-0 ${
                      theme === "dark" ? "bg-emerald-950/50 border-emerald-900/30 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                      <CheckCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>Cryptographic Credential Shielding</h4>
                      <p className={`text-xs mt-1 leading-normal ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Secrets remain fully masked and isolated inside memory pipelines, executing AES decrypted translations strictly on the active client container.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Mock */}
              <div className={`border rounded-2xl p-5 font-mono text-[11px] space-y-3.5 shadow-2xl transition ${
                theme === "dark" ? "bg-slate-950 border-slate-850 text-slate-300" : "bg-white border-slate-200 text-slate-800"
              }`}>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    <Terminal className="h-3.5 w-3.5 text-blue-500" /> SEC-DAEMON: ACTIVE
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-blue-600">[BOOT] Initializing core Cyber Fortress security nodes...</div>
                <div className="text-slate-500">[CACHE] Dynamic database mounted securely. Storage validated.</div>
                <div className="text-slate-500">[WAF] Reverse gateway active on secure interface port 3000.</div>
                <div className="text-slate-500">[AI] Server-side proxy token parsed. Gemini flash core ready.</div>
                <div className="text-emerald-600 font-bold">[OK] Sovereignty health audit checks finalized. Status nominal.</div>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="space-y-16">
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-mono font-bold text-blue-500 tracking-wider">SECURE INVESTMENT</span>
                <h2 className={`text-2xl md:text-4xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  SaaS Deployment Tiers
                </h2>
                <p className={`text-sm max-w-xl mx-auto leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Choose a deployment profile sized perfectly to support single audit consultants, active security teams, or enterprise divisions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                
                {/* Tier 1 */}
                <div className={`border p-7 rounded-2xl space-y-6 flex flex-col justify-between transition-all ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-sm hover:shadow-md"
                }`}>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Sandbox Trial</span>
                    <h3 className={`text-3xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      $0 <span className={`text-xs font-normal font-sans ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>/ forever</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Perfect for sovereign security professionals and academic researchers audit credentials.
                    </p>
                  </div>

                  <ul className={`space-y-3 text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> 1 Operational Seat</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Passive Web Auditing</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Local Encrypted Vault</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Simulated AI assistance</li>
                  </ul>

                  <button 
                    onClick={() => { setAuthMode("register"); setCurrentTab("auth"); }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      theme === "dark"
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-750"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200/80"
                    }`}
                  >
                    Deploy Sandbox Node
                  </button>
                </div>

                {/* Tier 2 (Highlighted) */}
                <div className={`border-2 p-7 rounded-2xl space-y-6 flex flex-col justify-between relative shadow-xl transition-all ${
                  theme === "dark"
                    ? "bg-slate-900 border-blue-500 shadow-blue-500/5"
                    : "bg-white border-blue-500 shadow-blue-500/5"
                }`}>
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-mono text-[9px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full shadow-md">
                    RECOMMENDED PROFILE
                  </span>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest block">SecOps Analyst</span>
                    <h3 className={`text-3xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      $49 <span className={`text-xs font-normal font-sans ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>/ seat / mo</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                      Built explicitly for cyber penetration groups, compliance auditing teams, and active defensive operations.
                    </p>
                  </div>

                  <ul className={`space-y-3 text-xs font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-blue-500 shrink-0" /> Unlimited passive audits</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-blue-500 shrink-0" /> Port scanners & OWASP Top 10</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-blue-500 shrink-0" /> Active Threat Intelligence</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-blue-500 shrink-0" /> Full Gemini SecOps Assistant</li>
                  </ul>

                  <button 
                    onClick={() => { setAuthMode("register"); setCurrentTab("auth"); }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md hover:shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    Deploy Analyst License
                  </button>
                </div>

                {/* Tier 3 */}
                <div className={`border p-7 rounded-2xl space-y-6 flex flex-col justify-between transition-all ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    : "bg-white border-slate-200/80 shadow-sm hover:shadow-md"
                }`}>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Sovereign Division</span>
                    <h3 className={`text-3xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      $149 <span className={`text-xs font-normal font-sans ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>/ mo</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Enterprise posture protection for entire engineering blocks, requiring strict RBAC logs auditing.
                    </p>
                  </div>

                  <ul className={`space-y-3 text-xs font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Unlimited Operators seats</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> ISO/SOC compliance audits logs</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Full Admin RBAC clearance</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Dedicated secure backend API</li>
                  </ul>

                  <button 
                    onClick={() => { setAuthMode("register"); setCurrentTab("auth"); }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      theme === "dark"
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-750"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200/80"
                    }`}
                  >
                    Contact Sales Group
                  </button>
                </div>

              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="space-y-16 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-mono font-bold text-blue-500 tracking-wider">FREQUENTLY INQUIRED</span>
                <h2 className={`text-2xl md:text-4xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Platform FAQ
                </h2>
                <p className={`text-sm max-w-xl mx-auto ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Technical responses covering our passive-to-active scan algorithms, password masking encryption, and server AI.
                </p>
              </div>

              <div className="space-y-4">
                {landingFaqs.map((faq, idx) => {
                  const isOpen = activeFaqIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-2xl p-5 cursor-pointer transition ${
                        theme === "dark"
                          ? "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                          : "bg-white border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm"
                      }`}
                      onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <h4 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{faq.q}</h4>
                        <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
                      </div>
                      
                      {isOpen && (
                        <p className={`text-xs leading-relaxed mt-4 border-t pt-4 ${
                          theme === "dark" ? "text-slate-400 border-slate-800/80" : "text-slate-500 border-slate-100"
                        }`}>
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SECURITY OPERATOR AUTHENTICATION */}
        {currentTab === "auth" && (
          <div className="max-w-md mx-auto w-full py-16" id="auth-container">
            <div className={`border rounded-2xl p-7 space-y-6 relative overflow-hidden shadow-xl transition-all ${
              theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-slate-200/30"
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
              
              <div className="text-center space-y-3">
                <div className={`p-3 rounded-xl border w-fit mx-auto ${
                  theme === "dark" ? "bg-blue-950/40 border-blue-900/40 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                  <Shield className="h-6 w-6" />
                </div>
                <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {authMode === "login" ? "Access Defense Console" : "Register Security Operator"}
                </h2>
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  {authMode === "login" 
                    ? "Verify security credentials to load control panels" 
                    : "Register operator profiles compliant with compliance scopes"
                  }
                </p>
              </div>

              {authError && (
                <div className={`border p-3 rounded-xl flex items-start gap-2.5 text-xs font-mono leading-relaxed ${
                  theme === "dark" ? "bg-red-950/20 border-red-900/30 text-red-400" : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login/Register Forms */}
              <form 
                onSubmit={authMode === "login" ? handleLoginSubmit : handleRegisterSubmit} 
                className="space-y-4 text-left"
              >
                {authMode === "register" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-[11px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Operator Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                          theme === "dark" 
                            ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                            : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className={`text-[11px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                          Organization
                        </label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Fortress Lab"
                          className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                            theme === "dark" 
                              ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                              : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-[11px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                          Assigned Role
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                            theme === "dark" 
                              ? "bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500" 
                              : "bg-white border-slate-200 text-slate-700 focus:border-blue-500 focus:shadow-sm"
                          }`}
                        >
                          <option value="Security Analyst">Security Analyst</option>
                          <option value="Registered User">Registered User</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={`text-[11px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Security Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@cyberfortress.com"
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className={`text-[11px] font-semibold block uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Clearance Password
                    </label>
                    {authMode === "login" && (
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => alert("Sandbox clearance credentials: analyst@cyberfortress.com / Password123!")}
                          className="text-[10px] text-slate-400 hover:text-slate-300 hover:underline font-semibold cursor-pointer"
                        >
                          Bypass Hint?
                        </button>
                        <span className="text-[10px] text-slate-500 font-bold leading-none select-none">•</span>
                        <button 
                          type="button"
                          onClick={() => { setCurrentTab("forgot-password"); setAuthError(""); }}
                          className="text-[10px] text-blue-500 hover:text-blue-400 hover:underline font-bold cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Authorizing...
                    </>
                  ) : authMode === "login" ? (
                    "Authorize & Load Console"
                  ) : (
                    "Create Operator Profile"
                  )}
                </button>
              </form>

              {/* Demo Clearance Hints */}
              <div className={`p-3.5 rounded-xl border text-[11px] font-mono leading-normal text-left space-y-1.5 ${
                theme === "dark" ? "bg-slate-950/60 border-slate-850 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-600"
              }`}>
                <span className="text-blue-500 font-bold flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Sandbox Access Keys:</span>
                <div>Email: <strong className={theme === "dark" ? "text-slate-300" : "text-slate-800"}>analyst@cyberfortress.com</strong></div>
                <div>Password: <strong className={theme === "dark" ? "text-slate-300" : "text-slate-800"}>Password123!</strong></div>
              </div>

              {/* Toggle register / login triggers */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className={`text-xs underline font-semibold cursor-pointer ${theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {authMode === "login" 
                    ? "Need registered operator clearance? Create account" 
                    : "Have an operational clearance profile? Log in"
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2.5: SECURITY OPERATOR RECOVERY SEQUENCE */}
        {currentTab === "forgot-password" && (
          <ForgotPassword 
            onBackToLogin={() => { setAuthMode("login"); setCurrentTab("auth"); }} 
            theme={theme}
          />
        )}

        {/* VIEW 3: AUTHENTICATED ACTIVE FEATURE VIEWS */}
        {currentUser && currentTab === "dashboard" && (
          <DashboardHome 
            scans={scans} 
            threats={threats} 
            logs={logs} 
            onNavigate={(tab) => setCurrentTab(tab)}
            onRefreshAll={async () => {}}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "scanner" && (
          <WebScanner 
            scans={scans}
            onTriggerScan={handleTriggerScan}
            onNavigateToAi={handleNavigateToAi}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "threats" && (
          <ThreatIntelligence 
            threats={threats}
            onAddThreat={handleAddThreat}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "vault" && (
          <PasswordVault 
            vault={vault}
            onAddVaultItem={handleAddVaultItem}
            onDeleteVaultItem={handleDeleteVaultItem}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "ai-assistant" && (
          <AiAssistant 
            initialPromptContext={aiContextPrompt}
            onClearContext={() => setAiContextPrompt("")}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "logs" && (
          <AuditLogs 
            logs={logs}
            theme={theme}
          />
        )}

        {currentUser && currentTab === "academy" && (
          <Academy 
            currentUser={currentUser}
            theme={theme}
          />
        )}

      </main>

      {/* Global Footing */}
      <footer className={`border-t py-8 text-xs font-medium relative z-10 ${
        theme === "dark" ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-white border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Cyber Fortress Inc. Sovereign Corporate Protections. All Rights Reserved.</span>
          <div className="flex gap-5 font-mono text-[10px] uppercase tracking-wider font-bold">
            <span className={theme === "dark" ? "text-slate-700" : "text-slate-400"}>ISO 27001</span>
            <span className={theme === "dark" ? "text-slate-700" : "text-slate-400"}>SOC2 Type II</span>
            <span className={theme === "dark" ? "text-slate-700" : "text-slate-400"}>HIPAA Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
