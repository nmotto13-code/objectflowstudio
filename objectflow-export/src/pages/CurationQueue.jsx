import { useState } from "react";
import AIAssistant from "../components/ui/AIAssistant";
import {
  Search, X, CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  Users, Eye, FileText, Upload, Webhook, PenLine, FileJson,
  Paperclip, Clock, ChevronDown, ArrowRight, Info, GitMerge,
  RotateCcw, Copy, Check
} from "lucide-react";

// ─── Static data ─────────────────────────────────────────────────────────────

const SOURCE_ICON  = { "Form Submission":FileText, "CSV Upload":Upload, "Webhook / API":Webhook, "Manual Entry":PenLine, "JSON Import":FileJson, "File Attachment":Paperclip };
const SOURCE_COLOR = { "Form Submission":"bg-indigo-50 text-indigo-600 ring-indigo-200", "CSV Upload":"bg-emerald-50 text-emerald-600 ring-emerald-200", "Webhook / API":"bg-amber-50 text-amber-600 ring-amber-200", "Manual Entry":"bg-slate-100 text-slate-500 ring-slate-200", "JSON Import":"bg-purple-50 text-purple-600 ring-purple-200", "File Attachment":"bg-blue-50 text-blue-600 ring-blue-200" };
const OBJECT_COLOR = { "Vendor":"bg-blue-50 text-blue-700 ring-blue-200", "Invoice":"bg-green-50 text-green-700 ring-green-200", "Work Order":"bg-amber-50 text-amber-700 ring-amber-200", "Inspection":"bg-purple-50 text-purple-700 ring-purple-200", "Employee Change Request":"bg-slate-100 text-slate-600 ring-slate-200" };

