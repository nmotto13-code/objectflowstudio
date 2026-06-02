import { useState } from "react";
import AIAssistant from "../components/ui/AIAssistant";
import {
  Plus, GitBranch, X, Clock, Users, ArrowRight, ChevronRight,
  CheckCircle2, AlertTriangle, Zap, Shield, RotateCcw,
  TrendingUp, TrendingDown, Play, Pause, Settings,
  Info, Flame, Timer, UserCheck, Link2, ChevronDown, Check,
  AlertCircle, Flag
} from "lucide-react";
import Badge from "../components/ui/Badge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STAGE_TYPES = {
  intake:    { label:"Intake",    color:"bg-slate-100 text-slate-600",   ring:"ring-slate-200",  dot:"bg-slate-400"  },
  automated: { label:"Automated", color:"bg-blue-50 text-blue-700",      ring:"ring-blue-200",   dot:"bg-blue-500"   },
  review:    { label:"Review",    color:"bg-indigo-50 text-indigo-700",  ring:"ring-indigo-200", dot:"bg-indigo-500" },
  approval:  { label:"Approval",  color:"bg-amber-50 text-amber-700",    ring:"ring-amber-200",  dot:"bg-amber-500"  },
  terminal:  { label:"Terminal",  color:"bg-emerald-50 text-emerald-700",ring:"ring-emerald-200",dot:"bg-emerald-500"},
  sync:      { label:"Sync",      color:"bg-purple-50 text-purple-700",  ring:"ring-purple-200", dot:"bg-purple-500" },
};

// The canonical example workflow — Vendor Onboarding
const VENDOR_STAGES = [
  {
    id:"s1", name:"Submitted",         type:"intake",    role:"Requester",          sla_hours:4,
    bottleneck:false, escalation_hours:8,  avg_hours:2.1,  instance_count:3,
    description:"Record received from intake source. Awaiting system validation.",
    transitions:[{ to:"s2", condition:"Always", label:"Auto-advance" }],
    conditions:[], notes:"",
  },
  {
    id:"s2", name:"Validated",         type:"automated", role:"System",             sla_hours:1,
    bottleneck:false, escalation_hours:2,  avg_hours:0.2,  instance_count:1,
    description:"System performs field validation, duplicate detection, and format checks.",
    transitions:[{ to:"s3", condition:"Validation passed", label:"Pass" }, { to:"s1", condition:"Validation failed", label:"Return to submitter" }],
    conditions:["All required fields populated","No duplicate match above 90%","Tax ID format valid"],
    notes:"",
  },
  {
    id:"s3", name:"Dept. Review",      type:"review",    role:"Facilities Manager", sla_hours:24,
    bottleneck:true,  escalation_hours:28, avg_hours:31.4, instance_count:2,
    description:"Department manager reviews the submission for operational suitability and completeness.",
    transitions:[{ to:"s4", condition:"Approved by reviewer", label:"Approve" }, { to:"s1", condition:"Rejected", label:"Send back" }],
    conditions:["Reviewer must add a note if rejecting"],
    notes:"This is the primary bottleneck. Avg 31h vs 24h SLA.",
  },
  {
    id:"s4", name:"Finance Review",    type:"approval",  role:"Finance Manager",    sla_hours:24,
    bottleneck:false, escalation_hours:30, avg_hours:18.7, instance_count:1,
    description:"Finance manager validates GL code, payment terms, and budget availability.",
    transitions:[{ to:"s5", condition:"Finance approved", label:"Approve" }, { to:"s3", condition:"Finance rejected", label:"Return to Dept." }],
    conditions:["GL code must be mapped","Budget headroom confirmed"],
    notes:"",
  },
  {
    id:"s5", name:"Approved",          type:"approval",  role:"Process Admin",      sla_hours:8,
    bottleneck:false, escalation_hours:10, avg_hours:3.2,  instance_count:0,
    description:"Final approval by Process Admin before record is committed to the system.",
    transitions:[{ to:"s6", condition:"Admin approved", label:"Approve & Sync" }],
    conditions:["All prior stages must be completed"],
    notes:"",
  },
  {
    id:"s6", name:"Synced",            type:"sync",      role:"System",             sla_hours:1,
    bottleneck:false, escalation_hours:2,  avg_hours:0.3,  instance_count:1,
    description:"System syncs the approved record to ERP, sends webhook notifications, and updates downstream integrations.",
    transitions:[{ to:"s7", condition:"Sync successful", label:"Close" }],
    conditions:["ERP webhook responds 200","Record written to curated store"],
    notes:"",
  },
  {
    id:"s7", name:"Closed",            type:"terminal",  role:"System",             sla_hours:0,
    bottleneck:false, escalation_hours:0,  avg_hours:0,    instance_count:0,
    description:"Process complete. Record is fully approved, synced, and archived in the curated records store.",
    transitions:[],
    conditions:[],
    notes:"",
  },
];

