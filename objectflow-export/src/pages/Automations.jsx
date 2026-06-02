import { useState } from "react";
import AIAssistant from "../components/ui/AIAssistant";
import { Plus, Zap, Play, Pause, ChevronRight, X, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import Badge from "../components/ui/Badge";

const automations = [
  { id:"1", name:"Notify Reviewer on Submission",        description:"Send in-app notification when a new record enters the curation queue",      trigger:"Record Submitted",    condition:"Always",                              action:"Send Notification",          status:"Active", last_run:"2026-05-30T12:05:00Z", success_count:481, failure_count:2 },
  { id:"2", name:"Assign Reviewer on Validation Failure",description:"Auto-assign default reviewer when validation fails and reviewer is unset",   trigger:"Validation Failed",   condition:"Reviewer is unassigned",              action:"Assign Reviewer",            status:"Active", last_run:"2026-05-30T11:42:00Z", success_count:134, failure_count:0 },
  { id:"3", name:"Send Webhook on Record Approved",      description:"POST approved vendor record to downstream ERP endpoint on approval",         trigger:"Record Approved",     condition:"Object = Vendor",                     action:"Send Webhook",               status:"Active", last_run:"2026-05-30T10:15:00Z", success_count:147, failure_count:5 },
  { id:"4", name:"Escalate on SLA Miss",                 description:"Create escalation task and notify process owner when SLA is exceeded",       trigger:"SLA Deadline Passed", condition:"Stage is not terminal",               action:"Create Task + Notify Manager",status:"Active", last_run:"2026-05-29T23:00:00Z", success_count:28,  failure_count:1 },
  { id:"5", name:"Notify Requester on Work Order Close", description:"Send email to original requester when a work order reaches Closed stage",    trigger:"Record Approved",     condition:"Object = Work Order, Stage = Closed", action:"Send Email",                 status:"Paused", last_run:"2026-05-28T14:30:00Z", success_count:89,  failure_count:3 },
  { id:"6", name:"Create Task on Issue Opened",          description:"Automatically create a follow-up task when a new issue record is logged",    trigger:"Record Created",      condition:"Object = Issue",                      action:"Create Task",                status:"Active", last_run:"2026-05-30T09:55:00Z", success_count:73,  failure_count:0 },
];

const triggerOptions = ["Record Submitted","Record Created","Record Approved","Record Rejected","Validation Failed","Validation Passed","SLA Deadline Passed","Stage Transition","Duplicate Detected","Integration Error"];
const actionOptions  = ["Send Notification","Send Email","Send Webhook","Assign Reviewer","Create Task","Update Record","Escalate to Manager","Run Integration"];

const fmt = iso => new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

const recentRuns = (failures) => [
  { ok: true,     ts:"May 30 12:05 PM" },
  { ok: true,     ts:"May 30 10:48 AM" },
  { ok: failures > 0 ? false : true, ts:"May 30 09:30 AM" },
  { ok: true,     ts:"May 29 04:15 PM" },
];

export default function Automations() {
  const [selected, setSelected]         = useState(null);
  const [showBuilder, setShowBuilder]   = useState(false);
  const [form, setForm]                 = useState({ name:"", trigger:"", condition:"", action:"" });

  const totalRuns   = automations.reduce((s,a) => s + a.success_count + a.failure_count, 0);
  const totalFails  = automations.reduce((s,a) => s + a.failure_count, 0);
  const successRate = totalRuns ? Math.round((totalRuns - totalFails) / totalRuns * 100) : 0;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── List pane ── */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Automations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {automations.filter(a => a.status === "Active").length} active rules · {totalRuns.toLocaleString()} total runs
            </p>
          </div>
          <button onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Automation
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label:"Active Rules",   value:automations.filter(a=>a.status==="Active").length, color:"text-emerald-600", bg:"bg-emerald-50", ring:"ring-emerald-200" },
            { label:"Total Runs",     value:totalRuns.toLocaleString(),                        color:"text-indigo-600",  bg:"bg-indigo-50",  ring:"ring-indigo-200"  },
            { label:"Failures",       value:totalFails,                                        color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"    },
            { label:"Success Rate",   value:`${successRate}%`,                                 color:"text-amber-600",   bg:"bg-amber-50",   ring:"ring-amber-200"   },
          ].map(c => (
            <div key={c.label} className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ring-1 ${c.ring} ring-inset`}>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Rule</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Trigger</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Action</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Runs</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Last Run</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {automations.map(a => (
                <tr key={a.id}
                  onClick={() => setSelected(selected?.id === a.id ? null : a)}
                  className={`cursor-pointer transition-colors ${selected?.id === a.id ? "bg-indigo-50/50" : "hover:bg-slate-50/60"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        a.status === "Active" ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-slate-100"
                      }`}>
                        <Zap className={`w-4 h-4 ${a.status === "Active" ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-800">{a.name}</div>
                        <div className="text-xs text-slate-400 hidden sm:block mt-0.5 truncate max-w-xs">{a.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">{a.trigger}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-slate-600 hidden lg:table-cell">{a.action}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><Badge status={a.status} /></td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <div className="text-[13px] font-semibold text-slate-700">{(a.success_count + a.failure_count).toLocaleString()}</div>
                    {a.failure_count > 0 && <div className="text-[11px] text-rose-500 font-medium">{a.failure_count} failed</div>}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[11px] text-slate-400 hidden lg:table-cell">{fmt(a.last_run)}</td>
                  <td className="px-4 py-3.5"><ChevronRight className="w-4 h-4 text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <div className="w-[360px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                selected.status === "Active" ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-slate-100"
              }`}>
                <Zap className={`w-4 h-4 ${selected.status === "Active" ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-800 leading-snug">{selected.name}</div>
                <div className="mt-1"><Badge status={selected.status} /></div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 ml-2 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* When / If / Then */}
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">When</div>
                <div className="text-[13px] font-bold text-indigo-900">{selected.trigger}</div>
              </div>
              <div className="flex justify-center"><ChevronDown className="w-4 h-4 text-slate-300" /></div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">If</div>
                <div className="text-[13px] font-bold text-amber-900">{selected.condition}</div>
              </div>
              <div className="flex justify-center"><ChevronDown className="w-4 h-4 text-slate-300" /></div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Then</div>
                <div className="text-[13px] font-bold text-emerald-900">{selected.action}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label:"Runs",      value:(selected.success_count + selected.failure_count).toLocaleString(), color:"text-slate-800" },
                { label:"Successes", value:selected.success_count.toLocaleString(), color:"text-emerald-600" },
                { label:"Failures",  value:selected.failure_count, color: selected.failure_count > 0 ? "text-rose-600" : "text-slate-400" },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 px-1">Last run: {fmt(selected.last_run)}</p>

            {/* Recent runs */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Runs</div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                {recentRuns(selected.failure_count).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    {r.ok
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      : <XCircle     className="w-3.5 h-3.5 text-rose-500    flex-shrink-0" />}
                    <span className={`text-[12px] font-semibold flex-1 ${r.ok ? "text-emerald-700" : "text-rose-700"}`}>
                      {r.ok ? "Success" : "Failed"}
                    </span>
                    <span className="text-[11px] text-slate-400">{r.ts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 flex-shrink-0">
            <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">Edit Rule</button>
            <button className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Test
            </button>
            <button className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              {selected.status === "Active" ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Enable</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Builder modal ── */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                </div>
                <h2 className="font-bold text-slate-800">Create Automation Rule</h2>
              </div>
              <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Rule Name</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                  placeholder="e.g. Notify team on approval"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
              </div>
              <AIAssistant context="automation" compact className="mb-4"
                onApply={(suggestions) => { console.log("AI automation suggestions:", suggestions); }}
              />

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <label className="block text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">When — Trigger</label>
                <select value={form.trigger} onChange={e => setForm({...form, trigger:e.target.value})}
                  className="w-full px-3 py-2.5 border border-indigo-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select trigger…</option>
                  {triggerOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">If — Condition</label>
                <input value={form.condition} onChange={e => setForm({...form, condition:e.target.value})}
                  placeholder="e.g. Object = Vendor, Status = Pending"
                  className="w-full px-3 py-2.5 border border-amber-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" />
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Then — Action</label>
                <select value={form.action} onChange={e => setForm({...form, action:e.target.value})}
                  className="w-full px-3 py-2.5 border border-emerald-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Select action…</option>
                  {actionOptions.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button onClick={() => setShowBuilder(false)} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
              <button onClick={() => setShowBuilder(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                Save Automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
