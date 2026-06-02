import { useState } from "react";
import {
  Plus, Search, ChevronRight, X, Box, Wrench, Home, Package,
  ClipboardCheck, AlertTriangle, UserCog, FileText, CheckSquare,
  Database, GitBranch, Shield, Zap, Link2, Filter, MoreHorizontal,
  ArrowUpRight, TrendingUp, Clock, Tag, Star, Copy
} from "lucide-react";
import Badge from "../components/ui/Badge";
import ObjectBuilder from "../components/ObjectBuilder";

// ─── Data ────────────────────────────────────────────────────────────────────

const ICON_MAP = {
  Vendor: Box, "Work Order": Wrench, Property: Home, Asset: Package,
  Inspection: ClipboardCheck, Issue: AlertTriangle,
  "Employee Change Request": UserCog, Invoice: FileText, Task: CheckSquare,
};

const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200",    dot: "bg-blue-500"    },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500"   },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200",  dot: "bg-indigo-500"  },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  ring: "ring-purple-200",  dot: "bg-purple-500"  },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500"    },
  slate:   { bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200",   dot: "bg-slate-400"   },
  green:   { bg: "bg-green-50",   text: "text-green-700",   ring: "ring-green-200",   dot: "bg-green-500"   },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-700",    ring: "ring-cyan-200",    dot: "bg-cyan-500"    },
};

const OBJECTS = [
  { id:"1", name:"Vendor",                  key:"vendor",             description:"External vendors, suppliers, and contractors",         status:"Active", owner:"Avery Morgan",  record_count:147,  process_count:2, color:"blue",    tags:["procurement","finance"],   field_count:9,  last_updated:"2026-05-28" },
  { id:"2", name:"Work Order",              key:"work_order",         description:"Facilities and maintenance work order lifecycle",       status:"Active", owner:"Jordan Lee",    record_count:312,  process_count:1, color:"amber",   tags:["facilities","operations"], field_count:11, last_updated:"2026-05-26" },
  { id:"3", name:"Property",               key:"property",           description:"Real estate assets and managed facility properties",    status:"Active", owner:"Jordan Lee",    record_count:48,   process_count:1, color:"emerald", tags:["facilities"],              field_count:8,  last_updated:"2026-05-20" },
  { id:"4", name:"Asset",                  key:"asset",              description:"Physical and digital asset inventory and tracking",     status:"Active", owner:"Casey Rivera",  record_count:892,  process_count:0, color:"indigo",  tags:["inventory"],               field_count:14, last_updated:"2026-05-22" },
  { id:"5", name:"Inspection",             key:"inspection",         description:"Property and equipment inspection records",             status:"Active", owner:"Morgan Patel",  record_count:204,  process_count:1, color:"purple",  tags:["compliance","facilities"], field_count:10, last_updated:"2026-05-25" },
  { id:"6", name:"Issue",                  key:"issue",              description:"Operational issues, defects, and incident reports",     status:"Active", owner:"Morgan Patel",  record_count:73,   process_count:0, color:"rose",    tags:["operations"],              field_count:7,  last_updated:"2026-05-18" },
  { id:"7", name:"Employee Change Request",key:"emp_change_request", description:"HR change requests, title changes, and onboarding",    status:"Active", owner:"Avery Morgan",  record_count:56,   process_count:1, color:"slate",   tags:["hr"],                      field_count:12, last_updated:"2026-05-15" },
  { id:"8", name:"Invoice",               key:"invoice",            description:"Vendor invoices, line items, and payment records",      status:"Active", owner:"Avery Morgan",  record_count:438,  process_count:1, color:"green",   tags:["finance"],                 field_count:13, last_updated:"2026-05-27" },
  { id:"9", name:"Task",                  key:"task",               description:"Internal task assignments and action items",            status:"Draft",  owner:"Casey Rivera",  record_count:0,    process_count:0, color:"cyan",    tags:["operations"],              field_count:5,  last_updated:"2026-05-10" },
];

