import { SkillTreeNode, CareerPathway, ShopItem, QuizQuestionExtended } from "../types/learningEngine";

export const SECURITY_DOMAINS = [
  { id: "web_sec", name: "Web Application Security", description: "Vulnerability analysis, OWASP exploits, and web code hardening." },
  { id: "linux_hard", name: "Linux Hardening", description: "Server administration, SUID audits, privilege limits, and shell security." },
  { id: "crypto", name: "Cryptology & Hashing", description: "Symmetric systems, asymmetric key rings, hashing algorithms, and ciphers." },
  { id: "net_sec", name: "Network Auditing", description: "Packet inspections, protocol handshakes, firewall configurations, and traffic analysis." },
  { id: "forensics", name: "Incident Response", description: "Log parsing, finding indicators of compromise (IoC), and tracking hacker signatures." }
];

export const SKILL_TREE_NODES: SkillTreeNode[] = [
  {
    id: "node-http",
    title: "HTTP Protocol Basics",
    description: "Understand requests, responses, headers, cookies, and HTTP methods.",
    domainId: "web_sec",
    dependencies: [],
    lessonIds: ["l1_1"],
    xpRequired: 0
  },
  {
    id: "node-sqli",
    title: "SQL Injection Mechanics",
    description: "Audit concatenation flaws, bypass login filters, and execute union queries.",
    domainId: "web_sec",
    dependencies: ["node-http"],
    lessonIds: ["l1_1", "l1_2"],
    xpRequired: 50
  },
  {
    id: "node-xss",
    title: "Cross-Site Scripting (XSS)",
    description: "Analyze Stored, Reflected, and DOM injection vectors.",
    domainId: "web_sec",
    dependencies: ["node-http"],
    lessonIds: ["l2_1"],
    xpRequired: 100
  },
  {
    id: "node-linux-intro",
    title: "Linux Shell Fundamentals",
    description: "Master bash commands, piping, file system permission filters, and user rights.",
    domainId: "linux_hard",
    dependencies: [],
    lessonIds: [],
    xpRequired: 0
  },
  {
    id: "node-suid",
    title: "SUID Privilege Escalation",
    description: "Audit setuid permissions, examine GTFOBins, and secure system shells.",
    domainId: "linux_hard",
    dependencies: ["node-linux-intro"],
    lessonIds: ["l1_2"],
    xpRequired: 100
  },
  {
    id: "node-crypto-basics",
    title: "Encoding & Hashing Core",
    description: "Understand Base64, Hexadecimal, MD5, SHA-256, and password salting mechanics.",
    domainId: "crypto",
    dependencies: [],
    lessonIds: [],
    xpRequired: 0
  },
  {
    id: "node-symmetric",
    title: "Symmetric Encryption Ciphers",
    description: "Learn AES, DES, block ciphers, and XOR cipher stream mechanics.",
    domainId: "crypto",
    dependencies: ["node-crypto-basics"],
    lessonIds: [],
    xpRequired: 80
  },
  {
    id: "node-pcap",
    title: "Network Packet Analysis",
    description: "Use Wireshark filters, analyze 3-way handshakes, and track unencrypted payloads.",
    domainId: "net_sec",
    dependencies: [],
    lessonIds: [],
    xpRequired: 0
  },
  {
    id: "node-logs",
    title: "Enterprise Log Auditing",
    description: "Examine Nginx access logs, auth logs, and trace suspicious IP scans.",
    domainId: "forensics",
    dependencies: ["node-linux-intro"],
    lessonIds: [],
    xpRequired: 50
  }
];

