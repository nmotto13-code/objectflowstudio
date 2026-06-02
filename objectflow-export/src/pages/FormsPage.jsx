import { useState, useRef } from "react";
import AIAssistant from "../components/ui/AIAssistant";
import {
  Plus, FileText, X, Eye, Code2, Settings, GripVertical, Trash2,
  ChevronRight, ChevronDown, AlertTriangle, CheckCircle2, Layers,
  Link2, GitBranch, Copy, Check, ToggleLeft, ToggleRight,
  Monitor, Smartphone, ArrowRight, ArrowLeft, Zap, Info,
  EyeOff, PlusCircle, List, AlignLeft, Hash, Calendar,
  ToggleLeft as Toggle, Upload, Image, Pen, Star, Minus
} from "lucide-react";
import Badge from "../components/ui/Badge";

// ─── Static data ──────────────────────────────────────────────────────────────

const FORMS = [
  {
    id:"1", name:"Facilities Work Order Form",
    description:"Submit facilities maintenance and repair requests",
    status:"Published", bound_object:"Work Order", bound_process:"Facilities Work Order",
    submission_count:312, created_by:"Jordan Lee", form_mode:"Advanced",
    is_multi_step:true, steps:3, last_modified:"May 28, 2026",
  },
  {
    id:"2", name:"Vendor Request Form",
    description:"New vendor onboarding and supplier intake",
    status:"Published", bound_object:"Vendor", bound_process:"Vendor Onboarding",
    submission_count:147, created_by:"Avery Morgan", form_mode:"Advanced",
    is_multi_step:true, steps:4, last_modified:"May 26, 2026",
  },
  {
    id:"3", name:"Inspection Intake Form",
    description:"Field inspection data capture for managed properties",
    status:"Published", bound_object:"Inspection", bound_process:"Property Inspection Review",
    submission_count:204, created_by:"Morgan Patel", form_mode:"Basic",
    is_multi_step:false, steps:1, last_modified:"May 20, 2026",
  },
  {
    id:"4", name:"Employee Change Request Form",
    description:"HR change requests — title, dept, compensation",
    status:"Published", bound_object:"Employee Change Request", bound_process:"Employee Change Request",
    submission_count:56, created_by:"Avery Morgan", form_mode:"Advanced",
    is_multi_step:true, steps:2, last_modified:"May 18, 2026",
  },
  {
    id:"5", name:"Invoice Submission Form",
    description:"Vendor invoice submission with GL code routing",
    status:"Draft", bound_object:"Invoice", bound_process:"Invoice Approval",
    submission_count:0, created_by:"Casey Rivera", form_mode:"Code",
    is_multi_step:false, steps:1, last_modified:"May 30, 2026",
  },
];

const OBJECTS = ["Work Order","Vendor","Inspection","Invoice","Employee Change Request","Asset","Property","Issue"];
const PROCESSES = ["Facilities Work Order","Vendor Onboarding","Property Inspection Review","Invoice Approval","Employee Change Request"];

const FIELD_TYPES = [
  { type:"Text",          icon:AlignLeft,  group:"Basic"     },
  { type:"Long Text",     icon:AlignLeft,  group:"Basic"     },
  { type:"Number",        icon:Hash,       group:"Basic"     },
  { type:"Currency",      icon:Hash,       group:"Basic"     },
  { type:"Date",          icon:Calendar,   group:"Basic"     },
  { type:"Dropdown",      icon:List,       group:"Choice"    },
  { type:"Multi-select",  icon:List,       group:"Choice"    },
  { type:"Checkbox",      icon:Toggle,     group:"Choice"    },
  { type:"Radio Group",   icon:Toggle,     group:"Choice"    },
  { type:"File Upload",   icon:Upload,     group:"Media"     },
  { type:"Image Upload",  icon:Image,      group:"Media"     },
  { type:"Signature",     icon:Pen,        group:"Media"     },
  { type:"Rating",        icon:Star,       group:"Special"   },
  { type:"Section Header",icon:Minus,      group:"Layout"    },
  { type:"Divider",       icon:Minus,      group:"Layout"    },
];

const TYPE_COLOR = {
  Text:"bg-blue-50 text-blue-700", "Long Text":"bg-blue-50 text-blue-700",
  Number:"bg-purple-50 text-purple-700", Currency:"bg-green-50 text-green-700",
  Date:"bg-amber-50 text-amber-700", Dropdown:"bg-indigo-50 text-indigo-700",
  "Multi-select":"bg-indigo-50 text-indigo-700", Checkbox:"bg-slate-100 text-slate-600",
  "Radio Group":"bg-slate-100 text-slate-600", "File Upload":"bg-orange-50 text-orange-700",
  "Image Upload":"bg-orange-50 text-orange-700", Signature:"bg-pink-50 text-pink-700",
  Rating:"bg-yellow-50 text-yellow-700", "Section Header":"bg-slate-100 text-slate-500",
  Divider:"bg-slate-100 text-slate-500",
};

