import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Send, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  ChevronRight, 
  Radio, 
  Cpu,
  BookOpen,
  Info
} from "lucide-react";
import { ChatMessage } from "../types";

interface AiAssistantProps {
  initialPromptContext: string;
  onClearContext: () => void;
  theme?: "light" | "dark";
}

export default function AiAssistant({ initialPromptContext, onClearContext, theme = "light" }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "Hello. I am the Cyber Fortress SecOps assistant. I can help audit configurations, explain CVE vulnerabilities, hunt threat logs for indicators of compromise, and write secure defensive scripts (Blue Teaming).\n\nWhat cybersecurity matter can I assist you with today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    {
      title: "Explain CVE-2024-3094",
      prompt: "Can you explain the CVE-2024-3094 vulnerability in XZ Utils, how it works, and how to verify if our servers are affected?"
    },
    {
      title: "Secure Nginx Config",
      prompt: "Provide a secure, production-ready Nginx configuration block that enforces HSTS, prevents clickjacking, sets a secure CSP, and disables deprecated TLS versions."
    },
    {
      title: "Analyze Threat Log",
      prompt: "Analyze this log snip for indicators of compromise: '192.168.1.100 - - [10/Jul/2026:14:02:11 +0000] \"GET /admin/db_backup.sql HTTP/1.1\" 200 45892 \"-\" \"curl/7.68.0\"'"
    }
  ];

  // Load context from other screens (e.g. WebScanner Explain finding)
  useEffect(() => {
    if (initialPromptContext) {
      setInputValue(initialPromptContext);
      onClearContext(); // clear it from parent state so it doesn't trigger repeatedly
    }
  }, [initialPromptContext]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 11)}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputValue("");
    setIsLoading(true);

    try {
      // Map messages for the server
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with Cyber Fortress secure AI backend.");
      }

      const data = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Math.random().toString(36).substring(2, 11)}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Math.random().toString(36).substring(2, 11)}`,
        role: "assistant",
        content: `⚠️ Error: ${err.message || "An unknown issue disrupted the SecOps intelligence loop. Please verify connection."}`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "init-1",
        role: "assistant",
        content: "Session memory flushed. Ready for new cybersecurity inquiries and defensive audits.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  return (
    <div className="space-y-8 text-left" id="ai-assistant-view">
      {/* Header */}
      <div className={`pb-6 border-b ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
        <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"} flex items-center gap-2.5`}>
          <Sparkles className="h-5.5 w-5.5 text-blue-500 animate-pulse shrink-0" />
          AI Cyber Assistant & Security Analyst
        </h1>
        <p className={`text-xs md:text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          Interact with a secure local-proxied SecOps intelligence assistant trained in threat analysis, policy creation, and code hardening.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Col: Prompt Playbooks & Quick Actions */}
        <div className={`${getCardClasses()} space-y-5 lg:col-span-1 h-full flex flex-col justify-between`}>
          <div className="space-y-4">
            <h3 className={`text-xs uppercase font-bold tracking-wider font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Defensive Playbooks
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Select a playbook macro below to immediately load a secure response model template:
            </p>

            <div className="space-y-3 pt-1">
              {quickPrompts.map((p, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isLoading}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-start gap-2.5 cursor-pointer disabled:opacity-50 ${
                    theme === "dark"
                      ? "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 hover:shadow-sm"
                  }`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className={`font-bold block ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{p.title}</strong>
                    <p className="text-slate-400 text-[10px] line-clamp-1">{p.prompt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`border-t pt-4 mt-6 space-y-2 text-xs font-mono font-semibold ${
            theme === "dark" ? "border-slate-850/80 text-slate-500" : "border-slate-100 text-slate-500"
          }`}>
            <span className="text-slate-400 uppercase font-bold tracking-wider text-[9px] block">Assistant parameters:</span>
            <div className="flex items-center gap-1.5"><Radio className="h-4 w-4 text-blue-500 animate-pulse shrink-0" /> Model: gemini-2.5-flash</div>
            <div className="flex items-center gap-1.5"><Cpu className="h-4 w-4 text-blue-500 shrink-0" /> Temperature: 0.2 (Analytic)</div>
            <div className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-blue-500 shrink-0" /> Grounding: Enabled</div>
          </div>
        </div>

        {/* Right 3 Cols: Active Chat Terminal UI */}
        <div className={`lg:col-span-3 border rounded-2xl flex flex-col overflow-hidden h-[580px] justify-between ${
          theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          
          {/* Active Status bar */}
          <div className={`px-4 py-3 border-b flex justify-between items-center ${
            theme === "dark" ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-200/60"
          }`}>
            <span className={`text-xs font-mono font-bold flex items-center gap-2 ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}>
              <Terminal className="h-4 w-4 text-blue-500 animate-pulse" />
              SECURE SECOPS_TERM_SESSION_01
            </span>
            
            <button
              onClick={handleClearHistory}
              className="text-slate-400 hover:text-red-500 font-mono text-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Clear Session Memory"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Flush Memory
            </button>
          </div>

          {/* Messages list */}
          <div className={`flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin ${
            theme === "dark" ? "bg-slate-950/20" : "bg-slate-50/20"
          }`}>
            {messages.map((m) => {
              const isAssistant = m.role === "assistant" || m.role === "model";
              return (
                <div 
                  key={m.id} 
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4.5 space-y-2.5 relative border text-left ${
                    isAssistant 
                      ? theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200" 
                        : "bg-white border-slate-200 text-slate-800 shadow-sm"
                      : theme === "dark"
                        ? "bg-blue-950/20 border-blue-900/40 text-slate-100"
                        : "bg-blue-50 border-blue-100 text-slate-900"
                  }`}>
                    {/* Role Header */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                      <span>{isAssistant ? "CYBER FORTRESS SEC_AGENT" : "USER_OPERATOR"}</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {/* Content (Render preformatted text safely for secure configs) */}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans select-text">
                      {m.content}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start text-left">
                <div className={`border rounded-2xl p-4 flex items-center gap-3 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"
                }`}>
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-mono text-blue-500 font-bold animate-pulse">Agent is auditing payload criteria...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Sender block */}
          <div className={`p-4 border-t ${
            theme === "dark" ? "bg-slate-900/50 border-slate-850" : "bg-white border-slate-100"
          }`}>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Ask me to audit an exploit, analyze a log snippet, or write a policy..."
                className={`flex-1 border rounded-xl p-3 text-xs outline-none font-mono transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                    : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                }`}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`px-4.5 rounded-xl text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isLoading || !inputValue.trim()
                    ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg hover:shadow-blue-500/10"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Analyze
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