const FIELDS_BY_OBJECT = {
  Vendor: [
    { id:1,  label:"Company Name",    key:"company_name",    type:"Text",      required:true,  system:false, description:"Legal registered company name" },
    { id:2,  label:"Contact Email",   key:"contact_email",   type:"Email",     required:true,  system:false, description:"Primary contact email address" },
    { id:3,  label:"Tax ID / EIN",    key:"tax_id",          type:"Text",      required:true,  system:false, description:"IRS Employer Identification Number" },
    { id:4,  label:"Category",        key:"category",        type:"Select",    required:true,  system:false, description:"Vendor service category", options:["Electrical","HVAC","Plumbing","General Maintenance","IT","Legal","Finance"] },
    { id:5,  label:"Payment Terms",   key:"payment_terms",   type:"Select",    required:false, system:false, description:"Standard payment terms", options:["Net 15","Net 30","Net 45","Net 60"] },
    { id:6,  label:"Phone",           key:"phone",           type:"Phone",     required:false, system:false, description:"Main office phone number" },
    { id:7,  label:"Address",         key:"address",         type:"Long Text", required:false, system:false, description:"Registered business address" },
    { id:8,  label:"Notes",           key:"notes",           type:"Long Text", required:false, system:false, description:"Additional reviewer notes" },
    { id:9,  label:"GL Code",         key:"gl_code",         type:"Text",      required:true,  system:false, description:"General ledger code for payment routing" },
    { id:10, label:"ID",              key:"id",              type:"UUID",      required:true,  system:true,  description:"Auto-generated unique identifier" },
    { id:11, label:"Created Date",    key:"created_date",    type:"Date/Time", required:true,  system:true,  description:"Record creation timestamp" },
    { id:12, label:"Updated Date",    key:"updated_date",    type:"Date/Time", required:true,  system:true,  description:"Last modification timestamp" },
    { id:13, label:"Created By",      key:"created_by",      type:"User Ref",  required:true,  system:true,  description:"User who created this record" },
  ],
  Invoice: [
    { id:1,  label:"Vendor",          key:"vendor",          type:"Relationship",required:true, system:false, description:"Link to Vendor object", rel_target:"Vendor" },
    { id:2,  label:"Amount",          key:"amount",          type:"Currency",  required:true,  system:false, description:"Total invoice amount in USD" },
    { id:3,  label:"PO Number",       key:"po_number",       type:"Text",      required:true,  system:false, description:"Purchase order number for 3-way match" },
    { id:4,  label:"GL Code",         key:"gl_code",         type:"Text",      required:true,  system:false, description:"General ledger routing code" },
    { id:5,  label:"Invoice Date",    key:"invoice_date",    type:"Date",      required:true,  system:false, description:"Date the invoice was issued" },
    { id:6,  label:"Due Date",        key:"due_date",        type:"Date",      required:false, system:false, description:"Payment due date" },
    { id:7,  label:"Status",          key:"status",          type:"Select",    required:true,  system:false, description:"Payment status", options:["Pending","Approved","Paid","Disputed","Cancelled"] },
    { id:8,  label:"Line Items",      key:"line_items",      type:"Number",    required:false, system:false, description:"Number of line items on the invoice" },
    { id:9,  label:"Notes",           key:"notes",           type:"Long Text", required:false, system:false, description:"Additional notes or dispute details" },
    { id:10, label:"ID",              key:"id",              type:"UUID",      required:true,  system:true,  description:"Auto-generated unique identifier" },
    { id:11, label:"Created Date",    key:"created_date",    type:"Date/Time", required:true,  system:true,  description:"Record creation timestamp" },
    { id:12, label:"Updated Date",    key:"updated_date",    type:"Date/Time", required:true,  system:true,  description:"Last modification timestamp" },
    { id:13, label:"Created By",      key:"created_by",      type:"User Ref",  required:true,  system:true,  description:"User who created this record" },
  ],
};

const DEFAULT_FIELDS = [
  { id:1,  label:"ID",           key:"id",           type:"UUID",      required:true, system:true  },
  { id:2,  label:"Created Date", key:"created_date", type:"Date/Time", required:true, system:true  },
  { id:3,  label:"Updated Date", key:"updated_date", type:"Date/Time", required:true, system:true  },
  { id:4,  label:"Created By",   key:"created_by",   type:"User Ref",  required:true, system:true  },
];

