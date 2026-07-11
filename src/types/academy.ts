export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  estimatedTime: string; // e.g. "4h 30m"
  xpReward: number;
  instructor: string;
  rating: number;
  modulesCount: number;
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: "text" | "video" | "lab";
  duration: string;
  xp: number;
  content: string; // Markdown supported
  completed?: boolean;
  lab?: LabSimulation;
  quiz?: QuizQuestion[];
}

export interface LabSimulation {
  id: string;
  title: string;
  instructions: string; // markdown
  targetHost?: string;
  terminalPrompt?: string;
  commands: { [key: string]: { output: string; solve?: boolean; details?: string } };
  flag?: string; // flag format e.g. CF{...}
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "multiple-select" | "true-false" | "fill-blank" | "code-completion";
  options?: string[]; // For choices
  correctAnswer: string | string[]; // Single string or array of correct answers
  hint?: string;
  explanation?: string;
}

export interface CtfChallenge {
  id: string;
  title: string;
  category: "Web" | "Crypto" | "Forensics" | "OSINT" | "Reverse Engineering" | "Binary Exploitation" | "Linux" | "Windows" | "Cloud";
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Insane";
  description: string;
  hints: string[];
  xpReward: number;
  points: number;
  flag: string; // e.g. CF{web_xss_vuln_fixed}
  completed?: boolean;
  solveCount: number;
  connectionDetails?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // tailwind color class
  unlockedAt?: string;
}

export interface Certificate {
  id: string;
  courseName: string;
  courseId: string;
  studentName: string;
  completedAt: string;
  verificationId: string;
  instructor: string;
}

export interface UserAcademyProfile {
  xp: number;
  level: number;
  streak: number;
  rank: string; // e.g. "Script Kiddie", "Junior Analyst", "Threat Hunter", "Admin Sovereign"
  completedLessonIds: string[];
  completedCourseIds: string[];
  completedCtfIds: string[];
  unlockedBadges: string[];
  earnedCertificates: Certificate[];
  weeklyStudyMinutes: number;
  dailyGoalMinutes: number;
  coins?: number;
  inventory?: string[];
  activeTitle?: string;
  activeBannerClass?: string;
  activeCareerGoalId?: string | null;
  studyPlan?: any | null;
  notifications?: any[];
  studyHistory?: any[];
}
