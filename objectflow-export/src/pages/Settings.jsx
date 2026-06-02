import { useState } from "react";
import { Building2, Palette, Bell, Database, Sparkles, Lock, Key, Webhook, Check, Eye, EyeOff } from "lucide-react";

const sections = [
  { id:"workspace",     label:"Workspace",         icon:Building2 },
  { id:"branding",      label:"Branding",           icon:Palette   },
  { id:"notifications", label:"Notifications",      icon:Bell      },
  { id:"retention",     label:"Data Retention",     icon:Database  },
  { id:"ai",            label:"AI Assistant",       icon:Sparkles  },
  { id:"security",      label:"Security",           icon:Lock      },
  { id:"apikeys",       label:"API Keys",           icon:Key       },
  { id:"webhooks",      label:"Webhook Secrets",    icon:Webhook   },
];

function Toggle({ on: initOn = false }) {
  const [on, setOn] = useState(initOn);
  return (
    <button onClick={() => setOn(!on)}
      className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${on ? "bg-indigo-600" : "bg-slate-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function FieldRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

function Input({ defaultValue, placeholder, mono, pw, className = "" }) {
  return (
    <input
      type={pw ? "password" : "text"}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all ${mono ? "font-mono" : ""} ${className}`}
    />
  );
}

function Select({ options, defaultValue, className = "" }) {
  return (
    <select defaultValue={defaultValue}
      className={`px-3 py-2 border border-slate-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function Settings() {
  const [active, setActive]      = useState("workspace");
  const [saved, setSaved]        = useState(false);
  const [showKey, setShowKey]    = useState(false);
  const [showSec, setShowSec]    = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar nav ── */}
      <div className="w-52 bg-white border-r border-slate-200 p-3 flex-shrink-0 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">Settings</p>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold mb-0.5 transition-colors ${
              active === s.id ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}>
            <s.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">

          {/* Saved banner */}
          {saved && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] font-semibold text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Settings saved successfully.
            </div>
          )}

          {/* ── Workspace ── */}
          {active === "workspace" && (
            <>
              <PageHeader title="Workspace Profile" onSave={save} />
              <Card title="Workspace Info" desc="Basic details about your Northstar Operations workspace">
                <FieldRow label="Workspace Name" desc="Shown in the sidebar and all exported documents">
                  <Input defaultValue="Northstar Operations" className="w-64" />
                </FieldRow>
                <FieldRow label="Slug" desc="Used in URLs and API references">
                  <Input defaultValue="northstar-ops" mono className="w-48" />
                </FieldRow>
                <FieldRow label="Industry" desc="Helps optimise templates and AI suggestions">
                  <Select defaultValue="Real Estate / Facilities" options={["Real Estate / Facilities","Healthcare","Manufacturing","Finance","Government","Other"]} className="w-52" />
                </FieldRow>
                <FieldRow label="Timezone" desc="Default for all SLA calculations and schedules">
                  <Select defaultValue="America/New_York (EST)" options={["America/New_York (EST)","America/Chicago (CST)","America/Denver (MST)","America/Los_Angeles (PST)","UTC"]} className="w-56" />
                </FieldRow>
              </Card>
            </>
          )}

          {/* ── Branding ── */}
          {active === "branding" && (
            <>
              <PageHeader title="Branding" onSave={save} />
              <Card title="Logo & Colours" desc="Customise how ObjectFlow Studio looks for your team">
                <FieldRow label="Workspace Logo" desc="Used in sidebar and exports (PNG/SVG, 512×512px)">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">N</div>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Upload</button>
                  </div>
                </FieldRow>
                <FieldRow label="Primary Colour" desc="Used for buttons, links, and active nav items">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-slate-200 shadow-sm" />
                    <Input defaultValue="#4F46E5" mono className="w-28" />
                  </div>
                </FieldRow>
                <FieldRow label="Sidebar Theme" desc="Colour scheme for the left navigation">
                  <div className="flex gap-2">
                    {[{bg:"bg-slate-950",ring:true},{bg:"bg-blue-950"},{bg:"bg-gray-900"},{bg:"bg-slate-100"}].map((t,i)=>(
                      <div key={i} className={`w-8 h-8 rounded-lg ${t.bg} border border-slate-200 cursor-pointer transition-all ${t.ring?"ring-2 ring-indigo-500 ring-offset-1":""}`} />
                    ))}
                  </div>
                </FieldRow>
              </Card>
            </>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <>
              <PageHeader title="Notifications" onSave={save} />
              <Card title="In-App Notifications">
                {[
                  {l:"Record assigned to me",     d:"Notify when a curation record is assigned",           on:true  },
                  {l:"SLA deadline approaching",  d:"Alert when a record is within 2h of its SLA",         on:true  },
                  {l:"Validation failure",        d:"Notify when intake validation fails",                  on:true  },
                  {l:"Automation errors",         d:"Alert when an automation rule fails",                  on:false },
                ].map(n => (
                  <FieldRow key={n.l} label={n.l} desc={n.d}><Toggle on={n.on} /></FieldRow>
                ))}
              </Card>
              <Card title="Email Notifications">
                {[
                  {l:"Daily digest",             d:"Summary of pending tasks at 8:00 AM",                  on:true  },
                  {l:"Approval required",        d:"Email when a record needs your approval",              on:true  },
                  {l:"Overdue SLA alerts",       d:"Email when SLA is breached",                           on:false },
                  {l:"Integration error alerts", d:"Email when integrations fail",                         on:true  },
                ].map(n => (
                  <FieldRow key={n.l} label={n.l} desc={n.d}><Toggle on={n.on} /></FieldRow>
                ))}
              </Card>
            </>
          )}

          {/* ── Data Retention ── */}
          {active === "retention" && (
            <>
              <PageHeader title="Data Retention" onSave={save} />
              <Card title="Retention Policies" desc="Define how long data is kept before archiving or deletion">
                {[
                  {l:"Approved Records",           d:"Keep approved curated records",                        v:"Indefinitely"},
                  {l:"Rejected Intake Records",    d:"Auto-delete rejected records after",                   v:"90 days"     },
                  {l:"Audit Logs",                 d:"Retain audit events for compliance",                   v:"2 years"     },
                  {l:"Draft Forms",                d:"Auto-archive unpublished drafts after",                v:"180 days"    },
                ].map(r => (
                  <FieldRow key={r.l} label={r.l} desc={r.d}>
                    <Select defaultValue={r.v} options={["30 days","90 days","180 days","1 year","2 years","Indefinitely"]} className="w-40" />
                  </FieldRow>
                ))}
              </Card>
            </>
          )}

          {/* ── AI ── */}
          {active === "ai" && (
            <>
              <PageHeader title="AI Assistant" onSave={save} />
              <Card title="AI Features" desc="Control how AI is used across the platform">
                {[
                  {l:"Object generation from description", d:"Allow AI to generate schemas from natural language", on:true  },
                  {l:"Form field suggestions",             d:"Suggest fields when building forms",                 on:true  },
                  {l:"Validation rule suggestions",        d:"Recommend rules based on field types",               on:false },
                  {l:"Duplicate detection",               d:"Use AI to identify potential duplicate records",      on:true  },
                  {l:"Process stage suggestions",          d:"Suggest approval stages when building processes",    on:true  },
                ].map(s => (
                  <FieldRow key={s.l} label={s.l} desc={s.d}><Toggle on={s.on} /></FieldRow>
                ))}
              </Card>
              <Card title="Access Control" desc="Restrict AI features to specific roles">
                <FieldRow label="Roles with AI access">
                  <div className="flex flex-wrap gap-1.5">
                    {["Admin","Process Admin","Builder"].map(r => (
                      <span key={r} className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">{r}</span>
                    ))}
                    <button className="text-[11px] font-semibold text-slate-400 border border-dashed border-slate-300 px-2.5 py-0.5 rounded-full hover:border-indigo-400 hover:text-indigo-500 transition-colors">+ Add</button>
                  </div>
                </FieldRow>
              </Card>
            </>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <>
              <PageHeader title="Security" onSave={save} />
              <Card title="Authentication" desc="Control how users sign in to ObjectFlow Studio">
                {[
                  {l:"Require 2FA for Admins",  d:"Enforce two-factor authentication for admin roles",    on:true  },
                  {l:"SSO via Microsoft 365",   d:"Allow login via Microsoft identity provider",          on:true  },
                  {l:"Session timeout",         d:"Auto-logout after 30 minutes of inactivity",           on:true  },
                  {l:"IP allowlist",            d:"Restrict access to approved IP address ranges",        on:false },
                ].map(s => (
                  <FieldRow key={s.l} label={s.l} desc={s.d}><Toggle on={s.on} /></FieldRow>
                ))}
              </Card>
            </>
          )}

          {/* ── API Keys ── */}
          {active === "apikeys" && (
            <>
              <PageHeader title="API Keys" action={{ label:"+ Generate Key", onClick:()=>{} }} />
              <Card title="Active API Keys" desc="Use these keys to access the ObjectFlow API from external systems">
                {[
                  { name:"ERP Integration Key", key:"sk_live_xk92nqPlm8...", created:"Jan 12, 2026", used:"2h ago",   scopes:["read:records","write:intake"] },
                  { name:"BI Connector Key",     key:"sk_live_7fmRb3Axz4...", created:"Mar 3, 2026",  used:"1 day ago",scopes:["read:records","read:insights"] },
                ].map((k,i) => (
                  <div key={i} className="py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">{k.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Created {k.created} · Last used {k.used}</div>
                      </div>
                      <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">Revoke</button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                        {showKey ? k.key : k.key.slice(0,12) + "••••••••••••"}
                      </code>
                      <button onClick={() => setShowKey(!showKey)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {k.scopes.map(s => (
                        <span key={s} className="text-[11px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* ── Webhooks ── */}
          {active === "webhooks" && (
            <>
              <PageHeader title="Webhook Secrets" action={{ label:"+ New Secret", onClick:()=>{} }} />
              <Card title="Webhook Signing Secrets" desc="Verify incoming payloads from ObjectFlow using these secrets">
                {[
                  { name:"ERP Outbound Webhook",  secret:"wh_sec_xk92nq8fmRb3...", endpoint:"https://erp.northstar.com/api/objectflow",                         events:["record.approved","record.rejected"] },
                  { name:"Power Automate Trigger", secret:"wh_sec_4jLpT9xWqs...",  endpoint:"https://prod-18.northcentralus.logic.azure.com/workflows/...",      events:["validation.failed","sla.missed"]    },
                ].map((w,i) => (
                  <div key={i} className="py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="text-[13px] font-bold text-slate-800">{w.name}</div>
                      <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">Revoke</button>
                    </div>
                    <code className="block text-[11px] text-slate-400 mb-2 font-mono truncate">{w.endpoint}</code>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                        {showSec ? w.secret : w.secret.slice(0,12) + "••••••••••••"}
                      </code>
                      <button onClick={() => setShowSec(!showSec)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        {showSec ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {w.events.map(e => (
                        <span key={e} className="text-[11px] font-mono font-medium bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 px-2 py-0.5 rounded-md">{e}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, onSave, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      {onSave && (
        <button onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Check className="w-4 h-4" /> Save Changes
        </button>
      )}
      {action && (
        <button onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}
