import { useState } from "react";
import AIAssistant from "./ui/AIAssistant";
import {
  X, Plus, Trash2, GripVertical, Sparkles, Upload, Code2,
  FileSpreadsheet, Layers, ArrowRight, ArrowLeft, Check,
  Box, Briefcase, Package, FileText, Users, Building2,
  AlertCircle, Info, ChevronDown, ChevronRight
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const FIELD_TYPES = [
  { type:"Text",           group:"Basic"    },
  { type:"Long Text",      group:"Basic"    },
  { type:"Number",         group:"Basic"    },
  { type:"Currency",       group:"Basic"    },
  { type:"Boolean",        group:"Basic"    },
  { type:"Date",           group:"Date"     },
  { type:"Date/Time",      group:"Date"     },
  { type:"Select",         group:"Choice"   },
  { type:"Multi-select",   group:"Choice"   },
  { type:"Email",          group:"Contact"  },
  { type:"Phone",          group:"Contact"  },
  { type:"URL",            group:"Contact"  },
  { type:"Relationship",   group:"Advanced" },
  { type:"File",           group:"Advanced" },
  { type:"Image",          group:"Advanced" },
  { type:"Formula",        group:"Advanced" },
];

const TYPE_COLOR = {
  Text:"bg-blue-50 text-blue-700", "Long Text":"bg-blue-50 text-blue-700",
  Number:"bg-purple-50 text-purple-700", Currency:"bg-green-50 text-green-700",
  Boolean:"bg-slate-100 text-slate-600",
  Date:"bg-amber-50 text-amber-700", "Date/Time":"bg-amber-50 text-amber-700",
  Select:"bg-indigo-50 text-indigo-700", "Multi-select":"bg-indigo-50 text-indigo-700",
  Email:"bg-rose-50 text-rose-700", Phone:"bg-rose-50 text-rose-700", URL:"bg-rose-50 text-rose-700",
  Relationship:"bg-emerald-50 text-emerald-700", File:"bg-slate-100 text-slate-600",
  Image:"bg-slate-100 text-slate-600", Formula:"bg-violet-50 text-violet-700",
};

const TEMPLATES = [
  {
    id:"vendor",    name:"Vendor",         icon:Briefcase,  color:"bg-blue-50 text-blue-700 ring-blue-200",
    description:"External suppliers, contractors, and service providers",
    tags:["procurement","finance"],
    fields:[
      { label:"Company Name",    key:"company_name",    type:"Text",      required:true  },
      { label:"Contact Email",   key:"contact_email",   type:"Email",     required:true  },
      { label:"Tax ID / EIN",    key:"tax_id",          type:"Text",      required:true  },
      { label:"Category",        key:"category",        type:"Select",    required:true  },
      { label:"Payment Terms",   key:"payment_terms",   type:"Select",    required:false },
      { label:"Phone",           key:"phone",           type:"Phone",     required:false },
      { label:"Address",         key:"address",         type:"Long Text", required:false },
      { label:"GL Code",         key:"gl_code",         type:"Text",      required:true  },
      { label:"Notes",           key:"notes",           type:"Long Text", required:false },
    ],
  },
  {
    id:"work_order", name:"Work Order",    icon:Package,    color:"bg-amber-50 text-amber-700 ring-amber-200",
    description:"Facilities, maintenance, and operational work requests",
    tags:["facilities","operations"],
    fields:[
      { label:"Title",           key:"title",           type:"Text",      required:true  },
      { label:"Priority",        key:"priority",        type:"Select",    required:true  },
      { label:"Location",        key:"location",        type:"Text",      required:true  },
      { label:"Requested By",    key:"requested_by",    type:"Text",      required:true  },
      { label:"Requested Date",  key:"requested_date",  type:"Date",      required:true  },
      { label:"Description",     key:"description",     type:"Long Text", required:false },
      { label:"Assigned To",     key:"assigned_to",     type:"Text",      required:false },
      { label:"Status",          key:"status",          type:"Select",    required:true  },
    ],
  },
  {
    id:"inspection", name:"Inspection",   icon:AlertCircle, color:"bg-purple-50 text-purple-700 ring-purple-200",
    description:"Property and equipment inspection records with certificates",
    tags:["compliance","facilities"],
    fields:[
      { label:"Property",        key:"property",        type:"Text",      required:true  },
      { label:"Inspection Type", key:"inspection_type", type:"Select",    required:true  },
      { label:"Inspector",       key:"inspector",       type:"Text",      required:true  },
      { label:"Result",          key:"result",          type:"Select",    required:true  },
      { label:"Inspection Date", key:"inspection_date", type:"Date",      required:true  },
      { label:"Certificate No.", key:"certificate_no",  type:"Text",      required:false },
      { label:"Next Due",        key:"next_due",        type:"Date",      required:false },
      { label:"Notes",           key:"notes",           type:"Long Text", required:false },
    ],
  },
  {
    id:"invoice",   name:"Invoice",       icon:FileText,   color:"bg-green-50 text-green-700 ring-green-200",
    description:"Vendor invoices, line items, and approval workflows",
    tags:["finance"],
    fields:[
      { label:"Vendor",          key:"vendor",          type:"Relationship",required:true },
      { label:"Amount",          key:"amount",          type:"Currency",   required:true  },
      { label:"PO Number",       key:"po_number",       type:"Text",       required:true  },
      { label:"GL Code",         key:"gl_code",         type:"Text",       required:true  },
      { label:"Invoice Date",    key:"invoice_date",    type:"Date",       required:true  },
      { label:"Due Date",        key:"due_date",        type:"Date",       required:false },
      { label:"Status",          key:"status",          type:"Select",     required:true  },
    ],
  },
  {
    id:"asset",     name:"Asset",         icon:Box,        color:"bg-indigo-50 text-indigo-700 ring-indigo-200",
    description:"Physical and digital asset inventory and tracking",
    tags:["inventory"],
    fields:[
      { label:"Asset Name",      key:"asset_name",      type:"Text",       required:true  },
      { label:"Asset Type",      key:"asset_type",      type:"Select",     required:true  },
      { label:"Serial Number",   key:"serial_number",   type:"Text",       required:false },
      { label:"Location",        key:"location",        type:"Text",       required:false },
      { label:"Assigned To",     key:"assigned_to",     type:"Text",       required:false },
      { label:"Purchase Date",   key:"purchase_date",   type:"Date",       required:false },
      { label:"Value",           key:"value",           type:"Currency",   required:false },
      { label:"Status",          key:"status",          type:"Select",     required:true  },
    ],
  },
  {
    id:"hr_request", name:"HR Request",   icon:Users,      color:"bg-slate-100 text-slate-600 ring-slate-200",
    description:"Employee change requests, title changes, and onboarding",
    tags:["hr"],
    fields:[
      { label:"Employee",        key:"employee",        type:"Text",       required:true  },
      { label:"Employee ID",     key:"employee_id",     type:"Text",       required:true  },
      { label:"Change Type",     key:"change_type",     type:"Select",     required:true  },
      { label:"Effective Date",  key:"effective_date",  type:"Date",       required:true  },
      { label:"Department",      key:"department",      type:"Text",       required:false },
      { label:"Justification",   key:"justification",   type:"Long Text",  required:true  },
    ],
  },
];

const SYSTEM_FIELDS = [
  { label:"ID",           key:"id",           type:"UUID",      required:true },
  { label:"Created Date", key:"created_date", type:"Date/Time", required:true },
  { label:"Updated Date", key:"updated_date", type:"Date/Time", required:true },
  { label:"Created By",   key:"created_by",   type:"User Ref",  required:true },
];

const SAMPLE_JSON = `{
  "fields": [
    { "label": "Contract Title", "key": "title",        "type": "Text",      "required": true  },
    { "label": "Vendor",         "key": "vendor",       "type": "Text",      "required": true  },
    { "label": "Start Date",     "key": "start_date",   "type": "Date",      "required": true  },
    { "label": "End Date",       "key": "end_date",     "type": "Date",      "required": false },
    { "label": "Value",          "key": "value",        "type": "Currency",  "required": false },
    { "label": "Status",         "key": "status",       "type": "Select",    "required": true  }
  ]
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const cls = TYPE_COLOR[type] || "bg-slate-100 text-slate-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>{type}</span>;
}

let _nextId = 10;
const newField = () => ({ id: _nextId++, label: "New Field", key: `field_${_nextId}`, type: "Text", required: false, options: [] });
const slugify  = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id:"start",  label:"Get Started"   },
  { id:"config", label:"Configure"     },
  { id:"fields", label:"Define Fields" },
  { id:"review", label:"Review"        },
];

function StepBar({ current }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 flex-shrink-0">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
            i < idx  ? "text-indigo-600" :
            i === idx ? "bg-indigo-600 text-white shadow-sm" :
            "text-slate-400"
          }`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black border-2 flex-shrink-0 ${
              i < idx  ? "bg-indigo-600 border-indigo-600 text-white" :
              i === idx ? "border-white text-white" :
              "border-slate-300 text-slate-400"
            }`}>
              {i < idx ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : i + 1}
            </div>
            {s.label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-6 h-px mx-1 ${i < idx ? "bg-indigo-300" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ObjectBuilder({ onClose }) {
  const [step,          setStep]          = useState("start");
  const [startMode,     setStartMode]     = useState(null);   // blank | template | json | csv | ai
  const [selectedTmpl,  setSelectedTmpl]  = useState(null);
  const [name,          setName]          = useState("");
  const [desc,          setDesc]          = useState("");
  const [color,         setColor]         = useState("blue");
  const [tags,          setTags]          = useState("");
  const [aiPrompt,      setAiPrompt]      = useState("");
  const [jsonText,      setJsonText]      = useState(SAMPLE_JSON);
  const [fields,        setFields]        = useState([]);
  const [editingId,     setEditingId]     = useState(null);
  const [addingGroup,   setAddingGroup]   = useState(null);

  // ── field ops ──
  const addField = (group) => {
    const f = newField();
    setFields(prev => [...prev, f]);
    setEditingId(f.id);
    setAddingGroup(null);
  };
  const removeField  = id => { setFields(prev => prev.filter(f => f.id !== id)); if (editingId === id) setEditingId(null); };
  const updateField  = (id, k, v) => setFields(prev => prev.map(f => f.id === id ? { ...f, [k]: v } : f));

  // ── navigation ──
  const goToConfig = () => {
    if (startMode === "template" && selectedTmpl) {
      setName(selectedTmpl.name);
      setDesc(selectedTmpl.description);
      setFields(selectedTmpl.fields.map((f, i) => ({ ...f, id: i + 1 })));
    }
    if (startMode === "blank") setFields([]);
    setStep("config");
  };

  const goToFields = () => setStep("fields");
  const goToReview = () => setStep("review");

  const canGoConfig = startMode && (startMode !== "template" || selectedTmpl) && (startMode !== "ai" || aiPrompt.trim());
  const canGoFields = name.trim();

  const COLORS = ["blue","indigo","emerald","amber","purple","rose","green","slate","cyan"];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden" style={{ maxHeight:"92vh" }}>

        {/* ── Modal header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4.5 h-4.5 text-indigo-600" size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">
                {step === "start"  ? "Create Business Object"    :
                 step === "config" ? (name ? `Configure: ${name}` : "Configure Object")  :
                 step === "fields" ? `Fields: ${name || "Untitled"}` :
                 `Review: ${name}`}
              </h2>
              <div className="mt-1"><StepBar current={step} /></div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ════════════════════════════
              STEP 1: START
          ════════════════════════════ */}
          {step === "start" && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">How would you like to create this object?</h3>
                <div className="grid grid-cols-1 gap-2.5">

                  {/* Blank */}
                  <StartCard id="blank" active={startMode === "blank"} onClick={() => setStartMode("blank")}
                    icon={<Layers className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-100"
                    title="Start from Blank" badge="Most flexible"
                    desc="Define every field from scratch. Best for custom objects with unique requirements." />

                  {/* Template */}
                  <StartCard id="template" active={startMode === "template"} onClick={() => setStartMode("template")}
                    icon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100"
                    title="Use a Template" badge={`${TEMPLATES.length} templates`}
                    desc="Start from a pre-built schema for common business objects like Vendor, Invoice, or Asset." />

                  {startMode === "template" && (
                    <div className="ml-4 grid grid-cols-2 gap-2 pb-1">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => setSelectedTmpl(t)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                            selectedTmpl?.id === t.id
                              ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
                              : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white"
                          }`}>
                          <div className={`w-8 h-8 rounded-lg ring-1 flex items-center justify-center flex-shrink-0 ${t.color}`}>
                            <t.icon className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[12px] font-bold ${selectedTmpl?.id === t.id ? "text-indigo-800" : "text-slate-800"}`}>{t.name}</span>
                              {selectedTmpl?.id === t.id && <Check className="w-3.5 h-3.5 text-indigo-600" strokeWidth={3} />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{t.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{t.fields.length} fields pre-configured</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* JSON */}
                  <StartCard id="json" active={startMode === "json"} onClick={() => setStartMode("json")}
                    icon={<Code2 className="w-5 h-5 text-purple-600" />} bg="bg-purple-100"
                    title="Paste JSON Schema" badge="Import"
                    desc="Import a JSON field definition from an existing system or export." />

                  {startMode === "json" && (
                    <div className="ml-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">JSON Schema</span>
                        <button onClick={() => setJsonText(SAMPLE_JSON)} className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold">Load example</button>
                      </div>
                      <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={8}
                        className="w-full px-4 py-3 text-[12px] font-mono bg-slate-950 text-slate-300 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none leading-relaxed" />
                    </div>
                  )}

                  {/* CSV */}
                  <StartCard id="csv" active={startMode === "csv"} onClick={() => setStartMode("csv")}
                    icon={<Upload className="w-5 h-5 text-amber-600" />} bg="bg-amber-100"
                    title="Upload CSV Sample" badge="Auto-detect"
                    desc="Upload a CSV file and ObjectFlow will automatically detect fields and types from the column headers." />

                  {startMode === "csv" && (
                    <div className="ml-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-[13px] font-semibold text-slate-500">Drop a CSV file here</p>
                        <p className="text-[11px] text-slate-400 mt-1">or click to browse — max 5MB</p>
                      </div>
                    </div>
                  )}

                  {/* AI */}
                  <StartCard id="ai" active={startMode === "ai"} onClick={() => setStartMode("ai")}
                    icon={<Sparkles className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-100"
                    title="Describe with AI Assistant" badge="Recommended"
                    desc="Describe what you need in plain language and the AI will generate a complete field schema." />

                  {startMode === "ai" && (
                    <div className="ml-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Describe your object</span>
                      </div>
                      <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                        placeholder="e.g. A contract object for vendor agreements. Include fields for vendor name, contract value, start date, end date, contract type, signatory name, and renewal terms."
                        rows={4}
                        className="w-full px-3 py-2.5 text-[13px] border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed" />
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-500">
                        <Info className="w-3 h-3" /> AI will suggest a name, description, and complete field list.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════
              STEP 2: CONFIG
          ════════════════════════════ */}
          {step === "config" && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Object Name <span className="text-rose-500">*</span></label>
                  <input value={name} onChange={e => { setName(e.target.value); }} placeholder="e.g. Contract, Lease, Permit, Claim…"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this object represent? Who manages these records?"
                    rows={2} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">API Key (auto)</label>
                  <div className="px-3.5 py-2.5 border border-slate-100 rounded-xl bg-slate-50 text-[12px] font-mono text-slate-400">
                    {name ? slugify(name) || "object_key" : "object_key"}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tags</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. finance, compliance…"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Object Color</label>
                <div className="flex items-center gap-2">
                  {COLORS.map(c => {
                    const cls = {
                      blue:"bg-blue-500", indigo:"bg-indigo-500", emerald:"bg-emerald-500",
                      amber:"bg-amber-500", purple:"bg-purple-500", rose:"bg-rose-500",
                      green:"bg-green-500", slate:"bg-slate-400", cyan:"bg-cyan-500",
                    }[c];
                    return (
                      <button key={c} onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-lg ${cls} transition-all ${color === c ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "hover:scale-105"}`} />
                    );
                  })}
                </div>
              </div>

              {/* System fields preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Fields (always included)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_FIELDS.map(f => (
                    <span key={f.key} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />{f.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════
              STEP 3: FIELDS
          ════════════════════════════ */}
          {step === "fields" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Define fields for <span className="text-indigo-600">{name}</span></p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click any row to edit. {fields.length} custom field{fields.length !== 1 ? "s" : ""} defined.</p>
                </div>
                <button onClick={() => addField()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Field
                </button>
              </div>

              {/* AI field suggestions */}
              <AIAssistant context="fields" className="mb-4"
                onApply={(suggestions) => {
                  suggestions.forEach((s, i) => {
                    const parts = s.match(/^([^(]+)\s*\(([^,)]+)/);
                    if (parts) {
                      const id = Date.now() + i;
                      const type = parts[2].trim();
                      setFields(prev => [...prev, { id, label: parts[1].trim(), key: parts[1].trim().toLowerCase().replace(/[^a-z0-9]/g,"_"), type, required: s.includes("required"), options: [] }]);
                    }
                  });
                }}
              />

              {/* Field table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-0 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <div className="col-span-1 w-6" />
                  <div className="col-span-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Label</div>
                  <div className="col-span-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Key</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</div>
                  <div className="col-span-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Req</div>
                  <div className="col-span-1" />
                </div>

                {fields.length === 0 && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-[13px] font-semibold text-slate-500">No fields yet</p>
                    <button onClick={() => addField()} className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">+ Add your first field</button>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {fields.map(f => (
                    <div key={f.id}>
                      {/* Field row */}
                      <div className={`grid grid-cols-12 items-center px-4 py-3 cursor-pointer group transition-colors ${editingId === f.id ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}
                        onClick={() => setEditingId(editingId === f.id ? null : f.id)}>
                        <div className="col-span-1"><GripVertical className="w-4 h-4 text-slate-300 cursor-grab" /></div>
                        <div className="col-span-4">
                          <span className="text-[13px] font-semibold text-slate-800">{f.label || <span className="text-slate-400 italic">Untitled</span>}</span>
                        </div>
                        <div className="col-span-3">
                          <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{f.key || "—"}</code>
                        </div>
                        <div className="col-span-2"><TypeBadge type={f.type} /></div>
                        <div className="col-span-1 text-center">
                          {f.required ? <span className="text-rose-500 font-bold">*</span> : <span className="text-slate-300">—</span>}
                        </div>
                        <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); removeField(f.id); }}
                            className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline edit panel */}
                      {editingId === f.id && (
                        <div className="px-4 py-4 bg-indigo-50/40 border-t border-indigo-100">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Label</label>
                              <input value={f.label} onChange={e => updateField(f.id, "label", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-[13px] font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Field Key</label>
                              <input value={f.key} onChange={e => updateField(f.id, "key", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-[12px] font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</label>
                              <select value={f.type} onChange={e => updateField(f.id, "type", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                {["Basic","Date","Choice","Contact","Advanced"].map(group => (
                                  <optgroup key={group} label={group}>
                                    {FIELD_TYPES.filter(t => t.group === group).map(t => <option key={t.type}>{t.type}</option>)}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Placeholder</label>
                              <input placeholder="e.g. Enter company name…"
                                className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                            </div>
                          </div>

                          {/* Options (for Select/Multi-select) */}
                          {(f.type === "Select" || f.type === "Multi-select") && (
                            <div className="mb-3">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Options</label>
                              <div className="flex flex-wrap gap-1.5">
                                {(f.options || []).map((o, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">
                                    {o} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => updateField(f.id, "options", f.options.filter((_, j) => j !== i))} />
                                  </span>
                                ))}
                                <input placeholder="+ Add option" onKeyDown={e => {
                                  if (e.key === "Enter" && e.target.value.trim()) {
                                    updateField(f.id, "options", [...(f.options||[]), e.target.value.trim()]);
                                    e.target.value = "";
                                  }
                                }} className="text-[11px] border border-dashed border-slate-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-indigo-400 w-24" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-3">
                            {[
                              ["Required",    "required"],
                              ["Unique",      "unique"],
                              ["Searchable",  "searchable"],
                              ["Read-only",   "readonly"],
                            ].map(([label, key]) => (
                              <label key={key} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={!!f[key]} onChange={e => updateField(f.id, key, e.target.checked)}
                                  className="accent-indigo-600 w-3.5 h-3.5" />
                                {label}
                              </label>
                            ))}
                          </div>
                          <button onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System fields preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Auto-included system fields</div>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_FIELDS.map(f => (
                    <span key={f.key} className="text-[11px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{f.label}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════
              STEP 4: REVIEW
          ════════════════════════════ */}
          {step === "review" && (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-indigo-900">{name}</h3>
                  <p className="text-[12px] text-indigo-700 mt-0.5">{desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-[11px] font-mono text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">{slugify(name)}</code>
                    <span className="text-[11px] text-indigo-500">{fields.length + SYSTEM_FIELDS.length} total fields</span>
                  </div>
                </div>
              </div>

              {/* Field summary */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Custom Fields ({fields.length})</div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                  {fields.map(f => (
                    <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-[13px] font-semibold text-slate-700 flex-1">{f.label}</span>
                      <code className="text-[11px] font-mono text-slate-400">{f.key}</code>
                      <TypeBadge type={f.type} />
                      {f.required && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded">Required</span>}
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="px-4 py-4 text-center text-[12px] text-slate-400">No custom fields defined — only system fields will be included.</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <p className="text-[12px] text-emerald-800 font-medium">
                  This object will be created as <strong>Draft</strong> and can be published once field validation rules and relationships are configured.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">Cancel</button>
          <div className="flex items-center gap-2">
            {step !== "start" && (
              <button onClick={() => {
                if (step === "config") setStep("start");
                if (step === "fields") setStep("config");
                if (step === "review") setStep("fields");
              }}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step === "start"  && (
              <button onClick={goToConfig} disabled={!canGoConfig}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === "config" && (
              <button onClick={goToFields} disabled={!canGoFields}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                Define Fields <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === "fields" && (
              <button onClick={goToReview}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                Review <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === "review" && (
              <button onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                <Check className="w-4 h-4" strokeWidth={2.5} /> Create Object
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StartCard({ id, active, onClick, icon, bg, title, badge, desc }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left w-full transition-all ${
        active ? "border-indigo-500 bg-indigo-50/60 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60"
      }`}>
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] font-bold ${active ? "text-indigo-800" : "text-slate-800"}`}>{title}</span>
          {badge && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        active ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
      }`}>
        {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
