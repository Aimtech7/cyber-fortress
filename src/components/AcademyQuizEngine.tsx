import React, { useState, useEffect } from "react";
import { QuizQuestionExtended } from "../types/learningEngine";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCw, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  Lightbulb, 
  Compass, 
  Terminal, 
  ShieldAlert, 
  Award,
  ArrowRight
} from "lucide-react";

interface AcademyQuizEngineProps {
  questions: QuizQuestionExtended[];
  onQuizCompleted: (score: number, xpEarned: number, coinsEarned: number) => void;
  theme?: "light" | "dark";
}

export default function AcademyQuizEngine({ 
  questions, 
  onQuizCompleted, 
  theme = "light" 
}: AcademyQuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  // For matching type
  const [matchingState, setMatchingState] = useState<{ [left: string]: string }>({});
  
  // For ordering type
  const [orderingState, setOrderingState] = useState<string[]>([]);

  // For fill-blank type
  const [blankInput, setBlankInput] = useState<string>("");

  const currentQuestion = questions[currentIdx];

  // Initialize specific states on question change
  useEffect(() => {
    if (!currentQuestion) return;
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setFeedbackMessage("");
    setBlankInput("");
    
    // Shuffle options if multiple choice or select
    if (currentQuestion.options) {
      setShuffledOptions([...currentQuestion.options]);
    }
    
    // Setup matching items
    if (currentQuestion.type === "matching" && currentQuestion.matchingLeft) {
      const initialMatching: { [key: string]: string } = {};
      currentQuestion.matchingLeft.forEach(left => {
        initialMatching[left] = "";
      });
      setMatchingState(initialMatching);
    }

    // Setup ordering items
    if (currentQuestion.type === "ordering" && currentQuestion.options) {
      // Shuffle the starting order so the user actually has to reorder them
      const randomized = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      setOrderingState(randomized);
    }
  }, [currentIdx, questions]);

  if (questions.length === 0) {
    return (
      <div className={`p-6 border rounded-2xl text-center ${theme === "dark" ? "bg-slate-900/40 border-slate-800 text-white" : "bg-white border-slate-200"}`}>
        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-sm">No Quiz Modules Available</h3>
        <p className="text-xs text-slate-500 mt-1">This training lesson does not contain any active audit questions.</p>
      </div>
    );
  }

  const handleMultipleSelectToggle = (option: string) => {
    if (isAnswered) return;
    const current = selectedAnswers[currentQuestion.id] || [];
    let updated;
    if (current.includes(option)) {
      updated = current.filter((o: string) => o !== option);
    } else {
      updated = [...current, option];
    }
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: updated });
  };

  const handleOrderMove = (index: number, direction: "up" | "down") => {
    if (isAnswered) return;
    const newOrder = [...orderingState];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setOrderingState(newOrder);
  };

  const evaluateQuestion = () => {
    if (isAnswered) return;
    
    let answerCorrect = false;

    if (currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false" || currentQuestion.type === "packet-analysis" || currentQuestion.type === "code-review" || currentQuestion.type === "scenario") {
      const userAns = selectedAnswers[currentQuestion.id];
      answerCorrect = userAns === currentQuestion.correctAnswer;
    } 
    else if (currentQuestion.type === "multiple-select") {
      const userAnsList: string[] = selectedAnswers[currentQuestion.id] || [];
      const correctList: string[] = currentQuestion.correctAnswer as string[];
      
      const matchAll = userAnsList.length === correctList.length && 
                       userAnsList.every(val => correctList.includes(val)) &&
                       correctList.every(val => userAnsList.includes(val));
      answerCorrect = matchAll;
    } 
    else if (currentQuestion.type === "fill-blank") {
      const cleanInput = blankInput.trim().toLowerCase();
      const cleanCorrect = (currentQuestion.correctAnswer as string).trim().toLowerCase();
      answerCorrect = cleanInput === cleanCorrect;
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: blankInput });
    } 
    else if (currentQuestion.type === "matching") {
      const correctMap = currentQuestion.correctAnswer as { [left: string]: string };
      let allMatch = true;
      Object.keys(correctMap).forEach(leftKey => {
        if (matchingState[leftKey] !== correctMap[leftKey]) {
          allMatch = false;
        }
      });
      answerCorrect = allMatch;
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: matchingState });
    } 
    else if (currentQuestion.type === "ordering") {
      const correctOrder = currentQuestion.correctAnswer as string[];
      let orderMatch = true;
      correctOrder.forEach((val, idx) => {
        if (orderingState[idx] !== val) {
          orderMatch = false;
        }
      });
      answerCorrect = orderMatch;
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: orderingState });
    }

    setIsCorrect(answerCorrect);
    setIsAnswered(true);
    
    if (answerCorrect) {
      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + 100);
      setFeedbackMessage("✓ Exploit Validated! Defensive clearance verified.");
    } else {
      setFeedbackMessage("⚠️ Exploit Terminated! Security audit failure.");
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate reward payouts
      const finalScorePercentage = Math.round((correctCount / questions.length) * 100);
      const xpReward = correctCount * 25; // 25 XP per correct answer
      const coinsReward = correctCount * 10; // 10 coins per correct answer
      
      setQuizFinished(true);
      onQuizCompleted(finalScorePercentage, xpReward, coinsReward);
    }
  };

  // Render question card
  return (
    <div className={`border rounded-2xl p-5 md:p-6 space-y-5 shadow-sm text-left ${
      theme === "dark" ? "bg-slate-900/40 border-slate-850 text-white" : "bg-white border-slate-200"
    }`} id="academy-quiz-container">
      
      {!quizFinished ? (
        <>
          {/* Header Track */}
          <div className="flex justify-between items-center border-b border-slate-200/10 pb-3">
            <span className="text-[10px] font-mono tracking-wider text-blue-500 uppercase font-bold">
              OPERATIONAL AUDIT: QUESTION {currentIdx + 1} OF {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${
                currentQuestion.type === "scenario" ? "bg-purple-500/10 text-purple-400" :
                currentQuestion.type === "code-review" ? "bg-yellow-500/10 text-yellow-400" :
                currentQuestion.type === "packet-analysis" ? "bg-red-500/10 text-red-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>
                {currentQuestion.type}
              </span>
              <button 
                onClick={() => setShowHint(!showHint)}
                className={`p-1.5 rounded-lg border transition ${
                  theme === "dark" 
                    ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                }`}
                title="Toggle Assist Hint"
              >
                <Lightbulb className={`h-3.5 w-3.5 ${showHint ? "text-amber-400 fill-amber-400/20" : ""}`} />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className={`text-base font-extrabold leading-snug tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              {currentQuestion.question}
            </h2>

            {/* Special Rendering: Code Block for Code Review */}
            {currentQuestion.type === "code-review" && currentQuestion.codeSnippet && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400/90 leading-relaxed shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase border-b border-slate-900 pb-2 mb-2 font-bold">
                  <span>📄 Vulnerable Script Block</span>
                  <Terminal className="h-3.5 w-3.5" />
                </div>
                <pre className="whitespace-pre-wrap">{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            {/* Special Rendering: Packet Dump for Packet Analysis */}
            {currentQuestion.type === "packet-analysis" && currentQuestion.packetDump && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-rose-400/90 leading-relaxed shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase border-b border-slate-900 pb-2 mb-2 font-bold">
                  <span>📡 Captured TCP Payload Dump</span>
                  <ShieldAlert className="h-3.5 w-3.5" />
                </div>
                <pre className="whitespace-pre-wrap">{currentQuestion.packetDump}</pre>
              </div>
            )}
          </div>

          {/* Answer Interaction Blocks */}
          <div className="space-y-3">
            {/* Multiple Choice & Scenario & Code-Review & Packet-Analysis */}
            {(currentQuestion.type === "multiple-choice" || 
              currentQuestion.type === "scenario" || 
              currentQuestion.type === "code-review" || 
              currentQuestion.type === "packet-analysis") && shuffledOptions.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt;
                const isCorrectOpt = opt === currentQuestion.correctAnswer;
                let btnStyle = theme === "dark"
                  ? "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-950";

                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold";
                  } else {
                    btnStyle = "opacity-40 border-transparent text-slate-500";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold shadow-md";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: opt })}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="flex-1 pr-3">{opt}</span>
                    {isAnswered && isCorrectOpt && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                  </button>
                );
            })}

            {/* True/False Buttons */}
            {currentQuestion.type === "true-false" && (
              <div className="grid grid-cols-2 gap-4">
                {["True", "False"].map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt;
                  const isCorrectOpt = opt === currentQuestion.correctAnswer;
                  let btnStyle = theme === "dark"
                    ? "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";

                  if (isAnswered) {
                    if (isCorrectOpt) {
                      btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-extrabold";
                    } else {
                      btnStyle = "opacity-40 border-transparent text-slate-500";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold";
                  }

                  return (
                    <button
                      key={opt}
                      disabled={isAnswered}
                      onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: opt })}
                      className={`text-center py-4 rounded-xl border text-xs font-bold transition cursor-pointer ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multiple Select Checkboxes */}
            {currentQuestion.type === "multiple-select" && shuffledOptions.map((opt, idx) => {
              const userAnsList = selectedAnswers[currentQuestion.id] || [];
              const isSelected = userAnsList.includes(opt);
              const isCorrectOpt = (currentQuestion.correctAnswer as string[]).includes(opt);
              let boxStyle = theme === "dark"
                ? "bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-300"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";

              if (isAnswered) {
                if (isCorrectOpt) {
                  boxStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold";
                } else if (isSelected) {
                  boxStyle = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-semibold";
                } else {
                  boxStyle = "opacity-40 border-transparent text-slate-500";
                }
              } else if (isSelected) {
                boxStyle = "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold shadow-md";
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleMultipleSelectToggle(opt)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold leading-relaxed transition-all cursor-pointer flex items-center gap-3 ${boxStyle}`}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-blue-600 border-blue-500 text-white" : "border-slate-500"
                  }`}>
                    {isSelected && <span className="text-[10px] font-black">✓</span>}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}

            {/* Fill-in-the-Blank Single Text Input */}
            {currentQuestion.type === "fill-blank" && (
              <div className="space-y-2">
                <input
                  type="text"
                  disabled={isAnswered}
                  value={blankInput}
                  onChange={(e) => setBlankInput(e.target.value)}
                  placeholder="Type your security response keyword here..."
                  className={`w-full p-3.5 rounded-xl border text-xs font-mono transition outline-none ${
                    theme === "dark" 
                      ? "bg-slate-950/40 border-slate-800 text-white focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && blankInput.trim()) {
                      evaluateQuestion();
                    }
                  }}
                />
                {isAnswered && (
                  <div className="text-xs font-mono font-bold text-slate-400">
                    Correct Answer: <span className="text-emerald-400 font-black">{currentQuestion.correctAnswer}</span>
                  </div>
                )}
              </div>
            )}

            {/* Column Matching */}
            {currentQuestion.type === "matching" && currentQuestion.matchingLeft && currentQuestion.matchingRight && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 border-b border-slate-200/10 pb-1 uppercase font-mono">
                  <span>Risk Parameter</span>
                  <span>Defensive Remediation Patch</span>
                </div>
                
                {currentQuestion.matchingLeft.map((leftItem) => {
                  const correctMap = currentQuestion.correctAnswer as { [key: string]: string };
                  const selectedVal = matchingState[leftItem];
                  const isRowCorrect = selectedVal === correctMap[leftItem];
                  
                  let selectStyle = theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-250 text-slate-700";

                  if (isAnswered) {
                    if (isRowCorrect) {
                      selectStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold";
                    } else {
                      selectStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400 font-extrabold";
                    }
                  }

                  return (
                    <div key={leftItem} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        {leftItem}
                      </span>
                      <select
                        disabled={isAnswered}
                        value={selectedVal}
                        onChange={(e) => setMatchingState({ ...matchingState, [leftItem]: e.target.value })}
                        className={`p-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${selectStyle}`}
                      >
                        <option value="">-- Choose Solution Patch --</option>
                        {currentQuestion.matchingRight?.map(rightOpt => (
                          <option key={rightOpt} value={rightOpt}>{rightOpt}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List Ordering */}
            {currentQuestion.type === "ordering" && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-1">
                  Adjust order using control keys to position sequence (first step at the top):
                </p>
                {orderingState.map((opt, index) => {
                  const isCorrectOrder = (currentQuestion.correctAnswer as string[])[index] === opt;
                  let cardStyle = theme === "dark"
                    ? "bg-slate-950/40 border-slate-850 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700";

                  if (isAnswered) {
                    if (isCorrectOrder) {
                      cardStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                    } else {
                      cardStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold";
                    }
                  }

                  return (
                    <div key={opt} className={`p-3 rounded-xl border text-xs flex justify-between items-center transition ${cardStyle}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-black text-slate-500">#{index + 1}</span>
                        <span className="font-semibold leading-relaxed">{opt}</span>
                      </div>
                      
                      {!isAnswered && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOrderMove(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderMove(index, "down")}
                            disabled={index === orderingState.length - 1}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {isAnswered && (
                  <div className="space-y-1 font-mono text-[10px] pt-1">
                    <span className="text-slate-500 font-bold block uppercase">Correct sequence:</span>
                    {(currentQuestion.correctAnswer as string[]).map((val, idx) => (
                      <div key={idx} className="text-emerald-400 font-bold">
                        {idx + 1}. {val}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hint Overlay Card */}
          {showHint && currentQuestion.hint && (
            <div className={`p-4 rounded-xl border flex gap-3 animate-fade-in ${
              theme === "dark" ? "bg-amber-950/20 border-amber-900/40 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-900"
            }`}>
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 animate-bounce" />
              <div className="space-y-1 text-xs">
                <span className="font-bold block font-mono text-[10px] uppercase">AI Mentor Clue</span>
                <p className="leading-relaxed">{currentQuestion.hint}</p>
              </div>
            </div>
          )}

          {/* Explanatory Feedback Block */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border space-y-2 animate-fade-in ${
              isCorrect 
                ? theme === "dark" ? "bg-emerald-950/10 border-emerald-900/40" : "bg-emerald-50 border-emerald-100" 
                : theme === "dark" ? "bg-rose-950/10 border-rose-900/40" : "bg-rose-50 border-rose-100"
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold font-mono">
                {isCorrect ? (
                  <span className="text-emerald-500 flex items-center gap-1.5 uppercase font-black">
                    <CheckCircle className="h-4 w-4" /> EXPLOIT APPROVED
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1.5 uppercase font-black">
                    <XCircle className="h-4 w-4" /> THREAT DETECTED
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Nav Controls Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200/10">
            <div>
              {feedbackMessage && (
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCorrect ? "text-emerald-500" : "text-rose-500"}`}>
                  {feedbackMessage}
                </span>
              )}
            </div>
            
            {!isAnswered ? (
              <button
                onClick={evaluateQuestion}
                disabled={
                  (currentQuestion.type === "multiple-choice" && !selectedAnswers[currentQuestion.id]) ||
                  (currentQuestion.type === "scenario" && !selectedAnswers[currentQuestion.id]) ||
                  (currentQuestion.type === "code-review" && !selectedAnswers[currentQuestion.id]) ||
                  (currentQuestion.type === "packet-analysis" && !selectedAnswers[currentQuestion.id]) ||
                  (currentQuestion.type === "true-false" && !selectedAnswers[currentQuestion.id]) ||
                  (currentQuestion.type === "multiple-select" && (!selectedAnswers[currentQuestion.id] || selectedAnswers[currentQuestion.id].length === 0)) ||
                  (currentQuestion.type === "fill-blank" && !blankInput.trim()) ||
                  (currentQuestion.type === "matching" && Object.values(matchingState).some(v => v === ""))
                }
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-800 disabled:opacity-40 disabled:text-slate-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                Validate Exploit Payload <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                {currentIdx + 1 < questions.length ? "Proceed to Next Audit" : "Commit Audit Dossier"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </>
      ) : (
        /* Final Completion Splash */
        <div className="text-center py-8 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-25 animate-pulse" />
            <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center border-2 ${
              theme === "dark" ? "bg-slate-950 border-blue-500/50 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"
            }`}>
              <Award className="h-8 w-8 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              AUDIT COMPLETED SEC SUCCESSFULLY
            </span>
            <h2 className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
              Clearance Diagnostic Concluded
            </h2>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Your defensive payload has been analyzed and stored in the Academy ledger. Your results have updated your clearance credentials.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
            <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-lg font-black block ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                {correctCount} / {questions.length}
              </span>
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Solved</span>
            </div>
            <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-lg font-black text-blue-500 block">
                +{correctCount * 25} XP
              </span>
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Awarded</span>
            </div>
            <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-lg font-black text-amber-500 block">
                +{correctCount * 10}
              </span>
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Coins</span>
            </div>
          </div>

          <div className="pt-4 max-w-xs mx-auto">
            <button
              onClick={() => {
                // Restart
                setCurrentIdx(0);
                setQuizFinished(false);
                setScore(0);
                setCorrectCount(0);
                setSelectedAnswers({});
              }}
              className={`w-full text-center py-2.5 border rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                theme === "dark" 
                  ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <RotateCw className="h-3.5 w-3.5" /> Re-Run Clearance Diagnostic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