const RELATIONSHIPS = {
  Vendor:  [{ name:"Invoices",      target:"Invoice",    type:"Has Many", count:438, description:"All invoices linked to this vendor"           }],
  Invoice: [{ name:"Vendor",        target:"Vendor",     type:"Belongs To",count:1, description:"The vendor this invoice is issued by"         }],
  "Work Order": [
    { name:"Property",    target:"Property",   type:"Belongs To", count:1,  description:"The property this work order belongs to" },
    { name:"Inspections", target:"Inspection", type:"Has Many",   count:12, description:"Inspections triggered by this work order" },
  ],
};

const VALIDATION_RULES = {
  Vendor: [
    { id:1, field:"Tax ID / EIN",  rule:"Format",   condition:"Matches regex ^\\d{2}-\\d{7}$",         severity:"Error",   active:true  },
    { id:2, field:"Contact Email", rule:"Format",   condition:"Valid email address format",              severity:"Error",   active:true  },
    { id:3, field:"Category",      rule:"Required", condition:"Must not be empty",                       severity:"Error",   active:true  },
    { id:4, field:"GL Code",       rule:"Lookup",   condition:"Must exist in GL Code master list",       severity:"Error",   active:true  },
    { id:5, field:"Payment Terms", rule:"Allowed",  condition:"Must be one of: Net 15, 30, 45, 60",     severity:"Warning", active:true  },
    { id:6, field:"Any",           rule:"Duplicate","condition":"Company name + Tax ID must be unique", severity:"Warning", active:true  },
  ],
  Invoice: [
    { id:1, field:"PO Number",    rule:"Required",  condition:"Must not be empty",                       severity:"Error",   active:true  },
    { id:2, field:"GL Code",      rule:"Lookup",    condition:"Must exist in GL Code master list",       severity:"Error",   active:true  },
    { id:3, field:"Amount",       rule:"Threshold", condition:"If > $10,000 require Finance approval",   severity:"Error",   active:true  },
    { id:4, field:"Due Date",     rule:"Date",      condition:"Must be after Invoice Date",              severity:"Warning", active:true  },
    { id:5, field:"Vendor",       rule:"Linked",    condition:"Vendor must be in Approved status",       severity:"Error",   active:false },
  ],
};

const PROCESSES_BY_OBJECT = {
  Vendor: [
    { name:"Vendor Onboarding",   status:"Active", stages:7, active_instances:8,  avg_time:"7.5d" },
    { name:"Vendor Re-evaluation",status:"Draft",  stages:4, active_instances:0,  avg_time:"—"    },
  ],
  Invoice: [
    { name:"Invoice Approval",    status:"Active", stages:6, active_instances:31, avg_time:"2.4d" },
  ],
  "Work Order": [
    { name:"Facilities Work Order", status:"Active", stages:6, active_instances:24, avg_time:"3.2d" },
  ],
};

const RECENT_RECORDS = {
  Vendor: [
    { id:"REC-V-001", name:"Apex Electrical Services", status:"Active", created:"May 30, 2026" },
    { id:"REC-V-002", name:"BlueSky Maintenance",       status:"Active", created:"May 28, 2026" },
    { id:"REC-V-003", name:"Pacific HVAC Solutions",    status:"Active", created:"May 15, 2026" },
  ],
  Invoice: [
    { id:"REC-INV-001", name:"Pacific HVAC — INV-2026-0441", status:"Active", created:"May 26, 2026" },
    { id:"REC-INV-002", name:"BlueSky — INV-2026-0438",       status:"Active", created:"May 24, 2026" },
  ],
};

const TYPE_COLOR = {
  Text:"bg-blue-50 text-blue-700", "Long Text":"bg-blue-50 text-blue-700",
  Number:"bg-purple-50 text-purple-700", Currency:"bg-green-50 text-green-700",
  Date:"bg-amber-50 text-amber-700", "Date/Time":"bg-amber-50 text-amber-700",
  Boolean:"bg-slate-100 text-slate-600", Select:"bg-indigo-50 text-indigo-700",
  "Multi-select":"bg-indigo-50 text-indigo-700", Email:"bg-rose-50 text-rose-700",
  Phone:"bg-rose-50 text-rose-700", File:"bg-slate-100 text-slate-600",
  Image:"bg-slate-100 text-slate-600", Relationship:"bg-emerald-50 text-emerald-700",
  UUID:"bg-slate-100 text-slate-500", "User Ref":"bg-slate-100 text-slate-500",
};