const RECORDS = [
  {
    id:"INT-2026-0483", object_type:"Vendor", source:"CSV Upload", submitted_by:"Casey Rivera",
    submitted_at:"2026-05-30T08:10:00Z", status:"Pending Review", validation_result:"Warning",
    has_duplicate_warning:true, assigned_reviewer:"Morgan Patel", reviewer_avatar:"MP", reviewer_color:"bg-purple-500",
    sla_remaining:"Overdue",
    raw_payload:`{
  "company_name": "BlueSky Maintenance",
  "contact_email": "info@blueskymt.com",
  "tax_id": "33-7821049",
  "category": "General Maintenance",
  "payment_terms": "Net 45",
  "phone": "415-882-0041"
}`,
    mapped_data:[
      { field:"Name",          raw_key:"company_name",  value:"BlueSky Maintenance",  status:"ok"      },
      { field:"Email",         raw_key:"contact_email", value:"info@blueskymt.com",   status:"ok"      },
      { field:"Tax ID",        raw_key:"tax_id",        value:"33-7821049",           status:"warning", note:"Not verified against IRS" },
      { field:"Category",      raw_key:"category",      value:"General Maintenance",  status:"ok"      },
      { field:"Payment Terms", raw_key:"payment_terms", value:"Net 45",               status:"ok"      },
      { field:"Phone",         raw_key:"phone",         value:"415-882-0041",         status:"ok"      },
      { field:"GL Code",       raw_key:null,            value:null,                   status:"missing", note:"Required — not provided in source" },
    ],
    validation_errors:[
      { rule:"Duplicate Check",     severity:"warning", msg:"Possible duplicate: BlueSky Maintenance Group (83% match)" },
      { rule:"Tax ID Verification", severity:"warning", msg:"Tax ID 33-7821049 not confirmed via external lookup"      },
    ],
    duplicates:[
      { id:"REC-V-047", name:"BlueSky Maintenance Group", match:83, fields:["Name","Email Domain","Category"], added:"May 12, 2026" },
      { id:"REC-V-031", name:"Blue Sky Maintenance Co.",  match:71, fields:["Name","Phone"],                   added:"Jan 5, 2026"  },
    ],
    activity:[
      { actor:"System",       action:"Record received via CSV Upload",              ts:"2026-05-30T08:10:00Z" },
      { actor:"System",       action:"Validation completed — 2 warnings raised",   ts:"2026-05-30T08:10:05Z" },
      { actor:"System",       action:"Duplicate check: 2 potential matches found", ts:"2026-05-30T08:10:06Z" },
      { actor:"Morgan Patel", action:"Assigned as reviewer",                       ts:"2026-05-30T08:15:00Z" },
    ],
    reviewer_notes:"",
  },
  {
    id:"INT-2026-0484", object_type:"Work Order", source:"Form Submission", submitted_by:"Taylor Brooks",
    submitted_at:"2026-05-30T07:55:00Z", status:"Pending Review", validation_result:"Pending",
    has_duplicate_warning:false, assigned_reviewer:"Jordan Lee", reviewer_avatar:"JL", reviewer_color:"bg-emerald-500",
    sla_remaining:"58h",
    raw_payload:`{
  "title": "HVAC Unit Replacement — Building C",
  "priority": "High",
  "location": "Building C, Floor 2",
  "requested_by": "Taylor Brooks",
  "requested_date": "2026-05-30",
  "description": "HVAC unit on floor 2 has failed. Full replacement needed before Monday."
}`,
    mapped_data:[
      { field:"Title",          raw_key:"title",          value:"HVAC Unit Replacement — Building C",  status:"ok"      },
      { field:"Priority",       raw_key:"priority",       value:"High",                                status:"ok"      },
      { field:"Location",       raw_key:"location",       value:"Building C, Floor 2",                 status:"ok"      },
      { field:"Requested By",   raw_key:"requested_by",   value:"Taylor Brooks",                       status:"ok"      },
      { field:"Requested Date", raw_key:"requested_date", value:"May 30, 2026",                        status:"ok"      },
      { field:"Description",    raw_key:"description",    value:"HVAC unit on floor 2 has failed…",    status:"ok"      },
      { field:"Assigned To",    raw_key:null,             value:null,                                  status:"missing", note:"Requires assignment before approval" },
    ],
    validation_errors:[],
    duplicates:[],
    activity:[
      { actor:"System",     action:"Record received via Form Submission", ts:"2026-05-30T07:55:00Z" },
      { actor:"System",     action:"Validation queued — awaiting review", ts:"2026-05-30T07:55:01Z" },
      { actor:"Jordan Lee", action:"Assigned as reviewer",                ts:"2026-05-30T08:00:00Z" },
    ],
    reviewer_notes:"",
  },
  {
    id:"INT-2026-0482", object_type:"Invoice", source:"Webhook / API", submitted_by:"ERP System",
    submitted_at:"2026-05-30T09:22:00Z", status:"Needs Fix", validation_result:"Failed",
    has_duplicate_warning:false, assigned_reviewer:"Morgan Patel", reviewer_avatar:"MP", reviewer_color:"bg-purple-500",
    sla_remaining:"Overdue",
    raw_payload:`{
  "vendor": "BuildRight LLC",
  "vendor_id": "V-0041",
  "amount": 12500,
  "currency": "USD",
  "po_number": "",
  "invoice_date": "2026-05-28",
  "due_date": "2026-06-27",
  "line_items": 4
}`,
    mapped_data:[
      { field:"Vendor",       raw_key:"vendor",       value:"BuildRight LLC",  status:"ok"    },
      { field:"Vendor ID",    raw_key:"vendor_id",    value:"V-0041",          status:"ok"    },
      { field:"Amount",       raw_key:"amount",       value:"$12,500.00",      status:"ok"    },
      { field:"Currency",     raw_key:"currency",     value:"USD",             status:"ok"    },
      { field:"PO Number",    raw_key:"po_number",    value:null,              status:"error",  note:"Required field — empty value received" },
      { field:"Invoice Date", raw_key:"invoice_date", value:"May 28, 2026",    status:"ok"    },
      { field:"Due Date",     raw_key:"due_date",     value:"Jun 27, 2026",    status:"ok"    },
      { field:"GL Code",      raw_key:null,           value:null,              status:"error",  note:"No mapping found — cannot route for payment" },
    ],
    validation_errors:[
      { rule:"Required Fields",    severity:"error", msg:"PO number is required but was empty in the source payload"               },
      { rule:"GL Code Mapping",    severity:"error", msg:"GL code has no field mapping — payment routing will fail"                },
      { rule:"Approval Threshold", severity:"error", msg:"Amount $12,500 exceeds auto-approval limit — Finance sign-off required" },
    ],
    duplicates:[],
    activity:[
      { actor:"System",       action:"Record received via Webhook / API (ERP)",         ts:"2026-05-30T09:22:00Z" },
      { actor:"System",       action:"Validation failed — 3 errors found",              ts:"2026-05-30T09:22:02Z" },
      { actor:"System",       action:"Auto-assigned to Morgan Patel (Finance Reviewer)", ts:"2026-05-30T09:22:03Z" },
      { actor:"Morgan Patel", action:"Opened record for review",                        ts:"2026-05-30T10:05:00Z" },
    ],
    reviewer_notes:"Contacted BuildRight LLC for PO number. Awaiting response.",
  },
  {
    id:"INT-2026-0481", object_type:"Vendor", source:"Form Submission", submitted_by:"Taylor Brooks",
    submitted_at:"2026-05-30T10:45:00Z", status:"Validated", validation_result:"Passed",
    has_duplicate_warning:false, assigned_reviewer:"Morgan Patel", reviewer_avatar:"MP", reviewer_color:"bg-purple-500",
    sla_remaining:"10h",
    raw_payload:`{
  "company_name": "Apex Electrical Services",
  "contact_email": "james@apexelec.com",
  "tax_id": "47-2938471",
  "category": "Electrical",
  "payment_terms": "Net 30",
  "phone": "510-334-7820",
  "address": "1400 Harbor Blvd, Oakland, CA 94601"
}`,
    mapped_data:[
      { field:"Name",          raw_key:"company_name",  value:"Apex Electrical Services",   status:"ok", note:"Verified via IRS EIN lookup" },
      { field:"Email",         raw_key:"contact_email", value:"james@apexelec.com",          status:"ok" },
      { field:"Tax ID",        raw_key:"tax_id",        value:"47-2938471",                 status:"ok" },
      { field:"Category",      raw_key:"category",      value:"Electrical",                 status:"ok" },
      { field:"Payment Terms", raw_key:"payment_terms", value:"Net 30",                     status:"ok" },
      { field:"Phone",         raw_key:"phone",         value:"510-334-7820",               status:"ok" },
      { field:"Address",       raw_key:"address",       value:"1400 Harbor Blvd, Oakland",  status:"ok" },
    ],
    validation_errors:[],
    duplicates:[],
    activity:[
      { actor:"System",       action:"Record received via Form Submission",  ts:"2026-05-30T10:45:00Z" },
      { actor:"System",       action:"All validation checks passed",         ts:"2026-05-30T10:45:02Z" },
      { actor:"System",       action:"Duplicate check: no matches found",    ts:"2026-05-30T10:45:03Z" },
      { actor:"Morgan Patel", action:"Assigned as reviewer",                 ts:"2026-05-30T10:48:00Z" },
    ],
    reviewer_notes:"All fields validated. Tax ID confirmed via IRS lookup.",
  },
  {
    id:"INT-2026-0480", object_type:"Inspection", source:"Manual Entry", submitted_by:"Morgan Patel",
    submitted_at:"2026-05-29T16:30:00Z", status:"Approved", validation_result:"Passed",
    has_duplicate_warning:false, assigned_reviewer:"Morgan Patel", reviewer_avatar:"MP", reviewer_color:"bg-purple-500",
    sla_remaining:"Completed",
    raw_payload:`{
  "property": "111 Harbor View Drive",
  "inspection_type": "Annual Fire Safety",
  "inspector": "R. Montoya",
  "result": "Pass",
  "inspection_date": "2026-05-22",
  "certificate_no": "FSC-2026-0441",
  "next_due": "2027-05-22"
}`,
    mapped_data:[
      { field:"Property",        raw_key:"property",        value:"111 Harbor View Drive", status:"ok" },
      { field:"Type",            raw_key:"inspection_type", value:"Annual Fire Safety",    status:"ok" },
      { field:"Inspector",       raw_key:"inspector",       value:"R. Montoya",            status:"ok" },
      { field:"Result",          raw_key:"result",          value:"Pass",                  status:"ok" },
      { field:"Inspection Date", raw_key:"inspection_date", value:"May 22, 2026",          status:"ok" },
      { field:"Certificate No.", raw_key:"certificate_no",  value:"FSC-2026-0441",         status:"ok" },
      { field:"Next Due",        raw_key:"next_due",        value:"May 22, 2027",          status:"ok" },
    ],
    validation_errors:[],
    duplicates:[],
    activity:[
      { actor:"System",       action:"Record received via Manual Entry",  ts:"2026-05-29T16:30:00Z" },
      { actor:"System",       action:"All validation checks passed",      ts:"2026-05-29T16:30:01Z" },
      { actor:"Morgan Patel", action:"Reviewed and approved",             ts:"2026-05-29T17:10:00Z" },
    ],
    reviewer_notes:"Inspection certificate attached. All items cleared.",
  },
  {
    id:"INT-2026-0479", object_type:"Employee Change Request", source:"Form Submission", submitted_by:"Avery Morgan",
    submitted_at:"2026-05-29T14:00:00Z", status:"Rejected", validation_result:"Failed",
    has_duplicate_warning:false, assigned_reviewer:"Avery Morgan", reviewer_avatar:"AM", reviewer_color:"bg-indigo-500",
    sla_remaining:"Completed",
    raw_payload:`{
  "employee": "Derek Shaw",
  "employee_id": "EMP-0284",
  "change_type": "Title Change",
  "current_title": "Manager",
  "new_title": "Senior Manager",
  "effective_date": "2026-06-01",
  "department": "Operations"
}`,
    mapped_data:[
      { field:"Employee",       raw_key:"employee",       value:"Derek Shaw",      status:"ok"    },
      { field:"Employee ID",    raw_key:"employee_id",    value:"EMP-0284",        status:"ok"    },
      { field:"Change Type",    raw_key:"change_type",    value:"Title Change",    status:"ok"    },
      { field:"Current Title",  raw_key:"current_title",  value:"Manager",         status:"ok"    },
      { field:"New Title",      raw_key:"new_title",      value:"Senior Manager",  status:"ok"    },
      { field:"Effective Date", raw_key:"effective_date", value:"Jun 1, 2026",     status:"error", note:"Conflicts with active Q2 headcount freeze" },
      { field:"Department",     raw_key:"department",     value:"Operations",      status:"ok"    },
    ],
    validation_errors:[
      { rule:"Freeze Period Check", severity:"error", msg:"Effective date Jun 1, 2026 falls within active Q2 headcount freeze" },
      { rule:"Budget Approval",     severity:"error", msg:"Grade-level change requires Finance budget approval — not attached"  },
    ],
    duplicates:[],
    activity:[
      { actor:"System",       action:"Record received via Form Submission",          ts:"2026-05-29T14:00:00Z" },
      { actor:"System",       action:"Validation failed — 2 policy violations",     ts:"2026-05-29T14:00:02Z" },
      { actor:"Avery Morgan", action:"Reviewed record",                              ts:"2026-05-29T14:40:00Z" },
      { actor:"Avery Morgan", action:"Rejected — headcount freeze Q2, resubmit Q3", ts:"2026-05-29T14:44:00Z" },
    ],
    reviewer_notes:"Rejected — headcount freeze in effect through Q2. Resubmit in Q3.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtShort = iso => new Date(iso).toLocaleString("en-US",{ month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
const fmtDate  = iso => new Date(iso).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
const fmtTime  = iso => new Date(iso).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" });

// ─── Mini components ─────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const C = {
    "Pending Review":{ bg:"bg-amber-50",   text:"text-amber-700",  ring:"ring-amber-300",   dot:"bg-amber-400"  },
    "Needs Fix":     { bg:"bg-rose-50",    text:"text-rose-700",   ring:"ring-rose-300",    dot:"bg-rose-500"   },
    "Validated":     { bg:"bg-blue-50",    text:"text-blue-700",   ring:"ring-blue-300",    dot:"bg-blue-500"   },
    "Approved":      { bg:"bg-emerald-50", text:"text-emerald-700",ring:"ring-emerald-300", dot:"bg-emerald-500"},
    "Rejected":      { bg:"bg-slate-100",  text:"text-slate-600",  ring:"ring-slate-300",   dot:"bg-slate-400"  },
  }[status] || { bg:"bg-slate-100", text:"text-slate-500", ring:"ring-slate-200", dot:"bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ring-1 ring-inset whitespace-nowrap ${C.bg} ${C.text} ${C.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${C.dot}`}/>
      {status}
    </span>
  );
}

