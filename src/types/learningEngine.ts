export interface SkillTreeNode {
  id: string;
  title: string;
  description: string;
  domainId: string;
  dependencies: string[]; // parent node IDs
  lessonIds: string[]; // linked lessons
  xpRequired: number;
}

export interface SkillMastery {
  domainId: string;
  domainName: string;
  points: number;
  level: "Uninitiated" | "Novice" | "Competent" | "Expert" | "Master";
}

export interface CareerPathway {
  id: string;
  title: string;
  description: string;
  focusDomains: string[]; // e.g. ["web_sec", "crypto"]
  requiredNodeIds: string[]; // required skill tree node IDs
  recommendedLabs: string[]; // lab IDs
  recommendedCtfs: string[]; // CTF challenge IDs
  icon: string; // lucide icon name
}

export interface StudyPlan {
  id: string;
  targetCareerId: string;
  weeklyHours: number;
  pace: "steady" | "balanced" | "intensive";
  weeklyAvailability: { [day: string]: number }; // day name to minutes, e.g., "Monday": 30
  startDate: string;
  endDate: string;
}

export interface QuizQuestionExtended {
  id: string;
  question: string;
  type: "multiple-choice" | "multiple-select" | "true-false" | "fill-blank" | "matching" | "ordering" | "drag-drop" | "packet-analysis" | "code-review" | "scenario";
  options?: string[]; // For choices
  correctAnswer: any; // string, string[], or left-right map, or correct order array
  hint?: string;
  explanation?: string;
  codeSnippet?: string; // for code review
  packetDump?: string; // for packet analysis
  matchingLeft?: string[]; // Left items for matching
  matchingRight?: string[]; // Right items for matching
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "title" | "banner" | "theme" | "hint";
  value: string; // e.g. custom title string, bg class, etc.
}

export interface UserAcademyNotification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  timestamp: string;
  type: "level-up" | "badge" | "streak" | "goal" | "system";
}

export interface StudySessionLog {
  date: string; // YYYY-MM-DD
  minutes: number;
  xp: number;
}
