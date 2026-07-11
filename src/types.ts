export interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  orgName: string;
  createdAt: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cve: string;
  description: string;
  remediation: string;
}

export interface SecurityScan {
  id: string;
  target: string;
  type: string;
  status: string;
  riskScore: number;
  findingsCount: number;
  findings: Finding[];
  scannedBy: string;
  createdAt: string;
}

export interface PasswordVaultItem {
  id: string;
  title: string;
  username: string;
  password?: string; // Opt out on list if needed, keep available for vault
  url: string;
  notes: string;
  strength: "Strong" | "Medium" | "Weak";
  createdAt: string;
}

export interface ThreatIndicator {
  id: string;
  source: string;
  indicator: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  status: "Success" | "Failure" | "Warning";
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "model";
  content: string;
  timestamp: string;
}
