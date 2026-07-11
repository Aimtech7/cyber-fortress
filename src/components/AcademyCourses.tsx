import React, { useState } from "react";
import { Course, CourseModule, Lesson, UserAcademyProfile, QuizQuestion, LabSimulation } from "../types/academy";
import AcademyQuizEngine from "./AcademyQuizEngine";
import { 
  BookOpen, 
  Clock, 
  Compass, 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle, 
  Terminal, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle,
  Code,
  Info,
  RefreshCw,
  Award
} from "lucide-react";

interface AcademyCoursesProps {
  courses: Course[];
  profile: UserAcademyProfile;
  userId: string;
  onLessonComplete: (courseId: string, lessonId: string, xpReward: number) => void;
  onNavigateToTab: (tab: string) => void;
  theme?: "light" | "dark";
}

export default function AcademyCourses({
  courses,
  profile,
  userId,
  onLessonComplete,
  onNavigateToTab,
  theme = "light"
}: AcademyCoursesProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ [key: string]: { correct: boolean; explanation?: string } }>({});

  // Lab Terminal state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [labFlagSubmitted, setLabFlagSubmitted] = useState<string>("");
  const [labSuccess, setLabSuccess] = useState<boolean>(false);
  const [labError, setLabError] = useState<string | null>(null);

  const categories = ["All", "Web Security", "Linux"];

  const filteredCourses = activeCategory === "All" 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizFeedback({});
    setLabSuccess(false);
    setLabError(null);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizFeedback({});
    setLabSuccess(false);
    setLabError(null);
    setLabFlagSubmitted("");
    
    if (lesson.type === "lab" && lesson.lab) {
      setTerminalLogs([
        `🛡️ Cyber Fortress Virtual Lab Environment v2.91.4`,
        `Target Endpoint: ${lesson.lab.targetHost}`,
        `Operational status: STABLE / ISOLATED_CONTAINER`,
        `Type 'help' to audit available clearance commands.`,
        ``,
        `${lesson.lab.terminalPrompt || "operator@defense-vm:~$"}`
      ]);
    }
  };

  // Quiz evaluation
  const handleOptionSelect = (questionId: string, value: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuiz = (questions: QuizQuestion[]) => {
    if (quizSubmitted) return;
    
    let allCorrect = true;
    const feedback: { [key: string]: { correct: boolean; explanation?: string } } = {};

    questions.forEach(q => {
      const isCorrect = quizAnswers[q.id] === q.correctAnswer;
      if (!isCorrect) allCorrect = false;
      feedback[q.id] = {
        correct: isCorrect,
        explanation: q.explanation
      };
    });

    setQuizFeedback(feedback);
    setQuizSubmitted(true);

    if (allCorrect && selectedCourse && selectedLesson) {
      onLessonComplete(selectedCourse.id, selectedLesson.id, selectedLesson.xp);
    }
  };

  // Lab terminal input processing
  const handleTerminalSubmit = (e: React.FormEvent, lab: LabSimulation) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalLogs];
    // Remove prompt suffix for clean formatting
    if (newLogs.length > 0) {
      newLogs[newLogs.length - 1] = `${newLogs[newLogs.length - 1]} ${terminalInput}`;
    }

    let output = `Command not recognized. Check administrative configurations.`;
    if (lab.commands[cmd]) {
      output = lab.commands[cmd].output;
    }

    newLogs.push(output);
    newLogs.push(``); // spacing
    newLogs.push(`${lab.terminalPrompt || "operator@defense-vm:~$"}`);

    setTerminalLogs(newLogs);
    setTerminalInput("");
  };

  const handleSubmitLabFlag = async (lab: LabSimulation) => {
    setLabError(null);
    if (labFlagSubmitted.trim() === lab.flag) {
      setLabSuccess(true);
      if (selectedCourse && selectedLesson) {
        onLessonComplete(selectedCourse.id, selectedLesson.id, selectedLesson.xp);
      }
    } else {
      setLabError("Incorrect flag cryptographic signature. Verify your terminal logs and re-submit.");
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return profile.completedLessonIds.includes(lessonId);
  };

  const isCourseCompleted = (courseId: string) => {
    return profile.completedCourseIds.includes(courseId);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="academy-courses-view">
      
      {/* 1. Root Catalog View */}
      {!selectedCourse && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Operational Training Courses
              </h2>
              <p className="text-xs text-slate-500">
                Master defensive cyber infrastructure, audit web ports, exploit parameter boundaries, and earn verified certifications.
              </p>
            </div>

            {/* Filters */}
            <div className={`flex p-1 rounded-xl border ${
              theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200/60"
            }`}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeCategory === cat
                      ? theme === "dark"
                        ? "bg-slate-800 text-white"
                        : "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => {
              const isCompleted = isCourseCompleted(course.id);
              return (
                <div 
                  key={course.id}
                  className={`border rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg ${
                    theme === "dark" 
                      ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900/60" 
                      : "bg-white border-slate-200/80 hover:shadow-slate-200/30 shadow-sm"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                        theme === "dark" ? "bg-blue-950/40 text-blue-400" : "bg-blue-50 text-blue-600"
                      }`}>
                        {course.category}
                      </span>
                      {isCompleted && (
                        <span className="text-emerald-500 font-mono font-bold text-[10px] flex items-center gap-1 uppercase">
                          <CheckCircle className="h-3.5 w-3.5" /> Complete
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      {course.title}
                    </h3>

                    <p className={`text-xs line-clamp-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/10 flex justify-between items-center">
                    <div className="flex gap-3 text-[10px] font-mono font-bold text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.estimatedTime}</span>
                      <span className="flex items-center gap-1"><Compass className="h-3 w-3" /> {course.difficulty}</span>
                    </div>

                    <button
                      onClick={() => handleSelectCourse(course)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                    >
                      Enter Course
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Course Syllabus / Lesson detail view */}
      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Modules List */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer pb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Course Catalog
            </button>

            <div className={`border rounded-2xl p-4 space-y-4 ${
              theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="space-y-1">
                <h3 className={`text-sm font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  Syllabus Registry
                </h3>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase">
                  {selectedCourse.title}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {selectedCourse.modules.map((module, mIdx) => (
                  <div key={module.id} className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-black text-blue-500">M{mIdx + 1}</span>
                      <h4 className={`text-xs font-extrabold truncate ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
                        {module.title}
                      </h4>
                    </div>

                    <div className="space-y-1 pl-3 border-l border-slate-200/10">
                      {module.lessons.map(lesson => {
                        const isDone = isLessonCompleted(lesson.id);
                        const isActive = selectedLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition cursor-pointer ${
                              isActive
                                ? theme === "dark"
                                  ? "bg-slate-850 text-white border border-slate-800"
                                  : "bg-blue-50 text-blue-600 border border-blue-100"
                                : theme === "dark"
                                  ? "text-slate-400 hover:text-white hover:bg-slate-850/30"
                                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                            }`}
                          >
                            <span className="truncate pr-1.5">{lesson.title}</span>
                            {isDone ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : lesson.type === "lab" ? (
                              <Terminal className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <PlayCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Lesson Display Board */}
          <div className="lg:col-span-8 space-y-6">
            {selectedLesson ? (
              <div className={`border rounded-2xl p-6 md:p-8 space-y-6 ${
                theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
              }`}>
                {/* Lesson Header */}
                <div className="flex justify-between items-start border-b border-slate-200/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-500 font-bold tracking-wider font-mono uppercase block">
                      Lesson Module Progress ({selectedLesson.duration} | +{selectedLesson.xp} XP)
                    </span>
                    <h2 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      {selectedLesson.title}
                    </h2>
                  </div>

                  {isLessonCompleted(selectedLesson.id) && (
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 uppercase">
                      <CheckCircle className="h-3.5 w-3.5" /> Accomplished
                    </span>
                  )}
                </div>

                {/* Content body with custom inline markdown rendering */}
                <div className={`prose max-w-none text-xs leading-relaxed space-y-4 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  {selectedLesson.content.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("###")) {
                      return <h3 key={pIdx} className="text-sm font-extrabold pt-2 text-blue-500">{para.replace("###", "").trim()}</h3>;
                    }
                    if (para.startsWith("####")) {
                      return <h4 key={pIdx} className="text-xs font-extrabold pt-1 text-slate-400 uppercase tracking-wider">{para.replace("####", "").trim()}</h4>;
                    }
                    if (para.startsWith("`") || para.startsWith("```")) {
                      return (
                        <pre key={pIdx} className="p-4 rounded-xl font-mono text-[10px] bg-slate-950 border border-slate-900 text-blue-400 overflow-x-auto leading-normal">
                          {para.replace(/```[a-z]*/g, "").replace(/`/g, "").trim()}
                        </pre>
                      );
                    }
                    return <p key={pIdx}>{para}</p>;
                  })}
                </div>

                {/* CONDITIONAL LAB PANEL */}
                {selectedLesson.type === "lab" && selectedLesson.lab && (
                  <div className="space-y-4 pt-6 border-t border-slate-200/10">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black tracking-wider uppercase text-amber-500 flex items-center gap-1.5">
                        <Terminal className="h-4 w-4" /> Lab Terminal Simulator
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {selectedLesson.lab.instructions}
                      </p>
                    </div>

                    {/* Terminal buffer */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-1 shadow-inner h-64 overflow-y-auto">
                      {terminalLogs.map((log, lIdx) => (
                        <div key={lIdx} className="whitespace-pre-wrap">{log}</div>
                      ))}
                      
                      {/* Active input form line */}
                      <form onSubmit={(e) => handleTerminalSubmit(e, selectedLesson.lab!)} className="flex items-center">
                        <span className="text-slate-500 mr-2 select-none">
                          {selectedLesson.lab.terminalPrompt || "operator@defense-vm:~$"}
                        </span>
                        <input
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-blue-400 caret-blue-500"
                          autoFocus
                          disabled={labSuccess}
                        />
                      </form>
                    </div>

                    {/* Flag submission */}
                    <div className={`p-4 rounded-xl border space-y-3 ${
                      theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}>
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 block">
                        Submit Recovered Flag String (Format: CF&#123;...&#125;)
                      </label>
                      
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          placeholder="CF{cryptographic_recovered_checksum_here}"
                          value={labFlagSubmitted}
                          onChange={(e) => setLabFlagSubmitted(e.target.value)}
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none ${
                            theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
                          }`}
                          disabled={labSuccess}
                        />
                        <button
                          onClick={() => handleSubmitLabFlag(selectedLesson.lab!)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                          disabled={labSuccess}
                        >
                          Submit Flag
                        </button>
                      </div>

                      {labError && (
                        <p className="text-[10px] text-red-500 font-mono font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> {labError}
                        </p>
                      )}

                      {labSuccess && (
                        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-xs font-mono font-bold border border-emerald-500/20 flex items-center gap-2">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                          LAB RETRIEVED SUCCESSFULLY! Flag verified. +{selectedLesson.xp} XP added to SecOps profile.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL QUIZ PANEL */}
                {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-200/10">
                    <h3 className="text-xs font-black tracking-wider uppercase text-blue-500 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" /> Lesson Knowledge Audit
                    </h3>

                    <AcademyQuizEngine
                      questions={selectedLesson.quiz.map((q) => ({
                        id: q.id,
                        category: "Web Security",
                        type: "mcq",
                        question: q.question,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || "",
                        explanation: q.explanation || "No explanation provided."
                      }))}
                      onQuizCompleted={(score) => {
                        if (score >= 80 && selectedCourse && selectedLesson) {
                          onLessonComplete(selectedCourse.id, selectedLesson.id, selectedLesson.xp);
                        }
                      }}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className={`border rounded-2xl p-8 text-center space-y-4 ${
                theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
              }`}>
                <div className="mx-auto w-fit p-3.5 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    Syllabus Selection
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Select a training course lesson or simulated laboratory challenge in the syllabus panel to commence your SecOps study session.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
