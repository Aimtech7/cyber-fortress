import React, { useState, useRef, useEffect } from "react";
import { UserAcademyProfile } from "../types/academy";
import { 
  Sparkles, 
  Send, 
  User, 
  RefreshCw, 
  GraduationCap, 
  HelpCircle,
  Code,
  Terminal,
  Clock,
  ShieldCheck
} from "lucide-react";

interface AcademyAIMentorProps {
  profile: UserAcademyProfile;
  userId: string;
  theme?: "light" | "dark";
}

interface Message {
  role: "user" | "assistant" | "model";
  content: string;
}

export default function AcademyAIMentor({
  profile,
  userId,
  theme = "light"
}: AcademyAIMentorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Greetings, Security Practitioner. I am the Cyber Fortress Academy AI Mentor.

I am configured with advanced defensive models to:
- Explain complex security topics (SUID privilege esc, SQL concatenation, same-origin limits, etc.).
- Suggest hardening shell commands, scripting configurations, and secure coding patterns.
- Guide you through CTFs and Labs **without directly leaking flags or solutions**.

What security concept or lab challenge would you like to audit today?`
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    const updatedMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/academy/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: updatedMessages
        })
      });

      if (!res.ok) {
        throw new Error("Unable to contact AI Mentor gateway.");
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: `⚠️ [SecOps Signal Loss] Unable to synchronize with AI Mentor systems. Check your console connections or try again shortly.` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content: `Operational logs cleared. Let's start fresh. Which cybersecurity concept or lab can I guide you through?`
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left" id="academy-ai-mentor-view">
      
      {/* Sidebar Guidance Tips */}
      <div className="lg:col-span-4 space-y-4">
        <div className={`border rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between ${
          theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className={`text-sm font-extrabold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                <GraduationCap className="h-5 w-5 text-purple-500" /> Operational Mentor HUD
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ask specific questions to accelerate your SecOps level. The AI is trained to instruct rather than provide direct exploits.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wider uppercase block">Example Scenarios</span>
              {[
                "How does SQL Injection work under PostgreSQL query parsers?",
                "Give me secure code configurations to remediate session XSS vulnerabilities.",
                "Explain how a SUID file escalation operates on a hardened Linux server."
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(query)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold leading-relaxed transition-all cursor-pointer ${
                    theme === "dark" 
                      ? "bg-slate-950/60 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white" 
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className={`w-full text-center py-2.5 border rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              theme === "dark" 
                ? "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Purge Chat Ledger
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-8 flex flex-col h-[520px] justify-between">
        <div className={`border rounded-2xl flex-1 flex flex-col overflow-hidden relative ${
          theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200 shadow-sm"
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/10 flex justify-between items-center bg-slate-950/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <span className={`text-xs font-black block leading-none ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  AI Mentor Engine v3.1
                </span>
                <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase mt-1">Sovereign Training Node</span>
              </div>
            </div>

            <span className="text-[9px] text-emerald-500 font-mono font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
              <ShieldCheck className="h-3 w-3" /> Online
            </span>
          </div>

          {/* Messages Buffer */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant" || m.role === "model";
              return (
                <div 
                  key={idx}
                  className={`flex gap-3.5 items-start ${isAi ? "" : "flex-row-reverse"}`}
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${
                    isAi 
                      ? "bg-purple-600/10 border-purple-500/20 text-purple-400" 
                      : "bg-blue-600/10 border-blue-500/20 text-blue-500"
                  }`}>
                    {isAi ? <Sparkles className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed max-w-[80%] space-y-3 font-medium whitespace-pre-wrap ${
                    isAi 
                      ? theme === "dark" 
                        ? "bg-slate-900/60 border-slate-850 text-slate-300" 
                        : "bg-slate-50/50 border-slate-100 text-slate-800"
                      : "bg-blue-600 text-white border-transparent"
                  }`}>
                    {m.content.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return <h3 key={pIdx} className={`text-sm font-extrabold pt-1 ${isAi ? "text-purple-400" : "text-white"}`}>{para.replace("###", "").trim()}</h3>;
                      }
                      if (para.startsWith("- ") || para.startsWith("* ")) {
                        return (
                          <ul key={pIdx} className="list-disc pl-4 space-y-1">
                            {para.split("\n").map((li, lIdx) => (
                              <li key={lIdx}>{li.replace(/^[\s-*]+/, "")}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={pIdx}>{para}</p>;
                    })}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl border bg-purple-600/10 border-purple-500/20 text-purple-400 shrink-0">
                  <Sparkles className="h-4.5 w-4.5 animate-spin" />
                </div>
                <div className={`p-4 rounded-2xl border text-xs font-mono font-bold animate-pulse text-purple-400 ${
                  theme === "dark" ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  SEC_MENTOR_DECRYPTING: Fetching pedagogical guidelines...
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/10 bg-slate-950/5 flex gap-2.5">
            <input
              type="text"
              placeholder="Query cyber concepts, request secure config code..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs outline-none ${
                theme === "dark" ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-300"
              }`}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 shrink-0"
              disabled={loading || !inputValue.trim()}
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
