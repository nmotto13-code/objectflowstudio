import {
  Inbox, GitBranch, AlertTriangle, Clock, CheckCircle2, Plug,
  ArrowRight, Activity, TrendingUp, TrendingDown, Zap, ChevronRight,
  Wrench, Package, FileText, UserCheck, Webhook, Flame, Info
} from "lucide-react";
import Badge from "../components/ui/Badge";

// ─── Demo lifecycle data ──────────────────────────────────────────────────────
// "Facilities Work Order" end-to-end from submission → approval → task → webhook

const DEMO_LIFECYCLE = [
  {
    step: 1,
    icon: FileText,
    color: "bg-indigo-50 text-indigo-600 ring-indigo-200",
    title: "WO-2026-0484 Submitted",
    detail: "HVAC Unit Replacement — Building C",
    meta: "Taylor Brooks · Form Submission · 07:55 AM",
    status: "Approved",
    link: "View in Records",
  },
  {
    step: 2,
    icon: AlertTriangle,
    color: "bg-amber-50 text-amber-600 ring-amber-200",
    title: "Validation Warning",
    detail: "Assigned To field missing — flagged for reviewer",
    meta: "System · Validation Engine · 07:55 AM",
    status: "Warning",
    link: "View in Queue",
  },
  {
    step: 3,
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    title: "Record Approved",
    detail: "Jordan Lee approved after assigning technician",
    meta: "Jordan Lee · Curation Queue · 09:12 AM",
    status: "Approved",
    link: "View record",
  },
  {
    step: 4,
    icon: Package,
    color: "bg-purple-50 text-purple-600 ring-purple-200",
    title: "Task Created for Vendor",
    detail: "Pacific HVAC Solutions — urgent maintenance task",
    meta: "System · Automation · 09:12 AM",
    status: "Active",
    link: "View task",
  },
  {
    step: 5,
    icon: Webhook,
    color: "bg-blue-50 text-blue-600 ring-blue-200",
    title: "Webhook Fired",
    detail: "ERP notified via REST webhook — 200 OK",
    meta: "System · Integration · 09:12 AM",
    status: "Active",
    link: "View log",
  },
];

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const KPIS = [
  { label:"Pending Records",    value:"47",  delta:"+8 today",        trend:"bad",     icon:Inbox,         color:"text-amber-600",   bg:"bg-amber-50",   ring:"ring-amber-200"  },
  { label:"Active Processes",   value:"5",   delta:"No change",       trend:"neutral", icon:GitBranch,     color:"text-indigo-600",  bg:"bg-indigo-50",  ring:"ring-indigo-200" },
  { label:"Failed Validations", value:"13",  delta:"−3 from yesterday",trend:"good",   icon:AlertTriangle, color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"   },
  { label:"Overdue Tasks",      value:"6",   delta:"+2 today",        trend:"bad",     icon:Clock,         color:"text-orange-600",  bg:"bg-orange-50",  ring:"ring-orange-200" },
  { label:"Approved This Week", value:"124", delta:"+18 vs last week", trend:"good",   icon:CheckCircle2,  color:"text-emerald-600", bg:"bg-emerald-50", ring:"ring-emerald-200"},
  { label:"Integration Errors", value:"12",  delta:"12 new today",    trend:"bad",     icon:Plug,          color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"   },
];

// ─── Activity ─────────────────────────────────────────────────────────────────
const ACTIVITY = [
  { actor:"Jordan Lee",   initials:"JL", color:"bg-emerald-500", action:"approved",           tag:"success", target:"WO-2026-0484 — HVAC Unit Replacement",          time:"9 min ago"  },
  { actor:"System",       initials:"SY", color:"bg-blue-500",    action:"webhook fired",      tag:"info",    target:"ERP notified — WO-2026-0484 approved",           time:"9 min ago"  },
  { actor:"System",       initials:"SY", color:"bg-purple-500",  action:"task created",       tag:"create",  target:"Pacific HVAC — urgent maintenance task",         time:"9 min ago"  },
  { actor:"Morgan Patel", initials:"MP", color:"bg-purple-500",  action:"approved",           tag:"success", target:"Inspection #INS-2026-0480 — Harbor View",        time:"58 min ago" },
  { actor:"Casey Rivera", initials:"CR", color:"bg-amber-500",   action:"published form",     tag:"create",  target:"Invoice Submission Form v2",                     time:"1h ago"     },
  { actor:"System",       initials:"SY", color:"bg-rose-500",    action:"validation failed",  tag:"error",   target:"INT-2026-0482 — Invoice (PO missing)",           time:"2h ago"     },
  { actor:"Taylor Brooks",initials:"TB", color:"bg-rose-500",    action:"submitted",          tag:"submit",  target:"WO-2026-0484 — HVAC Unit Replacement",           time:"3h ago"     },
];

const TAG_STYLE = {
  success: "bg-emerald-50 text-emerald-700",
  info:    "bg-blue-50 text-blue-700",
  create:  "bg-indigo-50 text-indigo-700",
  error:   "bg-rose-50 text-rose-700",
  submit:  "bg-amber-50 text-amber-700",
  update:  "bg-slate-100 text-slate-600",
};
const TAG_DOT = {
  success:"bg-emerald-500", info:"bg-blue-500", create:"bg-indigo-500",
  error:"bg-rose-500", submit:"bg-amber-500", update:"bg-slate-400",
};

// ─── Assigned reviews ─────────────────────────────────────────────────────────
const REVIEWS = [
  { id:"INT-2026-0483", object:"Vendor",      title:"BlueSky Maintenance",           status:"Pending Review", due:"Overdue", urgent:true  },
  { id:"INT-2026-0484", object:"Work Order",  title:"HVAC Unit Replacement — Bldg C",status:"Pending Review", due:"Today",   urgent:false },
  { id:"INT-2026-0482", object:"Invoice",     title:"BuildRight LLC — $12,500",      status:"Needs Fix",      due:"Today",   urgent:false },
];

// ─── Process health ───────────────────────────────────────────────────────────
const PROCESS_HEALTH = [
  { name:"Invoice Approval",            active:31, sla:"2.4d avg", score:72, bottleneck:true  },
  { name:"Facilities Work Order",       active:24, sla:"3.2d avg", score:85, bottleneck:false },
  { name:"Vendor Onboarding",           active:8,  sla:"7.5d avg", score:91, bottleneck:false },
  { name:"Property Inspection Review",  active:12, sla:"1.8d avg", score:96, bottleneck:false },
  { name:"Employee Change Req.",        active:5,  sla:"4.1d avg", score:60, bottleneck:true  },
];

// ─── Automations ──────────────────────────────────────────────────────────────
const AUTOMATIONS = [
  { name:"Notify Reviewer on Submission",   runs:481, errors:2  },
  { name:"Create Task on WO Approval",      runs:134, errors:0  },
  { name:"Send Webhook on Record Approved", runs:147, errors:5  },
  { name:"Escalate on SLA Miss",            runs:28,  errors:1  },
];

function scoreColor(s) {
  if (s >= 90) return "bg-emerald-500";
  if (s >= 75) return "bg-amber-400";
  return "bg-rose-500";
}
function scoreText(s) {
  if (s >= 90) return "text-emerald-600";
  if (s >= 75) return "text-amber-600";
  return "text-rose-600";
}

export default function Home() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Northstar Operations · Friday, May 30, 2026</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Activity className="w-3.5 h-3.5"/> Live View
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex w-9 h-9 rounded-xl ${k.bg} items-center justify-center mb-3 ring-1 ${k.ring}`}>
              <k.icon className={`w-4 h-4 ${k.color}`} strokeWidth={2}/>
            </div>
            <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{k.value}</div>
            <div className="text-xs text-slate-500 font-medium leading-tight mb-1.5">{k.label}</div>
            <div className={`text-[11px] flex items-center gap-1 font-medium ${k.trend==="bad"?"text-rose-600":k.trend==="good"?"text-emerald-600":"text-slate-400"}`}>
              {k.trend==="bad"  ? <TrendingUp   className="w-3 h-3"/> : null}
              {k.trend==="good" ? <TrendingDown  className="w-3 h-3"/> : null}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* ── Demo lifecycle banner ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-500"/>
            <span className="text-sm font-bold text-slate-800">Live Demo: Facilities Work Order Lifecycle</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 px-2 py-0.5 rounded-full ml-1">WO-2026-0484</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Today · End-to-end flow</span>
        </div>
        <div className="px-5 py-4 overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            {DEMO_LIFECYCLE.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex items-stretch">
                  <div className="flex flex-col items-center w-44">
                    {/* Node */}
                    <div className={`w-10 h-10 rounded-2xl ring-1 flex items-center justify-center flex-shrink-0 mb-2 ${step.color}`}>
                      <Icon className="w-4.5 h-4.5" size={18} strokeWidth={1.75}/>
                    </div>
                    <div className="text-center">
                      <div className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">{step.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mb-1">{step.detail}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mb-1.5">{step.meta}</div>
                      <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-2">{step.link}</button>
                    </div>
                  </div>
                  {i < DEMO_LIFECYCLE.length - 1 && (
                    <div className="flex items-center px-2 pb-8">
                      <div className="flex items-center gap-0">
                        <div className="w-8 h-px bg-slate-200"/>
                        <ArrowRight className="w-3 h-3 text-slate-300"/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row: Activity + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400"/>
              <span className="text-sm font-bold text-slate-800">Recent Activity</span>
            </div>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">View all <ArrowRight className="w-3 h-3"/></button>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5`}>{a.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-700 leading-snug flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800">{a.actor}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${TAG_STYLE[a.tag]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${TAG_DOT[a.tag]}`}/>
                      {a.action}
                    </span>
                    <span className="font-medium text-slate-700">{a.target}</span>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Assigned Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">My Assigned Reviews</span>
            <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{REVIEWS.length}</span>
          </div>
          <div className="flex-1 p-3 space-y-2">
            {REVIEWS.map(r => (
              <div key={r.id} className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                r.urgent ? "border-amber-200 bg-amber-50/40 hover:border-amber-300" : "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-slate-400">{r.id}</span>
                  <span className={`text-[11px] font-bold ${r.due==="Overdue" ? "text-rose-600" : "text-amber-600"}`}>{r.due}</span>
                </div>
                <div className="text-[13px] font-bold text-slate-800 truncate mb-1.5">{r.title}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{r.object}</span>
                  <Badge status={r.status}/>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100">
            <button className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors flex items-center justify-center gap-1">
              Open Curation Queue <ArrowRight className="w-3 h-3"/>
            </button>
          </div>
        </div>
      </div>

      {/* Row: Process Health + Automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Process Health */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-400"/>
              <span className="text-sm font-bold text-slate-800">Active Process Health</span>
            </div>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">Details <ChevronRight className="w-3 h-3"/></button>
          </div>
          <div className="px-5 py-4 space-y-4">
            {PROCESS_HEALTH.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-700">{p.name}</span>
                    {p.bottleneck && <Flame className="w-3.5 h-3.5 text-rose-500" title="Bottleneck detected"/>}
                    <span className="text-[11px] text-slate-400">{p.active} active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">{p.sla}</span>
                    <span className={`text-xs font-bold w-10 text-right ${scoreText(p.score)}`}>{p.score}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${scoreColor(p.score)} transition-all duration-500`} style={{width:`${p.score}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-400"/>
              <span className="text-sm font-bold text-slate-800">Automation Status</span>
            </div>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">All rules <ChevronRight className="w-3 h-3"/></button>
          </div>
          <div className="divide-y divide-slate-50">
            {AUTOMATIONS.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.errors>0 ? "bg-amber-400" : "bg-emerald-400"}`}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-700 truncate">{a.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{a.runs.toLocaleString()} runs · {a.errors} errors</div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${a.errors>0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {a.errors>0 ? `${a.errors} err` : "Healthy"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