export const CAREER_PATHWAYS: CareerPathway[] = [
  {
    id: "soc",
    title: "SOC Security Analyst (L1/L2)",
    description: "Operate defensive command centers. Audit network activity, parse logs, detect suspicious intrusions, and trigger mitigation playbooks.",
    focusDomains: ["forensics", "net_sec", "linux_hard"],
    requiredNodeIds: ["node-linux-intro", "node-pcap", "node-logs"],
    recommendedLabs: ["lab-sqli"],
    recommendedCtfs: ["ctf-3"],
    icon: "Shield"
  },
  {
    id: "pentest",
    title: "Junior Offensive Penetration Tester",
    description: "Authorized ethical hacker. Find logical flaws in web services, exploit system misconfigurations, and help organizations secure their perimeter.",
    focusDomains: ["web_sec", "crypto", "linux_hard"],
    requiredNodeIds: ["node-http", "node-sqli", "node-xss", "node-suid"],
    recommendedLabs: ["lab-sqli"],
    recommendedCtfs: ["ctf-1", "ctf-2"],
    icon: "Terminal"
  },
  {
    id: "cloud-engineer",
    title: "SecOps Cloud Infrastructure Engineer",
    description: "Harden server templates, configure zero-trust networking, review firewalls, and orchestrate secure containerized services.",
    focusDomains: ["linux_hard", "net_sec", "web_sec"],
    requiredNodeIds: ["node-http", "node-linux-intro", "node-pcap"],
    recommendedLabs: ["lab-sqli"],
    recommendedCtfs: ["ctf-1"],
    icon: "Cloud"
  },
  {
    id: "forensics-investigator",
    title: "Digital Forensics & Incident Responder",
    description: "Unravel advanced cyber attacks. Reconstruct chronological log chains, analyze compromised memory dumps, and decrypt malicious traffic payloads.",
    focusDomains: ["forensics", "crypto", "net_sec"],
    requiredNodeIds: ["node-crypto-basics", "node-pcap", "node-logs"],
    recommendedLabs: ["lab-sqli"],
    recommendedCtfs: ["ctf-3"],
    icon: "Zap"
  }
];

export const GAMIFICATION_SHOP: ShopItem[] = [
  {
    id: "item-title-1",
    title: "Root Compromiser Title",
    description: "Equip the exclusive rank title: 'Root Compromiser' in the academy standings.",
    cost: 150,
    category: "title",
    value: "Root Compromiser"
  },
  {
    id: "item-title-2",
    title: "Kernel Overlord Title",
    description: "Display supreme OS authority with the title: 'Kernel Overlord'.",
    cost: 300,
    category: "title",
    value: "Kernel Overlord"
  },
  {
    id: "item-title-3",
    title: "0day Hunter Title",
    description: "Awarded to operators of legendary finding capability: '0day Hunter'.",
    cost: 500,
    category: "title",
    value: "0day Hunter"
  },
  {
    id: "item-banner-1",
    title: "Matrix Terminal Banner",
    description: "Give your profile dashboard an emerald matrix digital stream aura.",
    cost: 200,
    category: "banner",
    value: "from-slate-950 via-emerald-950/40 to-slate-950 border-emerald-500/30"
  },
  {
    id: "item-banner-2",
    title: "Cyberpunk Cyber Neon Banner",
    description: "Drape your dashboard header in synthwave purple neon lines.",
    cost: 250,
    category: "banner",
    value: "from-slate-950 via-purple-950/40 to-slate-950 border-purple-500/30"
  },
  {
    id: "item-banner-3",
    title: "Crimson Threat Dawn Banner",
    description: "Activate a dramatic deep red combat warning overlay.",
    cost: 400,
    category: "banner",
    value: "from-slate-950 via-rose-950/40 to-slate-950 border-rose-500/30"
  },
  {
    id: "item-theme-1",
    title: "Cyber Gold Theme Accent",
    description: "Remap primary focus elements from Cyber Blue to High-Contrast Amber Gold.",
    cost: 100,
    category: "theme",
    value: "amber"
  },
  {
    id: "item-theme-2",
    title: "Neon Pink Hacker Theme Accent",
    description: "Enforce a striking cyber-pink highlight color scheme across Academy widgets.",
    cost: 120,
    category: "theme",
    value: "pink"
  },
  {
    id: "item-lab-hint-token",
    title: "Virtual Lab Crypt-Key Hint",
    description: "Instantly unlock a secondary diagnostic tip inside any training lab module.",
    cost: 50,
    category: "hint",
    value: "lab_hint"
  }
];