function ValPill({ result }) {
  const C = {
    Passed:  { bg:"bg-emerald-50", text:"text-emerald-700", Icon:CheckCircle2,  ic:"text-emerald-500" },
    Failed:  { bg:"bg-rose-50",    text:"text-rose-700",    Icon:XCircle,       ic:"text-rose-500"    },
    Warning: { bg:"bg-amber-50",   text:"text-amber-700",   Icon:AlertTriangle, ic:"text-amber-500"   },
    Pending: { bg:"bg-slate-100",  text:"text-slate-500",   Icon:Clock,         ic:"text-slate-400"   },
  }[result] || { bg:"bg-slate-100", text:"text-slate-500", Icon:Clock, ic:"text-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${C.bg} ${C.text}`}>
      <C.Icon className={`w-3 h-3 ${C.ic} flex-shrink-0`} strokeWidth={2.5}/>
      {result}
    </span>
  );
}

function FieldStatusDot({ status }) {
  if (status === "ok")      return <CheckCircle2  className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2.5}/>;
  if (status === "error")   return <XCircle       className="w-4 h-4 text-rose-500    flex-shrink-0" strokeWidth={2.5}/>;
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500   flex-shrink-0" strokeWidth={2.5}/>;
  return <span className="w-4 h-4 rounded-full border-2 border-dashed border-slate-300 flex-shrink-0 inline-block mt-0.5"/>;
}

