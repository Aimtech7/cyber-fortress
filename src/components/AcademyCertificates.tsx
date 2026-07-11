import React, { useState } from "react";
import { Certificate } from "../types/academy";
import { 
  Award, 
  Clock, 
  User, 
  Bookmark, 
  ExternalLink, 
  X, 
  Printer, 
  ShieldCheck, 
  QrCode 
} from "lucide-react";

interface AcademyCertificatesProps {
  certificates: Certificate[];
  theme?: "light" | "dark";
}

export default function AcademyCertificates({
  certificates,
  theme = "light"
}: AcademyCertificatesProps) {
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="academy-certificates-view">
      
      {/* Overview Block */}
      <div className="space-y-1">
        <h2 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          SecOps Certifications Registry
        </h2>
        <p className="text-xs text-slate-500">
          Access and verify credentials awarded to you by the Cyber Fortress Security Board upon 100% course syllabus execution.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className={`border rounded-2xl p-10 text-center space-y-4 ${
          theme === "dark" ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="mx-auto w-fit p-3.5 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
              No Active Credentials Earned Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Complete all interactive lessons, quizzes, and laboratory challenges within any operational training course to generate a verifiable SecOps certificate.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div 
              key={cert.id}
              className={`border rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:shadow-lg transition ${
                theme === "dark" 
                  ? "bg-slate-900/40 border-slate-850" 
                  : "bg-white border-slate-200/80 shadow-sm"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500">{cert.verificationId}</span>
                </div>

                <h3 className={`text-sm font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {cert.courseName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Recipient: **{cert.studentName}** <br />
                  Issued Date: {cert.completedAt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/10 flex justify-between items-center">
                <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-wider">ACTIVE / VERIFIED</span>
                <button
                  onClick={() => setActiveCertificate(cert)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  View Blueprint <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Immersive Certificate Modal View */}
      {activeCertificate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl border rounded-2xl p-6 md:p-10 relative space-y-6 overflow-hidden ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"
          }`}>
            
            {/* Modal Controls */}
            <div className="flex justify-between items-center border-b border-slate-200/10 pb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">SecOps Clearance Certificate Verification Panel</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                  title="Print Certificate"
                >
                  <Printer className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setActiveCertificate(null)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500 hover:text-red-500 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* THE PRINTABLE CERTIFICATE CARD */}
            <div 
              className="border-8 border-slate-900 dark:border-slate-950 p-6 md:p-12 text-center space-y-8 relative overflow-hidden bg-white text-slate-900"
              style={{ minHeight: "450px" }}
              id="printable-certificate-canvas"
            >
              {/* Decorative secure grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

              {/* Secure corners decoration */}
              <div className="absolute top-2 left-2 border-t-2 border-l-2 border-slate-400 w-8 h-8" />
              <div className="absolute top-2 right-2 border-t-2 border-r-2 border-slate-400 w-8 h-8" />
              <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-slate-400 w-8 h-8" />
              <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-slate-400 w-8 h-8" />

              {/* Branding and logo */}
              <div className="space-y-1.5 z-10 relative">
                <div className="mx-auto w-fit p-2.5 rounded-full bg-blue-900 text-white">
                  <Award className="h-7 w-7" />
                </div>
                <h4 className="text-xs font-mono font-black tracking-widest text-slate-500 uppercase">CYBER FORTRESS DEFENSE</h4>
                <div className="h-0.5 w-24 bg-slate-300 mx-auto" />
              </div>

              {/* Main certificate header */}
              <div className="space-y-2 z-10 relative">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
                  CERTIFICATE OF COMPLETION
                </h2>
                <p className="text-xs text-slate-500 font-medium italic">
                  This secure validation ledger hereby certifies that
                </p>
              </div>

              {/* Recipient Name */}
              <div className="space-y-1 z-10 relative">
                <h1 className="text-xl md:text-2xl font-black text-blue-900 underline decoration-slate-300 decoration-1 underline-offset-8">
                  {activeCertificate.studentName}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium pt-1.5">
                  has completed the rigorous syllabus requirements and laboratory audits for:
                </p>
              </div>

              {/* Course Title */}
              <div className="z-10 relative">
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                  {activeCertificate.courseName}
                </h3>
                <span className="text-[9px] text-slate-400 block font-mono font-bold mt-1">
                  OFFICIAL CYBERSECURITY CLEARANCE MODULE
                </span>
              </div>

              {/* Verification and signature columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end z-10 relative">
                
                {/* QR validation */}
                <div className="flex flex-col items-center space-y-1">
                  <QrCode className="h-10 w-10 text-slate-800" />
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">Ledger verification QR</span>
                </div>

                {/* Date / Signature */}
                <div className="space-y-1 text-center">
                  <span className="font-mono text-[10px] text-slate-800 underline decoration-slate-300 underline-offset-4 font-bold">
                    {activeCertificate.completedAt}
                  </span>
                  <span className="text-[8px] font-sans font-bold text-slate-500 uppercase block border-t border-slate-200 pt-1">
                    Date of completion
                  </span>
                </div>

                {/* Instructor Sign */}
                <div className="space-y-1 text-center">
                  <span className="font-mono text-[9px] text-blue-900 italic font-black">
                    {activeCertificate.instructor}
                  </span>
                  <span className="text-[8px] font-sans font-bold text-slate-500 uppercase block border-t border-slate-200 pt-1">
                    Authorized Instructor
                  </span>
                </div>

              </div>

              {/* Cryptographic ID foot stamp */}
              <div className="text-[8px] font-mono text-slate-500 pt-4 z-10 relative">
                Certificate ID: {activeCertificate.verificationId} | Security hash status: OK | System level clearance authenticated.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
