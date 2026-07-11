import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  FileDown, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Trophy, 
  ChevronRight, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Code,
  Shield, 
  Cpu, 
  HardDrive, 
  Database,
  Lock,
  UserCheck,
  Settings,
  X,
  PlusCircle,
  Bookmark,
  Heart,
  MessageSquare
} from "lucide-react";

// --- Types ---
export interface Lab {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Insane";
  estimatedTime: string; // e.g. "45 mins"
  xpReward: number;
  coinsReward: number;
  requiredSkills: string[];
  learningOutcomes: string[];
  overview: string;
  objectives: string[];
  hints: string[];
  walkthrough: string;
  files: { name: string; size: string; type: string; downloadUrl: string; previewContent?: string }[];
  flags: { flag: string; points: number; description: string; solved?: boolean }[];
  targetHost?: string;
  terminalPrompt?: string;
  commands: { [key: string]: { output: string; solve?: boolean; details?: string } };
}

export interface LabSession {
  sessionId: string;
  labId: string;
  userId: string;
  status: "Active" | "Paused" | "Terminated";
  startedAt: string;
  timeLeft: number; // seconds
  terminalTabs: { id: string; name: string; history: { cmd: string; out: string }[] }[];
  activeTabId: string;
  notes: string;
  bookmarks: string[];
  flagsSolved: string[]; // flag indices or descriptions
}

