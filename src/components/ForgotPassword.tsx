import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, ToastData } from "./Toast";
import { 
  Shield, 
  Mail, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  LockKeyhole,
  Info
} from "lucide-react";

// Schema for Forgot Password Validation
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Security email is required." })
    .email({ message: "Please provide a valid corporate email format (e.g. analyst@cyberfortress.com)." })
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  theme?: "light" | "dark";
}

export default function ForgotPassword({ onBackToLogin, theme = "light" }: ForgotPasswordProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<{
    message: string;
    resetToken: string;
    instructions: string;
  } | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange" // Ensures real-time validation as requested
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError(null);
    setSuccessResponse(null);

    try {
      // 1. Invoke Firebase Auth password reset pipeline
      await sendPasswordResetEmail(auth, values.email);

      // 2. Add Audit Log entry to Firestore
      const logId = `log-${Math.random().toString(36).substr(2, 9)}`;
      try {
        await setDoc(doc(db, "auditLogs", logId), {
          id: logId,
          userId: "anonymous",
          userEmail: values.email.toLowerCase(),
          action: "Password Reset Requested",
          details: `Recovery transmission triggered for email: ${values.email.toLowerCase()}`,
          status: "Success",
          timestamp: new Date().toISOString()
        });
      } catch (logErr) {
        console.error("Audit log creation failure on forgot password:", logErr);
      }

      setSuccessResponse({
        message: "A cryptographically secure password reset token has been dispatched to your corporate inbox via Firebase.",
        resetToken: "firebase-automated-recovery-flow",
        instructions: "Please click the link inside the automated email dispatch to re-verify your authorization credentials."
      });
      
      // Trigger a success toast notification
      addToast("Password reset email successfully dispatched via Firebase!", "success");
      reset(); // Clear form on success
    } catch (err: any) {
      const errMsg = err.message || "An exception occurred while processing the reset request.";
      setApiError(errMsg);
      // Trigger an error toast notification
      addToast(errMsg, "error");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-16 animate-fade-in" id="forgot-password-view">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onClose={removeToast} theme={theme} />

      <div className={`border rounded-2xl p-7 space-y-6 relative overflow-hidden shadow-xl transition-all ${
        theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200/80 shadow-slate-200/30"
      }`}>
        {/* Visual outline decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
        
        {/* Header content */}
        <div className="text-center space-y-3">
          <div className={`p-3 rounded-xl border w-fit mx-auto ${
            theme === "dark" ? "bg-blue-950/40 border-blue-900/40 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
          }`}>
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
            Forgot Clearance Password?
          </h2>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Request a secure cryptographic recovery link to regain control of your SecOps terminal session
          </p>
        </div>

        {/* Success Alert Banner */}
        {successResponse && (
          <div className={`border p-4 rounded-xl space-y-3 text-xs leading-relaxed ${
            theme === "dark" ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-800"
          }`}>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm mb-1">Authorization Instructions Emitted</strong>
                <span>{successResponse.message}</span>
              </div>
            </div>
            
            {/* Display Simulated Reset Key Token Link for sandbox purposes */}
            <div className={`p-3 rounded-lg border font-mono text-[10px] space-y-2 mt-2 leading-relaxed ${
              theme === "dark" ? "bg-slate-950/60 border-slate-850/80" : "bg-white border-slate-200/80"
            }`}>
              <div className="text-blue-500 font-bold uppercase tracking-wider">SECURE SANDBOX LINK:</div>
              <div className="break-all font-semibold select-all text-slate-400">
                {window.location.origin}/?token={successResponse.resetToken}
              </div>
              <div className="text-[9px] text-slate-500">
                {successResponse.instructions}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {apiError && (
          <div className={`border p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono leading-relaxed ${
            theme === "dark" ? "bg-red-950/20 border-red-900/30 text-red-400" : "bg-red-50 border-red-100 text-red-600"
          }`}>
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Container */}
        {!successResponse && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-semibold block uppercase tracking-wider ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>
                Security Email Address
              </label>
              
              <div className="relative">
                <input
                  type="email"
                  placeholder="analyst@cyberfortress.com"
                  {...register("email")}
                  className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                      : theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                        : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
                  }`}
                  disabled={isSubmitting}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>

              {/* Validation Error Message */}
              {errors.email && (
                <p className="text-[10px] text-red-500 font-semibold font-mono flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer flex justify-center items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Emitting Security Signals...
                </>
              ) : (
                "Issue Password Reset Instructions"
              )}
            </button>
          </form>
        )}

        {/* Demonstration clearance hints to make sandbox usable */}
        <div className={`p-3.5 rounded-xl border text-[11px] font-mono leading-normal text-left space-y-1.5 ${
          theme === "dark" ? "bg-slate-950/60 border-slate-850 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-600"
        }`}>
          <span className="text-blue-500 font-bold flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> Core Database Registry Check:
          </span>
          <p className="text-[10px] text-slate-500">
            Submit registered accounts like <strong className={theme === "dark" ? "text-slate-300" : "text-slate-800"}>analyst@cyberfortress.com</strong> to verify database-bound lookup and audit log creation.
          </p>
        </div>

        {/* Back to Login Option */}
        <div className="text-center pt-2 border-t border-slate-200/10">
          <button
            type="button"
            onClick={onBackToLogin}
            className={`text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 mx-auto transition-colors ${
              theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Active Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