export const SPECIALIZED_QUIZZES: QuizQuestionExtended[] = [
  {
    id: "quiz-mchoice",
    question: "Which of the following describes a 'Stored XSS' delivery vector?",
    type: "multiple-choice",
    options: [
      "The script is parsed directly in URL queries without server delivery.",
      "The script payload is persisted directly in database fields and rendered for subsequent page requests.",
      "The script is injected through local developer tool overrides only.",
      "The script is encrypted prior to transport."
    ],
    correctAnswer: "The script payload is persisted directly in database fields and rendered for subsequent page requests.",
    hint: "Think about the durability of the payload.",
    explanation: "Stored XSS is persistent. The script is stored in a database and executes on any user's browser who requests that stored content."
  },
  {
    id: "quiz-mselect",
    question: "Which techniques are standard recommendations for mitigating Cross-Site Request Forgery (CSRF)? (Select all that apply)",
    type: "multiple-select",
    options: [
      "Using unique anti-CSRF tokens in secure POST forms",
      "Setting SameSite=Strict or SameSite=Lax attributes on session cookies",
      "Using Base64 encoding on query strings",
      "Enforcing double-submit cookie validations for Ajax queries"
    ],
    correctAnswer: ["Using unique anti-CSRF tokens in secure POST forms", "Setting SameSite=Strict or SameSite=Lax attributes on session cookies", "Enforcing double-submit cookie validations for Ajax queries"],
    hint: "Three of these choices are widely accepted CSRF countermeasures.",
    explanation: "Anti-CSRF tokens, SameSite cookie attributes, and double-submit cookies prevent browser clients from implicitly attaching ambient credentials to unauthorized cross-site requests."
  },
  {
    id: "quiz-tfalse",
    question: "True or False: Symmetric encryption utilizes separate keys (one public, one private) for enciphering and deciphering data payloads.",
    type: "true-false",
    options: ["True", "False"],
    correctAnswer: "False",
    hint: "Symmetric means 'same' on both sides.",
    explanation: "Symmetric cryptography utilizes the EXACT same secret key for both encryption and decryption. Asymmetric cryptography (like RSA) utilizes public-private key pairs."
  },
  {
    id: "quiz-fblank",
    question: "What is the common abbreviation for a vulnerability that enables unprivileged local users to execute binaries with the root file owner's privileges?",
    type: "fill-blank",
    correctAnswer: "suid",
    hint: "S_I_.",
    explanation: "SUID (Set owner User ID) permission bits instruct Linux systems to execute files using the file owner's security clearance context, representing a severe escalation risk if misconfigured."
  },
  {
    id: "quiz-match",
    question: "Remediate these system risks by mapping each specific vulnerability to its most effective secure defensive patch.",
    type: "matching",
    matchingLeft: ["SQL Injection", "XSS Session Hijack", "CSRF Cross-State Request", "Plaintext Transport"],
    matchingRight: ["Prepared Statements", "HttpOnly Cookie Flag", "SameSite Cookie Attribute", "TLS v1.3 Enforced"],
    correctAnswer: {
      "SQL Injection": "Prepared Statements",
      "XSS Session Hijack": "HttpOnly Cookie Flag",
      "CSRF Cross-State Request": "SameSite Cookie Attribute",
      "Plaintext Transport": "TLS v1.3 Enforced"
    },
    hint: "Map SQLi to database parameter handling, XSS to browser cookie access, CSRF to credential context, and Transport to cryptography.",
    explanation: "Prepared Statements prevent SQLi; HttpOnly blocks XSS cookie reading; SameSite prevents cross-origin CSRF credential transmission; TLS encrypts transport."
  },
  {
    id: "quiz-order",
    question: "Arrange the phases of the Incident Response cycle (NIST SP 800-61 r2) in correct order.",
    type: "ordering",
    options: ["Containment, Eradication & Recovery", "Preparation", "Detection & Analysis", "Post-Incident Activity"],
    correctAnswer: ["Preparation", "Detection & Analysis", "Containment, Eradication & Recovery", "Post-Incident Activity"],
    hint: "Start with preparation, and conclude with learning from the breach.",
    explanation: "NIST Incident Response phases operate in sequence: Preparation, Detection & Analysis, Containment, Eradication & Recovery, and Post-Incident Activity."
  },
  {
    id: "quiz-packet",
    question: "Inspect this unencrypted capture of a network packet. Analyze the TCP stream and identify the specific application-layer protocol utilized.",
    type: "packet-analysis",
    packetDump: `Frame 42: 124 bytes on wire
Ethernet II, Src: 00:0c:29:ab:cd:12, Dst: 02:42:ac:11:00:02
Internet Protocol Version 4, Src: 10.14.0.12, Dst: 10.14.0.99
Transmission Control Protocol, Src Port: 53124, Dst Port: 21, Seq: 1, Ack: 1
FTP Protocol:
    220-FileZilla Server 1.5.0
    220 Welcome to the SecOps Archive server.
    USER anonymous
    331 Password required for anonymous.
    PASS guest@cyberfortress.com
    230 User logged in, proceed.`,
    options: ["HTTP", "SSH", "FTP", "DNS"],
    correctAnswer: "FTP",
    hint: "Check the Destination Port (Dst Port: 21) and the commands (USER, PASS).",
    explanation: "The packet utilizes Destination Port 21 and exchanges USER/PASS handshake signals, which is the signature of FTP (File Transfer Protocol)."
  },
  {
    id: "quiz-code",
    question: "Analyze this Node.js Express database query. Locate the vulnerable line and select the secure remediation block.",
    type: "code-review",
    codeSnippet: `// Express Route Handler
app.post("/api/user/profile", async (req, res) => {
  const userId = req.body.userId;
  
  // VULNERABLE DIRECT CONCATENATION:
  const query = \`SELECT * FROM user_profiles WHERE user_id = '\${userId}'\`;
  const result = await db.query(query);
  
  res.json(result.rows[0]);
});`,
    options: [
      `const query = "SELECT * FROM user_profiles WHERE user_id = $1";\nconst result = await db.query(query, [userId]);`,
      `const query = "SELECT * FROM user_profiles WHERE user_id = '" + sanitize(userId) + "'";\nconst result = await db.query(query);`,
      `const query = \`SELECT * FROM user_profiles WHERE user_id = '\${Base64(userId)}'\`;\nconst result = await db.query(query);`,
      `const query = \`SELECT * FROM user_profiles WHERE user_id = '\${userId.replace(/'/g, "")}'\`;\nconst result = await db.query(query);`
    ],
    correctAnswer: `const query = "SELECT * FROM user_profiles WHERE user_id = $1";\nconst result = await db.query(query, [userId]);`,
    hint: "Use prepared parameter placeholders ($1, $2) instead of string manipulation or replacement.",
    explanation: "Parameterized queries with placeholders are the only 100% mathematical guarantee against SQL Injection, as they keep parameters completely isolated from the execution instruction tree."
  },
  {
    id: "quiz-scenario",
    question: "Scenario: An active scanning tool alerts you that a public Nginx production container is vulnerable to an unauthenticated Remote Code Execution exploit (CVSS 9.8). A public proof-of-concept exists on GitHub. What is your immediate incident response escalation path?",
    type: "scenario",
    options: [
      "Schedule a system backup for next week and patch during regular Sunday maintenance.",
      "Immediately disconnect the Nginx container from public ingress routing, apply the vendor patch, redeploy behind the firewall, and conduct a full log audit for exploitation indicators.",
      "Email the web application developers asking them to rewrite the backend routing logic.",
      "Conduct a penetration test on your own active systems using the public GitHub proof-of-concept."
    ],
    correctAnswer: "Immediately disconnect the Nginx container from public ingress routing, apply the vendor patch, redeploy behind the firewall, and conduct a full log audit for exploitation indicators.",
    hint: "A CVSS 9.8 vulnerability with a public exploit requires rapid containment to avoid a breach.",
    explanation: "With a CVSS 9.8 vulnerability and active PoC code in the wild, the threat exposure is extreme. Immediate isolation and remediation are paramount to prevent container takeover."
  }
];