const PROCESSES = [
  {
    id:"1",
    name:"Vendor Onboarding",
    primary_object:"Vendor",
    status:"Active",
    owner:"Avery Morgan",
    active_instances:8,
    avg_cycle_time:7.5,
    sla_hours:168,
    on_time_pct:82,
    bottleneck_stage:"Dept. Review",
    description:"Full vendor vetting, compliance review, finance approval, and ERP registration workflow.",
    tags:["procurement","finance"],
    stages: VENDOR_STAGES,
  },
  {
    id:"2",
    name:"Invoice Approval",
    primary_object:"Invoice",
    status:"Active",
    owner:"Avery Morgan",
    active_instances:31,
    avg_cycle_time:2.4,
    sla_hours:48,
    on_time_pct:72,
    bottleneck_stage:"Finance Review",
    description:"Three-way PO/invoice/receipt matching and multi-level finance approval for vendor payments.",
    tags:["finance"],
    stages:[
      { id:"s1", name:"Submitted",      type:"intake",    role:"Finance Team",    sla_hours:2,  bottleneck:false, escalation_hours:4,  avg_hours:1.1,  instance_count:8,  transitions:[{to:"s2",condition:"Always",label:"Auto-advance"}],        conditions:[], notes:"" },
      { id:"s2", name:"3-Way Match",    type:"automated", role:"System",          sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0.4,  instance_count:3,  transitions:[{to:"s3",condition:"Match passed",label:"Pass"}],          conditions:["PO number matches","Amount within tolerance"], notes:"" },
      { id:"s3", name:"Dept. Review",   type:"review",    role:"Dept. Head",      sla_hours:24, bottleneck:false, escalation_hours:28, avg_hours:20.1, instance_count:11, transitions:[{to:"s4",condition:"Approved",label:"Approve"}],           conditions:["Dept Head must review"], notes:"" },
      { id:"s4", name:"Finance Review", type:"approval",  role:"Finance Manager", sla_hours:24, bottleneck:true,  escalation_hours:28, avg_hours:31.0, instance_count:7,  transitions:[{to:"s5",condition:"Approved",label:"Approve"}],           conditions:["GL code valid","Budget confirmed"], notes:"Primary bottleneck — avg 31h vs 24h SLA" },
      { id:"s5", name:"Approved",       type:"approval",  role:"CFO Delegate",    sla_hours:8,  bottleneck:false, escalation_hours:10, avg_hours:4.2,  instance_count:2,  transitions:[{to:"s6",condition:"Final approval",label:"Queue Payment"}],conditions:[], notes:"" },
      { id:"s6", name:"Payment Queued", type:"terminal",  role:"System",          sla_hours:0,  bottleneck:false, escalation_hours:0,  avg_hours:0,    instance_count:0,  transitions:[],                                                         conditions:[], notes:"" },
    ],
  },
  {
    id:"3",
    name:"Facilities Work Order",
    primary_object:"Work Order",
    status:"Active",
    owner:"Jordan Lee",
    active_instances:24,
    avg_cycle_time:3.2,
    sla_hours:72,
    on_time_pct:91,
    bottleneck_stage:"In Progress",
    description:"End-to-end facilities maintenance lifecycle from submission through completion and sign-off.",
    tags:["facilities","operations"],
    stages:[
      { id:"s1", name:"Submitted",   type:"intake",    role:"Requester",          sla_hours:2,  bottleneck:false, escalation_hours:4,  avg_hours:1.4,  instance_count:5,  transitions:[], conditions:[], notes:"" },
      { id:"s2", name:"Validated",   type:"automated", role:"System",             sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0.1,  instance_count:2,  transitions:[], conditions:[], notes:"" },
      { id:"s3", name:"Dept. Review",type:"review",    role:"Facilities Manager", sla_hours:24, bottleneck:false, escalation_hours:28, avg_hours:19.0, instance_count:4,  transitions:[], conditions:[], notes:"" },
      { id:"s4", name:"Approved",    type:"approval",  role:"Process Admin",      sla_hours:4,  bottleneck:false, escalation_hours:6,  avg_hours:2.1,  instance_count:2,  transitions:[], conditions:[], notes:"" },
      { id:"s5", name:"In Progress", type:"review",    role:"Technician",         sla_hours:48, bottleneck:true,  escalation_hours:52, avg_hours:54.2, instance_count:9,  transitions:[], conditions:[], notes:"" },
      { id:"s6", name:"Closed",      type:"terminal",  role:"Requester",          sla_hours:2,  bottleneck:false, escalation_hours:4,  avg_hours:1.2,  instance_count:2,  transitions:[], conditions:[], notes:"" },
    ],
  },
  {
    id:"4",
    name:"Property Inspection Review",
    primary_object:"Inspection",
    status:"Active",
    owner:"Morgan Patel",
    active_instances:12,
    avg_cycle_time:1.8,
    sla_hours:48,
    on_time_pct:96,
    bottleneck_stage:null,
    description:"Property and equipment inspection intake, compliance verification, and certificate issuance.",
    tags:["compliance","facilities"],
    stages:[
      { id:"s1", name:"Submitted",  type:"intake",    role:"Inspector",         sla_hours:2,  bottleneck:false, escalation_hours:4,  avg_hours:1.5, instance_count:2, transitions:[], conditions:[], notes:"" },
      { id:"s2", name:"Validated",  type:"automated", role:"System",            sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0.2, instance_count:1, transitions:[], conditions:[], notes:"" },
      { id:"s3", name:"Review",     type:"review",    role:"Compliance Officer", sla_hours:24, bottleneck:false, escalation_hours:28, avg_hours:20.0,instance_count:6, transitions:[], conditions:[], notes:"" },
      { id:"s4", name:"Approved",   type:"approval",  role:"Morgan Patel",      sla_hours:4,  bottleneck:false, escalation_hours:6,  avg_hours:3.1, instance_count:3, transitions:[], conditions:[], notes:"" },
      { id:"s5", name:"Closed",     type:"terminal",  role:"System",            sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0.2, instance_count:0, transitions:[], conditions:[], notes:"" },
    ],
  },
  {
    id:"5",
    name:"Employee Change Request",
    primary_object:"Employee Change Request",
    status:"Active",
    owner:"Avery Morgan",
    active_instances:5,
    avg_cycle_time:4.1,
    sla_hours:96,
    on_time_pct:60,
    bottleneck_stage:"Finance Review",
    description:"HR change request approval chain spanning department, finance, and executive sign-off.",
    tags:["hr"],
    stages:[
      { id:"s1", name:"Submitted",      type:"intake",    role:"Requester",         sla_hours:2,  bottleneck:false, escalation_hours:4,  avg_hours:1.8,  instance_count:1, transitions:[], conditions:[], notes:"" },
      { id:"s2", name:"Validated",      type:"automated", role:"System",            sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0.3,  instance_count:0, transitions:[], conditions:[], notes:"" },
      { id:"s3", name:"Dept. Approval", type:"approval",  role:"Dept. Manager",     sla_hours:24, bottleneck:false, escalation_hours:28, avg_hours:22.0, instance_count:2, transitions:[], conditions:[], notes:"" },
      { id:"s4", name:"Finance Review", type:"approval",  role:"Finance Manager",   sla_hours:48, bottleneck:true,  escalation_hours:52, avg_hours:71.0, instance_count:2, transitions:[], conditions:[], notes:"" },
      { id:"s5", name:"Approved",       type:"approval",  role:"HR Director",       sla_hours:8,  bottleneck:false, escalation_hours:10, avg_hours:6.1,  instance_count:0, transitions:[], conditions:[], notes:"" },
      { id:"s6", name:"Closed",         type:"terminal",  role:"System",            sla_hours:1,  bottleneck:false, escalation_hours:2,  avg_hours:0,    instance_count:0, transitions:[], conditions:[], notes:"" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slaColor(pct) {
  if (pct >= 90) return { text:"text-emerald-600", bg:"bg-emerald-50", ring:"ring-emerald-200", bar:"bg-emerald-500" };
  if (pct >= 75) return { text:"text-amber-600",   bg:"bg-amber-50",   ring:"ring-amber-200",   bar:"bg-amber-400"   };
  return               { text:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200",    bar:"bg-rose-500"    };
}

function cycleIcon(avg, sla) {
  const ratio = avg / (sla / 24);
  if (ratio <= 0.7) return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  if (ratio <= 1.0) return <TrendingUp   className="w-3.5 h-3.5 text-amber-500" />;
  return               <TrendingUp   className="w-3.5 h-3.5 text-rose-500" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageTypeBadge({ type }) {
  const cfg = STAGE_TYPES[type] || STAGE_TYPES.review;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-inset whitespace-nowrap ${cfg.color} ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Process list card ────────────────────────────────────────────────────────

function ProcessCard({ p, active, onClick }) {
  const sla   = slaColor(p.on_time_pct);
  const stages = p.stages || [];
  return (
    <div onClick={onClick}
      className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md ${
        active ? "border-indigo-400 ring-1 ring-indigo-200 shadow-md" : "border-slate-200 hover:border-slate-300"
      }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          active ? "bg-indigo-600 shadow-sm" : "bg-indigo-50 border border-indigo-100"
        }`}>
          <GitBranch className={`w-5 h-5 ${active ? "text-white" : "text-indigo-600"}`} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="text-[15px] font-bold text-slate-800">{p.name}</span>
            <Badge status={p.status} />
            {p.bottleneck_stage && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md">
                <Flame className="w-2.5 h-2.5" /> Bottleneck
              </span>
            )}
          </div>

          <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{p.description}</p>

          {/* Mini flow strip */}
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {stages.map((s, i) => {
              const cfg = STAGE_TYPES[s.type] || STAGE_TYPES.review;
              return (
                <div key={s.id} className="flex items-center gap-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${cfg.color} ${cfg.ring} ${s.bottleneck ? "ring-rose-400 bg-rose-50 text-rose-700" : ""}`}>
                    {s.name}
                  </span>
                  {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-5 text-[12px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
              {p.primary_object}
            </span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{p.owner}</span>
            <span className="flex items-center gap-1.5">
              {cycleIcon(p.avg_cycle_time, p.sla_hours)}
              {p.avg_cycle_time}d avg
            </span>
            <span className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" />SLA {p.sla_hours}h</span>
            <span className="flex items-center gap-1.5">
              {p.tags.map(t => <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{t}</span>)}
            </span>
          </div>
        </div>

        {/* Right stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <div className={`text-2xl font-bold ${p.active_instances > 0 ? "text-indigo-600" : "text-slate-300"}`}>{p.active_instances}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Active</div>
          </div>
          <div className="text-center hidden md:block">
            <div className={`text-2xl font-bold ${sla.text}`}>{p.on_time_pct}%</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">On-Time</div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-colors flex-shrink-0 ${active ? "text-indigo-500" : "text-slate-300"}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id:"flow",      label:"Workflow"       },
  { id:"stages",    label:"Stage Config"   },
  { id:"instances", label:"Instances"      },
  { id:"health",    label:"Health"         },
];

function DetailPanel({ process: p, onClose }) {
  const [tab,         setTab]         = useState("flow");
  const [activeStage, setActiveStage] = useState(null);
  const stages = p.stages || [];
  const sla    = slaColor(p.on_time_pct);

  return (
    <div className="flex-1 min-w-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GitBranch className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <h2 className="text-[17px] font-bold text-slate-900">{p.name}</h2>
                <Badge status={p.status} />
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">{p.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{p.primary_object}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.owner}</span>
                <span>·</span>
                <span>{stages.length} stages</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <Settings className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label:"Active",    value:p.active_instances,         color:"text-indigo-600" },
            { label:"Avg Cycle", value:`${p.avg_cycle_time}d`,     color:"text-slate-800"  },
            { label:"SLA",       value:`${p.sla_hours}h`,          color:"text-slate-800"  },
            { label:"On-Time",   value:`${p.on_time_pct}%`,        color:sla.text          },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex -mx-6 px-6 overflow-x-auto">
          {DETAIL_TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveStage(null); }}
              className={`px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"
              }`}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">

        {/* ═══════════════ WORKFLOW TAB ═══════════════ */}
        {tab === "flow" && (
          <div className="p-5 space-y-4">
            {/* Visual flow */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Process Flow</div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max">
                  {stages.map((s, i) => {
                    const cfg    = STAGE_TYPES[s.type] || STAGE_TYPES.review;
                    const isLast = i === stages.length - 1;
                    const over   = s.avg_hours > s.sla_hours && s.sla_hours > 0;
                    return (
                      <div key={s.id} className="flex items-center">
                        {/* Stage node */}
                        <button
                          onClick={() => setActiveStage(activeStage?.id === s.id ? null : s)}
                          className={`relative flex flex-col items-center group transition-all ${activeStage?.id === s.id ? "scale-105" : ""}`}
                        >
                          {/* Bottleneck flame */}
                          {s.bottleneck && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Flame className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                          )}
                          {/* Node circle */}
                          <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shadow-sm ${
                            activeStage?.id === s.id
                              ? "border-indigo-500 bg-indigo-600 shadow-indigo-200"
                              : s.bottleneck
                                ? "border-rose-300 bg-rose-50"
                                : `border-current ${cfg.color.split(" ")[0]} bg-white hover:shadow-md`
                          }`} style={{ borderColor: activeStage?.id === s.id ? undefined : undefined }}>
                            <span className={`text-[11px] font-black ${activeStage?.id === s.id ? "text-white" : cfg.color.split(" ").find(c => c.startsWith("text-"))}`}>
                              {i + 1}
                            </span>
                          </div>
                          {/* Label */}
                          <div className={`mt-2 text-center max-w-[72px]`}>
                            <div className={`text-[11px] font-bold leading-tight ${activeStage?.id === s.id ? "text-indigo-600" : s.bottleneck ? "text-rose-700" : "text-slate-700"}`}>
                              {s.name}
                            </div>
                            <StageTypeBadge type={s.type} />
                            {/* SLA indicator */}
                            {s.sla_hours > 0 && (
                              <div className={`mt-1 text-[10px] font-semibold flex items-center justify-center gap-0.5 ${over ? "text-rose-600" : "text-slate-400"}`}>
                                {over && <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />}
                                {s.sla_hours}h
                              </div>
                            )}
                          </div>
                          {/* Instance count bubble */}
                          {s.instance_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                              {s.instance_count}
                            </div>
                          )}
                        </button>

                        {/* Connector */}
                        {!isLast && (
                          <div className="flex flex-col items-center mx-1 flex-shrink-0" style={{ width: 40, marginBottom: 24 }}>
                            <div className="flex items-center gap-0.5">
                              <div className="h-px w-8 bg-slate-300" />
                              <ChevronRight className="w-3 h-3 text-slate-400 -ml-1" />
                            </div>
                            {stages[i + 1]?.transitions?.[0]?.label && (
                              <span className="text-[9px] text-slate-400 font-medium mt-0.5 text-center leading-tight max-w-[40px]">
                                {stages[i + 1].transitions[0]?.label}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected stage detail */}
            {activeStage && (
              <div className="bg-white border border-indigo-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                      {stages.findIndex(s => s.id === activeStage.id) + 1}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-indigo-900">{activeStage.name}</div>
                      <StageTypeBadge type={activeStage.type} />
                    </div>
                  </div>
                  <button onClick={() => setActiveStage(null)} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-[13px] text-slate-600 leading-relaxed">{activeStage.description}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label:"Assigned Role",  value:activeStage.role                             },
                      { label:"SLA Target",     value:activeStage.sla_hours > 0 ? `${activeStage.sla_hours}h` : "—" },
                      { label:"Avg Duration",   value:activeStage.avg_hours > 0 ? `${activeStage.avg_hours}h` : "—" },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</div>
                        <div className={`text-[13px] font-bold ${
                          m.label === "Avg Duration" && activeStage.avg_hours > activeStage.sla_hours && activeStage.sla_hours > 0
                            ? "text-rose-600" : "text-slate-800"
                        }`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  {activeStage.conditions.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Entry Conditions</div>
                      <div className="space-y-1">
                        {activeStage.conditions.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeStage.transitions.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transitions</div>
                      <div className="space-y-1.5">
                        {activeStage.transitions.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200 px-1.5 py-0.5 rounded">{t.label}</span>
                            <span className="text-[11px] text-slate-500">if: {t.condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeStage.bottleneck && (
                    <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <Flame className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-rose-800">Bottleneck Detected</div>
                        <p className="text-[11px] text-rose-700 mt-0.5">{activeStage.notes || `Average duration (${activeStage.avg_hours}h) exceeds SLA target (${activeStage.sla_hours}h).`}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!activeStage && (
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-100 border border-slate-200 rounded-xl">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-slate-500">Click any stage node above to see its configuration, entry conditions, transitions, and performance data.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ STAGE CONFIG TAB ═══════════════ */}
        {tab === "stages" && (
          <div className="p-5 space-y-2.5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stages.length} stages configured</div>
              <div className="flex items-center gap-2">
                <AIAssistant context="process" compact
                  onApply={(s) => console.log("AI stage suggestions:", s)}
                />
                <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Stage
                </button>
              </div>
            </div>

            {stages.map((s, i) => {
              const cfg = STAGE_TYPES[s.type] || STAGE_TYPES.review;
              const over = s.avg_hours > s.sla_hours && s.sla_hours > 0;
              return (
                <div key={s.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                  s.bottleneck ? "border-rose-200" : "border-slate-200"
                }`}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    {/* Number + connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white ${
                        s.type === "terminal" ? "bg-emerald-500" : s.type === "approval" ? "bg-amber-500" : s.type === "automated" ? "bg-blue-500" : "bg-indigo-500"
                      }`}>{i + 1}</div>
                      {i < stages.length - 1 && <div className="w-px h-3 bg-slate-200 mt-1" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-bold text-slate-800">{s.name}</span>
                        <StageTypeBadge type={s.type} />
                        {s.bottleneck && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md">
                            <Flame className="w-2.5 h-2.5" />Bottleneck
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{s.role}</span>
                        {s.sla_hours > 0 && (
                          <span className={`flex items-center gap-1 ${over ? "text-rose-600 font-semibold" : ""}`}>
                            <Timer className="w-3 h-3" />SLA {s.sla_hours}h
                            {over && <span className="text-rose-500">(avg {s.avg_hours}h ↑)</span>}
                          </span>
                        )}
                        {s.escalation_hours > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-3 h-3" />Escalate at {s.escalation_hours}h
                          </span>
                        )}
                        {s.instance_count > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-indigo-600">
                            <Play className="w-3 h-3" />{s.instance_count} here now
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button */}
                    <button onClick={() => setActiveStage(activeStage?.id === s.id ? null : s)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all flex-shrink-0">
                      {activeStage?.id === s.id ? "Close" : "Config"}
                    </button>
                  </div>

                  {/* Expanded config */}
                  {activeStage?.id === s.id && (
                    <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stage Name</label>
                          <input defaultValue={s.name} className="w-full px-2.5 py-2 text-[13px] font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stage Type</label>
                          <select defaultValue={s.type} className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                            {Object.entries(STAGE_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Role</label>
                          <input defaultValue={s.role} className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">SLA Target (hours)</label>
                          <input type="number" defaultValue={s.sla_hours} className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Escalate After (hours)</label>
                          <input type="number" defaultValue={s.escalation_hours} className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div className="flex flex-col gap-2 pt-5">
                          {[["Requires Approval", s.type === "approval"],["Terminal Stage", s.type === "terminal"],["System-Automated", s.type === "automated"]].map(([l,d])=>(
                            <label key={l} className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                              <input type="checkbox" defaultChecked={d} className="accent-indigo-600 w-3.5 h-3.5" />{l}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stage Description</label>
                        <textarea defaultValue={s.description} rows={2} className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all" />
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Save Stage</button>
                        <button onClick={() => setActiveStage(null)} className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ INSTANCES TAB ═══════════════ */}
        {tab === "instances" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.active_instances} active instances</div>
            </div>

            {/* Stage distribution */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="px-4 py-3 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Instances by Stage
              </div>
              <div className="p-4 space-y-2.5">
                {stages.filter(s => s.instance_count > 0).map(s => {
                  const pct = Math.round((s.instance_count / Math.max(p.active_instances, 1)) * 100);
                  const cfg = STAGE_TYPES[s.type] || STAGE_TYPES.review;
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-slate-700">{s.name}</span>
                          {s.bottleneck && <Flame className="w-3 h-3 text-rose-500" />}
                        </div>
                        <span className="text-[12px] font-bold text-slate-800">{s.instance_count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full transition-all ${s.bottleneck ? "bg-rose-500" : cfg.dot}`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {stages.every(s => s.instance_count === 0) && (
                  <p className="text-[12px] text-slate-400 text-center py-4">No active instances</p>
                )}
              </div>
            </div>

            {/* Recent instance table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Recent Instances
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Stage</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id:"INST-0041", stage:"Dept. Review", hours:29, over:true  },
                    { id:"INST-0040", stage:"Validated",    hours:0.5, over:false },
                    { id:"INST-0039", stage:"Dept. Review", hours:12, over:false  },
                    { id:"INST-0038", stage:"Finance Review",hours:6, over:false  },
                  ].map(inst => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3"><code className="text-[12px] font-bold text-slate-700">{inst.id}</code></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-slate-700">{inst.stage}</span>
                          {inst.over && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded">Overdue</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[12px] font-bold ${inst.over ? "text-rose-600" : "text-slate-600"}`}>{inst.hours}h</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ HEALTH TAB ═══════════════ */}
        {tab === "health" && (
          <div className="p-5 space-y-4">

            {/* SLA performance bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">SLA Performance</div>
                <span className={`text-2xl font-bold ${sla.text}`}>{p.on_time_pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
                <div className={`h-2.5 rounded-full transition-all duration-700 ${sla.bar}`} style={{ width:`${p.on_time_pct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0%</span><span>Target: 90%</span><span>100%</span>
              </div>
            </div>

            {/* Stage performance table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Stage Performance
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA Target</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Duration</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stages.filter(s => s.sla_hours > 0).map(s => {
                    const over = s.avg_hours > s.sla_hours;
                    const pct  = s.sla_hours > 0 ? Math.round((s.avg_hours / s.sla_hours) * 100) : 0;
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${s.bottleneck ? "bg-rose-50/30" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {s.bottleneck && <Flame className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                            <span className="text-[12px] font-semibold text-slate-700">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-[12px] text-slate-500">{s.sla_hours}h</td>
                        <td className={`px-3 py-3 text-right text-[12px] font-bold ${over ? "text-rose-600" : "text-emerald-600"}`}>
                          {s.avg_hours > 0 ? `${s.avg_hours}h` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ring-1 ring-inset ${
                            over
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          }`}>
                            {over ? `+${Math.round(s.avg_hours - s.sla_hours)}h over` : "Within SLA"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottleneck callout */}
            {p.bottleneck_stage && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <Flame className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-rose-800 mb-0.5">Bottleneck: {p.bottleneck_stage}</div>
                  <p className="text-[12px] text-rose-700">This stage consistently exceeds its SLA target and is the primary driver of overall cycle time. Consider adding a reviewer or adjusting escalation rules.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-3.5 flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
          <Play className="w-3.5 h-3.5" /> Test Run
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
          <Pause className="w-3.5 h-3.5" /> {p.status === "Active" ? "Pause" : "Activate"}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Duplicate
        </button>
        <span className="text-[11px] text-slate-400 ml-auto">
          {stages.length} stages · {p.active_instances} active
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Processes() {
  const [selected, setSelected] = useState(null);

  const totalActive = PROCESSES.reduce((s, p) => s + p.active_instances, 0);
  const avgOnTime   = Math.round(PROCESSES.reduce((s, p) => s + p.on_time_pct, 0) / PROCESSES.length);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ═════════ LIST PANE ═════════ */}
      <div className={`flex flex-col overflow-hidden transition-all duration-200 ${selected ? "w-[560px] flex-shrink-0" : "flex-1"}`}>

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Processes</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {PROCESSES.filter(p => p.status === "Active").length} active processes · {totalActive} instances running · {avgOnTime}% avg on-time
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Process
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Running Instances", value:totalActive,              color:"text-indigo-600" },
              { label:"Avg On-Time Rate",  value:`${avgOnTime}%`,          color:slaColor(avgOnTime).text },
              { label:"Bottlenecks",       value:PROCESSES.filter(p => p.bottleneck_stage).length, color:"text-rose-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Process list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {PROCESSES.map(p => (
            <ProcessCard key={p.id} p={p}
              active={selected?.id === p.id}
              onClick={() => setSelected(selected?.id === p.id ? null : p)} />
          ))}
        </div>
      </div>

      {/* ═════════ DETAIL PANEL ═════════ */}
      {selected && (
        <DetailPanel process={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