// Work Order form — canonical example
const WO_STEPS = [
  { id:"step1", label:"Request Details",   fields:["f1","f2","f3","f4"] },
  { id:"step2", label:"Location & Photos", fields:["f5","f6","f7"]      },
  { id:"step3", label:"Review & Submit",   fields:["f8"]                 },
];

const WO_FIELDS = [
  { id:"f1", label:"Work Order Title",     key:"title",          type:"Text",        required:true,  step:"step1", object_field:"title",       visible:true, conditions:[] },
  { id:"f2", label:"Priority",             key:"priority",       type:"Dropdown",    required:true,  step:"step1", object_field:"priority",    visible:true, conditions:[], options:["Low","Medium","High","Emergency"] },
  { id:"f3", label:"Requested Date",       key:"requested_date", type:"Date",        required:true,  step:"step1", object_field:"requested_date",visible:true,conditions:[] },
  { id:"f4", label:"Requested By",         key:"requested_by",   type:"Text",        required:true,  step:"step1", object_field:"requested_by", visible:true, conditions:[] },
  { id:"f5", label:"Location / Building",  key:"location",       type:"Text",        required:true,  step:"step2", object_field:"location",    visible:true, conditions:[] },
  { id:"f6", label:"Description of Issue", key:"description",    type:"Long Text",   required:true,  step:"step2", object_field:"description", visible:true, conditions:[] },
  { id:"f7", label:"Attach Photo",         key:"photo",          type:"Image Upload",required:false, step:"step2", object_field:null,           visible:true, conditions:[{ field:"priority", op:"equals", value:"Emergency", action:"require" }] },
  { id:"f8", label:"Emergency Notes",      key:"emergency_notes",type:"Long Text",   required:false, step:"step3", object_field:null,           visible:false,conditions:[{ field:"priority", op:"equals", value:"Emergency", action:"show" }] },
];

// ─── Code editor content ───────────────────────────────────────────────────────

const CODE_JS = `// ObjectFlow Form API — executes in a secure sandbox.
// All DOM access is blocked. Only approved methods are available.

// ── Field Values ─────────────────────────────────────────────
const priority = form.getValue("priority");
form.setValue("status", "Submitted");

// ── Field Visibility ──────────────────────────────────────────
if (priority === "Emergency") {
  form.showField("emergency_notes");
  form.requireField("photo_upload");
  form.hideSection("standard_flow");
} else {
  form.hideField("emergency_notes");
  form.showSection("standard_flow");
}

// ── Validation ────────────────────────────────────────────────
form.setError("location", "Please specify a building.");
form.clearError("location");

// ── Section Control ───────────────────────────────────────────
form.hideSection("vendor_details");
form.showSection("vendor_details");

// ── Lifecycle Hooks ───────────────────────────────────────────
form.onLoad(() => {
  // Runs when the form mounts — pre-fill values, hide sections, etc.
  form.setValue("requested_by", currentUser.full_name);
});

form.onFieldChange("priority", (newVal, oldVal) => {
  if (newVal === "Emergency") {
    form.showField("emergency_notes");
  }
});

form.onBeforeSubmit(() => {
  const loc = form.getValue("location");
  if (!loc || loc.trim() === "") {
    form.setError("location", "Location is required before submitting.");
    return false; // Block submission
  }
  return true; // Allow submission
});

form.onAfterSubmit((record) => {
  // record.id contains the newly created record ID
  console.log("Record created:", record.id);
});`;

const CODE_HTML = `<!-- Custom HTML injected into the form wrapper.
     Use sparingly — prefer field config and CSS instead.
     Standard HTML tags are supported. Scripts are blocked. -->

<div class="of-notice of-notice--info" data-field-visible="emergency_notes">
  <strong>Emergency submissions</strong> are escalated immediately
  to the on-call Facilities Manager. Expect a response within 1 hour.
</div>

<div class="of-notice of-notice--warning" id="budget-warning" style="display:none">
  This request may exceed the monthly maintenance budget.
  Finance review will be required.
</div>`;

