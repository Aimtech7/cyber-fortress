import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "cyber_db.json");

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Cyber Assistant will fall back to simulated responses.");
}

// Ensure database file exists
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: [
        {
          id: "usr-admin",
          email: "admin@cyberfortress.com",
          password: "Password123!",
          role: "Administrator",
          fullName: "Security Administrator",
          orgName: "Fortress Enterprise Ltd",
          createdAt: new Date().toISOString(),
        },
        {
          id: "usr-analyst",
          email: "analyst@cyberfortress.com",
          password: "Password123!",
          role: "Security Analyst",
          fullName: "Alex Rivera",
          orgName: "Fortress Enterprise Ltd",
          createdAt: new Date().toISOString(),
        }
      ],
      scans: [
        {
          id: "scn-001",
          target: "https://vulnerable-test-app.fortress.internal",
          type: "Website Security",
          status: "Completed",
          riskScore: 78,
          findingsCount: 5,
          findings: [
            {
              id: "fnd-1",
              title: "Missing Content-Security-Policy (CSP) Header",
              severity: "Medium",
              cve: "N/A",
              description: "The application does not set a Content-Security-Policy response header, which increases the susceptibility to Cross-Site Scripting (XSS) and clickjacking attacks.",
              remediation: "Configure the web server or application framework to send a robust Content-Security-Policy header, restricting allowed script sources, frames, and styles."
            },
            {
              id: "fnd-2",
              title: "Outdated OpenSSL Version (CVE-2023-3817)",
              severity: "High",
              cve: "CVE-2023-3817",
              description: "An issue was found in OpenSSL where DH_check() performs excessive checks on prime parameters, leading to a potential denial of service.",
              remediation: "Upgrade OpenSSL to version 3.0.10, 3.1.2 or higher."
            },
            {
              id: "fnd-3",
              title: "Insecure Transport Layer Configuration",
              severity: "High",
              cve: "N/A",
              description: "The server supports deprecated TLS v1.0 and TLS v1.1 protocols, which suffer from cryptographic weaknesses.",
              remediation: "Disable support for TLS v1.0 and TLS v1.1. Enforce TLS 1.2 and TLS 1.3 only with secure cipher suites."
            },
            {
              id: "fnd-4",
              title: "HTTP Strict-Transport-Security (HSTS) Not Enforced",
              severity: "Low",
              cve: "N/A",
              description: "The server does not transmit the Strict-Transport-Security header, leaving users vulnerable to SSL-stripping and man-in-the-middle attacks.",
              remediation: "Configure the web server to append the Strict-Transport-Security header with a sufficient max-age directive (e.g. max-age=63072000; includeSubDomains)."
            }
          ],
          scannedBy: "usr-admin",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ],
      passwordVault: [
        {
          id: "vlt-001",
          title: "Primary Production Database",
          username: "pg_admin_prod",
          password: "dK9$xLp2!vW8#qZ",
          url: "postgresql://db.fortress.internal:5432",
          notes: "Master DB password. Rotation due every 90 days.",
          strength: "Strong",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        }
      ],
      threatFeed: [
        {
          id: "tht-001",
          source: "Cyber Fortress Intelligence",
          indicator: "185.190.140.22",
          type: "Malicious IP / Active Botnet Host",
          severity: "Critical",
          description: "IP identified conducting active scanning and brute-force campaigns against SSH (port 22) and RDP (port 3389) across enterprise subnets.",
          timestamp: new Date().toISOString()
        },
        {
          id: "tht-002",
          source: "CISA US-CERT Bulletin",
          indicator: "CVE-2024-3094",
          type: "XZ Utils Backdoor Campaign",
          severity: "Critical",
          description: "Malicious backdoor discovered in upstream tarballs of xz tools, leading to unauthorized SSH server execution capability.",
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ],
      auditLogs: [
        {
          id: "log-001",
          userId: "usr-admin",
          userEmail: "admin@cyberfortress.com",
          action: "User Authentication",
          details: "Successful administrator login from host 10.14.0.51",
          status: "Success",
          timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

initDatabase();

// Load Database
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Database reading error, resetting...", err);
    initDatabase();
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  }
}

// Write Database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Database writing error", err);
  }
}

