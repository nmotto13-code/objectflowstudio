import { useState } from "react";
import { Plus, AlertCircle, CheckCircle2, Clock, Webhook, Upload, FileJson, FileText, PenLine, Paperclip, Settings, X } from "lucide-react";
import Badge from "../components/ui/Badge";

const typeIcons = { "Form Submission":FileText, "Manual Entry":PenLine, "CSV Upload":Upload, "JSON Import":FileJson, "Webhook / API":Webhook, "File Attachment":Paperclip };
const typeColor  = { "Form Submission":"bg-indigo-50 text-indigo-600", "Manual Entry":"bg-slate-50 text-slate-600", "CSV Upload":"bg-emerald-50 text-emerald-600", "JSON Import":"bg-purple-50 text-purple-600", "Webhook / API":"bg-amber-50 text-amber-600", "File Attachment":"bg-blue-50 text-blue-600" };

const sources = [
  { id:"1", name:"Facilities Work Order Portal", source_type:"Form Submission", connected_object:"Work Order",              connected_process:"Facilities Work Order",      status:"Active", recent_submissions:24, error_count:0,  last_received:"2026-05-30T11:48:00Z" },
  { id:"2", name:"Vendor CSV Batch Import",      source_type:"CSV Upload",      connected_object:"Vendor",                  connected_process:"Vendor Onboarding",          status:"Active", recent_submissions:8,  error_count:1,  last_received:"2026-05-29T09:15:00Z" },
  { id:"3", name:"Invoice Webhook — ERP",        source_type:"Webhook / API",   connected_object:"Invoice",                 connected_process:"Invoice Approval",           status:"Error",  recent_submissions:31, error_count:12, last_received:"2026-05-28T14:02:00Z", endpoint_url:"/api/intake/invoice" },
  { id:"4", name:"Inspection Manual Entry",      source_type:"Manual Entry",    connected_object:"Inspection",              connected_process:"Property Inspection Review", status:"Active", recent_submissions:12, error_count:0,  last_received:"2026-05-30T08:30:00Z" },
  { id:"5", name:"HR Change Request Form",       source_type:"Form Submission", connected_object:"Employee Change Request",  connected_process:"Employee Change Request",    status:"Active", recent_submissions:5,  error_count:0,  last_received:"2026-05-29T15:00:00Z" },
  { id:"6", name:"Asset JSON Import",            source_type:"JSON Import",     connected_object:"Asset",                   connected_process:null,                         status:"Paused", recent_submissions:0,  error_count:0,  last_received:"2026-05-15T10:00:00Z" },
];

const statusDot = { Active:"bg-emerald-500", Error:"bg-rose-500", Paused:"bg-slate-400" };

const fmt = iso => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
};

export default function Intake() {
  const [showModal, setShowModal] = useState(false);

  const totalRecords = sources.reduce((a,s)=>a+s.recent_submissions,0);
  const totalErrors  = sources.reduce((a,s)=>a+s.error_count,0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Intake Sources</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure how data enters ObjectFlow Studio</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Source
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:"Active Sources",   value:sources.filter(s=>s.status==="Active").length, icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50", ring:"ring-emerald-200" },
          { label:"Records Today",    value:totalRecords,                                   icon:FileText,     color:"text-indigo-600",  bg:"bg-indigo-50",  ring:"ring-indigo-200"  },
          { label:"Sources w/ Errors",value:sources.filter(s=>s.error_count>0).length,     icon:AlertCircle,  color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"    },
          { label:"Total Errors",     value:totalErrors,                                    icon:Clock,        color:"text-amber-600",   bg:"bg-amber-50",   ring:"ring-amber-200"   },
        ].map(c => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
              <c.icon className={`w-5 h-5 ${c.color}`} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{c.value}</div>
              <div className="text-xs text-slate-500 font-medium">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sources.map(s => {
          const Icon  = typeIcons[s.source_type] || FileText;
          const tColor = typeColor[s.source_type] || "bg-slate-50 text-slate-600";
          const isError = s.status === "Error";
          return (
            <div key={s.id} className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer ${
              isError ? "border-rose-200 hover:border-rose-300" : "border-slate-200 hover:border-slate-300"
            } shadow-sm`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${tColor} border border-current/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{s.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.source_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusDot[s.status]}`} />
                  <span className="text-[11px] font-semibold text-slate-500">{s.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs">
                <div>
                  <div className="text-slate-400 font-medium mb-0.5">Object</div>
                  <div className="font-semibold text-slate-700">{s.connected_object}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium mb-0.5">Process</div>
                  <div className="font-semibold text-slate-700 truncate">{s.connected_process || "—"}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium mb-0.5">Recent</div>
                  <div className="font-semibold text-slate-700">{s.recent_submissions} records</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium mb-0.5">Errors</div>
                  <div className={`font-bold ${s.error_count > 0 ? "text-rose-600" : "text-slate-400"}`}>{s.error_count}</div>
                </div>
              </div>

              {isError && (
                <div className="mb-3 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {s.error_count} intake errors — check endpoint config
                </div>
              )}
              {s.endpoint_url && (
                <code className="block mb-3 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-mono text-slate-500 truncate">{s.endpoint_url}</code>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Last: {fmt(s.last_received)}</span>
                <button className="flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  <Settings className="w-3.5 h-3.5" /> Configure
                </button>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <span className="text-sm font-semibold text-slate-400 group-hover:text-indigo-500 transition-colors">Add Intake Source</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Add Intake Source</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {Object.entries(typeIcons).map(([type, Icon]) => (
                <button key={type} onClick={() => setShowModal(false)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-600" strokeWidth={1.75} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