// --- Default Lab Catalog ---
const DEFAULT_LABS: Lab[] = [
  {
    id: "lab-linux-hardening",
    title: "Linux SUID Privilege Escalation Auditing",
    category: "Linux",
    description: "Audit insecure SUID permissions on an Ubuntu production box and exploit misconfigured find binaries to gain root privileges.",
    difficulty: "Medium",
    estimatedTime: "30 mins",
    xpReward: 250,
    coinsReward: 100,
    requiredSkills: ["Linux terminal basics", "Understanding file permissions", "SUID concept"],
    learningOutcomes: [
      "Audit standard files for the SUID bit on modern distributions",
      "Identify vulnerable executables capable of execution escapes",
      "Mitigate privilege vulnerabilities using root permission sweeps"
    ],
    overview: "This lab places you in an unprivileged user shell of a production corporate application container. A recent security audit suggested the system has an over-privileged file wrapper. Your mission is to find the misconfigured binary, exploit the SUID permission structure to spawn a root terminal, and extract the secret root flag.",
    objectives: [
      "Identify SUID-enabled binaries on the target file system.",
      "Identify the vulnerability in the 'find' utility when SUID is configured.",
      "Spawn a root shell to access restricted audit folders.",
      "Retrieve the operational flag from /root/flag.txt."
    ],
    hints: [
      "Run 'find / -perm -4000 -type f 2>/dev/null' to locate all SUID binaries.",
      "The 'find' command has an executive switch '-exec'. If it is run with SUID, it processes instructions as root."
    ],
    walkthrough: "1. Scan the SUID list using: find / -perm -4000 -type f\n2. Note that /usr/bin/find has the SUID bit active!\n3. Run: find . -exec /bin/sh -p \\; -quit\n4. This launches a privileged sh terminal.\n5. Inspect files: cat /root/flag.txt to capture the flag: CF{suid_find_root_elevation_77}",
    files: [
      { name: "audit_script.sh", size: "1.2 KB", type: "Script", downloadUrl: "#", previewContent: "#!/bin/bash\n# Audit SUID permissions\necho 'Auditing SUID permissions...'\nfind / -perm -4000 -type f 2>/dev/null" },
      { name: "system_logs.log", size: "45 KB", type: "Log File", downloadUrl: "#", previewContent: "Jul 10 12:01:03 fortress-prod systemd[1]: Started System Logging Service.\nJul 10 12:05:22 fortress-prod sshd[1244]: Accepted publickey for operator from 10.0.1.55" }
    ],
    flags: [
      { flag: "CF{suid_find_root_elevation_77}", points: 250, description: "Extract the root flag from /root/flag.txt" }
    ],
    targetHost: "ubuntu-prod-node.fortress.internal",
    terminalPrompt: "operator@ubuntu-prod:~$",
    commands: {
      "help": {
        output: "Available operational range commands:\n  help         - Display command catalog\n  ls           - List files in current directory\n  cat [file]   - View text file contents\n  find / -perm -4000 -type f 2>/dev/null - Audit the machine's SUID binary permissions\n  find . -exec /bin/sh -p \\; -quit      - Exploit SUID privilege escape vector\n  whoami       - Display current system privilege level\n  uname -a     - Display kernel metadata"
      },
      "ls": {
        output: "audit_script.sh    system_logs.log    public_html/"
      },
      "whoami": {
        output: "operator"
      },
      "uname -a": {
        output: "Linux ubuntu-prod-node 5.15.0-88-generic #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux"
      },
      "cat audit_script.sh": {
        output: "#!/bin/bash\n# Audit SUID permissions\necho 'Auditing SUID permissions...'\nfind / -perm -4000 -type f 2>/dev/null"
      },
      "cat system_logs.log": {
        output: "Jul 10 12:01:03 fortress-prod systemd[1]: Started System Logging Service.\nJul 10 12:05:22 fortress-prod sshd[1244]: Accepted publickey for operator"
      },
      "find / -perm -4000 -type f 2>/dev/null": {
        output: "/usr/lib/dbus-1.0/dbus-daemon-launch-helper\n/usr/lib/openssh/ssh-keysign\n/usr/bin/chsh\n/usr/bin/gpasswd\n/usr/bin/passwd\n/usr/bin/chfn\n/usr/bin/sudo\n/usr/bin/find  <-- [CRITICAL: NON-STANDARD SUID BINDING DETECTED]"
      },
      "find . -exec /bin/sh -p \\; -quit": {
        output: "# Launching interactive root shell...\n# whoami\nroot\n# ls /root\nflag.txt    ssh_configs/\n# cat /root/flag.txt\nCF{suid_find_root_elevation_77}\n# ",
        solve: true
      },
      "cat /root/flag.txt": {
        output: "cat: /root/flag.txt: Permission denied"
      }
    }
  },
  {
    id: "lab-wireshark-pcap",
    title: "Wireshark Network Incident Packet Analysis",
    category: "Wireshark",
    description: "Analyze a corporate network PCAP dump containing suspicious credential exfiltration over unencrypted protocols.",
    difficulty: "Easy",
    estimatedTime: "20 mins",
    xpReward: 150,
    coinsReward: 50,
    requiredSkills: ["Wireshark basics", "HTTP traffic structures", "Hex analysis"],
    learningOutcomes: [
      "Identify plaintext authentication packages over HTTP requests",
      "Trace target conversations across TCP streams",
      "Isolate exact credential leaks inside packet traces"
    ],
    overview: "Our firewall detected a peak of high outbound traffic on port 80. A network analyst managed to capture a packet capture (PCAP) trace of the event before the intruder stopped the transaction. Analyze the PCAP data, trace the TCP streams, and find the exfiltrated sensitive details.",
    objectives: [
      "Load the PCAP analysis tool context.",
      "Filter for HTTP POST requests containing sensitive parameters.",
      "Reconstruct the exfiltrated user data fields.",
      "Capture the flag: CF{plaintext_credentials_leaked_55}."
    ],
    hints: [
      "Run the 'sniff-packets' tool to run packet queries.",
      "Look for HTTP POST payload streams on Port 80."
    ],
    walkthrough: "1. Execute: sniff-packets --filter='http.request.method == \"POST\"'\n2. Inspect the HTTP payload stream output.\n3. The captured parameter payload outputs:\n   username=admin&secret=CF{plaintext_credentials_leaked_55}",
    files: [
      { name: "traffic_capture.pcap", size: "142 KB", type: "Packet Capture", downloadUrl: "#", previewContent: "[PCAP Packet Trace Metadata]\nFrame 1: 74 bytes on wire (592 bits)\nProtocols in frame: eth:ethertype:ip:tcp:http" }
    ],
    flags: [
      { flag: "CF{plaintext_credentials_leaked_55}", points: 150, description: "Extract the credentials leak from TCP stream" }
    ],
    targetHost: "wireshark-analyzer.internal",
    terminalPrompt: "analyst@wireshark-lab:~$",
    commands: {
      "help": {
        output: "Available commands:\n  help                     - Show helper catalog\n  ls                       - List files\n  cat traffic_capture.pcap - Read PCAP metadata\n  sniff-packets            - Load packet parser interactive engine"
      },
      "ls": {
        output: "traffic_capture.pcap"
      },
      "cat traffic_capture.pcap": {
        output: "[RAW SYSTEM PACKET ARCHIVE]\nLoad this file inside sniff-packets tool for TCP stream reconstruction."
      },
      "sniff-packets": {
        output: "Loading Wireshark Packet Sniffer Simulator...\nReading traffic_capture.pcap (1250 packets found)\nFilter: [None]\nTry using 'sniff-packets --filter=\"http\"' to filter down traffic protocols."
      },
      "sniff-packets --filter=\"http\"": {
        output: "Applying Filter: http\n[Packet 455] 10.0.1.10 -> 192.168.12.99 HTTP GET /index.html\n[Packet 458] 192.168.12.99 -> 10.0.1.10 HTTP 200 OK\n[Packet 520] 10.0.1.10 -> 192.168.12.99 HTTP POST /api/login (Application/x-www-form-urlencoded)\n\nTry checking the POST data content using sniff-packets --inspect=520"
      },
      "sniff-packets --inspect=520": {
        output: "[+] Packet 520 - Detailed Stream Hex Inspection:\nSource IP: 10.0.1.10 | Destination IP: 192.168.12.99\nTCP Stream #4 | Content-Length: 54\n\nPayload:\nusername=admin_root&auth_token=CF{plaintext_credentials_leaked_55}&session_key=8s9d8s\n",
        solve: true
      }
    }
  },
  {
    id: "lab-sqli-remediation",
    title: "SQL Injection (SQLi) Audit & Defensive Hardening",
    category: "SQL Injection",
    description: "Audit a vulnerable SQL injection endpoint, extract data via database dumps, and remediate using Parameterized Queries.",
    difficulty: "Hard",
    estimatedTime: "40 mins",
    xpReward: 350,
    coinsReward: 150,
    requiredSkills: ["Web exploitation", "SQL Syntax", "Prepared Statements"],
    learningOutcomes: [
      "Perform SQL query manipulation to leak schema structures",
      "Leverage UNION select queries to retrieve cross-table data",
      "Defend applications against injection using parameterized bindings"
    ],
    overview: "Your enterprise billing dashboard is under constant scan from brute-force systems. Our software engineers identified that the billing report lookup concatenates parameters directly. Your job is to verify the vulnerability by extracting the hidden flag, and then patch the source code script to enforce parameters.",
    objectives: [
      "Analyze the SQL database fields.",
      "Perform a UNION query to extract data from the secret_flags table.",
      "Locate the vulnerability code segment inside server.js.",
      "Patch the query code to use secure binding prepared statements.",
      "Capture the flag: CF{parameterized_prepared_queries_99}."
    ],
    hints: [
      "Try searching the target system for the web server files like ls -la.",
      "Run the exploit script using standard SQL injection Union queries: ' UNION SELECT null, flag FROM secret_flags --"
    ],
    walkthrough: "1. Run: ls\n2. Inspect server.js\n3. Use parameter check tool or union injection: inject-payload --sqli\n4. Read flag from query feedback.\n5. Patch source using command: patch-secure\n6. The flag is CF{parameterized_prepared_queries_99}",
    files: [
      { name: "server.js", size: "3.4 KB", type: "Source Code", downloadUrl: "#", previewContent: "const express = require('express');\nconst app = express();\n\napp.get('/api/billing', async (req, res) => {\n  const id = req.query.id;\n  // VULNERABLE: Direct string concatenation\n  const query = `SELECT * FROM invoices WHERE id = '${id}'`;\n  const results = await db.query(query);\n  res.json(results);\n});" }
    ],
    flags: [
      { flag: "CF{parameterized_prepared_queries_99}", points: 350, description: "Extract database flag via SQL injection" }
    ],
    targetHost: "billing-server.fortress.internal",
    terminalPrompt: "developer@billing-web:~$",
    commands: {
      "help": {
        output: "Available commands:\n  help                      - Display help\n  ls                        - List system files\n  cat server.js             - View source code file\n  inject-payload --sqli     - Inject union payload into billing endpoint\n  patch-secure              - Re-write query with secure parameterized bindings"
      },
      "ls": {
        output: "server.js   db_config.json"
      },
      "cat server.js": {
        output: "const express = require('express');\nconst app = express();\n\napp.get('/api/billing', async (req, res) => {\n  const id = req.query.id;\n  // VULNERABLE: Direct string concatenation\n  const query = `SELECT * FROM invoices WHERE id = '${id}'`;\n  const results = await db.query(query);\n  res.json(results);\n});"
      },
      "inject-payload --sqli": {
        output: "Executing payload against /api/billing?id=1' UNION SELECT 1, flag, 'active' FROM secret_flags --\n[+] SQL INJECTION SUCCESSFUL!\n\nDatabase Response Rows:\n----------------------------------------\nID: 1 | Name: Invoice 101 | Status: active\nID: 2 | Name: Flag Code | Status: CF{parameterized_prepared_queries_99}\n----------------------------------------\nUse command 'patch-secure' to harden the codebase and complete the secondary objective."
      },
      "patch-secure": {
        output: "[+] Secure Patch Applied successfully to server.js!\n[+] Code updated to:\n\nconst query = 'SELECT * FROM invoices WHERE id = $1';\nconst results = await db.query(query, [id]);\n\n[+] Security audit passed. Vulnerability eliminated."
      }
    }
  }
];