// Logger helper
function addAuditLog(userId: string, email: string, action: string, details: string, status: "Success" | "Failure" | "Warning") {
  const db = readDB();
  const newLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userEmail: email,
    action,
    details,
    status,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  // Cap at 200 logs
  if (db.auditLogs.length > 200) {
    db.auditLogs.pop();
  }
  writeDB(db);
}

// Express middlewares
app.use(express.json());

// --- API ROUTES ---

// Auth Register
app.post("/api/auth/register", (req, res) => {
  const { email, password, fullName, orgName, role } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const db = readDB();
  const exists = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const newUser = {
    id: `usr-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    password, // Store as clear text for our simple SaaS proof of state (SaaS sandbox environment)
    role: role || "Registered User",
    fullName,
    orgName: orgName || "Independent Professional",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  addAuditLog(newUser.id, newUser.email, "User Registration", `Created account with role: ${newUser.role}`, "Success");

  const { password: _, ...userNoPass } = newUser;
  res.status(201).json({ user: userNoPass, token: `mock-jwt-token-${newUser.id}` });
});

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    addAuditLog("anonymous", email, "User Login Failure", "Invalid password or email mismatch", "Failure");
    return res.status(401).json({ error: "Invalid credentials. Please verify email and password." });
  }

  addAuditLog(user.id, user.email, "User Login Success", `Authentication successful. Role: ${user.role}`, "Success");

  const { password: _, ...userNoPass } = user;
  res.json({ user: userNoPass, token: `mock-jwt-token-${user.id}` });
});

// Auth Forgot Password (Email Validation & Reset Sequence)
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Security email address is required." });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Record unauthorized or un-mapped access request in compliance ledger
    addAuditLog("anonymous", email, "Password Reset Failure", "Reset requested for unregistered security clearance email", "Failure");
    return res.status(404).json({ error: "This email address is not registered in the Cyber Fortress profile directory." });
  }

  // Create a secure cryptographic reset sequence representation
  const resetToken = `cf-reset-key-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
  
  // Log successful audit trail
  addAuditLog(user.id, user.email, "Password Reset Request", `Initiated cryptographic token recovery sequence. Token generated: ${resetToken}`, "Warning");

  res.json({
    message: "A password recovery signal has been emitted. In production, this transmits a secure transient link to the registered operator mail host.",
    resetToken,
    instructions: "To simulate verification, you can follow the secure sandbox link above to load your recovery state."
  });
});

// Audit Logs
app.get("/api/logs", (req, res) => {
  const db = readDB();
  res.json(db.auditLogs);
});

// Security Scans
app.get("/api/scans", (req, res) => {
  const db = readDB();
  res.json(db.scans);
});

// Perform Passive Security Scan
app.post("/api/scans/web", async (req, res) => {
  const { target, scanType, userId, userEmail } = req.body;

  if (!target) {
    return res.status(400).json({ error: "Scan target URL/Host is required." });
  }

  const cleanTarget = target.trim();
  
  // Create simulated vulnerability findings based on URL properties for realistic scan behavior
  const isHttps = cleanTarget.startsWith("https://");
  const isLocal = cleanTarget.includes("local") || cleanTarget.includes(".internal") || cleanTarget.includes("localhost") || cleanTarget.includes("127.0.0.1");

  const findings = [];
  let riskScore = 15; // default low base

  if (!isHttps) {
    riskScore += 25;
    findings.push({
      id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
      title: "Insecure Plaintext HTTP Protocol Enforced",
      severity: "High",
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
      severity: "Low",
      cve: "N/A",
      description: "The scanning targeted an internal host, potentially leaking private DNS names or intranet routing topologies.",
      remediation: "Limit exposure of internal hostnames in production certificates or HTTP redirect pathways."
    });
  }

  // Always add some realistic vulnerabilities for user's scan experience
  findings.push({
    id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
    title: "Missing X-Content-Type-Options Protection Header",
    severity: "Low",
    cve: "N/A",
    description: "The anti-sniffing HTTP response header X-Content-Type-Options is missing, allowing browsers to interpret files differently from their declared MIME types.",
    remediation: "Add the header: 'X-Content-Type-Options: nosniff' to all response payloads."
  });

  findings.push({
    id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
    title: "Potential CSRF Vulnerability on Action Endpoints",
    severity: "Medium",
    cve: "N/A",
    description: "No anti-CSRF cookies or request headers (e.g. SameSite configuration or anti-forgery tokens) were actively noticed on form action tags.",
    remediation: "Enforce SameSite=Lax or Strict cookie flag, and inject randomized cryptographic CSRF validation tokens."
  });

  // Random high/critical threat occasionally to make dashboard feel dynamic
  const randNum = Math.random();
  if (randNum > 0.5) {
    riskScore += 35;
    findings.push({
      id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
      title: "Log4j RCE Vulnerability (CVE-2021-44228)",
      severity: "Critical",
      cve: "CVE-2021-44228",
      description: "Apache Log4j2 JNDI features do not protect against attacker-controlled LDAP endpoints, allowing complete remote code execution (RCE).",
      remediation: "Update apache log4j dependency to version 2.17.1 or disable JNDI lookups."
    });
  } else {
    riskScore += 15;
    findings.push({
      id: `fnd-${Math.random().toString(36).substr(2, 5)}`,
      title: "CORS Wildcard Configuration Vulnerability",
      severity: "Medium",
      cve: "N/A",
      description: "Access-Control-Allow-Origin response headers are configured with wildcard '*' while allowing credentials, exposing resource endpoints to malicious origins.",
      remediation: "Specify authorized cross-origin endpoints instead of using broad wildcards."
    });
  }

  riskScore = Math.min(riskScore, 100);

  const newScan = {
    id: `scn-${Math.random().toString(36).substr(2, 9)}`,
    target: cleanTarget,
    type: scanType || "Website Security",
    status: "Completed",
    riskScore,
    findingsCount: findings.length,
    findings,
    scannedBy: userId || "anonymous",
    createdAt: new Date().toISOString()
  };

  const db = readDB();
  db.scans.unshift(newScan);
  writeDB(db);

  addAuditLog(userId || "anonymous", userEmail || "anonymous@cyberfortress.com", "Vulnerability Scan", `Completed ${newScan.type} scan on target ${cleanTarget}. Score: ${riskScore}`, "Warning");

  res.status(201).json(newScan);
});

// Password Vault
app.get("/api/vault", (req, res) => {
  const db = readDB();
  res.json(db.passwordVault);
});

app.post("/api/vault", (req, res) => {
  const { title, username, password, url, notes, strength } = req.body;
  if (!title || !username || !password) {
    return res.status(400).json({ error: "Title, Username and Password are required fields." });
  }

  const db = readDB();
  const newItem = {
    id: `vlt-${Math.random().toString(36).substr(2, 9)}`,
    title,
    username,
    password,
    url: url || "",
    notes: notes || "",
    strength: strength || "Medium",
    createdAt: new Date().toISOString()
  };

  db.passwordVault.unshift(newItem);
  writeDB(db);

  addAuditLog("SaaS-User", "user@cyberfortress.com", "Credential Added", `Stored credentials for ${title} under vault entry ${newItem.id}`, "Success");

  res.status(201).json(newItem);
});

app.delete("/api/vault/:id", (req, res) => {
  const db = readDB();
  const filtered = db.passwordVault.filter((item: any) => item.id !== req.params.id);
  db.passwordVault = filtered;
  writeDB(db);

  addAuditLog("SaaS-User", "user@cyberfortress.com", "Credential Deleted", `Removed vault entry ID: ${req.params.id}`, "Warning");
  res.json({ success: true });
});

// Threat Intelligence Feed
app.get("/api/threats", (req, res) => {
  const db = readDB();
  res.json(db.threatFeed);
});

app.post("/api/threats", (req, res) => {
  const { indicator, type, severity, description } = req.body;
  if (!indicator || !type) {
    return res.status(400).json({ error: "Threat Indicator and Type are required fields." });
  }

  const db = readDB();
  const newThreat = {
    id: `tht-${Math.random().toString(36).substr(2, 9)}`,
    source: "User Generated Intelligence",
    indicator,
    type,
    severity: severity || "Medium",
    description: description || "",
    timestamp: new Date().toISOString()
  };

  db.threatFeed.unshift(newThreat);
  writeDB(db);

  addAuditLog("SaaS-User", "user@cyberfortress.com", "Threat Intel Action", `Logged new threat indicator: ${indicator}`, "Warning");
  res.status(201).json(newThreat);
});

// AI Cybersecurity Assistant (SecOps Chat)
app.post("/api/ai/chat", async (req, res) => {
  const { messages, context } = req.body; // messages is an array of { role: 'user' | 'model', content: string }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const latestMessage = messages[messages.length - 1]?.content;
  if (!latestMessage) {
    return res.status(400).json({ error: "No message input detected." });
  }

  const systemPrompt = `You are Cyber Fortress AI, an elite, world-class SecOps cyber assistant integrated into the Cyber Fortress Cybersecurity platform. 
Your objective is to provide high-quality, professional, and precise analysis of cyber security matters, such as explaining CVE vulnerabilities, analyzing log entries for indicators of compromise (IOCs), providing hardening recommendations (e.g., Linux/IIS/Nginx configuration, active directory, firewalls), identifying malware traits, and drafting remediation suggestions.

Maintain a professional, supportive, and technical tone. Avoid generic fluff or overly simplified explanations unless asked. 
Whenever possible, provide secure bash, powershell, or config commands with explanation.
Always put security best-practices first. Do not explain how to hack or exploit targets maliciously, but focus heavily on defensive security engineering (Blue Teaming), secure code audits, and incident response.

Context of current environment or scanned target if available: ${JSON.stringify(context || {})}`;

  // If Gemini client is not configured, fall back to an elegant simulated response
  if (!ai) {
    console.log("No Gemini API key, utilizing high-quality simulated cybersecurity response");
    
    // Simulate smart cyber responses based on keywords
    let responseText = "Greetings. I am the Cyber Fortress SecOps assistant. ";
    const promptLower = latestMessage.toLowerCase();

    if (promptLower.includes("cve") || promptLower.includes("vulnerability") || promptLower.includes("openssl")) {
      responseText += `\n\n### Vulnerability & Patch Analysis

Vulnerabilities represent immediate vectors of exploitation. For critical CVEs, you should pursue the following patching strategy:
1. **Isolate Affected Systems**: Implement localized firewall zones or network-level VPC segmentation.
2. **Retrieve Official Advisory**: Access the official vendor or NIST NVD database advisory.
3. **Execute Upgrade**: Perform package-manager updates (e.g., \`yum update openssl\` or \`apt-get install --only-upgrade openssl\`).
4. **Post-Upgrade verification**: Run \`openssl version\` and trigger an automated Cyber Fortress scan to verify patch application.`;
    } else if (promptLower.includes("log") || promptLower.includes("apache") || promptLower.includes("nginx")) {
      responseText += `\n\n### Log Snippet Analysis & Security Assessment

Logs are critical for threat hunting. When assessing security logs:
- **Inspect Status Codes**: Look for repeated \`401 Unauthorized\` or \`403 Forbidden\` status lines suggesting active brute-force or crawling campaigns.
- **Analyze Query Strings**: Scan for directories containing trailing markers like \`../\`, \`/etc/passwd\`, or \`union select\`, indicative of path traversal and SQL injection attempts.
- **Remediation**: Establish strict rate-limiting policies at the load-balancer or web application firewall (WAF) layer, and implement parameterized backend parsing.`;
    } else {
      responseText += `\n\nI have reviewed your query regarding your Security Posture. To defend against advanced threats, enforce:
- Multi-Factor Authentication (MFA) across all identity providers.
- Absolute isolation of administrative and API-key endpoints.
- Weekly automated vulnerability scans and immediate secure config audits of your primary containers.

Please specify any logs, CVEs, or configurations you would like me to audit or write defensive configurations for!`;
    }

    return res.json({ text: responseText });
  }

  try {
    // Construct contents array for @google/genai format
    // Map roles: 'user' to 'user' and 'assistant'/'model' to 'model'
    const contents = messages.map((m: any) => {
      const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
      return {
        role,
        parts: [{ text: m.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Keep responses focused, analytical, and highly technical
      }
    });

    const responseText = response.text || "No response text generated by AI assistant.";
    res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: `Gemini API communication failure: ${error.message}` });
  }
});

// ==========================================
// --- CYBER FORTRESS ACADEMY LMS ROUTES ---
// ==========================================

// Helper to get or create profile
function getOrCreateAcademyProfile(db: any, userId: string) {
  if (!db.academyProfiles) {
    db.academyProfiles = {};
  }
  if (!db.academyProfiles[userId]) {
    db.academyProfiles[userId] = {
      xp: 120,
      level: 1,
      streak: 3,
      rank: "Clearance Cadet",
      completedLessonIds: ["l1_1"], // starting pre-complete for state showcase
      completedCourseIds: [],
      completedCtfIds: [],
      unlockedBadges: ["badge-novice"],
      earnedCertificates: [],
      weeklyStudyMinutes: 45,
      dailyGoalMinutes: 15
    };
    writeDB(db);
  }
  return db.academyProfiles[userId];
}

// 1. Fetch Academy Profile
app.get("/api/academy/profile", (req, res) => {
  const userId = (req.query.userId as string) || "usr-analyst";
  const db = readDB();
  const profile = getOrCreateAcademyProfile(db, userId);
  res.json(profile);
});

// 2. Complete Lesson / Quiz
app.post("/api/academy/lesson/complete", (req, res) => {
  const { userId, courseId, lessonId, xpReward } = req.body;
  if (!userId || !lessonId) {
    return res.status(400).json({ error: "Missing required profile context." });
  }

  const db = readDB();
  const profile = getOrCreateAcademyProfile(db, userId);

  // Avoid duplicate completion XP but register if first time
  if (!profile.completedLessonIds.includes(lessonId)) {
    profile.completedLessonIds.push(lessonId);
    
    // Increment XP
    const earnedXp = xpReward || 50;
    profile.xp += earnedXp;
    
    // Add study time
    profile.weeklyStudyMinutes += Math.floor(Math.random() * 10) + 10;

    // Recalculate level & rank
    const newLevel = Math.floor(profile.xp / 300) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
    }

    // Determine security ranks based on levels
    if (profile.level >= 10) {
      profile.rank = "Sovereign Threat Hunter";
    } else if (profile.level >= 5) {
      profile.rank = "SecOps Senior Responder";
    } else if (profile.level >= 3) {
      profile.rank = "Junior Cyber Defender";
    } else {
      profile.rank = "Clearance Cadet";
    }

    // Check if Course is complete
    const courseRequirements: { [key: string]: string[] } = {
      "course-1": ["l1_1", "l1_2", "l2_1"],
      "course-2": ["l2_1_1", "l2_1_2"]
    };

    if (courseId && courseRequirements[courseId]) {
      const reqs = courseRequirements[courseId];
      const completedAll = reqs.every(id => profile.completedLessonIds.includes(id));
      if (completedAll && !profile.completedCourseIds.includes(courseId)) {
        profile.completedCourseIds.push(courseId);
        
        // Award Course Completion XP
        profile.xp += 150;
        
        // Generate Certificate
        const user = db.users.find((u: any) => u.id === userId) || { fullName: "Alex Rivera", email: "analyst@cyberfortress.com" };
        const certId = `CERT-CF-${Math.floor(Math.random() * 900000 + 100000)}`;
        const courseTitles: { [key: string]: string } = {
          "course-1": "OWASP Top 10 & Web Security Vulnerabilities",
          "course-2": "Linux Operating System Hardening"
        };
        const courseInstructors: { [key: string]: string } = {
          "course-1": "Sarah Vance, Principal Security Architect",
          "course-2": "Marcus Aurelius, Blue Team Lead"
        };

        const newCertificate = {
          id: `cert-${Math.random().toString(36).substr(2, 9)}`,
          courseId,
          courseName: courseTitles[courseId] || "Advanced Systems Security",
          studentName: user.fullName,
          completedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          verificationId: certId,
          instructor: courseInstructors[courseId] || "Cyber Fortress Academy Board"
        };

        profile.earnedCertificates.push(newCertificate);

        addAuditLog(userId, user.email || "user@cyberfortress.com", "Certificate Earned", `Successfully completed course ${newCertificate.courseName}. Certificate ${certId} issued.`, "Success");
      }
    }

    // Check if Lab completions qualify for Badge "Terminal Sandbox Wizard"
    const labLessonIds = ["l1_2", "l2_1_2"];
    const completedLabsCount = labLessonIds.filter(id => profile.completedLessonIds.includes(id)).length;
    if (completedLabsCount >= 2 && !profile.unlockedBadges.includes("badge-lab-slayer")) {
      profile.unlockedBadges.push("badge-lab-slayer");
      addAuditLog(userId, "user@cyberfortress.com", "Badge Unlocked", "Earned badge: Terminal Sandbox Wizard for resolving multiple laboratory challenges", "Success");
    }

    db.academyProfiles[userId] = profile;
    writeDB(db);

    addAuditLog(userId, "user@cyberfortress.com", "Academy Lesson Complete", `Logged course module progress. Awarded +${earnedXp} XP.`, "Success");
  }

  res.json(profile);
});

