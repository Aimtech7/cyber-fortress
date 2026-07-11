import React, { useState } from "react";
import { 
  Lock, 
  Key, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Plus,
  FolderOpen,
  PlusCircle,
  FolderKey,
  ShieldAlert,
  Sliders,
  Info
} from "lucide-react";
import { PasswordVaultItem } from "../types";

interface PasswordVaultProps {
  vault: PasswordVaultItem[];
  onAddVaultItem: (item: Partial<PasswordVaultItem>) => Promise<PasswordVaultItem>;
  onDeleteVaultItem: (id: string) => Promise<void>;
  theme?: "light" | "dark";
}

export default function PasswordVault({ vault, onAddVaultItem, onDeleteVaultItem, theme = "light" }: PasswordVaultProps) {
  // Vault Form State
  const [newTitle, setNewTitle] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Generator State
  const [genLength, setGenLength] = useState(16);
  const [genLower, setGenLower] = useState(true);
  const [genUpper, setGenUpper] = useState(true);
  const [genNumber, setGenNumber] = useState(true);
  const [genSymbol, setGenSymbol] = useState(true);
  const [generatedPass, setGeneratedPass] = useState("");

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [formStrength, setFormStrength] = useState<"Strong" | "Medium" | "Weak">("Weak");
  const [entropyScore, setEntropyScore] = useState(0);

  // Generate random password
  const handleGenerate = () => {
    let charset = "";
    if (genLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (genUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (genNumber) charset += "0123456789";
    if (genSymbol) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (!charset) {
      alert("Please select at least one character parameter set.");
      return;
    }

    let result = "";
    for (let i = 0; i < genLength; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPass(result);
    setNewPassword(result);
    calculateStrength(result);
  };

  // Analyze password entropy and complexity
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 15;
    if (pass.length >= 12) score += 15;
    if (pass.length >= 16) score += 15;
    if (/[a-z]/.test(pass)) score += 10;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;

    setEntropyScore(score);

    if (score >= 70) {
      setFormStrength("Strong");
    } else if (score >= 40) {
      setFormStrength("Medium");
    } else {
      setFormStrength("Weak");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    calculateStrength(val);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUsername || !newPassword) return;

    try {
      await onAddVaultItem({
        title: newTitle,
        username: newUsername,
        password: newPassword,
        url: newUrl,
        notes: newNotes,
        strength: formStrength
      });

      // Reset
      setNewTitle("");
      setNewUsername("");
      setNewPassword("");
      setNewUrl("");
      setNewNotes("");
      setFormStrength("Weak");
      setEntropyScore(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  return (
    <div className="space-y-8 text-left" id="password-center-view">
      {/* Header */}
      <div className={`pb-6 border-b ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
        <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"} flex items-center gap-2.5`}>
          <Lock className="h-5.5 w-5.5 text-blue-500 shrink-0" />
          Credential Vault & Password Security Center
        </h1>
        <p className={`text-xs md:text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          Generate high-entropy password structures, analyze credentials strength, and manage corporate logins in a secure isolated storage container.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 2 Cols: Password Generator & Save form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Save Credentials */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              Store Credentials Entry
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Vault Title / System Resource</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Primary Production Database, SSH Jump Host"
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Username / Role ID</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. root, aws_iam_audit"
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Resource URL (Optional)</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://aws.amazon.com"
                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Secret Password / Key String</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter custom password or generate below..."
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none font-mono transition-all ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  required
                />
                
                {/* Entropy indicator bar */}
                {newPassword && (
                  <div className="space-y-2 mt-3.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500 font-bold uppercase">ENTROPY STRENGTH:</span>
                      <span className={`font-bold ${formStrength === "Strong" ? "text-emerald-500" : formStrength === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                        {formStrength.toUpperCase()} ({entropyScore}/100)
                      </span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-slate-950" : "bg-slate-100"}`}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          formStrength === "Strong" ? "bg-emerald-500" : formStrength === "Medium" ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${entropyScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-sans">Vault Notes / Rotation Policy</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Rotation calendar policies or secret deployment paths..."
                  rows={2}
                  className={`w-full border rounded-xl p-2.5 text-xs outline-none transition-all resize-none ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                      : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              >
                Encrypt & Save in Vault
              </button>
            </form>
          </div>

          {/* Section: Random Password Generator */}
          <div className={`${getCardClasses()} space-y-4`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              <Key className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              Cryptographic Password Generator
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Character length:</span>
                  <span className="text-blue-500 font-bold">{genLength} chars</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={genLength}
                  onChange={(e) => setGenLength(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: "lower", label: "Lowercase (a-z)", checked: genLower, onChange: setGenLower },
                  { id: "upper", label: "Uppercase (A-Z)", checked: genUpper, onChange: setGenUpper },
                  { id: "number", label: "Numbers (0-9)", checked: genNumber, onChange: setGenNumber },
                  { id: "symbol", label: "Symbols (!@#)", checked: genSymbol, onChange: setGenSymbol }
                ].map((option) => (
                  <label 
                    key={option.id} 
                    className={`flex items-center gap-2 border p-2 rounded-lg cursor-pointer font-sans text-[11px] font-semibold transition ${
                      theme === "dark"
                        ? "bg-slate-950/40 border-slate-800 text-slate-300"
                        : "bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={option.checked} 
                      onChange={(e) => option.onChange(e.target.checked)} 
                      className="accent-blue-600 h-3.5 w-3.5 rounded border-slate-300" 
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className={`w-full font-bold text-xs py-2.5 rounded-xl transition cursor-pointer border ${
                  theme === "dark"
                    ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/60"
                }`}
              >
                Generate Password Sequence
              </button>

              {generatedPass && (
                <div className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 font-mono text-xs ${
                  theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className="text-emerald-600 font-bold select-all truncate">{generatedPass}</span>
                  <button
                    onClick={() => handleCopy(generatedPass, "gen")}
                    className={`p-1.5 rounded transition ${
                      theme === "dark" ? "bg-slate-900 hover:bg-slate-800 text-slate-400" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 shadow-sm"
                    }`}
                  >
                    {copiedId === "gen" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 3 Cols: Secure Password Vault Database */}
        <div className={`lg:col-span-3 space-y-4 ${getCardClasses()}`}>
          <div className="flex justify-between items-center border-b pb-3 text-left">
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                <FolderOpen className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                Active Encrypted Vault Entries
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Isolated credentials state, AES decrypted on client demand</p>
            </div>

            <span className={`border font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
              theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-600"
            }`}>
              {vault.length} Stored Logins
            </span>
          </div>

          <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
            {vault.map((item) => {
              const isRevealed = revealedIds.includes(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-xl p-4.5 space-y-3.5 transition text-left ${
                    theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:bg-slate-950" : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{item.title}</h4>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="text-[10px] text-blue-500 font-mono hover:underline truncate max-w-[200px] block mt-1"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.strength === "Strong" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : item.strength === "Medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {item.strength}
                    </span>
                  </div>

                  {/* Username and Secret Row */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl border font-mono text-xs ${
                    theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/60 shadow-sm"
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Username ID:</span>
                      <span className={`font-bold select-all block mt-1 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{item.username}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200/60 pt-3 md:pt-0 md:pl-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Password Secret:</span>
                        <span className={`font-bold block mt-1 ${theme === "dark" ? "text-slate-200" : "text-slate-850"}`}>
                          {isRevealed ? item.password : "••••••••••••"}
                        </span>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className={`p-1.5 rounded transition border ${
                            theme === "dark" ? "bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500 shadow-sm"
                          }`}
                          title={isRevealed ? "Hide Password" : "Reveal Password"}
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(item.password || "", item.id)}
                          className={`p-1.5 rounded transition border ${
                            theme === "dark" ? "bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500 shadow-sm"
                          }`}
                          title="Copy Password"
                        >
                          {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div className={`p-3 rounded-xl border text-xs leading-normal ${
                      theme === "dark" ? "bg-slate-900/20 border-slate-850" : "bg-white border-slate-200/50"
                    }`}>
                      <strong className="text-[9px] text-slate-400 font-mono block uppercase font-bold tracking-wider">Rotation Policy notes:</strong>
                      <p className={`mt-1 text-[11px] ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>{item.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Vault record: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onDeleteVaultItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove login
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
