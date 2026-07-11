import { Course, CtfChallenge, Badge } from "../types/academy";

export const ACADEMY_COURSES: Course[] = [
  {
    id: "course-1",
    title: "OWASP Top 10 & Web Security Vulnerabilities",
    category: "Web Security",
    description: "Deep dive into web application vulnerabilities, exploitation mechanisms, and secure Blue Team remediation policies.",
    difficulty: "Intermediate",
    estimatedTime: "5h 15m",
    xpReward: 600,
    instructor: "Sarah Vance, Principal Security Architect",
    rating: 4.8,
    modulesCount: 3,
    modules: [
      {
        id: "m1",
        title: "Introduction to Web Attacking Vector",
        description: "Learn how the HTTP protocol operates under security scanning and penetration testing tools.",
        lessons: [
          {
            id: "l1_1",
            title: "Understanding SQL Injection (SQLi) Mechanics",
            type: "text",
            duration: "15m",
            xp: 50,
            content: `### SQL Injection Explained

SQL Injection (SQLi) is a critical vulnerability that occurs when user-supplied input is directly concatenated into a SQL query database engine without proper validation or parameterization. This allows an attacker to manipulate the execution structure of SQL statements.

#### The Vulnerable Code Pattern
\`\`\`sql
SELECT * FROM users WHERE email = '` + "${email}" + `' AND password = '` + "${password}" + `';
\`\`\`

If an attacker inputs \`admin@cyberfortress.com' OR '1'='1\`, the query evaluates to:
\`\`\`sql
SELECT * FROM users WHERE email = 'admin@cyberfortress.com' OR '1'='1' AND password = '...';
\`\`\`
Because \`'1'='1'\` is always true, the authentication is bypassed entirely!

#### Defensive Remediation
Always utilize **Parameterized Queries** (Prepared Statements) or an ORM. Parameterization ensures that database query parsers treat input values strictly as string literals, never as executable code instructions.

\`\`\`typescript
// Secure Node.js PG implementation
const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
await db.query(query, [email, password]);
\`\`\`
`,
            quiz: [
              {
                id: "q1_1_1",
                question: "Which defensive mechanism is most effective against SQL Injection vulnerabilities?",
                type: "multiple-choice",
                options: [
                  "Adding client-side length constraints to input fields",
                  "Enforcing secure Prepared Statements with Parameterized Queries",
                  "Base64-encoding all SQL query lines prior to database delivery",
                  "Setting the database to read-only replication state"
                ],
                correctAnswer: "Enforcing secure Prepared Statements with Parameterized Queries",
                hint: "Think about treating input strictly as a parameter, not as executable database commands.",
                explanation: "Prepared Statements isolate input variables from the query structure itself, making SQLi mathematically impossible on those parameters."
              }
            ]
          },
          {
            id: "l1_2",
            title: "SQLi Database Exploitation Lab",
            type: "lab",
            duration: "25m",
            xp: 150,
            content: `### Interactive SQLi Exploitation Lab

In this hands-on lab, your target is a simulated corporate database engine running an insecure billing endpoint. You need to manipulate the input to leak the Administrator's secret API token!

#### Lab Goal:
1. Review the input endpoint.
2. Inject a SQL payload to dump all credentials.
3. Retrieve the hidden flag format: \`CF{sql_injection_remediated_62}\` and submit below!`,
            lab: {
              id: "lab-sqli",
              title: "Exploiting SQL Injection",
              instructions: "Inject the parameter `' OR '1'='1` or inspect with payload query union commands. Try running commands on the terminal shell to locate vulnerable services.",
              targetHost: "sql-target.fortress.internal",
              terminalPrompt: "operator@secops-sandbox:~$",
              commands: {
                "help": {
                  output: "Available commands:\n  help         - Show this menu\n  scan-host    - Scan the local host for open ports\n  inject-payload - Run exploit input validation tool\n  cat flag.txt - View captured flag"
                },
                "scan-host": {
                  output: "Scanning sql-target.fortress.internal...\n[+] Port 80/tcp OPEN (Apache/2.4.41)\n[+] Port 5432/tcp OPEN (PostgreSQL 12.5)"
                },
                "inject-payload": {
                  output: "Executing parameter test: ' OR 1=1; --\n[+] INJECTION SUCCESSFUL!\n[+] Query Results Reflected:\n  ID: 1 | User: admin@cyberfortress.com | Flag: CF{sql_injection_remediated_62}\n  ID: 2 | User: analyst@cyberfortress.com | Hash: $2b$12$Kj6s8...\n"
                },
                "cat flag.txt": {
                  output: "CF{sql_injection_remediated_62}"
                }
              },
              flag: "CF{sql_injection_remediated_62}"
            }
          }
        ]
      },
      {
        id: "m2",
        title: "Cross-Site Scripting (XSS)",
        description: "Understand the differences between Stored, Reflected, and DOM-based XSS vectors.",
        lessons: [
          {
            id: "l2_1",
            title: "XSS Delivery Mechanisms & Defense",
            type: "text",
            duration: "20m",
            xp: 60,
            content: `### Cross-Site Scripting (XSS)

XSS occurs when a web application takes untrusted input and includes it in a web page without proper escaping or sanitization. This allows attackers to execute arbitrary JavaScript inside the victim's browser session.

#### Types of XSS:
1. **Reflected XSS**: The malicious script is part of the request payload sent to the server, which is immediately reflected back in the HTML response.
2. **Stored XSS (Persistent)**: The payload is stored in the database (e.g. comment field, profile settings) and executed when other operators fetch the data.
3. **DOM-based XSS**: The payload is processed client-side by browser scripts directly, manipulating DOM components without sending payloads to server engines.

#### XSS Mitigation Blueprint:
* Use **Context-Aware Output Escaping** (e.g. converting \`<\` to \`&lt;\`).
* Enforce a strong **Content-Security-Policy (CSP)** that restricts script source origins.
* Mark session cookies with the \`HttpOnly\` flag to prevent JavaScript cookie hijacking.
`,
            quiz: [
              {
                id: "q2_1_1",
                question: "Which of the following cookie attributes prevents XSS scripts from reading document cookies?",
                type: "multiple-choice",
                options: [
                  "Secure",
                  "SameSite=Strict",
                  "HttpOnly",
                  "Max-Age=3600"
                ],
                correctAnswer: "HttpOnly",
                hint: "This attribute tells the browser that scripts must not touch this cookie.",
                explanation: "The HttpOnly flag forbids JavaScript from accessing the cookie via document.cookie, fully neutralizing XSS session hijack risks."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Linux Operating System Hardening",
    category: "Linux",
    description: "Secure production system shells, configure PAM authentication layers, lock down open ports, and create Blue Team cron auditing jobs.",
    difficulty: "Beginner",
    estimatedTime: "3h 45m",
    xpReward: 400,
    instructor: "Marcus Aurelius, Blue Team Lead",
    rating: 4.9,
    modulesCount: 2,
    modules: [
      {
        id: "c2_m1",
        title: "Linux Permissions & User Audits",
        description: "Learn to audit SUID binaries, parse the /etc/shadow credential database, and secure the SSH config.",
        lessons: [
          {
            id: "l2_1_1",
            title: "Hardening SSH Configuration Defaults",
            type: "text",
            duration: "20m",
            xp: 75,
            content: `### Securing SSH (sshd_config)

The Secure Shell (SSH) daemon is one of the most targeted administration vectors. Leaving SSH configured with default values exposes systems to simple scanning and automated root brute force attacks.

#### Key Directives in \`/etc/ssh/sshd_config\`:

1. **Disable Root Authentication**:
   \`\`\`bash
   PermitRootLogin no
   \`\`\`
   Force admins to log in as standard unprivileged users, then escalate authority via \`sudo\`.

2. **Disable Password Authentication**:
   \`\`\`bash
   PasswordAuthentication no
   \`\`\`
   Enforce cryptographic SSH keys. Password-less logins block 99% of simple dictionary attempts.

3. **Change Default Port**:
   \`\`\`bash
   Port 2222
   \`\`\`
   Moving SSH off port 22 reduces noise in audit logs from automated bots.
`,
            quiz: [
              {
                id: "q2_1_1_1",
                question: "Which directive in sshd_config prevents direct root logins over SSH?",
                type: "multiple-choice",
                options: [
                  "RootLoginDisable yes",
                  "PermitRootLogin no",
                  "DenyUsers root",
                  "SSHRootAccess disabled"
                ],
                correctAnswer: "PermitRootLogin no",
                hint: "The directive starts with PermitRootLogin.",
                explanation: "Setting 'PermitRootLogin no' requires administrators to log in as unprivileged users first, adding audit logs of escalation."
              }
            ]
          },
          {
            id: "l2_1_2",
            title: "Linux Command Audit Challenge",
            type: "lab",
            duration: "20m",
            xp: 120,
            content: `### Hands-on SUID Audit Lab

A system administrator has misconfigured a critical shell permission. Your task is to investigate SUID binary flags to find a privilege escalation route.

#### Steps:
1. Scan the filesystem for SUID binaries.
2. Identify which file is executable with privileged rights.
3. Fetch the secure kernel token key file to reveal the verification flag.`,
            lab: {
              id: "lab-linux-suid",
              title: "Auditing SUID Filesystem Flags",
              instructions: "Audit the directory commands. Use `find` or listing parameters to identify SUID executable files.",
              targetHost: "hardened-server.internal",
              terminalPrompt: "operator@defense-vm:~$",
              commands: {
                "help": {
                  output: "Commands available:\n  help        - Display commands list\n  find-suid   - Audit files with SUID permission bit set\n  run-audit   - Execute internal audit tools on vulnerability parameters"
                },
                "find-suid": {
                  output: "Scanning file paths...\n[-] /usr/bin/passwd (SUID Ok)\n[!] /usr/local/bin/backup-audit-helper (SUID WARNING: World Executable!)\n"
                },
                "run-audit": {
                  output: "Accessing backup-audit-helper...\n[+] Authority Escalated to root privilege level!\n[+] Core Key Extracted: CF{linux_suid_privesc_resolved_78}\n"
                }
              },
              flag: "CF{linux_suid_privesc_resolved_78}"
            }
          }
        ]
      }
    ]
  }
];

export const CTF_CHALLENGES: CtfChallenge[] = [
  {
    id: "ctf-1",
    title: "The Broken Vault Gate",
    category: "Web",
    difficulty: "Easy",
    description: "An insecure development gateway page of a cyber security vault allows remote inspection. Recover the hidden flag by auditing the local console parameters or testing basic parameters.",
    hints: [
      "Check the source parameters or try running basic local sandbox scripts.",
      "The SQL parameter test from Web Security courses is often simulated here!"
    ],
    xpReward: 200,
    points: 100,
    flag: "CF{vault_gate_bypassed_99}",
    completed: false,
    solveCount: 412,
    connectionDetails: "curl -X GET https://vault-stage.fortress.internal/api/clearance"
  },
  {
    id: "ctf-2",
    title: "Cipher Cipher Everywhere",
    category: "Crypto",
    difficulty: "Medium",
    description: "Our threat intelligence center intercepted a raw encrypted text sequence broadcasted by an active ransomware botnet command module. Decrypt this base64 and rot13 payload: 'Q3liZXJG b3J0cmVzcyBpcyBzZWN1cmUgQ0Z7Y3J5cHRvX2dec2NoZW1lX2RlY3J5cHRlZF80NH0='.",
    hints: [
      "This looks like a standard Base64 encoding. Use standard decoder tools or base64 tool in your terminal sandbox.",
      "No secondary decryption key is needed. Just extract the plain string structure!"
    ],
    xpReward: 350,
    points: 250,
    flag: "CF{crypto_scheme_decrypted_44}",
    completed: false,
    solveCount: 189,
    connectionDetails: "Botnet Payload: Q3liZXJG b3J0cmVzcyBpcyBzZWN1cmUgQ0Z7Y3J5cHRvX2dec2NoZW1lX2RlY3J5cHRlZF80NH0="
  },
  {
    id: "ctf-3",
    title: "Ghost in the Shell Logs",
    category: "Forensics",
    difficulty: "Hard",
    description: "A secure server log was infected. Find the SSH session IP address that successfully initiated administrative compromise using an unauthorized credentials sweep.",
    hints: [
      "Inspect the network traffic logs or audit trails in the security console.",
      "Look for indicators of rapid credential warnings preceding success."
    ],
    xpReward: 500,
    points: 400,
    flag: "CF{forensics_ip_sweep_hunted_12}",
    completed: false,
    solveCount: 64,
    connectionDetails: "File: sshd_auth_events.log (simulated)"
  }
];

export const ACADEMY_BADGES: Badge[] = [
  {
    id: "badge-novice",
    title: "Clearance Cadet",
    description: "Unlock your very first lesson and successfully pass a training audit verification quiz.",
    icon: "ShieldAlert",
    color: "text-blue-500 bg-blue-50 border-blue-200"
  },
  {
    id: "badge-lab-slayer",
    title: "Terminal Sandbox Wizard",
    description: "Execute simulated command exploits and recover flag files from 2 different laboratory servers.",
    icon: "Terminal",
    color: "text-emerald-500 bg-emerald-50 border-emerald-200"
  },
  {
    id: "badge-ctf-hunter",
    title: "Flag Capturer",
    description: "Resolve an active Capture The Flag (CTF) security challenge by submitting a valid cryptographic token flag.",
    icon: "Radio",
    color: "text-amber-500 bg-amber-50 border-amber-200"
  },
  {
    id: "badge-ai-scholar",
    title: "Prompt Sovereign",
    description: "Engage in advanced diagnostic training with the Cyber Academy AI Mentor for critical threat advice.",
    icon: "Sparkles",
    color: "text-purple-500 bg-purple-50 border-purple-200"
  }
];
