import React, { useState } from "react";
import { 
  Terminal, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter
} from "lucide-react";
import { AuditLog } from "../types";

interface AuditLogsProps {
  logs: AuditLog[];
  theme?: "light" | "dark";
}

export default function AuditLogs({ logs, theme = "light" }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filter logs based on search and status
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "ALL" || 
      log.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Export logs to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Timestamp,Operator,Action,Details,Status\n";

    filteredLogs.forEach((log) => {
      const row = [
        log.id,
        log.timestamp,
        log.userEmail,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.details.replace(/"/g, '""')}"`,
        log.status
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cyber_fortress_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export logs to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyber_fortress_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const getCardClasses = () => {
    return theme === "dark"
      ? "bg-slate-900/40 border-slate-900 p-6 rounded-2xl border"
      : "bg-white border-slate-200/80 p-6 rounded-2xl border shadow-sm";
  };

  return (
    <div className="space-y-8 text-left" id="audit-trail-view">
      {/* Header */}
      <div className={`pb-6 border-b ${theme === "dark" ? "border-slate-900" : "border-slate-200/80"}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"} flex items-center gap-2.5`}>
              <Terminal className="h-5.5 w-5.5 text-blue-500 shrink-0" />
              SaaS Compliance Audit Logs
            </h1>
            <p className={`text-xs md:text-sm mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              Inspect absolute administrative records, security scan events, credential edits, and authorization trails for corporate audits.
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-sm"
              }`}
              title="Export as CSV sheet"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-sm"
              }`}
              title="Export as raw JSON payload"
            >
              <FileCode className="h-4 w-4 text-blue-500" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 flex flex-col lg:flex-row gap-4 justify-between items-center rounded-2xl border ${
        theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        
        <div className="relative w-full lg:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, operator email, IP, or details..."
            className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none font-mono transition-all ${
              theme === "dark" 
                ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500" 
                : "bg-white border-slate-200 text-slate-950 focus:border-blue-500 focus:shadow-sm"
            }`}
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400 hidden lg:inline shrink-0" />
          <span className="text-xs text-slate-400 hidden lg:inline font-mono">Status criteria:</span>
          
          <div className={`p-1 rounded-xl border flex w-full lg:w-auto ${
            theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-100 border-slate-200/60"
          }`}>
            {["ALL", "SUCCESS", "WARNING", "FAILURE"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex-1 lg:flex-none ${
                  statusFilter === status
                    ? theme === "dark"
                      ? "bg-slate-800 text-white"
                      : "bg-white text-blue-600 shadow-sm border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className={`border rounded-2xl overflow-hidden ${
        theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-left border-collapse font-sans text-xs ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            <thead>
              <tr className={`border-b text-slate-500 text-[10px] font-bold uppercase tracking-wider ${
                theme === "dark" ? "border-slate-850 bg-slate-950/40" : "border-slate-100 bg-slate-50"
              }`}>
                <th className="p-3.5 rounded-l-xl">Log ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Operator (Email)</th>
                <th className="p-3.5">Security Event</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Footprint Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`p-12 text-center italic text-slate-400 font-mono ${
                    theme === "dark" ? "bg-slate-950/20" : "bg-slate-50/50"
                  }`}>
                    No matching compliance logs match your query criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`border-b transition ${
                    theme === "dark" ? "border-slate-850/60 hover:bg-slate-900/10" : "border-slate-100 hover:bg-slate-50/50"
                  }`}>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px] font-semibold">{log.id}</td>
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-700 font-bold whitespace-nowrap">{log.userEmail}</td>
                    <td className="p-3.5 text-blue-600 font-bold whitespace-nowrap">{log.action}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        log.status === "Success" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : log.status === "Warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {log.status === "Success" && <CheckCircle className="h-3 w-3 shrink-0" />}
                        {log.status === "Warning" && <AlertTriangle className="h-3 w-3 shrink-0" />}
                        {log.status === "Failure" && <XCircle className="h-3 w-3 shrink-0" />}
                        {log.status}
                      </span>
                    </td>
                    <td className={`p-3.5 text-slate-400 text-xs break-all max-w-sm ${theme === "dark" ? "font-mono" : "font-sans font-medium"}`}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Counter footer */}
        <div className={`border-t px-4 py-3.5 flex justify-between text-[10px] font-mono text-slate-400 ${
          theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-100"
        }`}>
          <span>COMPLIANCE INDEX: ISO27001_A.12_SYSTEM_LOGS</span>
          <span>Showing {filteredLogs.length} of {logs.length} audit records</span>
        </div>
      </div>
    </div>
  );
}