// 3. Submit Capture the Flag Flag
app.post("/api/academy/ctf/submit", (req, res) => {
  const { userId, challengeId, flag } = req.body;
  if (!userId || !challengeId || !flag) {
    return res.status(400).json({ error: "Required submit parameters are missing." });
  }

  const db = readDB();
  const profile = getOrCreateAcademyProfile(db, userId);

  // Find challenge
  const challengeFlags: { [key: string]: { flag: string, points: number, xp: number, title: string } } = {
    "ctf-1": { flag: "CF{vault_gate_bypassed_99}", points: 100, xp: 200, title: "The Broken Vault Gate" },
    "ctf-2": { flag: "CF{crypto_scheme_decrypted_44}", points: 250, xp: 350, title: "Cipher Cipher Everywhere" },
    "ctf-3": { flag: "CF{forensics_ip_sweep_hunted_12}", points: 400, xp: 500, title: "Ghost in the Shell Logs" }
  };

  const chall = challengeFlags[challengeId];
  if (!chall) {
    return res.status(404).json({ error: "Security challenge record not found." });
  }

  const cleanFlag = flag.trim();
  if (cleanFlag !== chall.flag) {
    addAuditLog(userId, "user@cyberfortress.com", "CTF Submission Failure", `Incorrect flag submission for ${chall.title}. Attempt: ${cleanFlag}`, "Failure");
    return res.status(400).json({ success: false, error: "Incorrect flag payload structure. Audit trail logged." });
  }

  // Success
  let newlyUnlockedBadge = null;
  if (!profile.completedCtfIds.includes(challengeId)) {
    profile.completedCtfIds.push(challengeId);
    profile.xp += chall.xp;
    
    // Trigger "Flag Capturer" badge if first CTF completed
    if (!profile.unlockedBadges.includes("badge-ctf-hunter")) {
      profile.unlockedBadges.push("badge-ctf-hunter");
      newlyUnlockedBadge = "badge-ctf-hunter";
      addAuditLog(userId, "user@cyberfortress.com", "Badge Unlocked", "Earned badge: Flag Capturer for solving a CTF security challenge", "Success");
    }

    // Level up calculation
    const newLevel = Math.floor(profile.xp / 300) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
    }

    db.academyProfiles[userId] = profile;
    writeDB(db);

    addAuditLog(userId, "user@cyberfortress.com", "CTF Flag Solved", `Correct flag verified for ${chall.title}. Awarded +${chall.xp} XP.`, "Success");
  }

  res.json({
    success: true,
    profile,
    badgeUnlocked: newlyUnlockedBadge,
    message: `Flag confirmed! Awarded +${chall.points} Points and +${chall.xp} XP.`
  });
});