const SEV_STYLE = { Error:"bg-rose-50 text-rose-700 ring-rose-200", Warning:"bg-amber-50 text-amber-700 ring-amber-200" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function ObjectIcon({ name, color, size = "md" }) {
  const Icon = ICON_MAP[name] || Box;
  const c    = COLOR_MAP[color] || COLOR_MAP.slate;
  const sz   = size === "lg" ? "w-12 h-12 rounded-2xl" : "w-8 h-8 rounded-lg";
  const iSz  = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className={`${sz} ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${iSz} ${c.text}`} strokeWidth={1.75} />
    </div>
  );
}

function TypeBadge({ type }) {
  const cls = TYPE_COLOR[type] || "bg-slate-100 text-slate-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>{type}</span>;
}

// ─── Detail panel tabs ────────────────────────────────────────────────────────

function FieldsTab({ obj }) {
  const [editingId, setEditingId] = useState(null);
  const fields = FIELDS_BY_OBJECT[obj.name] || DEFAULT_FIELDS;
  const userFields = fields.filter(f => !f.system);
  const sysFields  = fields.filter(f =>  f.system);

  return (
    <div className="p-5 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {userFields.length} custom · {sysFields.length} system
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Field
        </button>
      </div>

      {/* Custom fields */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-2">
          <div className="col-span-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Label</div>
          <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key</div>
          <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</div>
          <div className="col-span-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Req</div>
          <div className="col-span-2" />
        </div>
        <div className="divide-y divide-slate-100">
          {userFields.map(f => (
            <div key={f.id}
              className={`grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-slate-50/60 transition-colors group cursor-pointer ${editingId === f.id ? "bg-indigo-50/40" : ""}`}
              onClick={() => setEditingId(editingId === f.id ? null : f.id)}>
              <div className="col-span-4">
                <div className="text-[13px] font-semibold text-slate-800">{f.label}</div>
                {f.description && <div className="text-[11px] text-slate-400 mt-0.5 truncate">{f.description}</div>}
              </div>
              <div className="col-span-3">
                <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{f.key}</code>
              </div>
              <div className="col-span-2"><TypeBadge type={f.type} /></div>
              <div className="col-span-1 text-center">
                {f.required
                  ? <span className="text-rose-500 font-bold text-sm">*</span>
                  : <span className="text-slate-300 text-sm">—</span>}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors" title="Copy key">
                  <Copy className="w-3 h-3" />
                </button>
                <button className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {/* Inline expand for selected field */}
          {editingId && (() => {
            const f = userFields.find(x => x.id === editingId);
            if (!f) return null;
            return (
              <div className="px-4 py-4 bg-indigo-50/40 border-t border-indigo-100">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Label</label>
                    <input defaultValue={f.label} className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Field Key</label>
                    <input defaultValue={f.key} className="w-full px-2.5 py-1.5 text-[13px] font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</label>
                    <select defaultValue={f.type} className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none">
                      {Object.keys(TYPE_COLOR).filter(t => !["UUID","User Ref"].includes(t)).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description</label>
                    <input defaultValue={f.description} className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked={f.required} className="accent-indigo-600 w-3.5 h-3.5" /> Required
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" className="accent-indigo-600 w-3.5 h-3.5" /> Unique
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" className="accent-indigo-600 w-3.5 h-3.5" /> Searchable
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                    <input type="checkbox" className="accent-indigo-600 w-3.5 h-3.5" /> Read-only
                  </label>
                </div>
                {f.options && (
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Options</label>
                    <div className="flex flex-wrap gap-1.5">
                      {f.options.map(o => (
                        <span key={o} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">
                          {o} <X className="w-2.5 h-2.5 cursor-pointer hover:text-indigo-900" />
                        </span>
                      ))}
                      <button className="text-[11px] font-semibold text-slate-400 border border-dashed border-slate-300 px-2 py-0.5 rounded-md hover:border-indigo-400 hover:text-indigo-500 transition-colors">+ Add</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Save Field</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* System fields (collapsed) */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System Fields (auto-managed)</div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {sysFields.map(f => (
            <div key={f.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-slate-500">{f.label}</span>
                <code className="text-[11px] font-mono text-slate-400">{f.key}</code>
              </div>
              <TypeBadge type={f.type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelationshipsTab({ obj }) {
  const rels = RELATIONSHIPS[obj.name] || [];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{rels.length} relationships defined</div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Relationship
        </button>
      </div>

      {rels.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><Link2 className="w-5 h-5 text-slate-400" /></div>
          <p className="text-[13px] font-semibold text-slate-600">No relationships defined</p>
          <p className="text-xs text-slate-400 mt-1">Link this object to other objects in the platform.</p>
          <button className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">+ Add first relationship</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {rels.map((r, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{r.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded-md">{r.type}</span>
                      <span className="text-[11px] text-slate-500">→ {r.target}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{r.count.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">linked</div>
                </div>
              </div>
              <p className="text-[12px] text-slate-500">{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationTab({ obj }) {
  const rules = VALIDATION_RULES[obj.name] || [];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{rules.length} rules · {rules.filter(r=>r.active).length} active</div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><Shield className="w-5 h-5 text-slate-400" /></div>
          <p className="text-[13px] font-semibold text-slate-600">No validation rules</p>
          <p className="text-xs text-slate-400 mt-1">Add rules to enforce data quality on intake.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.active ? "bg-emerald-500" : "bg-slate-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-700">{r.field}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{r.rule}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{r.condition}</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ring-1 ring-inset flex-shrink-0 ${SEV_STYLE[r.severity]}`}>{r.severity}</span>
              <button className="w-8 h-5 rounded-full flex-shrink-0 transition-colors relative" style={{ background: r.active ? "#4f46e5" : "#e2e8f0" }}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.active ? "translate-x-3.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcessesTab({ obj }) {
  const procs = PROCESSES_BY_OBJECT[obj.name] || [];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{procs.length} processes linked</div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5" /> Link Process
        </button>
      </div>
      {procs.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><GitBranch className="w-5 h-5 text-slate-400" /></div>
          <p className="text-[13px] font-semibold text-slate-600">No processes linked</p>
          <button className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">+ Link a process</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {procs.map((p, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 ring-1 ring-indigo-200 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-4 h-4 text-indigo-600" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge status={p.status} />
                      <span className="text-[11px] text-slate-400">{p.stages} stages</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">{p.active_instances}</div>
                  <div className="text-[11px] text-slate-400">active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Avg {p.avg_time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordsTab({ obj }) {
  const recent = RECENT_RECORDS[obj.name] || [];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{obj.record_count.toLocaleString()} total records</div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5" /> View All
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label:"Total",    value:obj.record_count.toLocaleString(), color:"text-slate-800" },
          { label:"Active",   value:Math.floor(obj.record_count * 0.92).toLocaleString(), color:"text-emerald-600" },
          { label:"Archived", value:Math.floor(obj.record_count * 0.08).toLocaleString(), color:"text-slate-400"   },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Records</div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            {recent.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-slate-800 truncate">{r.name}</div>
                  <code className="text-[10px] text-slate-400">{r.id}</code>
                </div>
                <Badge status={r.status} />
                <span className="text-[11px] text-slate-400">{r.created}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {recent.length === 0 && obj.record_count === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><Database className="w-5 h-5 text-slate-400" /></div>
          <p className="text-[13px] font-semibold text-slate-600">No records yet</p>
          <p className="text-xs text-slate-400 mt-1">Records will appear here once the object is published and intake begins.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id:"fields",        label:"Fields",        icon:Database    },
  { id:"relationships", label:"Relationships", icon:Link2       },
  { id:"validation",    label:"Validation",    icon:Shield      },
  { id:"processes",     label:"Processes",     icon:GitBranch   },
  { id:"records",       label:"Records",       icon:TrendingUp  },
];

export default function Objects() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected,     setSelected]     = useState(null);
  const [activeTab,    setActiveTab]    = useState("fields");
  const [showBuilder,  setShowBuilder]  = useState(false);

  const filtered = OBJECTS.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.name.toLowerCase().includes(search.toLowerCase()) ||
     o.description.toLowerCase().includes(search.toLowerCase()) ||
     o.tags.some(t => t.includes(search.toLowerCase())))
  );

  const selectObject = (obj) => { setSelected(obj); setActiveTab("fields"); };

  const totalRecords = OBJECTS.reduce((s, o) => s + o.record_count, 0);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ══════════════════════════════════════
          OBJECT LIST
      ══════════════════════════════════════ */}
      <div className={`flex flex-col overflow-hidden transition-all duration-200 ${selected ? "w-[540px] flex-shrink-0" : "flex-1"}`}>

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Object Studio</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {OBJECTS.filter(o => o.status === "Active").length} active objects · {totalRecords.toLocaleString()} total records
              </p>
            </div>
            <button onClick={() => setShowBuilder(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Create Object
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search objects, tags…"
                className="pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white w-52 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-lg">
              {["All","Active","Draft","Archived"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${statusFilter === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Object</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Status</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Owner</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Fields</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Records</th>
                <th className="text-right px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Processes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map(obj => {
                const c      = COLOR_MAP[obj.color] || COLOR_MAP.slate;
                const Icon   = ICON_MAP[obj.name] || Box;
                const active = selected?.id === obj.id;
                return (
                  <tr key={obj.id} onClick={() => selectObject(obj)}
                    className={`cursor-pointer transition-colors border-l-[3px] ${active ? "bg-indigo-50/60 border-l-indigo-500" : "hover:bg-slate-50/70 border-l-transparent"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${c.text}`} strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-800">{obj.name}</span>
                            {obj.status === "Draft" && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded">DRAFT</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-[220px]">{obj.description}</div>
                          <div className="flex items-center gap-1 mt-1 hidden sm:flex flex-wrap">
                            {obj.tags.map(t => (
                              <span key={t} className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell"><Badge status={obj.status} /></td>
                    <td className="px-3 py-3.5 text-[12px] text-slate-500 hidden lg:table-cell">{obj.owner}</td>
                    <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-[12px] font-semibold text-slate-600">{obj.field_count}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-[13px] font-bold text-slate-800">{obj.record_count.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                      <span className={`text-[12px] font-semibold ${obj.process_count > 0 ? "text-indigo-600" : "text-slate-300"}`}>{obj.process_count}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          OBJECT DETAIL PANEL
      ══════════════════════════════════════ */}
      {selected && (() => {
        const obj = selected;
        const c   = COLOR_MAP[obj.color] || COLOR_MAP.slate;
        const Icon = ICON_MAP[obj.name] || Box;
        return (
          <div className="flex-1 min-w-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">

            {/* Panel header */}
            <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h2 className="text-[17px] font-bold text-slate-900">{obj.name}</h2>
                      <Badge status={obj.status} />
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">{obj.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{obj.key}</code>
                      <span>·</span>
                      <span>{obj.field_count} fields</span>
                      <span>·</span>
                      <span>{obj.record_count.toLocaleString()} records</span>
                      <span>·</span>
                      <span>Updated {obj.last_updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setShowBuilder(true)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    Edit Object
                  </button>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label:"Records",   value:obj.record_count.toLocaleString(), color:"text-slate-900",    sub:"total" },
                  { label:"Fields",    value:obj.field_count,                   color:"text-indigo-600",   sub:"defined" },
                  { label:"Processes", value:obj.process_count,                 color:"text-indigo-600",   sub:"linked" },
                  { label:"SLA Rate",  value:"94%",                             color:"text-emerald-600",  sub:"on-time" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tab bar */}
              <div className="flex -mx-6 px-6 overflow-x-auto">
                {DETAIL_TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                      activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}>
                    <tab.icon className="w-3.5 h-3.5" strokeWidth={2} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {activeTab === "fields"        && <FieldsTab        obj={obj} />}
              {activeTab === "relationships" && <RelationshipsTab obj={obj} />}
              {activeTab === "validation"    && <ValidationTab    obj={obj} />}
              {activeTab === "processes"     && <ProcessesTab     obj={obj} />}
              {activeTab === "records"       && <RecordsTab       obj={obj} />}
            </div>
          </div>
        );
      })()}

      {/* Builder modal */}
      {showBuilder && <ObjectBuilder onClose={() => setShowBuilder(false)} />}
    </div>
  );
}
