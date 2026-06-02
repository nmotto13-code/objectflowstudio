/**
 * AIAssistant — reusable inline AI scaffold component.
 * Used throughout the app to show where AI assistance will exist.
 * Does NOT call any LLM backend. All suggestions are placeholder data.
 */
import { useState } from "react";
import { Sparkles, X, ChevronRight, Check, Loader, RefreshCw, Send } from "lucide-react";

// Pre-baked suggestion sets per context
const SUGGESTIONS = {
  fields: [
    "Company Name (Text, required)",
    "Contact Email (Email, required)",
    "Tax ID / EIN (Text, required)",
    "Category (Select: Electrical, HVAC, Plumbing, General)",
    "Payment Terms (Select: Net 15, 30, 45, 60)",
    "GL Code (Text, required — for payment routing)",
  ],
  validation: [
    "Tax ID must match regex: ^\\d{2}-\\d{7}$",
    "Contact Email must be a valid email format",
    "GL Code must exist in the GL master list",
    "PO Number is required when Amount > $5,000",
    "Duplicate: Company Name + Tax ID must be unique",
  ],
  process: [
    "Submitted → intake stage, assigned to Requester",
    "Validated → automated system check, no SLA",
    "Dept. Review → approval, 24h SLA, Facilities Manager",
    "Finance Review → approval, 24h SLA, Finance Manager",
    "Approved → final approval, 8h SLA",
    "Synced → automated ERP webhook, 1h SLA",
    "Closed → terminal stage",
  ],
  mapping: [
    "company_name → Name (confidence: 98%)",
    "contact_email → Email (confidence: 97%)",
    "tax_id → Tax ID / EIN (confidence: 91%)",
    "category → Category (confidence: 88%)",
    "payment_terms → Payment Terms (confidence: 85%)",
    "phone_number → Phone (confidence: 72% — review)",
  ],
  automation: [
    "When: Record Submitted → Then: Notify assigned reviewer",
    "When: Validation Failed → Then: Assign default reviewer",
    "When: SLA Missed → Then: Escalate to Process Admin",
    "When: Record Approved (Vendor) → Then: POST to ERP webhook",
  ],
  code: [
    'form.onFieldChange("priority", (val) => {',
    '  if (val === "Emergency") {',
    '    form.showField("emergency_notes");',
    '    form.requireField("photo_upload");',
    '  } else {',
    '    form.hideField("emergency_notes");',
    '  }',
    '});',
  ],
  duplicate: [
    "Check Company Name similarity (fuzzy match, threshold: 80%)",
    "Check Tax ID exact match",
    "Check Email domain match (warning, not block)",
    "Combine name + phone for secondary match signal",
  ],
  cleanup: [
    "Trim whitespace from all Text fields on submit",
    "Normalize email to lowercase before storage",
    "Strip non-numeric chars from Tax ID field",
    "Auto-set Status = 'Draft' if not provided",
  ],
};

const CONTEXT_LABELS = {
  fields:     { title:"Suggest Fields",           subtitle:"AI-generated field schema",           action:"Apply all fields"     },
  validation: { title:"Suggest Validation Rules",  subtitle:"AI-detected data quality rules",      action:"Apply all rules"      },
  process:    { title:"Suggest Process Stages",    subtitle:"AI-recommended workflow stages",      action:"Apply all stages"      },
  mapping:    { title:"Map CSV Columns",           subtitle:"AI field mapping suggestions",        action:"Accept all mappings"  },
  automation: { title:"Suggest Automations",       subtitle:"AI-recommended trigger rules",        action:"Add all rules"        },
  code:       { title:"Write Custom JavaScript",   subtitle:"AI-generated form logic",             action:"Insert code"          },
  duplicate:  { title:"Suggest Duplicate Logic",   subtitle:"AI-recommended detection strategy",  action:"Apply strategy"       },
  cleanup:    { title:"Suggest Cleanup Rules",     subtitle:"AI-recommended data cleanup",         action:"Apply all rules"      },
};