interface AcademyLabsProps {
  currentUser: { id: string; fullName: string; email: string; role: string; orgName: string };
  theme?: "light" | "dark";
}

export default function AcademyLabs({ currentUser, theme = "light" }: AcademyLabsProps) {
  // Navigation & Catalogs
  const [activeTab, setActiveTab] = useState<"dashboard" | "active-lab" | "builder" | "admin">("dashboard");
  const [labs, setLabs] = useState<Lab[]>(DEFAULT_LABS);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  
  // Active session tracking state
  const [currentSession, setCurrentSession] = useState<LabSession | null>(null);
  const [sessionTimer, setSessionTimer] = useState<string>("59:59");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [terminalTabs, setTerminalTabs] = useState<{ id: string; name: string; history: { cmd: string; out: string }[] }[]>([
    { id: "terminal-1", name: "Core Shell", history: [{ cmd: "help", out: "Available operational commands. Type 'help' to start." }] }
  ]);
  const [activeTerminalTab, setActiveTerminalTab] = useState<string>("terminal-1");
  const [cmdInput, setCmdInput] = useState<string>("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalSplit, setTerminalSplit] = useState<boolean>(false);
  const [isVMRunning, setIsVMRunning] = useState<boolean>(false);
  const [vmProgress, setVmProgress] = useState<number>(0);
  const [isVMLoading, setIsVMLoading] = useState<boolean>(false);
  
  // Dashboard Interactive States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [discussions, setDiscussions] = useState<{ [key: string]: { user: string; text: string; date: string }[] }>({
    "lab-linux-hardening": [
      { user: "Sarah Pence", text: "Remember to search for SUID executable paths using the correct permission bit prefix (-4000).", date: "Jul 9, 2026" },
      { user: "Carlos Diaz", text: "This environment mimics our staging server parameters identically. Highly educational!", date: "Jul 10, 2026" }
    ]
  });
  const [newComment, setNewComment] = useState<string>("");
  const [labNotes, setLabNotes] = useState<{ [key: string]: string }>({});

  // Active Lab Inner Tab
  const [activeLabInnerTab, setActiveLabInnerTab] = useState<"overview" | "validation" | "files" | "ai-helper" | "notes" | "discussion">("overview");

  // AI Lab Assistant state
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const aiChatEndRef = useRef<HTMLDivElement | null>(null);

  // Instructor Lab Builder Form
  const [newLabForm, setNewLabForm] = useState<Partial<Lab>>({
    title: "",
    category: "Linux",
    description: "",
    difficulty: "Medium",
    estimatedTime: "30 mins",
    xpReward: 200,
    coinsReward: 100,
    overview: "",
    requiredSkills: [],
    learningOutcomes: [],
    objectives: [],
    hints: [],
    walkthrough: "",
    flags: [{ flag: "", points: 100, description: "Extract the root flag code" }],
    terminalPrompt: "operator@secops:~$",
    commands: { "help": { output: "Custom lab environment system initialized." } }
  });

  // Admin virtualization metrics simulation state
  const [adminMetrics, setAdminMetrics] = useState({
    cpuUsage: 14.2,
    memoryUsage: 38.6,
    activeMicroVMs: 3,
    storageAllocation: 12.8,
    activeSessions: 12,
    networkThroughput: "450 Mbps"
  });

  // Flag submissions state
  const [flagInput, setFlagInput] = useState<string>("");
  const [flagStatus, setFlagStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Timer Countdown loop
  useEffect(() => {
    let interval: any = null;
    if (isVMRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsVMRunning(false);
            return 0;
          }
          const next = prev - 1;
          const mins = Math.floor(next / 60);
          const secs = next % 60;
          setSessionTimer(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVMRunning, secondsRemaining]);

  // Sync AI Chat scroll
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, aiLoading]);

  // Prepopulate from Firestore catalog if exists
  useEffect(() => {
    const fetchCatalogAndStats = async () => {
      try {
        const labsSnap = await getDocs(collection(db, "virtualLabs"));
        if (!labsSnap.empty) {
          const fetchedLabs: Lab[] = [];
          labsSnap.forEach(doc => {
            fetchedLabs.push({ id: doc.id, ...doc.data() } as Lab);
          });
          setLabs(fetchedLabs);
        } else {
          // Seed catalog into Firestore for permanence
          for (const lab of DEFAULT_LABS) {
            await setDoc(doc(db, "virtualLabs", lab.id), lab);
          }
        }

        // Fetch User state bookmarks
        const userDoc = await getDoc(doc(db, "users", currentUser.id));
        if (userDoc.exists()) {
          const uData = userDoc.data();
          if (uData.bookmarks) setBookmarks(uData.bookmarks);
          if (uData.favorites) setFavorites(uData.favorites);
        }
      } catch (err) {
        console.error("Failure synchronizing virtual labs catalog:", err);
      }
    };
    fetchCatalogAndStats();
  }, [currentUser]);

  // Bookmark toggle
  const toggleBookmark = async (labId: string) => {
    const nextBookmarks = bookmarks.includes(labId) 
      ? bookmarks.filter(id => id !== labId) 
      : [...bookmarks, labId];
    setBookmarks(nextBookmarks);
    try {
      await updateDoc(doc(db, "users", currentUser.id), { bookmarks: nextBookmarks });
    } catch (err) {
      console.error("Error persisting user bookmarks:", err);
    }
  };

  // Favorite toggle
  const toggleFavorite = async (labId: string) => {
    const nextFavs = favorites.includes(labId) 
      ? favorites.filter(id => id !== labId) 
      : [...favorites, labId];
    setFavorites(nextFavs);
    try {
      await updateDoc(doc(db, "users", currentUser.id), { favorites: nextFavs });
    } catch (err) {
      console.error("Error persisting user favorites:", err);
    }
  };

  // Launch Environment Animation & Handlers
  const handleLaunchLab = (lab: Lab) => {
    setSelectedLab(lab);
    setIsVMLoading(true);
    setVmProgress(0);
    
    // Simulate container provisioning build trace
    const interval = setInterval(() => {
      setVmProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVMLoading(false);
          setIsVMRunning(true);
          setSecondsRemaining(3600); // 1 hour
          setSessionTimer("60:00");
          setActiveTab("active-lab");
          
          // Seed initial terminal tabs & AI assistant
          setTerminalTabs([
            { id: "terminal-1", name: "Core Shell", history: [{ cmd: "help", out: lab.terminalPrompt ? `Welcome to ${lab.title}. System loaded.\nTarget: ${lab.targetHost || "internal-host"}\nType 'help' to review available operations.` : `Operational shell ready.\nType 'help' for instructions.` }] }
          ]);
          setAiMessages([
            { role: "assistant", content: `Greetings Practitioner. I am your specialized AI Lab Assistant for "${lab.title}". I have parsed your active lab configuration, available commands, and environment properties. How can I guide your exploitation strategy today? (No direct flag reveals allowed!).` }
          ]);

          // Create audit log entry
          setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
            userId: currentUser.id,
            userEmail: currentUser.email,
            action: "Lab VM Environment Launched",
            details: `Successfully booted Firecracker microVM container for: "${lab.title}"`,
            status: "Success",
            timestamp: new Date().toISOString()
          }).catch(console.error);

          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handlePauseLab = () => {
    setIsVMRunning(false);
    // Log Audit
    if (selectedLab) {
      setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "Lab VM Paused",
        details: `Paused execution state for: "${selectedLab.title}"`,
        status: "Success",
        timestamp: new Date().toISOString()
      }).catch(console.error);
    }
  };

  const handleResumeLab = () => {
    setIsVMRunning(true);
  };

  const handleResetLab = () => {
    if (!selectedLab) return;
    setSecondsRemaining(3600);
    setTerminalTabs([
      { id: "terminal-1", name: "Core Shell", history: [{ cmd: "help", out: `System fully re-imaged. Type 'help' to begin.` }] }
    ]);
    setFlagStatus(null);
    setFlagInput("");
    // Log Audit
    setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "Lab VM Hard Reset",
      details: `Dispatched container refresh for: "${selectedLab.title}"`,
      status: "Success",
      timestamp: new Date().toISOString()
    }).catch(console.error);
  };

  const handleTerminateLab = () => {
    setIsVMRunning(false);
    setSelectedLab(null);
    setActiveTab("dashboard");
  };

  const handleExtendTime = () => {
    setSecondsRemaining((prev) => prev + 900); // Add 15 mins
    // Trigger notification
    setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "Session Time Extended",
      details: `Added +15 minutes allocation for active microVM workspace.`,
      status: "Success",
      timestamp: new Date().toISOString()
    }).catch(console.error);
  };

  // Browser Terminal interpreter logic
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim() || !selectedLab) return;

    const cmd = cmdInput.trim();
    const cleanCmd = cmd.toLowerCase();
    
    // Add command to history
    const nextHistory = [...cmdHistory, cmd];
    setCmdHistory(nextHistory);
    setHistoryIndex(nextHistory.length);
    setCmdInput("");

    let output = `sh: command not found: ${cmd}. Type 'help' for support.`;
    
    // Lookup lab command output
    if (selectedLab.commands && selectedLab.commands[cmd]) {
      output = selectedLab.commands[cmd].output;
    } else {
      // Basic common commands logic
      if (cleanCmd === "help") {
        output = "Standard Linux Sandbox Shell commands:\n  help\n  ls\n  uname -a\n  whoami\n  clear";
      } else if (cleanCmd === "ls") {
        output = selectedLab.files.map(f => f.name).join("    ") || "public_html/  secure_sandbox/";
      } else if (cleanCmd === "whoami") {
        output = "operator";
      } else if (cleanCmd === "uname -a") {
        output = "Linux fortress-range-container 5.4.0-109-generic x86_64 x86_64 GNU/Linux";
      } else if (cleanCmd === "clear") {
        setTerminalTabs(prev => prev.map(t => t.id === activeTerminalTab ? { ...t, history: [] } : t));
        return;
      }
    }

    // Update active tab history
    setTerminalTabs(prev => prev.map(tab => {
      if (tab.id === activeTerminalTab) {
        return {
          ...tab,
          history: [...tab.history, { cmd, out: output }]
        };
      }
      return tab;
    }));
  };

  // Flag Validation Engine
  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || !selectedLab) return;

    const submitted = flagInput.trim();
    const matchedFlag = selectedLab.flags.find(f => f.flag === submitted);

    if (matchedFlag) {
      setFlagStatus({ success: true, message: `ACCESS GRANTED! Flag validated. Awarded +${matchedFlag.points} Points and +${selectedLab.xpReward} XP!` });
      
      // Update User Academy profile via Firestore
      try {
        const profileRef = doc(db, "academyProfiles", currentUser.id);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const prof = profileSnap.data();
          const nextCompletedCtf = prof.completedCtfIds || [];
          if (!nextCompletedCtf.includes(selectedLab.id)) {
            nextCompletedCtf.push(selectedLab.id);
            const nextXp = (prof.xp || 120) + selectedLab.xpReward;
            const nextLevel = Math.floor(nextXp / 300) + 1;
            
            await updateDoc(profileRef, {
              completedCtfIds: nextCompletedCtf,
              xp: nextXp,
              level: nextLevel
            });

            // Log Success Audit
            setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
              userId: currentUser.id,
              userEmail: currentUser.email,
              action: "Hands-on Lab Flag Captured",
              details: `Captured flag: "${submitted}" on Lab: "${selectedLab.title}". Awarded +${selectedLab.xpReward} XP.`,
              status: "Success",
              timestamp: new Date().toISOString()
            }).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Error updating user stats on flag capture:", err);
      }
    } else {
      setFlagStatus({ success: false, message: "INVALID FLAG STRUCTURE. Double check your syntax or seek AI Mentor assistance." });
      
      // Log Failure Audit
      setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "Lab Flag Attempt Failed",
        details: `Incorrect flag validation attempt submitted on Lab: "${selectedLab.title}"`,
        status: "Failure",
        timestamp: new Date().toISOString()
      }).catch(console.error);
    }
  };

  // AI Assistant Chat trigger using the exist Server API
  const handleAISend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading || !selectedLab) return;

    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);

    try {
      const activeHist = terminalTabs.find(t => t.id === activeTerminalTab)?.history || [];
      const cmdSummary = activeHist.map(h => `Command: ${h.cmd} -> Output: ${h.out.substring(0, 100)}`).join("\n");

      // Invoke server.ts route `/api/academy/ai-mentor`
      const res = await fetch("/api/academy/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          messages: [
            ...aiMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
            { role: "user", content: userMsg }
          ],
          lessonContext: {
            isHandsOnLab: true,
            labTitle: selectedLab.title,
            labDescription: selectedLab.description,
            objectives: selectedLab.objectives,
            hints: selectedLab.hints,
            commandsAudited: cmdSummary
          }
        })
      });

      if (!res.ok) throw new Error("Failed connecting to range AI network.");
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err) {
      console.error("AI Lab assistant connection failure:", err);
      setAiMessages(prev => [...prev, { role: "assistant", content: "⚠️ [AI-GATEWAY CONNECTION ERROR] Secure mesh network offline. Review active lab console command trails." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Instructor Custom Lab creation persistence
  const handleCreateCustomLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabForm.title || !newLabForm.description) return;

    const nextId = `lab-custom-${Math.random().toString(36).substr(2, 9)}`;
    const freshLab: Lab = {
      id: nextId,
      title: newLabForm.title,
      category: newLabForm.category || "General",
      description: newLabForm.description,
      difficulty: newLabForm.difficulty || "Medium",
      estimatedTime: newLabForm.estimatedTime || "30 mins",
      xpReward: Number(newLabForm.xpReward) || 200,
      coinsReward: Number(newLabForm.coinsReward) || 100,
      requiredSkills: newLabForm.requiredSkills || ["Cyber Security Basics"],
      learningOutcomes: newLabForm.learningOutcomes || ["Audit core environments"],
      overview: newLabForm.overview || newLabForm.description,
      objectives: newLabForm.objectives || ["Execute analysis", "Exfiltrate flag"],
      hints: newLabForm.hints || ["Audit local folders"],
      walkthrough: newLabForm.walkthrough || "Examine local files to locate credentials.",
      files: [{ name: "incident_audit.log", size: "4 KB", type: "Log File", downloadUrl: "#" }],
      flags: newLabForm.flags || [{ flag: "CF{custom_flag_code_12}", points: 100, description: "Extract the security token" }],
      terminalPrompt: newLabForm.terminalPrompt || "operator@range:~$",
      commands: {
        "help": { output: "Custom lab catalog loaded. List folders to explore." },
        "ls": { output: "incident_audit.log" },
        "cat incident_audit.log": { output: `[INCIDENT RECON REPORT]\nFlag captured successfully: ${newLabForm.flags?.[0]?.flag || "CF{custom_flag_code_12}"}` }
      }
    };

    try {
      await setDoc(doc(db, "virtualLabs", nextId), freshLab);
      setLabs(prev => [...prev, freshLab]);
      
      // Reset form
      setNewLabForm({
        title: "",
        category: "Linux",
        description: "",
        difficulty: "Medium",
        estimatedTime: "30 mins",
        xpReward: 200,
        coinsReward: 100,
        overview: "",
        requiredSkills: [],
        learningOutcomes: [],
        objectives: [],
        hints: [],
        walkthrough: "",
        flags: [{ flag: "", points: 100, description: "Extract the root flag code" }],
        terminalPrompt: "operator@secops:~$",
        commands: { "help": { output: "Custom lab environment system initialized." } }
      });
      
      setActiveTab("dashboard");

      // Audit Log Custom Lab Created
      await setDoc(doc(db, "auditLogs", `log-${Math.random().toString(36).substr(2, 9)}`), {
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "Custom Lab Provisioned",
        details: `Instructor published a new hands-on cyber range lab scenario: "${freshLab.title}"`,
        status: "Success",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error creating custom lab scenario:", err);
    }
  };

  // Add Comment on Discussions
  const handleAddComment = (labId: string) => {
    if (!newComment.trim()) return;
    const comment = {
      user: currentUser.fullName,
      text: newComment.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    setDiscussions(prev => ({
      ...prev,
      [labId]: [...(prev[labId] || []), comment]
    }));
    setNewComment("");
  };

  // Render Virtual Labs bento layout and dynamic sessions
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lab.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || lab.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "All" || lab.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="space-y-6" id="academy-labs-control">
      
      {/* HUD Header */}
      <div className={`p-6 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative ${
        theme === "dark" 
          ? "bg-slate-900/60 border-slate-850 text-white" 
          : "bg-white border-slate-200/80 shadow-sm text-slate-900"
      }`}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
          <TerminalIcon className="h-64 w-64 text-blue-500" />
        </div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Cyber Range Active
            </span>
            {selectedLab && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                Active Session
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Virtual Labs & Hands-on Sandbox</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Execute safe threat hunting operations, audit insecure server wrappers, trace live network protocols, and build your corporate compliance defense profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/10"
                : theme === "dark" ? "bg-slate-950/60 text-slate-400 border border-slate-850 hover:bg-slate-900" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Explore catalog
          </button>
          
          {selectedLab && (
            <button
              onClick={() => setActiveTab("active-lab")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "active-lab"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/10"
                  : "bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25"
              }`}
            >
              <Monitor className="h-3.5 w-3.5 animate-pulse" /> Active Workspace
            </button>
          )}

          <button
            onClick={() => setActiveTab("builder")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "builder"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/10"
                : theme === "dark" ? "bg-slate-950/60 text-slate-400 border border-slate-850 hover:bg-slate-900" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> Scenario Builder
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-slate-700 text-white shadow-md"
                : theme === "dark" ? "bg-slate-950/60 text-slate-400 border border-slate-850 hover:bg-slate-900" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Settings className="h-3.5 w-3.5" /> Hypervisor Admin
          </button>
        </div>
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Virtualization Loading Overlay */}
          <AnimatePresence>
            {isVMLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-slate-950/90 flex flex-col items-center justify-center p-6 backdrop-blur-md"
              >
                <div className="max-w-md w-full space-y-5 text-center">
                  <div className="relative inline-block">
                    <div className="h-16 w-16 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin" />
                    <TerminalIcon className="h-6 w-6 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white tracking-widest uppercase font-mono">
                      SEC_RANGE: INITIALIZING MICROVM
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Provisioning isolated firecracker node wrapper inside security sandboxes...
                    </p>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <motion.div 
                      className="bg-blue-500 h-full rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${vmProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    <span>Allocating RAM</span>
                    <span>Building audit logs</span>
                    <span>Done: {vmProgress}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Catalog Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hands-on labs (e.g. SQL, Hardening, Wireshark)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  theme === "dark" ? "bg-slate-900/60 text-white border-slate-850" : "bg-white text-slate-950 border-slate-200"
                }`}
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono uppercase shrink-0">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer ${
                  theme === "dark" ? "bg-slate-900/60 text-white border-slate-850" : "bg-white text-slate-950 border-slate-200"
                }`}
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
                <option value="Insane">Insane</option>
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono uppercase shrink-0">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer ${
                  theme === "dark" ? "bg-slate-900/60 text-white border-slate-850" : "bg-white text-slate-950 border-slate-200"
                }`}
              >
                <option value="All">All Tech Stack Categories</option>
                <option value="Linux">Linux Shell</option>
                <option value="Wireshark">Wireshark Analysis</option>
                <option value="SQL Injection">SQL Injection</option>
                <option value="Windows">Windows Active Directory</option>
                <option value="Docker">Docker Containers</option>
                <option value="SOC Analyst">SOC Incident Response</option>
              </select>
            </div>
          </div>

          {/* Labs Catalog Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.length > 0 ? (
              filteredLabs.map((lab) => {
                const isBookmarked = bookmarks.includes(lab.id);
                const isFavorited = favorites.includes(lab.id);
                const hasSession = selectedLab?.id === lab.id;

                return (
                  <div
                    key={lab.id}
                    className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:translate-y-[-2px] relative overflow-hidden ${
                      theme === "dark" 
                        ? "bg-slate-900/30 border-slate-900/80 hover:bg-slate-900/50 hover:border-slate-800" 
                        : "bg-white border-slate-200/60 hover:shadow-md hover:border-slate-300/40"
                    }`}
                    id={`lab-card-${lab.id}`}
                  >
                    <div className="space-y-3">
                      {/* Badge / Category and Meta Actions */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-black uppercase ${
                          lab.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                          lab.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                          lab.difficulty === "Hard" ? "bg-orange-500/10 text-orange-400 border border-orange-500/25" :
                          "bg-red-500/10 text-red-400 border border-red-500/25"
                        }`}>
                          {lab.difficulty}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleBookmark(lab.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                            title="Bookmark Lab"
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-blue-500 text-blue-500" : ""}`} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(lab.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                            title="Favorite Lab"
                          >
                            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold hover:text-blue-500 transition-colors line-clamp-1">{lab.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wide block uppercase font-bold">{lab.category} CATEGORY</span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-3">
                        {lab.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-slate-200/10">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{lab.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">+{lab.coinsReward} Coins</span>
                          <span className="text-blue-400 font-bold">+{lab.xpReward} XP</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {hasSession ? (
                          <button
                            onClick={() => setActiveTab("active-lab")}
                            className="flex-1 text-center py-2 rounded-xl text-xs font-extrabold bg-purple-600 text-white shadow-md hover:bg-purple-700 transition cursor-pointer"
                          >
                            Continue Work
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLaunchLab(lab)}
                            className={`flex-1 text-center py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              theme === "dark" 
                                ? "bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white"
                                : "bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            <Play className="h-3 w-3 fill-current" /> Launch Sandbox
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-slate-200/10 rounded-2xl space-y-2">
                <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400">No Target Scenarios Found</h4>
                <p className="text-[11px] max-w-sm mx-auto">
                  Adjust your search inputs, difficulty sliders, or category dropdowns to reveal available virtual microVM labs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ACTIVE LAB WORKSPACE --- */}
      {activeTab === "active-lab" && selectedLab && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="virtual-lab-workspace">
          
          {/* Lab Meta Controls HUD */}
          <div className={`col-span-full p-4 border rounded-2xl flex flex-wrap items-center justify-between gap-4 ${
            theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <TerminalIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black tracking-tight">{selectedLab.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono block uppercase">TARGET NODE: {selectedLab.targetHost || "sandbox.local"}</span>
              </div>
            </div>

            {/* Session Management controls */}
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/10 font-mono text-xs">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className={secondsRemaining < 300 ? "text-red-500 animate-pulse font-bold" : "text-slate-300"}>
                  {sessionTimer}
                </span>
                <span className="text-[10px] text-slate-500">remaining</span>
              </div>

              <div className="flex items-center gap-1.5">
                {isVMRunning ? (
                  <button
                    onClick={handlePauseLab}
                    className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Pause Sandbox Timer"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleResumeLab}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition cursor-pointer"
                    title="Resume Sandbox Session"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                )}

                <button
                  onClick={handleResetLab}
                  className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 transition cursor-pointer"
                  title="Re-Image Machine Wrapper"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <button
                  onClick={handleExtendTime}
                  className="px-3 py-1.5 rounded-xl bg-slate-500/15 text-slate-300 border border-slate-200/10 hover:bg-slate-500/25 text-xs font-bold transition cursor-pointer"
                  title="Request 15 Minute Extension"
                >
                  +15 Mins
                </button>

                <button
                  onClick={handleTerminateLab}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition cursor-pointer"
                  title="Shutdown and Terminate VM"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN: Objectives & Actions panel */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className={`border rounded-2xl flex-1 flex flex-col ${
              theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              {/* Inner Tab selections */}
              <div className="flex border-b border-slate-200/10 overflow-x-auto text-[11px] font-mono font-bold uppercase tracking-wider">
                {[
                  { id: "overview", label: "Overview", icon: <BookOpen className="h-3.5 w-3.5" /> },
                  { id: "validation", label: "Flags", icon: <Trophy className="h-3.5 w-3.5" /> },
                  { id: "files", label: "Files", icon: <FileDown className="h-3.5 w-3.5" /> },
                  { id: "ai-helper", label: "Mentor AI", icon: <Sparkles className="h-3.5 w-3.5" /> },
                  { id: "notes", label: "Notes", icon: <Code className="h-3.5 w-3.5" /> },
                  { id: "discussion", label: "Forum", icon: <MessageSquare className="h-3.5 w-3.5" /> }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveLabInnerTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition cursor-pointer ${
                      activeLabInnerTab === t.id
                        ? "border-blue-500 text-blue-400 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500/20"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Inner Tab contents */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[580px] text-left">
                
                {/* 1. Overview */}
                {activeLabInnerTab === "overview" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-200 border-b border-slate-200/10 pb-1.5">Lab Overview & Description</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{selectedLab.overview}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-200 border-b border-slate-200/10 pb-1.5">Operational Objectives</h4>
                      <ul className="space-y-2.5 text-xs text-slate-400">
                        {selectedLab.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="h-5 w-5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-black text-slate-200 border-b border-slate-200/10 pb-1.5">Study Hints</h4>
                      <div className="space-y-2">
                        {selectedLab.hints.map((hint, i) => (
                          <div key={i} className="p-3 rounded-xl border border-dashed border-slate-200/10 bg-slate-950/40 text-xs text-slate-400 leading-relaxed">
                            <span className="font-bold text-yellow-500 font-mono block mb-1">HINT #{i+1}</span>
                            {hint}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Flag Validation */}
                {activeLabInnerTab === "validation" && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-200">Capture Flag Gateway</h4>
                      <p className="text-[11px] text-slate-500">
                        Once you locate the secret system security hash, submit it below inside the standard flag formatting structure.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {selectedLab.flags.map((flg, idx) => (
                        <div key={idx} className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/30 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold font-mono">
                            <span className="text-slate-300">Flag Objective #{idx+1}</span>
                            <span className="text-emerald-400 font-extrabold">+{flg.points} pts</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{flg.description}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleFlagSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Submit Verification Key</label>
                        <input
                          type="text"
                          required
                          value={flagInput}
                          onChange={(e) => setFlagInput(e.target.value)}
                          placeholder="CF{your_hex_flag_key}"
                          className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-wider ${
                            theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
                      >
                        Submit Target Key
                      </button>
                    </form>

                    {flagStatus && (
                      <div className={`p-4 border rounded-xl flex items-start gap-3 text-xs leading-relaxed ${
                        flagStatus.success 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}>
                        {flagStatus.success ? <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />}
                        <div>
                          <span className="font-extrabold block uppercase mb-0.5">{flagStatus.success ? "Validation Succeeded" : "Integrity Failure"}</span>
                          {flagStatus.message}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Downloads & Files */}
                {activeLabInnerTab === "files" && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-200">Downloadable Incident Files</h4>
                      <p className="text-[11px] text-slate-500">
                        Download raw assets (including packet traces, operating system logs, or source code directories) to parse with external tools.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {selectedLab.files.map((file, i) => (
                        <div key={i} className="border border-slate-200/10 rounded-xl p-4 bg-slate-950/20 flex items-center justify-between gap-4">
                          <div className="text-left space-y-1">
                            <span className="text-xs font-bold text-slate-300 block line-clamp-1">{file.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
                              <span>{file.type}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                            </div>
                          </div>

                          <a
                            href={file.downloadUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Simulation Download Dispatched: Starting secure transfer of file '${file.name}' (${file.size}).`);
                            }}
                            className="p-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-250/5 text-slate-300 cursor-pointer transition-all"
                            title="Download Asset"
                          >
                            <FileDown className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. AI Helper */}
                {activeLabInnerTab === "ai-helper" && (
                  <div className="flex flex-col h-[400px] justify-between">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {aiMessages.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed text-left ${
                          msg.role === "assistant" 
                            ? "bg-purple-900/10 border-purple-900/20 text-purple-200" 
                            : "bg-slate-950/60 border-slate-900 text-slate-300"
                        }`}>
                          <div className={`p-1 rounded-md shrink-0 border ${
                            msg.role === "assistant" ? "bg-purple-950/40 border-purple-800 text-purple-400" : "bg-blue-950/40 border-blue-900 text-blue-400"
                          }`}>
                            {msg.role === "assistant" ? <Sparkles className="h-3 w-3" /> : <TerminalIcon className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <span className="font-mono text-[10px] text-slate-500 block uppercase font-black">{msg.role === "assistant" ? "AI Mentor" : "Operator"}</span>
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex items-center gap-1.5 p-3 rounded-xl border border-dashed border-purple-500/20 bg-purple-950/5 text-xs text-purple-400 font-mono">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing AI range guidance vectors...
                        </div>
                      )}
                      <div ref={aiChatEndRef} />
                    </div>

                    <form onSubmit={handleAISend} className="flex gap-2 border-t border-slate-200/10 pt-3 mt-3">
                      <input
                        type="text"
                        required
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask for exploit strategy hints (e.g. SUID find parameters)..."
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                          theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* 5. Notes */}
                {activeLabInnerTab === "notes" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-200">Session Personal Notes</h4>
                      <p className="text-[11px] text-slate-500">
                        Write down payloads, credentials, and observation paths. Stored locally to your user profile.
                      </p>
                    </div>

                    <textarea
                      value={labNotes[selectedLab.id] || ""}
                      onChange={(e) => setLabNotes(prev => ({ ...prev, [selectedLab.id]: e.target.value }))}
                      placeholder="Input security notes (e.g. admin credentials, extracted server outputs)..."
                      className={`w-full h-[280px] p-4 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono leading-relaxed ${
                        theme === "dark" ? "bg-slate-950 text-slate-300 border-slate-850" : "bg-slate-50 text-slate-850 border-slate-200"
                      }`}
                    />
                  </div>
                )}

                {/* 6. Forum Discussion */}
                {activeLabInnerTab === "discussion" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-200">Community Discussion</h4>
                      <p className="text-[11px] text-slate-500">
                        Read peer hints and secure coding conversations from developers worldwide.
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      {(discussions[selectedLab.id] || []).map((cmt, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200/10 bg-slate-950/20 text-xs text-slate-300 text-left space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <span className="font-bold">{cmt.user}</span>
                            <span>{cmt.date}</span>
                          </div>
                          <p className="leading-relaxed text-slate-400">{cmt.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your input..."
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                          theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                        }`}
                      />
                      <button
                        onClick={() => handleAddComment(selectedLab.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Browser Terminal Console */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-950 flex flex-col flex-1 min-h-[500px]">
              
              {/* Terminal Tab bar */}
              <div className="flex items-center justify-between border-b border-slate-900 px-4 bg-slate-900/40">
                <div className="flex items-center overflow-x-auto">
                  {terminalTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTerminalTab(tab.id)}
                      className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        activeTerminalTab === tab.id
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <TerminalIcon className="h-3.5 w-3.5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newId = `terminal-${terminalTabs.length + 1}`;
                      setTerminalTabs(prev => [...prev, { id: newId, name: `Auxiliary Shell ${terminalTabs.length + 1}`, history: [] }]);
                      setActiveTerminalTab(newId);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    title="Add Terminal Shell"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isVMRunning ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                    {isVMRunning ? "Container: Connected" : "Container: Paused"}
                  </span>
                </div>
              </div>

              {/* Terminal Prompt outputs */}
              <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] leading-relaxed text-left text-slate-300 space-y-3 h-[380px] scrollbar-thin">
                {terminalTabs.find(t => t.id === activeTerminalTab)?.history.map((hist, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>{selectedLab.terminalPrompt || "operator@secops-sandbox:~$"}</span>
                      <span className="text-white font-bold">{hist.cmd}</span>
                    </div>
                    <pre className="whitespace-pre-wrap bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 text-slate-300 font-mono">
                      {hist.out}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Terminal command input form */}
              <form onSubmit={handleTerminalSubmit} className="flex border-t border-slate-900 p-3 bg-slate-900/20">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] px-2">
                  <span>{selectedLab.terminalPrompt || "operator@secops-sandbox:~$"}</span>
                </div>
                <input
                  type="text"
                  disabled={!isVMRunning}
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  placeholder={isVMRunning ? "Input console command (e.g. ls, help, whoami)..." : "Launch or Resume Sandbox to input terminal commands"}
                  className="flex-1 bg-transparent text-white font-mono text-[11px] focus:outline-none placeholder-slate-600 tracking-wide"
                />
              </form>
            </div>
            
            {/* Visual Ubuntu Remote Desktop Preview Panel */}
            <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/30 flex flex-col p-4 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-blue-400" />
                  <h4 className="text-xs font-black tracking-tight text-white font-mono">REMOTE WINDOWS/LINUX GRAPHICS CANVAS (RDP)</h4>
                </div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">Resolution: 1280x720</span>
              </div>

              <div className="aspect-video bg-slate-950 rounded-xl relative border border-slate-900 flex items-center justify-center overflow-hidden">
                {/* Simulated desktop UI graphics */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 flex flex-col justify-between p-4">
                  
                  {/* Top bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-white">Ubuntu Desktop Core</span>
                    <span>16:55 UTC</span>
                  </div>

                  {/* Desktop Icons */}
                  <div className="flex flex-col gap-5 text-center text-white w-20">
                    <div className="space-y-1 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all flex flex-col items-center">
                      <TerminalIcon className="h-6 w-6 text-emerald-400" />
                      <span className="text-[9px] font-mono leading-none">Console</span>
                    </div>

                    <div className="space-y-1 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all flex flex-col items-center">
                      <Database className="h-6 w-6 text-blue-400" />
                      <span className="text-[9px] font-mono leading-none">File Manager</span>
                    </div>

                    <div className="space-y-1 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all flex flex-col items-center" onClick={() => alert("Simulation Browser Dispatched: Target host connection active.")}>
                      <Monitor className="h-6 w-6 text-purple-400" />
                      <span className="text-[9px] font-mono leading-none">Firewall GUI</span>
                    </div>
                  </div>

                  {/* Desktop status overlay */}
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-center max-w-xs mx-auto text-xs space-y-1 backdrop-blur-md">
                    <span className="font-extrabold text-blue-400 block uppercase font-mono text-[10px]">NoVNC Tunnel Live</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Graphics connection synced successfully. Interactive clicks and visual file transfer routes enabled.
                    </p>
                  </div>

                  {/* Bottom Panel bar */}
                  <div className="bg-slate-900/60 h-8 rounded-lg flex items-center px-3 border border-white/5 justify-between">
                    <div className="h-4 w-4 bg-blue-500 rounded-sm" />
                    <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                      <span>RDP Stream OK</span>
                      <span>Audio Off</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- INSTRUCTOR SCENARIO BUILDER --- */}
      {activeTab === "builder" && (
        <div className={`p-6 border rounded-2xl text-left space-y-6 ${
          theme === "dark" ? "bg-slate-900/40 border-slate-900 text-white" : "bg-white border-slate-200/80 text-slate-900"
        }`}>
          <div className="space-y-1 border-b border-slate-200/10 pb-4">
            <h3 className="text-sm font-black flex items-center gap-1.5">
              <UserCheck className="h-5 w-5 text-emerald-500" /> SecOps Scenario Lab Architect
            </h3>
            <p className="text-xs text-slate-500">
              Draft advanced sandbox penetration scenarios, bind interactive terminal operations, and generate custom target flags for team activities.
            </p>
          </div>

          <form onSubmit={handleCreateCustomLab} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Lab Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUID wrapper binary auditing"
                  value={newLabForm.title}
                  onChange={(e) => setNewLabForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                    theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Category Segment</label>
                <select
                  value={newLabForm.category}
                  onChange={(e) => setNewLabForm(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer ${
                    theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                  }`}
                >
                  <option value="Linux">Linux Shell Hardening</option>
                  <option value="Windows">Windows Systems</option>
                  <option value="Wireshark">Wireshark Packets</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="SOC Analyst">SOC Incident Response</option>
                  <option value="OSINT">OSINT Recon</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Description Summary</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize the hands-on lab vulnerability mechanics..."
                  value={newLabForm.description}
                  onChange={(e) => setNewLabForm(prev => ({ ...prev, description: e.target.value, overview: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                    theme === "dark" ? "bg-slate-950 text-slate-300 border-slate-850" : "bg-slate-50 text-slate-850 border-slate-200"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">XP Rewards</label>
                  <input
                    type="number"
                    value={newLabForm.xpReward}
                    onChange={(e) => setNewLabForm(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                      theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Coins Rewards</label>
                  <input
                    type="number"
                    value={newLabForm.coinsReward}
                    onChange={(e) => setNewLabForm(prev => ({ ...prev, coinsReward: Number(e.target.value) }))}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                      theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Vulnerability Verification Flag</label>
                <input
                  type="text"
                  required
                  placeholder="CF{your_custom_secret_flag_99}"
                  value={newLabForm.flags?.[0]?.flag}
                  onChange={(e) => {
                    const nextFlags = [...(newLabForm.flags || [])];
                    nextFlags[0] = { ...nextFlags[0], flag: e.target.value };
                    setNewLabForm(prev => ({ ...prev, flags: nextFlags }));
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono tracking-wider ${
                    theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Terminal Host Prompt</label>
                <input
                  type="text"
                  value={newLabForm.terminalPrompt}
                  onChange={(e) => setNewLabForm(prev => ({ ...prev, terminalPrompt: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono ${
                    theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-mono uppercase font-black tracking-wider block">Scenario Guidance Hint</label>
                <input
                  type="text"
                  placeholder="Draft system hint for operators..."
                  value={newLabForm.hints?.[0] || ""}
                  onChange={(e) => setNewLabForm(prev => ({ ...prev, hints: [e.target.value] }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${
                    theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-slate-50 text-slate-950 border-slate-200"
                  }`}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
                >
                  Publish Scenario into Catalog
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- ADMIN HYPERVISOR CONTROL TAB --- */}
      {activeTab === "admin" && (
        <div className={`p-6 border rounded-2xl text-left space-y-6 ${
          theme === "dark" ? "bg-slate-900/40 border-slate-900 text-white" : "bg-white border-slate-200/80 text-slate-900"
        }`}>
          <div className="space-y-1 border-b border-slate-200/10 pb-4">
            <h3 className="text-sm font-black flex items-center gap-1.5">
              <Settings className="h-5 w-5 text-blue-500" /> SecOps Hypervisor & Resource Supervisor
            </h3>
            <p className="text-xs text-slate-500">
              Monitor cloud sandboxes, inspect microVM metrics, allocate virtual networks, and inspect active container logs.
            </p>
          </div>

          {/* Active stats boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/20 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">CPU ALLOCATION</span>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span className="text-base font-extrabold font-mono text-white">{adminMetrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${adminMetrics.cpuUsage}%` }} />
              </div>
            </div>

            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/20 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">RAM PROVISIONED</span>
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-emerald-400" />
                <span className="text-base font-extrabold font-mono text-white">{adminMetrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${adminMetrics.memoryUsage}%` }} />
              </div>
            </div>

            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/20 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">ACTIVE MICROVMS</span>
              <div className="flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-purple-400" />
                <span className="text-base font-extrabold font-mono text-white">{adminMetrics.activeMicroVMs} Core VM</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/20 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">STORAGE OCCUPIED</span>
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-amber-400" />
                <span className="text-base font-extrabold font-mono text-white">{adminMetrics.storageAllocation} GB</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Active session trace list */}
            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/40 space-y-4">
              <span className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider block">ACTIVE RUNNING SESSIONS</span>
              
              <div className="space-y-2.5">
                {[
                  { user: "Sarah Pence", lab: "Linux Hardy SUID", time: "34m remaining", node: "VM-1244" },
                  { user: "Marcus Aurelius", lab: "Wireshark Analysis", time: "12m remaining", node: "VM-4993" },
                  { user: "Dave Grohl", lab: "SQL Injection union", time: "55m remaining", node: "VM-5012" }
                ].map((ss, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200/5 bg-slate-950/30 flex items-center justify-between text-xs font-mono">
                    <div className="text-left">
                      <span className="font-bold text-white block">{ss.user}</span>
                      <span className="text-[10px] text-slate-500">{ss.lab} • {ss.node}</span>
                    </div>

                    <span className="text-[10px] text-amber-400 font-bold">{ss.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Kernel trace Logs */}
            <div className="p-4 border border-slate-200/10 rounded-xl bg-slate-950/40 space-y-4">
              <span className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider block">HYPERVISOR CORE EVENTS</span>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1.5 h-[140px] overflow-y-auto">
                <p className="text-blue-400">[02.10.22] microVM Orchestrator thread pool initialized (4 workers)</p>
                <p className="text-emerald-400">[02.10.45] Container docker://ubuntu_prod_v1 spawned as session-id_12</p>
                <p className="text-slate-500">[02.11.02] VNC Tunnel connected on port :5901 from operator@host</p>
                <p className="text-amber-400">[02.11.23] Disk allocation warning: node VM-1244 peak disk writes</p>
                <p className="text-blue-400">[02.12.01] Dispatched heartbeats to Firecracker host hypervisor</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