const CODE_CSS = `/* Scoped to this form only — class prefix: .of-form-{form-id} */

/* Override field label style */
.of-field-label {
  font-weight: 700;
  font-size: 13px;
  color: #334155;
}

/* Make priority field stand out */
.of-field[data-key="priority"] select {
  border-width: 2px;
}

/* Emergency notice styling */
.of-notice {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 16px;
}
.of-notice--info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
.of-notice--warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

/* Step progress bar */
.of-step-bar__item.is-active {
  color: #4f46e5;
  font-weight: 700;
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ModePill({ mode }) {
  const cfg = {
    Basic:    "bg-slate-100 text-slate-600",
    Advanced: "bg-blue-50 text-blue-700",
    Code:     "bg-purple-50 text-purple-700",
  }[mode] || "bg-slate-100 text-slate-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${cfg}`}>{mode}</span>;
}

function TypeTag({ type }) {
  const cls = TYPE_COLOR[type] || "bg-slate-100 text-slate-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>{type}</span>;
}

// ─── Live Preview ──────────────────────────────────────────────────────────────

function LivePreview({ form: f, fields, steps, currentStep }) {
  const step   = steps[currentStep] || steps[0];
  const stepFs = step ? fields.filter(fi => fi.step === step.id) : fields;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Preview header */}
      <div className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-between">
        <span className="text-white text-[13px] font-bold">{f.name}</span>
        <span className="text-indigo-200 text-[11px]">Preview</span>
      </div>

      {/* Step bar */}
      {f.is_multi_step && steps.length > 1 && (
        <div className="flex items-center gap-0 px-5 py-3 border-b border-slate-100 bg-slate-50 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-1.5 whitespace-nowrap ${i === currentStep ? "text-indigo-600" : i < currentStep ? "text-emerald-600" : "text-slate-400"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                  i < currentStep ? "bg-emerald-500 border-emerald-500 text-white" :
                  i === currentStep ? "border-indigo-500 text-indigo-600" :
                  "border-slate-300 text-slate-400"
                }`}>
                  {i < currentStep ? <Check className="w-3 h-3" strokeWidth={3}/> : i+1}
                </div>
                <span className="text-[11px] font-semibold">{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* Fields */}
      <div className="p-5 space-y-4">
        {stepFs.map(fi => {
          if (!fi.visible && !fi.conditions.find(c => c.action === "show")) return null;
          const isHidden = !fi.visible;
          return (
            <div key={fi.id} className={`${isHidden ? "opacity-40" : ""}`}>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                {fi.label}
                {fi.required && <span className="text-rose-500 ml-1">*</span>}
                {fi.object_field && (
                  <span className="ml-2 text-[10px] font-semibold text-indigo-500 bg-indigo-50 ring-1 ring-indigo-200 px-1.5 py-0.5 rounded">{fi.object_field}</span>
                )}
                {fi.conditions.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded flex-shrink-0 inline-flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />Conditional
                  </span>
                )}
              </label>
              {fi.type === "Text" && <div className="h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 text-[12px] text-slate-400 flex items-center">Enter {fi.label.toLowerCase()}…</div>}
              {fi.type === "Long Text" && <div className="h-20 px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[12px] text-slate-400">Enter {fi.label.toLowerCase()}…</div>}
              {fi.type === "Date" && <div className="h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 text-[12px] text-slate-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-300"/>mm/dd/yyyy</div>}
              {fi.type === "Dropdown" && (
                <div className="h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 text-[12px] text-slate-400 flex items-center justify-between">
                  <span>Select {fi.label.toLowerCase()}…</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
              {fi.type === "Image Upload" && (
                <div className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[12px] text-slate-400">
                  <Image className="w-4 h-4" /> Drop image or click to upload
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        {f.is_multi_step && currentStep > 0
          ? <button className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5"/>Back</button>
          : <div />}
        <button className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
          {f.is_multi_step && currentStep < steps.length - 1 ? <>Next<ArrowRight className="w-3.5 h-3.5"/></> : <>Submit<CheckCircle2 className="w-3.5 h-3.5"/></>}
        </button>
      </div>
    </div>
  );
}

// ─── Basic Mode ────────────────────────────────────────────────────────────────

function BasicMode({ form: f, fields, setFields, steps }) {
  const [dragging, setDragging]     = useState(null);
  const [over,     setOver]         = useState(null);
  const [activeStep, setActiveStep] = useState(steps[0]?.id || null);
  const [editId,   setEditId]       = useState(null);
  const [previewStep, setPreviewStep] = useState(0);
  const nextId = useRef(fields.length + 10);

  const visibleFields = activeStep ? fields.filter(fi => fi.step === activeStep) : fields;
  const editField     = fields.find(fi => fi.id === editId);

  const addField = (type) => {
    const id = `f_new_${nextId.current++}`;
    const newF = { id, label:`New ${type}`, key:`field_${id}`, type, required:false, step:activeStep || "step1", object_field:null, visible:true, conditions:[], options:[] };
    setFields(prev => [...prev, newF]);
    setEditId(id);
  };
  const updateField = (id, k, v) => setFields(prev => prev.map(fi => fi.id === id ? { ...fi, [k]:v } : fi));
  const removeField = (id) => { setFields(prev => prev.filter(fi => fi.id !== id)); if (editId === id) setEditId(null); };

  const handleDragStart = (id) => setDragging(id);
  const handleDragOver  = (e, id) => { e.preventDefault(); setOver(id); };
  const handleDrop      = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setOver(null); return; }
    setFields(prev => {
      const arr = [...prev];
      const fi = arr.findIndex(x => x.id === dragging);
      const ti = arr.findIndex(x => x.id === targetId);
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
    setDragging(null); setOver(null);
  };

  return (
    <div className="flex gap-4 p-4 h-full overflow-hidden">
      {/* Left: Field palette + canvas */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Step tabs */}
        {f.is_multi_step && steps.length > 1 && (
          <div className="flex items-center gap-1 mb-3 flex-shrink-0 flex-wrap">
            {steps.map((s, i) => (
              <button key={s.id} onClick={() => setActiveStep(s.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  activeStep === s.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}>
                Step {i+1}: {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {visibleFields.map(fi => (
            <div key={fi.id}
              draggable onDragStart={() => handleDragStart(fi.id)}
              onDragOver={e => handleDragOver(e, fi.id)}
              onDrop={e => handleDrop(e, fi.id)}
              className={`bg-white border-2 rounded-xl transition-all group ${
                over === fi.id ? "border-indigo-400 bg-indigo-50/40" :
                editId === fi.id ? "border-indigo-300 bg-indigo-50/20" :
                "border-slate-200 hover:border-slate-300"
              }`}>
              {/* Row */}
              <div className="flex items-center gap-3 px-3 py-3" onClick={() => setEditId(editId === fi.id ? null : fi.id)}>
                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 cursor-grab flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-slate-800">{fi.label}</span>
                    {fi.required && <span className="text-rose-500 text-sm font-bold">*</span>}
                    <TypeTag type={fi.type} />
                    {fi.object_field && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Link2 className="w-2.5 h-2.5"/>{ fi.object_field}
                      </span>
                    )}
                    {fi.conditions.length > 0 && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5"/>Conditional
                      </span>
                    )}
                    {!fi.visible && <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1"><EyeOff className="w-2.5 h-2.5"/>Hidden</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); removeField(fi.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>

              {/* Inline editor */}
              {editId === fi.id && (
                <div className="border-t border-indigo-100 px-3 py-3 bg-white rounded-b-xl">
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Label</label>
                      <input value={fi.label} onChange={e => updateField(fi.id,"label",e.target.value)}
                        className="w-full px-2.5 py-2 text-[13px] font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Field Key</label>
                      <input value={fi.key} onChange={e => updateField(fi.id,"key",e.target.value)}
                        className="w-full px-2.5 py-2 text-[12px] font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</label>
                      <select value={fi.type} onChange={e => updateField(fi.id,"type",e.target.value)}
                        className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        {FIELD_TYPES.map(t => <option key={t.type}>{t.type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bind to Object Field</label>
                      <input value={fi.object_field || ""} onChange={e => updateField(fi.id,"object_field",e.target.value || null)}
                        placeholder="e.g. priority"
                        className="w-full px-2.5 py-2 text-[12px] font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"/>
                    </div>
                  </div>
                  {(fi.type === "Dropdown" || fi.type === "Multi-select" || fi.type === "Radio Group") && (
                    <div className="mb-2.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Options</label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {(fi.options||[]).map((o,i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">
                            {o} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => updateField(fi.id,"options",(fi.options||[]).filter((_,j)=>j!==i))}/>
                          </span>
                        ))}
                        <input placeholder="+ Add" onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value.trim()){ updateField(fi.id,"options",[...(fi.options||[]),e.target.value.trim()]); e.target.value=""; }}}
                          className="text-[11px] border border-dashed border-slate-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-indigo-400 w-20 bg-white"/>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {[["Required","required"],["Visible","visible"],["Read-only","readonly"]].map(([l,k])=>(
                      <label key={k} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!fi[k]} onChange={e=>updateField(fi.id,k,e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5"/>
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Drop zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl py-4 text-center text-[12px] text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            onClick={() => addField("Text")}>
            <Plus className="w-4 h-4 mx-auto mb-1"/> Drop field here or click to add Text
          </div>
        </div>

        {/* AI field suggestions */}
        <div className="flex-shrink-0 mt-3 pt-3 border-t border-slate-200">
          <AIAssistant context="fields" compact className="mb-3 w-full"
            onApply={(suggestions) => {
              suggestions.forEach((s, i) => {
                const parts = s.match(/^([^(]+)\s*\(([^,)]+)/);
                if (parts) addField(parts[2].trim() || "Text");
              });
            }}
          />
        </div>

        {/* Field palette */}
        <div className="flex-shrink-0 mt-0 pt-3 border-t border-slate-200">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add Field</div>
          <div className="grid grid-cols-4 gap-1.5">
            {FIELD_TYPES.filter(t => t.group !== "Layout").slice(0,8).map(t => (
              <button key={t.type} onClick={() => addField(t.type)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-center group">
                <t.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors"/>
                <span className="text-[9px] font-semibold text-slate-500 group-hover:text-indigo-600 leading-tight">{t.type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Monitor className="w-3.5 h-3.5"/></button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><Smartphone className="w-3.5 h-3.5"/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LivePreview form={f} fields={fields} steps={steps} currentStep={previewStep} />
        </div>
        {f.is_multi_step && steps.length > 1 && (
          <div className="flex items-center justify-between px-1">
            <button onClick={() => setPreviewStep(s => Math.max(0,s-1))} disabled={previewStep === 0}
              className="text-xs font-bold text-slate-500 disabled:opacity-30 flex items-center gap-1"><ArrowLeft className="w-3 h-3"/>Prev</button>
            <span className="text-[10px] text-slate-400 font-medium">Step {previewStep+1}/{steps.length}</span>
            <button onClick={() => setPreviewStep(s => Math.min(steps.length-1,s+1))} disabled={previewStep === steps.length-1}
              className="text-xs font-bold text-slate-500 disabled:opacity-30 flex items-center gap-1">Next<ArrowRight className="w-3 h-3"/></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Advanced Mode ─────────────────────────────────────────────────────────────

function AdvancedMode({ form: f, fields, setFields, steps }) {
  const [activeField, setActiveField] = useState(null);
  const [advTab, setAdvTab] = useState("field");
  const [previewStep, setPreviewStep] = useState(0);

  const fi = fields.find(x => x.id === activeField);
  const updateField = (id, k, v) => setFields(prev => prev.map(x => x.id === id ? { ...x, [k]:v } : x));

  return (
    <div className="flex h-full overflow-hidden gap-0">
      {/* Field list */}
      <div className="w-52 flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fields ({fields.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {fields.map(x => (
            <button key={x.id} onClick={() => { setActiveField(x.id); setAdvTab("field"); }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                activeField === x.id ? "bg-indigo-600 text-white" : "hover:bg-white text-slate-600"
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeField === x.id ? "bg-indigo-200" : (TYPE_COLOR[x.type]||"").split(" ")[0]?.replace("bg-","bg-") || "bg-slate-400"}`} />
              <span className="text-[11px] font-semibold truncate">{x.label}</span>
              {!x.visible && <EyeOff className="w-3 h-3 flex-shrink-0 opacity-60"/>}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-slate-200">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5"/>Add Field
          </button>
        </div>
      </div>

      {/* Config panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {fi ? (
          <>
            {/* Field header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px] font-bold text-slate-800">{fi.label}</span>
                <TypeTag type={fi.type}/>
              </div>
              <div className="flex gap-0">
                {[
                  {id:"field",   label:"Field Config"},
                  {id:"binding", label:"Object Binding"},
                  {id:"logic",   label:"Conditions"},
                  {id:"validation",label:"Validation"},
                ].map(t => (
                  <button key={t.id} onClick={() => setAdvTab(t.id)}
                    className={`px-3 py-1.5 text-[11px] font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                      advTab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}>{t.label}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Field Config */}
              {advTab === "field" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["Label","label","text"],["Field Key","key","mono"],["Placeholder","placeholder","text"],["Help Text","help_text","text"]].map(([l,k,mono])=>(
                      <div key={k}>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{l}</label>
                        <input defaultValue={fi[k]||""} onChange={e => updateField(fi.id,k,e.target.value)}
                          className={`w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${mono==="mono"?"font-mono text-[12px]":""}`}/>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      ["Required",   "required"  ],
                      ["Visible",    "visible"   ],
                      ["Read-only",  "readonly"  ],
                      ["Unique",     "unique"    ],
                      ["Searchable", "searchable"],
                      ["Disabled",   "disabled"  ],
                    ].map(([l,k])=>(
                      <label key={k} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={!!fi[k]} onChange={e=>updateField(fi.id,k,e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5"/>
                        {l}
                      </label>
                    ))}
                  </div>
                  {(fi.type === "Dropdown" || fi.type === "Multi-select" || fi.type === "Radio Group") && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Options</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(fi.options||[]).map((o,i)=>(
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">
                            {o}<X className="w-2.5 h-2.5 cursor-pointer" onClick={()=>updateField(fi.id,"options",(fi.options||[]).filter((_,j)=>j!==i))}/>
                          </span>
                        ))}
                        <input placeholder="+ Add option" onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){updateField(fi.id,"options",[...(fi.options||[]),e.target.value.trim()]);e.target.value="";}}}
                          className="text-[11px] border border-dashed border-slate-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-indigo-400 w-24 bg-white"/>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Object Binding */}
              {advTab === "binding" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="w-3.5 h-3.5 text-indigo-600"/>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest">Object Binding</span>
                    </div>
                    <p className="text-[12px] text-indigo-700">Bind this form field to a field on the <strong>{f.bound_object}</strong> object. Submitted values will be mapped to this field automatically.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bound to Object Field</label>
                    <select value={fi.object_field||""} onChange={e=>updateField(fi.id,"object_field",e.target.value||null)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                      <option value="">— Not bound —</option>
                      {["title","priority","location","requested_by","requested_date","description","status","assigned_to"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    {fi.object_field && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5}/>
                        Bound to <code className="font-mono bg-emerald-50 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded">{fi.object_field}</code> on {f.bound_object}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transform on Submit</label>
                    <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                      <option>None — use raw value</option>
                      <option>Trim whitespace</option>
                      <option>Uppercase</option>
                      <option>Lowercase</option>
                      <option>Format as currency</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditions */}
              {advTab === "logic" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600"/>
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Conditional Visibility</span>
                    </div>
                    <p className="text-[12px] text-amber-700">Show, hide, or require this field based on the value of another field.</p>
                  </div>
                  {fi.conditions.length === 0 ? (
                    <div className="text-center py-6">
                      <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
                      <p className="text-[12px] text-slate-500 font-medium">No conditions set — field is always visible</p>
                      <button className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">+ Add condition</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {fi.conditions.map((c, i) => (
                        <div key={i} className="bg-white border border-amber-200 rounded-xl p-3.5">
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">When Field</label>
                              <select defaultValue={c.field} className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none">
                                {fields.map(x => <option key={x.id}>{x.key}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operator</label>
                              <select defaultValue={c.op} className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none">
                                {["equals","not equals","contains","is empty","is not empty"].map(o=><option key={o}>{o}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Value</label>
                              <input defaultValue={c.value} className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none"/>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Then</label>
                            <select defaultValue={c.action} className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none">
                              {["show","hide","require","make optional","disable","enable"].map(a=><option key={a}>{a}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-2 border-2 border-dashed border-amber-200 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5">
                        <Plus className="w-3.5 h-3.5"/>Add condition
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Validation */}
              {advTab === "validation" && (
                <div className="space-y-3">
                  {[
                    { label:"Min Length", type:"number", placeholder:"e.g. 3"       },
                    { label:"Max Length", type:"number", placeholder:"e.g. 200"     },
                    { label:"Pattern (regex)", type:"text", placeholder:"e.g. ^\\d{2}-\\d{7}$" },
                    { label:"Custom Error Message", type:"text", placeholder:"e.g. This field is required." },
                  ].map(v => (
                    <div key={v.label}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{v.label}</label>
                      <input type={v.type} placeholder={v.placeholder}
                        className="w-full px-2.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Settings className="w-6 h-6 text-slate-400"/>
            </div>
            <p className="text-[13px] font-semibold text-slate-600">Select a field to configure</p>
            <p className="text-[12px] text-slate-400 mt-1">Choose from the field list on the left to edit bindings, conditions, and validation.</p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="w-56 flex-shrink-0 border-l border-slate-200 flex flex-col p-3 gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LivePreview form={f} fields={fields} steps={steps} currentStep={previewStep}/>
        </div>
      </div>
    </div>
  );
}

// ─── Code Mode ─────────────────────────────────────────────────────────────────

function CodeMode() {
  const [codeTab, setCodeTab] = useState("js");
  const [copied,  setCopied]  = useState(false);

  const tabs = [
    { id:"js",  label:"JavaScript", content:CODE_JS  },
    { id:"html",label:"HTML",       content:CODE_HTML },
    { id:"css", label:"CSS",        content:CODE_CSS  },
  ];
  const active = tabs.find(t => t.id === codeTab);

  const copy = async () => {
    try { await navigator.clipboard.writeText(active.content); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch {}
  };

  // Basic syntax highlight classes per line
  const highlight = (line, lang) => {
    if (lang === "js") {
      if (line.trim().startsWith("//")) return "text-slate-500 italic";
      if (line.match(/\bform\.(getValue|setValue|showField|hideField|showSection|hideSection|requireField|setError|clearError|onLoad|onFieldChange|onBeforeSubmit|onAfterSubmit)\b/)) return "text-indigo-300";
      if (line.match(/\b(const|let|var|if|else|return|true|false)\b/)) return "text-purple-300";
      if (line.match(/["'`][^"'`]*["'`]/)) return "text-emerald-300";
    }
    if (lang === "html") {
      if (line.trim().startsWith("<!--")) return "text-slate-500 italic";
      if (line.match(/<\/?[a-z]/i)) return "text-blue-300";
    }
    if (lang === "css") {
      if (line.trim().startsWith("/*")) return "text-slate-500 italic";
      if (line.match(/^[.#]/)) return "text-amber-300";
      if (line.match(/:[^:]/)) return "text-rose-300";
    }
    return "text-slate-300";
  };

  return (
    <div className="flex h-full overflow-hidden gap-0">
      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-4 bg-slate-900 border-b border-slate-700 flex-shrink-0">
          <div className="flex">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setCodeTab(t.id)}
                className={`px-4 py-2.5 text-[12px] font-bold border-b-2 transition-colors ${
                  codeTab === t.id ? "border-indigo-400 text-indigo-300" : "border-transparent text-slate-500 hover:text-slate-400"
                }`}>{t.label}</button>
            ))}
          </div>
          <button onClick={copy} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors py-2">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-y-auto bg-slate-950 px-0">
          <div className="flex">
            {/* Line numbers */}
            <div className="flex-shrink-0 px-3 py-4 text-right select-none border-r border-slate-800">
              {active.content.split("\n").map((_, i) => (
                <div key={i} className="text-[11px] font-mono text-slate-600 leading-relaxed">{i+1}</div>
              ))}
            </div>
            {/* Code */}
            <div className="flex-1 px-4 py-4 overflow-x-auto">
              {active.content.split("\n").map((line, i) => (
                <div key={i} className={`text-[12px] font-mono leading-relaxed whitespace-pre ${highlight(line, codeTab)}`}>{line || " "}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Reference sidebar */}
      <div className="w-60 flex-shrink-0 border-l border-slate-700 bg-slate-950 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Form API Reference</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {[
            { method:"form.getValue(key)",             returns:"any",     desc:"Read current value of a field"          },
            { method:"form.setValue(key, value)",      returns:"void",    desc:"Set a field's value programmatically"   },
            { method:"form.showField(key)",            returns:"void",    desc:"Make a hidden field visible"            },
            { method:"form.hideField(key)",            returns:"void",    desc:"Hide a visible field"                   },
            { method:"form.showSection(id)",           returns:"void",    desc:"Show a named form section"              },
            { method:"form.hideSection(id)",           returns:"void",    desc:"Hide a named form section"              },
            { method:"form.requireField(key)",         returns:"void",    desc:"Make a field required at runtime"       },
            { method:"form.setError(key, msg)",        returns:"void",    desc:"Set a validation error on a field"      },
            { method:"form.clearError(key)",           returns:"void",    desc:"Clear a field's validation error"       },
            { method:"form.onLoad(fn)",                returns:"void",    desc:"Runs when the form first mounts"        },
            { method:"form.onFieldChange(key, fn)",    returns:"void",    desc:"Fires when a field value changes"       },
            { method:"form.onBeforeSubmit(fn)",        returns:"boolean", desc:"Return false to block submission"       },
            { method:"form.onAfterSubmit(fn)",         returns:"void",    desc:"Fires after successful submission"      },
          ].map(m => (
            <div key={m.method} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
              <code className="text-[10px] font-mono text-indigo-300 block mb-1 leading-tight">{m.method}</code>
              <p className="text-[10px] text-slate-400 leading-tight">{m.desc}</p>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">→ {m.returns}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800">
          <div className="p-2.5 bg-amber-950/40 border border-amber-800/40 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0"/>
              <span className="text-[10px] font-bold text-amber-400">Sandbox</span>
            </div>
            <p className="text-[10px] text-amber-600/80 leading-tight">Code runs in an isolated sandbox. DOM access, fetch, and localStorage are blocked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Builder panel ─────────────────────────────────────────────────────────────

function BuilderPanel({ form: f, onClose }) {
  const [mode,    setMode]    = useState(f.form_mode || "Basic");
  const [fields,  setFields]  = useState(f.id === "1" ? WO_FIELDS : []);
  const [steps,   setSteps]   = useState(f.is_multi_step ? WO_STEPS : [{ id:"step1", label:"Form", fields:[] }]);
  const [saved,   setSaved]   = useState(false);

  const MODE_TABS = [
    { id:"Basic",    label:"Basic",    icon:Eye,      desc:"Drag-and-drop field builder with live preview"                },
    { id:"Advanced", label:"Advanced", icon:Settings, desc:"Full field config — binding, conditions, validation"          },
    { id:"Code",     label:"Code",     icon:Code2,    desc:"Custom HTML, CSS, and sandboxed JavaScript"                   },
  ];

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="flex-1 min-w-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h2 className="text-[15px] font-bold text-slate-800">{f.name}</h2>
              <Badge status={f.status}/>
              <ModePill mode={mode}/>
              {f.is_multi_step && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 px-1.5 py-0.5 rounded">{steps.length} steps</span>}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
              {f.bound_object && <span className="flex items-center gap-1"><Link2 className="w-3 h-3"/>{f.bound_object}</span>}
              {f.bound_process && <span className="flex items-center gap-1"><GitBranch className="w-3 h-3"/>{f.bound_process}</span>}
              <span>{f.submission_count.toLocaleString()} submissions</span>
              <span>Modified {f.last_modified}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {saved && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5}/>Saved</span>
            )}
            <button onClick={save} className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">Save</button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex -mx-5 px-5">
          {MODE_TABS.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                mode === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"
              }`}>
              <t.icon className="w-3.5 h-3.5"/>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Builder body */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {mode === "Basic"    && <BasicMode    form={f} fields={fields} setFields={setFields} steps={steps}/>}
        {mode === "Advanced" && <AdvancedMode form={f} fields={fields} setFields={setFields} steps={steps}/>}
        {mode === "Code"     && <CodeMode/>}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Eye className="w-3.5 h-3.5"/> Full Preview
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Copy className="w-3.5 h-3.5"/> Duplicate
          </button>
        </div>
        <button onClick={save}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
          {f.status === "Draft" ? "Publish Form" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const MODE_COLOR = { Basic:"bg-slate-100 text-slate-600", Advanced:"bg-blue-50 text-blue-700", Code:"bg-purple-50 text-purple-700" };

export default function FormsPage() {
  const [selected, setSelected] = useState(null);

  const totalSubmissions = FORMS.reduce((s,f) => s + f.submission_count, 0);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ══════════════════════════ LIST ══════════════════════════ */}
      <div className={`flex flex-col transition-all duration-200 overflow-hidden flex-shrink-0 ${selected ? "w-[480px]" : "flex-1"}`}>

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Forms & Interfaces</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {FORMS.filter(f => f.status === "Published").length} published · {totalSubmissions.toLocaleString()} total submissions
              </p>
            </div>
            <button onClick={() => setSelected(FORMS[0])}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4"/> Create Form
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Published",   value:FORMS.filter(f=>f.status==="Published").length, color:"text-emerald-600" },
              { label:"Multi-Step",  value:FORMS.filter(f=>f.is_multi_step).length,         color:"text-indigo-600"  },
              { label:"Submissions", value:totalSubmissions.toLocaleString(),               color:"text-slate-800"   },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Form</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Status</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Mode</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Submissions</th>
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {FORMS.map(f => (
                <tr key={f.id} onClick={() => setSelected(f)}
                  className={`cursor-pointer transition-colors border-l-[3px] ${
                    selected?.id === f.id
                      ? "bg-indigo-50/50 border-l-indigo-500"
                      : "hover:bg-slate-50/70 border-l-transparent"
                  }`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${
                        f.status === "Published" ? "bg-indigo-50 ring-indigo-200" : "bg-slate-100 ring-slate-200"
                      }`}>
                        <FileText className={`w-4 h-4 ${f.status === "Published" ? "text-indigo-600" : "text-slate-400"}`} strokeWidth={1.75}/>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-bold text-slate-800">{f.name}</span>
                          {f.is_multi_step && (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 px-1.5 py-0.5 rounded">{f.steps} steps</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 truncate">{f.description}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {f.bound_object && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Link2 className="w-2.5 h-2.5"/>{f.bound_object}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 hidden sm:table-cell"><Badge status={f.status}/></td>
                  <td className="px-3 py-3.5 hidden md:table-cell"><ModePill mode={f.form_mode}/></td>
                  <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-[13px] font-bold text-slate-800">{f.submission_count.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-300"><ChevronRight className="w-4 h-4"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════ BUILDER ══════════════════════════ */}
      {selected && (
        <BuilderPanel form={selected} onClose={() => setSelected(null)}/>
      )}
    </div>
  );
}