export default function AIAssistant({
  context = "fields",      // one of the keys in SUGGESTIONS
  compact = false,         // true = inline button only, false = expanded panel
  className = "",
  onApply,                 // callback when user hits "Apply" (gets suggestions array)
}) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const [prompt,   setPrompt]   = useState("");
  const [accepted, setAccepted] = useState({});

  const cfg         = CONTEXT_LABELS[context] || CONTEXT_LABELS.fields;
  const suggestions = SUGGESTIONS[context]    || [];

  const simulate = () => {
    setLoading(true);
    setLoaded(false);
    setTimeout(() => { setLoading(false); setLoaded(true); }, 1100);
  };

  const toggle = (i) => setAccepted(prev => ({ ...prev, [i]: !prev[i] }));
  const selectAll = () => {
    const all = {};
    suggestions.forEach((_,i) => { all[i] = true; });
    setAccepted(all);
  };

  const applySelected = () => {
    const sel = suggestions.filter((_,i) => accepted[i]);
    onApply?.(sel);
    setOpen(false);
    setLoaded(false);
    setAccepted({});
  };

  /* ── Compact trigger button ── */
  if (compact) {
    return (
      <button onClick={() => { setOpen(true); simulate(); }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200 rounded-lg transition-colors ${className}`}>
        <Sparkles className="w-3.5 h-3.5"/>
        {cfg.title}
        {open && <AssistantModal {...{cfg,suggestions,loading,loaded,prompt,setPrompt,accepted,toggle,selectAll,applySelected,simulate,onClose:()=>{setOpen(false);setLoaded(false);}}}/>}
      </button>
    );
  }

  /* ── Inline panel (not a modal) ── */
  return (
    <div className={`border border-indigo-200 bg-indigo-50/40 rounded-2xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" onClick={() => { setOpen(!open); if (!open && !loaded) simulate(); }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600"/>
          </div>
          <div>
            <div className="text-[12px] font-bold text-indigo-800">{cfg.title}</div>
            <div className="text-[11px] text-indigo-500">{cfg.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">AI</span>
          <ChevronRight className={`w-4 h-4 text-indigo-400 transition-transform ${open ? "rotate-90" : ""}`}/>
        </div>
      </div>

      {open && (
        <div className="border-t border-indigo-200 px-4 pb-4">
          {/* Prompt row */}
          <div className="flex items-center gap-2 my-3">
            <input value={prompt} onChange={e=>setPrompt(e.target.value)}
              placeholder={`Describe what you need — e.g. "vendor object with compliance fields"…`}
              className="flex-1 px-3 py-2 text-[12px] border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-indigo-300"/>
            <button onClick={simulate} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0">
              <Send className="w-3.5 h-3.5"/>
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2.5 py-4 justify-center">
              <Loader className="w-4 h-4 text-indigo-500 animate-spin"/>
              <span className="text-[12px] text-indigo-600 font-semibold">Generating suggestions…</span>
            </div>
          )}

          {loaded && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{suggestions.length} suggestions</span>
                <button onClick={selectAll} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Select all</button>
              </div>
              <div className="space-y-1.5 mb-3">
                {suggestions.map((s,i) => (
                  <button key={i} onClick={() => toggle(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      accepted[i] ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      accepted[i] ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                    }`}>
                      {accepted[i] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3}/>}
                    </div>
                    <span className={`text-[12px] font-mono leading-tight ${accepted[i] ? "text-indigo-800 font-semibold" : "text-slate-700"}`}>{s}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={applySelected} disabled={Object.values(accepted).every(v=>!v)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5}/>{cfg.action}
                </button>
                <button onClick={simulate} className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors" title="Regenerate">
                  <RefreshCw className="w-3.5 h-3.5"/>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AssistantModal({ cfg, suggestions, loading, loaded, prompt, setPrompt, accepted, toggle, selectAll, applySelected, simulate, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>e.stopPropagation()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-white"/>
            <div>
              <div className="text-[14px] font-bold text-white">{cfg.title}</div>
              <div className="text-[11px] text-indigo-200">{cfg.subtitle}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you need…"
              className="flex-1 px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"/>
            <button onClick={simulate} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Send className="w-4 h-4"/></button>
          </div>
          {loading && (
            <div className="flex items-center gap-2.5 py-6 justify-center">
              <Loader className="w-5 h-5 text-indigo-500 animate-spin"/>
              <span className="text-[13px] text-indigo-600 font-semibold">Generating suggestions…</span>
            </div>
          )}
          {loaded && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{suggestions.length} suggestions</span>
                <button onClick={selectAll} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700">Select all</button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
                {suggestions.map((s,i) => (
                  <button key={i} onClick={()=>toggle(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${accepted[i]?"border-indigo-400 bg-indigo-50":"border-slate-200 hover:border-indigo-200"}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${accepted[i]?"bg-indigo-600 border-indigo-600":"border-slate-300"}`}>
                      {accepted[i] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3}/>}
                    </div>
                    <span className={`text-[12px] font-mono leading-tight ${accepted[i]?"text-indigo-800 font-semibold":"text-slate-700"}`}>{s}</span>
                  </button>
                ))}
              </div>
              <button onClick={applySelected} disabled={Object.values(accepted).every(v=>!v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Check className="w-4 h-4" strokeWidth={2.5}/>{cfg.action}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