// 4. AI Mentor Chat (Gemini or local simulation fallback)
app.post("/api/academy/ai-mentor", async (req, res) => {
  const { messages, lessonContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const systemPrompt = `You are the Cyber Fortress Academy AI Mentor, a premium, world-class cybersecurity tutor, elite penetration tester, and SecOps mentor.
Your role is to teach, guide, and challenge cybersecurity students.
1. Explain cybersecurity topics in clear, engaging, and structured Markdown formatting.
2. Provide code blocks with syntax highlighting and bash commands where helpful.
3. NEVER immediately reveal challenge flags, answers, or direct solutions for labs/quizzes. Instead, provide hints, explain the vulnerability mechanics, suggest diagnostic commands to run, and coach the student to find the answer.
4. Keep the tone inspiring, technical, secure, and encouraging.

Context of current lesson if applicable: ${JSON.stringify(lessonContext || {})}`;

  if (!ai) {
    const latestMsg = messages[messages.length - 1]?.content || "";
    let reply = "Greetings, cybersecurity cadet! I am your Cyber Academy AI Mentor. ";
    
    if (latestMsg.toLowerCase().includes("flag") || latestMsg.toLowerCase().includes("solution") || latestMsg.toLowerCase().includes("how do i solve")) {
      reply += "\n\nI cannot directly leak flags or solutions! That would violate cybersecurity operational protocols. However, here is a guiding hint:\n- Re-examine the active services in the lab.\n- Execute SUID binary audit commands or payload test utilities in your browser terminal sandbox (try 'find-suid' or 'run-audit').\n- Think about how the parameter concatenation is executed under SQL query formats.";
    } else if (latestMsg.toLowerCase().includes("sqli") || latestMsg.toLowerCase().includes("sql injection")) {
      reply += "\n\nSQL Injection is highly critical. Remember: a database engine executes code segments based on parameter boundary escapes. By injecting `' OR '1'='1`, you force the boolean query condition to evaluate to true. In your secure coding, always utilize **Prepared Statements** to make variables secure string literals.";
    } else if (latestMsg.toLowerCase().includes("suid") || latestMsg.toLowerCase().includes("privilege")) {
      reply += "\n\nSUID (Set owner User ID) is a file permission flag in Linux that allows unprivileged users to execute a binary with the permissions of the file owner (usually root). If a binary has an active SUID flag and allows running arbitrary helper scripts or custom lookups, an operator can escape and run commands as root!";
    } else {
      reply += "\n\nCyber security is about defense in depth. Continue practicing in the laboratories, submit flags in the Capture The Flag sandbox, and let me know which concept (OWASP Top 10, Linux Hardening, Network Analysis) you would like to explore next!";
    }

    return res.json({ text: reply });
  }

  try {
    const contents = messages.map((m: any) => {
      const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
      return {
        role,
        parts: [{ text: m.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3
      }
    });

    res.json({ text: response.text || "No response generated by AI Mentor." });
  } catch (err: any) {
    console.error("Gemini AI Mentor Error:", err);
    res.status(500).json({ error: `AI Mentor communication failure: ${err.message}` });
  }
});

// 5. Leaderboard API
app.get("/api/academy/leaderboard", (req, res) => {
  const db = readDB();
  const profiles = db.academyProfiles || {};
  
  const leaderboard = db.users.map((u: any) => {
    const prof = profiles[u.id] || {
      xp: 120,
      level: 1,
      rank: "Clearance Cadet",
      streak: 3
    };
    return {
      userId: u.id,
      fullName: u.fullName,
      email: u.email,
      xp: prof.xp,
      level: prof.level,
      rank: prof.rank,
      streak: prof.streak
    };
  });

  leaderboard.sort((a: any, b: any) => b.xp - a.xp);
  res.json(leaderboard);
});


// Start Dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware Mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Static Asset Middleware Loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`🛡️  CYBER FORTRESS SECURE SERVER BOOTED  🛡️`);
    console.log(`Port: ${PORT}`);
    console.log(`Host: 0.0.0.0`);
    console.log(`Database state initialized at ${DB_FILE}`);
    console.log(`====================================================`);
  });
}

startServer();
