# Security Specification & "Dirty Dozen" Threat Vectors

This document outlines the zero-trust Attribute-Based Access Control (ABAC) invariants, the "Dirty Dozen" adversarial payloads designed to compromise the system, and the corresponding rules required to enforce secure states.

## 1. Core Data Invariants

- **Identity Isolation**: A `PasswordVaultItem` must never be readable or writable by any user other than its legitimate owner (`ownerId == request.auth.uid`).
- **Profile Integrity**: A user can only write and read their own `User` profile. The critical `role` parameter is immutable for the user; elevation of roles is strictly forbidden.
- **Append-Only Auditing**: `AuditLog` documents are strictly write-once, append-only, and completely immutable. No user can modify or delete existing logs.
- **Academic Sovereignty**: Users may only read or update their own `AcademyProfile`. State parameters such as `xp` and `level` must increase linearly and within bounds; descending/resetting progress is blocked.
- **Temporal Strictness**: Timestamps like `createdAt` and `updatedAt` are validated directly against the server clock (`request.time`). Client-side overrides are blocked.
- **Resource Poisoning Prevention**: All document path variables must adhere to strict identifier specifications (`isValidId`), preventing denial-of-wallet character exhaustion.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to break the rules of Identity, Integrity, and State in the Cyber Fortress database.

### Payload 1: Privilege Escalation (Self-Assigned Admin Role)
* **Target Collection**: `/users/usr-malicious`
* **Adversarial Goal**: Elevate a newly registered user to "Administrator".
* **Payload**:
```json
{
  "email": "attacker@fortress.com",
  "fullName": "Malicious User",
  "role": "Administrator",
  "orgName": "Rogue Syndicate",
  "createdAt": "2026-07-10T22:04:22.572Z"
}
```
* **Required Gate**: Profile creation blocks roles other than "Security Analyst" or "Registered User" unless validated by a trusted lookup.

### Payload 2: Hostile Takeover (Credential Snooping)
* **Target Collection**: `/vault/vlt-001`
* **Adversarial Goal**: Reading another user's database credential keys.
* **Attack**: Authenticated user `usr-malicious` attempts a direct `get` on `/vault/vlt-001` owned by `usr-admin`.
* **Required Gate**: `allow read: if resource.data.ownerId == request.auth.uid`

### Payload 3: Fraudulent Credential Insertion
* **Target Collection**: `/vault/vlt-malicious`
* **Adversarial Goal**: Creating a vault entry with the `ownerId` set to another user (`usr-admin`) to confuse audits.
* **Payload**:
```json
{
  "id": "vlt-malicious",
  "title": "Stolen LDAP Server",
  "username": "ldap_admin",
  "password": "HackPassword!",
  "url": "ldap://rogue.server:389",
  "strength": "Strong",
  "createdAt": "2026-07-10T22:04:22.572Z",
  "ownerId": "usr-admin"
}
```
* **Required Gate**: `incoming().ownerId == request.auth.uid`

### Payload 4: Ghost Field Injection (Shadow Update)
* **Target Collection**: `/users/usr-analyst`
* **Adversarial Goal**: Injecting non-schema configuration variables (`isSuperAdmin: true`).
* **Payload**:
```json
{
  "email": "analyst@cyberfortress.com",
  "fullName": "Alex Rivera",
  "role": "Security Analyst",
  "orgName": "Fortress Enterprise Ltd",
  "createdAt": "2026-07-10T22:04:22.572Z",
  "isSuperAdmin": true
}
```
* **Required Gate**: `affectedKeys().hasOnly(['fullName', 'orgName'])` or equivalent strict schema validations.

### Payload 5: Audit Log Erasure (Evidence Destruction)
* **Target Collection**: `/auditLogs/log-001`
* **Adversarial Goal**: Deleting a critical log that records a previous failed breach attempt.
* **Attack**: Direct `delete` request on `/auditLogs/log-001`.
* **Required Gate**: `allow delete: if false` (strictly append-only).

### Payload 6: Audit Trail Alteration (Log Forgery)
* **Target Collection**: `/auditLogs/log-001`
* **Adversarial Goal**: Altering the status of a logged warning to "Success".
* **Payload**:
```json
{
  "status": "Success",
  "details": "Falsified operational details"
}
```
* **Required Gate**: `allow update: if false` (append-only ruleset).

### Payload 7: Timestamp Spoofing (Backdating Activity)
* **Target Collection**: `/scans/scn-002`
* **Adversarial Goal**: Backdating a security scan to an past date to evade compliance checkups.
* **Payload**:
```json
{
  "id": "scn-002",
  "target": "https://vulnerable-site.com",
  "type": "Website Security",
  "status": "Completed",
  "riskScore": 12,
  "findingsCount": 0,
  "scannedBy": "usr-malicious",
  "createdAt": "2010-01-01T00:00:00.000Z"
}
```
* **Required Gate**: `incoming().createdAt == request.time`

### Payload 8: Denial-of-Wallet Character Poisoning
* **Target Collection**: `/scans/JUNK_CHARACTERS_x1000`
* **Adversarial Goal**: Triggering massive document path size consumption via path parameter injection.
* **Attack**: Issuing document actions using large strings (e.g. 10KB strings) as document keys.
* **Required Gate**: `isValidId(scanId)` validating matches `'^[a-zA-Z0-9_\-]+$'` and sizes `<= 128`.

### Payload 9: Academic Progress Forgery (Max Level Hack)
* **Target Collection**: `/academyProfiles/usr-malicious`
* **Adversarial Goal**: Instantly setting player level to 999 and XP to 100,000.
* **Payload**:
```json
{
  "xp": 100000,
  "level": 999,
  "rank": "Sovereign Threat Hunter",
  "streak": 100,
  "completedLessonIds": [],
  "completedCourseIds": [],
  "completedCtfIds": [],
  "unlockedBadges": [],
  "weeklyStudyMinutes": 1000,
  "dailyGoalMinutes": 15
}
```
* **Required Gate**: Updates to academy profiles must validate the bounds of incremented XP.

### Payload 10: Academic Badge Plagiarism
* **Target Collection**: `/academyProfiles/usr-malicious`
* **Adversarial Goal**: Unlocking premium achievement badges without completing the prerequisite labs.
* **Payload**:
```json
{
  "unlockedBadges": ["badge-lab-slayer", "badge-ctf-hunter", "badge-admin-overlord"]
}
```
* **Required Gate**: Strict keys validation that ensures badges can only be unlocked via specific validation hooks.

### Payload 11: SQLi / XSS String Injection in Threats
* **Target Collection**: `/threats/tht-vuln`
* **Adversarial Goal**: Injecting cross-site scripting scripts or heavy SQL blocks inside the indicator string field.
* **Payload**:
```json
{
  "id": "tht-vuln",
  "source": "Malicious Intelligence",
  "indicator": "<script>alert('compromised')</script>",
  "type": "Malware Injection",
  "severity": "Critical",
  "timestamp": "2026-07-10T22:04:22.572Z"
}
```
* **Required Gate**: Verification that strings fit schema length requirements and escape sequences.

### Payload 12: Anonymous Profiling Access
* **Target Collection**: `/academyProfiles/usr-admin`
* **Adversarial Goal**: Inspecting or modifying admin educational logs while unauthenticated.
* **Attack**: Reading `/academyProfiles/usr-admin` without token credentials.
* **Required Gate**: `allow read, write: if isSignedIn()`

---

## 3. Test Verification Blueprint

The test scenarios map directly to the "Dirty Dozen" payloads above, validating that all security gates produce a secure `PERMISSION_DENIED` response when breached.