function SLATag({ sla }) {
  if (sla === "Overdue")   return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md whitespace-nowrap"><Clock className="w-3 h-3"/>Overdue</span>;
  if (sla === "Completed") return <span className="text-[11px] text-slate-400 font-medium">—</span>;
  return <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{sla} left</span>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["All","Pending Review","Needs Fix","Validated","Approved","Rejected"];
const DRAWER_TABS    = [
  { id:"mapped",     label:"Mapped Data"  },
  { id:"payload",    label:"Raw Payload"  },
  { id:"validation", label:"Validation"   },
  { id:"duplicates", label:"Duplicates"   },
  { id:"notes",      label:"Notes"        },
  { id:"activity",   label:"Activity"     },
];

export default function CurationQueue() {
  const [selected,     setSelected]     = useState(null);
  const [drawerTab,    setDrawerTab]    = useState("mapped");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notesByID,    setNotesByID]    = useState({});
  const [copied,       setCopied]       = useState(false);

  const open = r => { setSelected(r); setDrawerTab("mapped"); };

  const filtered = RECORDS.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) ||
     r.object_type.toLowerCase().includes(search.toLowerCase()) ||
     r.submitted_by.toLowerCase().includes(search.toLowerCase()) ||
     r.assigned_reviewer.toLowerCase().includes(search.toLowerCase()))
  );

  const countBy = s => RECORDS.filter(r => r.status === s).length;

  const noteVal = r => notesByID[r.id] !== undefined ? notesByID[r.id] : r.reviewer_notes;

  const errCount  = r => r.validation_errors.filter(e => e.severity === "error").length;
  const warnCount = r => r.validation_errors.filter(e => e.severity === "warning").length;

  const copyPayload = async text => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch {}
  };

  const isPending = s => s !== "Approved" && s !== "Rejected";

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ══════════════════════════════════════════════
          QUEUE PANEL
      ══════════════════════════════════════════════ */}
      <div className={`flex flex-col transition-all duration-200 overflow-hidden flex-shrink-0 ${selected ? "w-[580px]" : "flex-1"}`}>

        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Curation Queue</h1>
              <p className="text-sm text-slate-500 mt-0.5">Review, validate, and approve incoming records</p>
            </div>
            {/* Live counters */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {countBy("Needs Fix") > 0 && (
                <button onClick={() => setStatusFilter("Needs Fix")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 ring-1 ring-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">
                  <XCircle className="w-3.5 h-3.5" strokeWidth={2.5}/>{countBy("Needs Fix")} Needs Fix
                </button>
              )}
              {countBy("Pending Review") > 0 && (
                <button onClick={() => setStatusFilter("Pending Review")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                  <Clock className="w-3.5 h-3.5"/>{countBy("Pending Review")} Pending
                </button>
              )}
              {countBy("Validated") > 0 && (
                <button onClick={() => setStatusFilter("Validated")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5}/>{countBy("Validated")} Ready
                </button>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search ID, object, submitter…"
                className="pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-52 bg-white transition-all placeholder:text-slate-400"/>
            </div>
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-lg">
              {STATUS_FILTERS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${statusFilter === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Record</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Source</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Validation</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden xl:table-cell">Reviewer</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map(r => {
                const SrcIcon = SOURCE_ICON[r.source] || FileText;
                const objC    = OBJECT_COLOR[r.object_type] || "bg-slate-100 text-slate-600 ring-slate-200";
                const srcC    = SOURCE_COLOR[r.source] || "bg-slate-100 text-slate-500 ring-slate-200";
                const isActive = selected?.id === r.id;
                const errs  = errCount(r);
                const warns = warnCount(r);

                return (
                  <tr key={r.id} onClick={() => open(r)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? "bg-indigo-50 border-l-[3px] border-l-indigo-500"
                        : r.status === "Needs Fix"
                          ? "hover:bg-rose-50/40 border-l-[3px] border-l-rose-400"
                          : r.has_duplicate_warning
                            ? "hover:bg-amber-50/40 border-l-[3px] border-l-amber-400"
                            : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                    }`}>

                    {/* Record cell */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ring-1 flex-shrink-0 mt-0.5 ${objC}`}>
                          {r.object_type[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <code className="text-[12px] font-bold text-slate-800 tracking-tight">{r.id}</code>
                            {r.has_duplicate_warning && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded">
                                <GitMerge className="w-2.5 h-2.5"/>DUP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ring-1 ${objC}`}>{r.object_type}</span>
                            <span className="text-[11px] text-slate-400">·</span>
                            <span className="text-[11px] text-slate-500">{r.submitted_by}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{fmtDate(r.submitted_at)} · {fmtTime(r.submitted_at)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ring-1 ${srcC}`}>
                        <SrcIcon className="w-3 h-3" strokeWidth={2}/>
                        {r.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5"><StatusPill status={r.status}/></td>

                    {/* Validation */}
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <div className="space-y-1">
                        <ValPill result={r.validation_result}/>
                        {(errs > 0 || warns > 0) && (
                          <div className="flex items-center gap-1">
                            {errs  > 0 && <span className="text-[10px] font-bold text-rose-600  bg-rose-50  px-1.5 py-0.5 rounded">{errs}E</span>}
                            {warns > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{warns}W</span>}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Reviewer */}
                    <td className="px-3 py-3.5 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${r.reviewer_color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {r.reviewer_avatar}
                        </div>
                        <span className="text-[12px] text-slate-600 truncate">{r.assigned_reviewer}</span>
                      </div>
                    </td>

                    {/* SLA */}
                    <td className="px-5 py-3.5 text-right"><SLATag sla={r.sla_remaining}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-slate-400"/>
              </div>
              <p className="text-sm font-semibold text-slate-600">No records match</p>
              <button onClick={() => { setSearch(""); setStatusFilter("All"); }}
                className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
                <RotateCcw className="w-3.5 h-3.5"/> Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          REVIEW DRAWER
      ══════════════════════════════════════════════ */}
      {selected && (() => {
        const r      = selected;
        const SrcIcon = SOURCE_ICON[r.source] || FileText;
        const objC    = OBJECT_COLOR[r.object_type] || "bg-slate-100 text-slate-600 ring-slate-200";
        const srcC    = SOURCE_COLOR[r.source] || "bg-slate-100 text-slate-500 ring-slate-200";
        const errs    = errCount(r);
        const warns   = warnCount(r);

        return (
          <div className="flex-1 min-w-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">

            {/* ── Drawer header ── */}
            <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 flex-shrink-0">
              {/* Title row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ring-1 flex-shrink-0 ${objC}`}>
                    {r.object_type[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <code className="text-base font-bold text-slate-900 tracking-tight">{r.id}</code>
                      {r.has_duplicate_warning && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-md">
                          <GitMerge className="w-3 h-3"/>Duplicate Warning
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ring-1 ${objC}`}>{r.object_type}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ring-1 ${srcC}`}>
                        <SrcIcon className="w-3 h-3" strokeWidth={2}/>{r.source}
                      </span>
                      <StatusPill status={r.status}/>
                      <ValPill result={r.validation_result}/>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              {/* Meta strip */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submitted By</p>
                  <p className="text-[12px] font-bold text-slate-700">{r.submitted_by}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtShort(r.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reviewer</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full ${r.reviewer_color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>{r.reviewer_avatar}</div>
                    <p className="text-[12px] font-bold text-slate-700 truncate">{r.assigned_reviewer}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SLA</p>
                  <SLATag sla={r.sla_remaining}/>
                </div>
              </div>

              {/* Validation alert banner */}
              {(errs > 0 || warns > 0) && (
                <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border mb-3 ${errs > 0 ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                  {errs > 0
                    ? <XCircle      className="w-4 h-4 text-rose-600  flex-shrink-0" strokeWidth={2.5}/>
                    : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2.5}/>}
                  <p className={`text-[12px] font-semibold flex-1 ${errs > 0 ? "text-rose-800" : "text-amber-800"}`}>
                    {errs > 0
                      ? `${errs} validation error${errs > 1?"s":""} must be resolved before this record can be approved`
                      : `${warns} warning${warns > 1?"s":""} detected — review carefully before approving`}
                  </p>
                  <button onClick={() => setDrawerTab("validation")}
                    className={`text-[11px] font-bold underline underline-offset-2 flex-shrink-0 ${errs > 0 ? "text-rose-700" : "text-amber-700"}`}>
                    View
                  </button>
                </div>
              )}

              {/* Drawer tabs */}
              <div className="flex border-b-0 overflow-x-auto -mx-6 px-6">
                {DRAWER_TABS.map(tab => {
                  const hasDot = (tab.id === "validation" && (errs > 0 || warns > 0)) || (tab.id === "duplicates" && r.duplicates.length > 0);
                  return (
                    <button key={tab.id} onClick={() => setDrawerTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                        drawerTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"
                      }`}>
                      {tab.label}
                      {tab.id === "validation" && errs > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{errs}</span>
                      )}
                      {tab.id === "validation" && errs === 0 && warns > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/>
                      )}
                      {tab.id === "duplicates" && r.duplicates.length > 0 && (
                        <span className="bg-amber-400 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{r.duplicates.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto bg-slate-50">

              {/* MAPPED DATA */}
              {drawerTab === "mapped" && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Field Mapping</h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {r.mapped_data.filter(f => f.status === "ok").length} / {r.mapped_data.length} mapped OK
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Column header */}
                    <div className="grid grid-cols-12 gap-0 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Field</div>
                      <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Key</div>
                      <div className="col-span-1"/>
                      <div className="col-span-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {r.mapped_data.map((f, i) => (
                        <div key={i} className={`grid grid-cols-12 items-start px-4 py-3 transition-colors hover:bg-slate-50 ${
                          f.status === "error"   ? "bg-rose-50/60"   :
                          f.status === "warning" ? "bg-amber-50/40"  :
                          f.status === "missing" ? "bg-slate-50/80"  : ""
                        }`}>
                          <div className="col-span-3 flex items-center pt-0.5">
                            <span className="text-[13px] font-semibold text-slate-700">{f.field}</span>
                          </div>
                          <div className="col-span-3 flex items-center pt-0.5">
                            {f.raw_key
                              ? <code className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{f.raw_key}</code>
                              : <span className="text-[11px] text-slate-300 italic">—</span>}
                          </div>
                          <div className="col-span-1 flex justify-center pt-0.5">
                            <FieldStatusDot status={f.status}/>
                          </div>
                          <div className="col-span-5">
                            {f.value
                              ? <span className={`text-[13px] font-semibold leading-snug ${
                                  f.status === "error" ? "text-rose-700" : f.status === "warning" ? "text-amber-800" : "text-slate-900"
                                }`}>{f.value}</span>
                              : <span className="text-[12px] text-rose-500 italic font-medium">Empty / missing</span>}
                            {f.note && (
                              <p className={`flex items-center gap-1 text-[11px] font-medium mt-0.5 ${
                                f.status === "error" ? "text-rose-600" : f.status === "warning" ? "text-amber-600" : "text-emerald-600"
                              }`}>
                                <Info className="w-3 h-3 flex-shrink-0"/>{f.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RAW PAYLOAD */}
              {drawerTab === "payload" && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Raw Payload</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{r.source} · {fmtShort(r.submitted_at)}</span>
                      <button onClick={() => copyPayload(r.raw_payload)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        {copied ? <Check className="w-3 h-3 text-emerald-500"/> : <Copy className="w-3 h-3"/>}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"/>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{r.id}.json</span>
                    </div>
                    <pre className="px-5 py-4 text-[12px] font-mono leading-relaxed overflow-x-auto">
                      {r.raw_payload.split("\n").map((line, i) => {
                        const isKey  = line.match(/^\s+"[^"]+"/);
                        const isVal  = line.includes(":");
                        const isEmpty = line.match(/:\s*("|)(|)("|),?\s*$/);
                        const color  = isEmpty ? "text-rose-400" : isKey ? "text-slate-300" : "text-emerald-300";
                        return <div key={i} className={color}>{line}</div>;
                      })}
                    </pre>
                  </div>
                  <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>
                    <span className="text-[11px] text-slate-500">This is the original payload received. Red lines indicate empty or missing values.</span>
                  </div>
                </div>
              )}

              {/* VALIDATION */}
              {drawerTab === "validation" && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Validation Results</h3>
                    <ValPill result={r.validation_result}/>
                  </div>

                  {r.validation_errors.length === 0 ? (
                    <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5}/>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-emerald-800">All validation checks passed</p>
                        <p className="text-[12px] text-emerald-600 mt-0.5">This record passed all {r.mapped_data.length} field validation rules.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 mb-5">
                      {[...r.validation_errors].sort((a,b) => a.severity === "error" ? -1 : 1).map((e, i) => (
                        <div key={i} className={`flex gap-3.5 p-4 rounded-xl border ${e.severity === "error" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${e.severity === "error" ? "bg-rose-100" : "bg-amber-100"}`}>
                            {e.severity === "error"
                              ? <XCircle       className="w-4 h-4 text-rose-600"  strokeWidth={2.5}/>
                              : <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={2.5}/>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${e.severity === "error" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                                {e.severity}
                              </span>
                              <span className={`text-[11px] font-bold ${e.severity === "error" ? "text-rose-700" : "text-amber-700"}`}>{e.rule}</span>
                            </div>
                            <p className={`text-[13px] font-medium leading-snug ${e.severity === "error" ? "text-rose-900" : "text-amber-900"}`}>{e.msg}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Field-level summary grid */}
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Field-Level Summary</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label:"Passed",   count:r.mapped_data.filter(f=>f.status==="ok").length,      color:"bg-emerald-50 text-emerald-700 ring-emerald-200" },
                      { label:"Errors",   count:r.mapped_data.filter(f=>f.status==="error").length,   color:"bg-rose-50 text-rose-700 ring-rose-200"          },
                      { label:"Warnings", count:r.mapped_data.filter(f=>f.status==="warning").length, color:"bg-amber-50 text-amber-700 ring-amber-200"       },
                      { label:"Missing",  count:r.mapped_data.filter(f=>f.status==="missing").length, color:"bg-slate-100 text-slate-600 ring-slate-200"      },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl p-3 text-center ring-1 ring-inset ${s.color}`}>
                        <div className="text-xl font-bold">{s.count}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wide mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DUPLICATES */}
              {drawerTab === "duplicates" && (
                <div className="p-5">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Duplicate Matches</h3>

                  {r.duplicates.length === 0 ? (
                    <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5}/>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-emerald-800">No duplicates found</p>
                        <p className="text-[12px] text-emerald-600 mt-0.5">This record has no matching entries in the system.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <AIAssistant context="duplicate" compact className="mb-3"
                        onApply={(s) => console.log("AI duplicate strategy:", s)}
                      />
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <GitMerge className="w-4 h-4 text-amber-600 flex-shrink-0"/>
                        <p className="text-[12px] font-semibold text-amber-800">
                          {r.duplicates.length} potential duplicate{r.duplicates.length > 1 ? "s" : ""} detected. Resolve each match before approving.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {r.duplicates.map((d, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                              <div>
                                <code className="text-[11px] font-bold text-slate-400">{d.id}</code>
                                <p className="text-[14px] font-bold text-slate-800 mt-0.5">{d.name}</p>
                              </div>
                              <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${d.match >= 80 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                                {d.match}% match
                              </div>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Matching fields</p>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {d.fields.map(f => (
                                  <span key={f} className="text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 rounded-md">{f}</span>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-400">Added to system: {d.added}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">
                                <GitMerge className="w-3.5 h-3.5"/> Merge into this
                              </button>
                              <button className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                                View existing
                              </button>
                              <button className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ml-auto">
                                Not a duplicate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* NOTES */}
              {drawerTab === "notes" && (
                <div className="p-5">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reviewer Notes</h3>
                  <textarea
                    value={noteVal(r)}
                    onChange={e => setNotesByID({ ...notesByID, [r.id]: e.target.value })}
                    placeholder="Add notes about this record — issues found, actions taken, or context for the decision…"
                    rows={6}
                    className="w-full px-4 py-3 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all leading-relaxed shadow-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">{noteVal(r).length} characters</span>
                    <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                      Save Notes
                    </button>
                  </div>
                  {r.reviewer_notes && notesByID[r.id] === undefined && (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Previously saved by {r.assigned_reviewer}</p>
                      <p className="text-[13px] text-indigo-900 font-medium leading-relaxed">{r.reviewer_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVITY */}
              {drawerTab === "activity" && (
                <div className="p-5">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Audit Trail</h3>
                  <div className="relative pl-5">
                    {r.activity.map((a, i) => {
                      const isSystem = a.actor === "System";
                      const isLast   = i === r.activity.length - 1;
                      return (
                        <div key={i} className={`relative pb-5 ${!isLast ? "border-l-2 border-slate-200" : ""}`}>
                          <div className={`absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center ${isSystem ? "bg-slate-400" : "bg-indigo-500"}`}>
                            {!isSystem && <span className="text-white text-[8px] font-black">{a.actor[0]}</span>}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                              <span className={`text-[12px] font-bold ${isSystem ? "text-slate-500" : "text-slate-800"}`}>{a.actor}</span>
                              <span className="text-[11px] text-slate-400">{fmtShort(a.ts)}</span>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-snug">{a.action}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Action footer ── */}
            {isPending(r.status) ? (
              <div className="flex-shrink-0 border-t border-slate-200 bg-white p-4 space-y-2">
                {errs > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-semibold text-rose-700">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5}/>
                    Approval blocked — {errs} error{errs > 1?"s":""} must be resolved first
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm ${
                    errs > 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                  }`} disabled={errs > 0}>
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5}/> Approve Record
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl text-[13px] font-bold hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm">
                    <XCircle className="w-4 h-4" strokeWidth={2.5}/> Reject Record
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5"/> Request Changes
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Users className="w-3.5 h-3.5"/> Reassign
                  </button>
                  <button onClick={() => setDrawerTab("notes")}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Eye className="w-3.5 h-3.5"/> Add Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${r.status === "Approved" ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"}`}>
                  {r.status === "Approved"
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={2.5}/>
                    : <XCircle      className="w-5 h-5 text-slate-500    flex-shrink-0" strokeWidth={2.5}/>}
                  <div>
                    <p className={`text-[13px] font-bold ${r.status === "Approved" ? "text-emerald-800" : "text-slate-700"}`}>
                      Record {r.status}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      by {r.assigned_reviewer} · {fmtDate(r.activity[r.activity.length - 1].ts)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
