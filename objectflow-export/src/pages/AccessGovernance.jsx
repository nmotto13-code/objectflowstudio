import { useState } from "react";
import {
  Plus, Check, X, ChevronRight, Shield, Users, Key,
  FileText, Code2, Sparkles, Zap, Plug, BookOpen,
  Lock, Unlock, AlertTriangle, Info, CheckCircle2,
  Settings, Eye, EyeOff, Clock, Activity, Search
} from "lucide-react";
import Badge from "../components/ui/Badge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const USERS = [
  { id:"1", name:"Avery Morgan",   email:"avery.morgan@northstar.com",   role:"Admin",          dept:"Operations", status:"Active",   last:"2026-05-30T12:10:00Z", initials:"AM", color:"bg-indigo-500",  mfa:true,  advanced_privs:["custom_code","publish_forms","manage_integrations","ai_advanced","create_automations"] },
  { id:"2", name:"Jordan Lee",     email:"jordan.lee@northstar.com",     role:"Process Admin",  dept:"Facilities", status:"Active",   last:"2026-05-30T11:45:00Z", initials:"JL", color:"bg-emerald-500", mfa:true,  advanced_privs:["create_automations","publish_forms"] },
  { id:"3", name:"Casey Rivera",   email:"casey.rivera@northstar.com",   role:"Builder",        dept:"Technology", status:"Active",   last:"2026-05-29T16:30:00Z", initials:"CR", color:"bg-amber-500",   mfa:false, advanced_privs:["custom_code","ai_advanced"] },
  { id:"4", name:"Morgan Patel",   email:"morgan.patel@northstar.com",   role:"Reviewer",       dept:"Compliance", status:"Active",   last:"2026-05-30T09:15:00Z", initials:"MP", color:"bg-purple-500",  mfa:true,  advanced_privs:[] },
  { id:"5", name:"Taylor Brooks",  email:"taylor.brooks@northstar.com",  role:"Standard User",  dept:"Finance",    status:"Active",   last:"2026-05-28T14:00:00Z", initials:"TB", color:"bg-rose-500",    mfa:false, advanced_privs:[] },
  { id:"6", name:"Riley Chen",     email:"riley.chen@northstar.com",     role:"Viewer",         dept:"Executive",  status:"Active",   last:"2026-05-27T10:00:00Z", initials:"RC", color:"bg-slate-500",   mfa:false, advanced_privs:[] },
  { id:"7", name:"Sam Wallace",    email:"sam.wallace@northstar.com",    role:"Builder",        dept:"Technology", status:"Inactive", last:"2026-05-10T08:00:00Z", initials:"SW", color:"bg-cyan-500",    mfa:false, advanced_privs:["custom_code"] },
];

const ROLES = [
  {
    name:"Admin", color:"bg-indigo-600", count:1,
    desc:"Full platform access including workspace configuration, user management, billing, and all advanced privileges.",
    capabilities:["All platform features","Manage users & roles","Grant advanced privileges","Configure workspace settings","Access audit log","Manage billing"],
  },
  {
    name:"Process Admin", color:"bg-blue-600", count:1,
    desc:"Manage business objects, processes, integrations, and automations. Cannot manage users or workspace settings.",
    capabilities:["Create & edit processes","Manage business objects","Manage integrations","Create automations","Review records","View audit log"],
  },
  {
    name:"Builder", color:"bg-amber-500", count:2,
    desc:"Build and configure forms and interfaces. Can be granted custom code and form publishing privileges by an Admin.",
    capabilities:["Build & edit forms","Create business objects","Create automations","Submit records","Can be granted: custom code, publish forms, AI advanced"],
  },
  {
    name:"Reviewer", color:"bg-purple-500", count:1,
    desc:"Review and curate incoming records in the queue. Approve, reject, and assign records within assigned workflows.",
    capabilities:["Review records in queue","Approve / reject records","Request changes","Add reviewer notes","View process status"],
  },
  {
    name:"Standard User", color:"bg-emerald-500", count:1,
    desc:"Submit forms and view the status of their own submitted records. Read-only access to approved records.",
    capabilities:["Submit forms","Track own submissions","View approved records","View dashboards"],
  },
  {
    name:"Viewer", color:"bg-slate-400", count:1,
    desc:"Read-only access to dashboards and curated records. Cannot submit, review, or configure anything.",
    capabilities:["View dashboards","View approved records","Read-only access only"],
  },
];

const ROLE_COLS = ["Admin","Process Admin","Builder","Reviewer","Standard User","Viewer"];

const PERMISSIONS = [
  { group:"Objects & Data",     perm:"Create Business Objects",    Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Objects & Data",     perm:"Edit Object Schemas",        Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Objects & Data",     perm:"Export Records",             Admin:true,  "Process Admin":true,  Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Processes",          perm:"Create Processes",           Admin:true,  "Process Admin":true,  Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Processes",          perm:"Edit Process Stages",        Admin:true,  "Process Admin":true,  Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Forms",              perm:"Build & Edit Forms",         Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Forms",              perm:"Publish Forms",              Admin:true,  "Process Admin":true,  Builder:"priv",Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Advanced Build",     perm:"Use Custom Code",            Admin:true,  "Process Admin":false, Builder:"priv",Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Advanced Build",     perm:"Create Automations",         Admin:true,  "Process Admin":true,  Builder:"priv",Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Advanced Build",     perm:"Manage Integrations",        Admin:true,  "Process Admin":true,  Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"AI Assistant",       perm:"Use AI Assistant (Basic)",   Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:true,  "Standard User":false, Viewer:false },
  { group:"AI Assistant",       perm:"AI Advanced Features",       Admin:true,  "Process Admin":true,  Builder:"priv",Reviewer:false, "Standard User":false, Viewer:false },
  { group:"AI Assistant",       perm:"AI Write Custom Code",       Admin:true,  "Process Admin":false, Builder:"priv",Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Records",            perm:"Submit Records",             Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:true,  "Standard User":true,  Viewer:false },
  { group:"Records",            perm:"Review Records (Queue)",     Admin:true,  "Process Admin":true,  Builder:false, Reviewer:true,  "Standard User":false, Viewer:false },
  { group:"Records",            perm:"Approve / Reject Records",   Admin:true,  "Process Admin":true,  Builder:false, Reviewer:true,  "Standard User":false, Viewer:false },
  { group:"Visibility",         perm:"View Dashboards",            Admin:true,  "Process Admin":true,  Builder:true,  Reviewer:true,  "Standard User":true,  Viewer:true  },
  { group:"Visibility",         perm:"View Audit Log",             Admin:true,  "Process Admin":true,  Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Admin",              perm:"Manage Users & Roles",       Admin:true,  "Process Admin":false, Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Admin",              perm:"Grant Advanced Privileges",  Admin:true,  "Process Admin":false, Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
  { group:"Admin",              perm:"Workspace Settings",         Admin:true,  "Process Admin":false, Builder:false, Reviewer:false, "Standard User":false, Viewer:false },
];

const ADVANCED_PRIVS = [
  { id:"custom_code",         label:"Use Custom Code",          icon:Code2,    color:"bg-purple-50 text-purple-700 ring-purple-200",  desc:"Write custom JS in Form Builder and Process automation hooks" },
  { id:"publish_forms",       label:"Publish Forms",            icon:FileText, color:"bg-blue-50 text-blue-700 ring-blue-200",         desc:"Publish and unpublish live intake forms" },
  { id:"create_automations",  label:"Create Automations",       icon:Zap,      color:"bg-amber-50 text-amber-700 ring-amber-200",      desc:"Create and enable automation rules" },
  { id:"manage_integrations", label:"Manage Integrations",      icon:Plug,     color:"bg-emerald-50 text-emerald-700 ring-emerald-200",desc:"Connect and configure third-party integrations" },
  { id:"ai_advanced",         label:"AI Advanced Features",     icon:Sparkles, color:"bg-indigo-50 text-indigo-700 ring-indigo-200",   desc:"AI field generation, custom code writing, schema suggestions" },
];

const AUDIT_EVENTS = [
  { event:"Advanced Privilege Granted",  entity:"User",          actor:"Avery Morgan",  desc:"Granted 'Use Custom Code' to Casey Rivera",                    time:"2026-05-30T12:32:00Z", sev:"Warning"  },
  { event:"User Login",                  entity:"User",          actor:"Avery Morgan",  desc:"Logged in from 192.168.1.4 — MFA passed",                     time:"2026-05-30T12:10:00Z", sev:"Info"     },
  { event:"Form Published",              entity:"Form",          actor:"Jordan Lee",    desc:"Published 'Facilities Work Order Form' v3",                    time:"2026-05-30T11:50:00Z", sev:"Info"     },
  { event:"Record Approved",             entity:"IntakeRecord",  actor:"Morgan Patel",  desc:"Approved INT-2026-0480 (Inspection — 111 Harbor View)",        time:"2026-05-30T10:52:00Z", sev:"Info"     },
  { event:"Schema Updated",              entity:"BusinessObject",actor:"Casey Rivera",  desc:"Vendor schema: added 'gl_code' (required Text field)",         time:"2026-05-30T09:30:00Z", sev:"Warning"  },
  { event:"Automation Enabled",          entity:"Automation",    actor:"Jordan Lee",    desc:"Enabled 'Notify Reviewer on Submission'",                      time:"2026-05-29T17:00:00Z", sev:"Info"     },
  { event:"User Role Changed",           entity:"User",          actor:"Avery Morgan",  desc:"Taylor Brooks: Viewer → Standard User",                        time:"2026-05-29T14:45:00Z", sev:"Warning"  },
  { event:"MFA Bypass Attempted",        entity:"User",          actor:"Sam Wallace",   desc:"MFA challenge failed — 3 attempts from 203.88.41.12",          time:"2026-05-29T11:22:00Z", sev:"Critical" },
  { event:"Integration Error",           entity:"Integration",   actor:"System",        desc:"SQL Database sync failed — connection refused (12 retries)",   time:"2026-05-28T14:00:00Z", sev:"Critical" },
  { event:"Custom Code Executed",        entity:"Form",          actor:"Casey Rivera",  desc:"Custom JS ran in 'Invoice Submission Form' — no errors",       time:"2026-05-28T10:15:00Z", sev:"Info"     },
];

const SEV = {
  Info:     { pill:"bg-blue-50 text-blue-700 ring-blue-200",     dot:"bg-blue-500"    },
  Warning:  { pill:"bg-amber-50 text-amber-700 ring-amber-200",  dot:"bg-amber-500"   },
  Critical: { pill:"bg-rose-50 text-rose-700 ring-rose-200",     dot:"bg-rose-500"    },
};

const ROLE_CHIP = {
  Admin:"bg-indigo-600", "Process Admin":"bg-blue-600", Builder:"bg-amber-500",
  Reviewer:"bg-purple-500", "Standard User":"bg-emerald-500", Viewer:"bg-slate-400",
};

const fmt = iso => new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SevBadge({ sev }) {
  const c = SEV[sev] || SEV.Info;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ring-1 ring-inset ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
      {sev}
    </span>
  );
}

function PrivChip({ id }) {
  const p = ADVANCED_PRIVS.find(x => x.id === id);
  if (!p) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ring-inset whitespace-nowrap ${p.color}`}>
      <p.icon className="w-2.5 h-2.5 flex-shrink-0"/>
      {p.label}
    </span>
  );
}

function MatrixCell({ val }) {
  if (val === true)    return <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={2.5}/>;
  if (val === "priv")  return <span title="Grantable privilege" className="flex items-center justify-center"><span className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"/></span></span>;
  return               <X className="w-3.5 h-3.5 text-slate-200 mx-auto" strokeWidth={2}/>;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const TABS = ["Users","Roles","Permission Matrix","Advanced Privileges","Audit Log"];

export default function AccessGovernance() {
  const [tab,        setTab]        = useState("Users");
  const [userSearch, setUserSearch] = useState("");
  const [auditSev,   setAuditSev]   = useState("All");
  const [expandUser, setExpandUser] = useState(null);

  const filteredUsers = USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const groups = [...new Set(PERMISSIONS.map(p => p.group))];
  const filteredAudit = AUDIT_EVENTS.filter(e => auditSev === "All" || e.sev === auditSev);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access & Governance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage users, roles, permissions, advanced privileges, and audit activity</p>
        </div>
        {tab === "Users" && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4"/> Invite User
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-slate-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all whitespace-nowrap ${
              tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>{t}</button>
        ))}
      </div>

      {/* ════════════════════════ USERS ════════════════════════ */}
      {tab === "Users" && (
        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:"Total Users",    value:USERS.length,                                       color:"text-slate-800"   },
              { label:"Active",         value:USERS.filter(u=>u.status==="Active").length,         color:"text-emerald-600" },
              { label:"MFA Enabled",    value:USERS.filter(u=>u.mfa).length,                      color:"text-indigo-600"  },
              { label:"With Adv. Priv", value:USERS.filter(u=>u.advanced_privs.length>0).length,  color:"text-amber-600"   },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
            <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…"
              className="pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white w-full transition-all"/>
          </div>

          {/* User table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Dept</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Advanced Privileges</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Security</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Last Active</th>
                  <th className="w-10"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <>
                    <tr key={u.id}
                      className={`cursor-pointer transition-colors border-l-[3px] ${expandUser===u.id ? "bg-indigo-50/40 border-l-indigo-400" : "hover:bg-slate-50/60 border-l-transparent"}`}
                      onClick={() => setExpandUser(expandUser===u.id ? null : u.id)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{u.initials}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-slate-800">{u.name}</span>
                              {u.status === "Inactive" && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Inactive</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className={`text-[11px] font-bold text-white px-2.5 py-1 rounded-full ${ROLE_CHIP[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-600 hidden md:table-cell">{u.dept}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {u.advanced_privs.length === 0
                            ? <span className="text-[11px] text-slate-400">—</span>
                            : u.advanced_privs.map(p => <PrivChip key={p} id={p}/>)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {u.mfa
                            ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded"><Lock className="w-2.5 h-2.5"/>MFA</span>
                            : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 ring-1 ring-rose-200 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5"/>No MFA</span>}
                          <Badge status={u.status}/>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-400 hidden lg:table-cell">{fmt(u.last)}</td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandUser===u.id ? "rotate-90 text-indigo-400" : "text-slate-300"}`}/>
                      </td>
                    </tr>

                    {/* Expanded user row */}
                    {expandUser === u.id && (
                      <tr key={`${u.id}-expand`}>
                        <td colSpan={7} className="px-5 py-4 bg-indigo-50/30 border-b border-indigo-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Role & status */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role & Status</div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl">
                                  <span className="text-[12px] font-semibold text-slate-600">Role</span>
                                  <select defaultValue={u.role} className="text-[12px] border-0 bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer">
                                    {["Admin","Process Admin","Builder","Reviewer","Standard User","Viewer"].map(r=><option key={r}>{r}</option>)}
                                  </select>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl">
                                  <span className="text-[12px] font-semibold text-slate-600">MFA Required</span>
                                  <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${u.mfa ? "bg-indigo-600":"bg-slate-300"} relative`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.mfa?"translate-x-4.5":"translate-x-0.5"}`}/>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Advanced privileges */}
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advanced Privileges</div>
                                <span className="text-[10px] text-slate-400">Only Admins can grant/revoke</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {ADVANCED_PRIVS.map(p => {
                                  const has = u.advanced_privs.includes(p.id);
                                  return (
                                    <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${has ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"}`}>
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ${p.color}`}>
                                        <p.icon className="w-3.5 h-3.5" strokeWidth={1.75}/>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-bold text-slate-700">{p.label}</div>
                                        <div className="text-[10px] text-slate-400 leading-tight truncate">{p.desc}</div>
                                      </div>
                                      <div className={`w-8 h-5 rounded-full cursor-pointer transition-colors flex-shrink-0 relative ${has ? "bg-indigo-600":"bg-slate-200"}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${has?"translate-x-3.5":"translate-x-0.5"}`}/>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 pt-3 border-t border-indigo-100">
                            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Save Changes</button>
                            <button className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Reset Password</button>
                            <button className="px-3 py-1.5 border border-rose-200 bg-white text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors ml-auto">Deactivate</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════ ROLES ════════════════════════ */}
      {tab === "Roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ROLES.map(r => (
            <div key={r.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[12px] font-bold text-white px-3 py-1.5 rounded-full ${r.color}`}>{r.name}</span>
                <span className="text-[11px] text-slate-400 font-semibold">{r.count} user{r.count!==1?"s":""}</span>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{r.desc}</p>
              <div className="space-y-1.5 mb-4">
                {r.capabilities.map((c,i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                    {c.startsWith("Can be granted") ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-indigo-300 flex-shrink-0 mt-0.5"/>
                        <span className="text-indigo-700 font-semibold italic">{c}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2.5}/>
                        <span>{c}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Edit permissions →</button>
            </div>
          ))}
          <button className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[180px] hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"/>
            </div>
            <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">Create Custom Role</span>
          </button>
        </div>
      )}

      {/* ════════════════════════ PERMISSION MATRIX ════════════════════════ */}
      {tab === "Permission Matrix" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5}/> Included in role</span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"/></span>
                Grantable privilege (Admin must enable)
              </span>
              <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-slate-300" strokeWidth={2}/> Not available</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[220px]">Permission</th>
                  {ROLE_COLS.map(r => (
                    <th key={r} className="text-center px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full ${ROLE_CHIP[r]}`}>{r}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <>
                    <tr key={group}>
                      <td colSpan={7} className="px-5 py-2 bg-slate-50/80 border-y border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group}</span>
                      </td>
                    </tr>
                    {PERMISSIONS.filter(p => p.group === group).map((row,i) => (
                      <tr key={i} className="hover:bg-slate-50/40 transition-colors border-b border-slate-50">
                        <td className="px-5 py-3 text-[13px] font-semibold text-slate-700">{row.perm}</td>
                        {ROLE_COLS.map(r => (
                          <td key={r} className="px-4 py-3 text-center">
                            <MatrixCell val={row[r]}/>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════ ADVANCED PRIVILEGES ════════════════════════ */}
      {tab === "Advanced Privileges" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="text-[13px] font-bold text-amber-800 mb-0.5">Admin-Controlled Privileges</div>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Advanced privileges are opt-in capabilities that can be granted to technical users by an Admin.
                They extend the base role — a Builder with <strong>Use Custom Code</strong> can write JS in forms,
                but still cannot manage users or workspace settings.
                Each grant is logged in the audit trail.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ADVANCED_PRIVS.map(p => {
              const grantedTo = USERS.filter(u => u.advanced_privs.includes(p.id));
              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ring-1 flex items-center justify-center flex-shrink-0 ${p.color}`}>
                      <p.icon className="w-5 h-5" strokeWidth={1.75}/>
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">{p.label}</div>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed mb-4">{p.desc}</p>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Granted to ({grantedTo.length})</div>
                    {grantedTo.length === 0 ? (
                      <span className="text-[12px] text-slate-400 italic">No users</span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {grantedTo.map(u => (
                          <div key={u.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-full">
                            <div className={`w-4 h-4 rounded-full ${u.color} flex items-center justify-center text-white text-[9px] font-black flex-shrink-0`}>{u.initials[0]}</div>
                            <span className="text-[11px] font-semibold text-slate-700">{u.name.split(" ")[0]}</span>
                            <X className="w-3 h-3 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 rounded-xl text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5"/> Grant to user
                  </button>
                </div>
              );
            })}
          </div>

          {/* Scope examples */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Scope Examples — What Each Privilege Enables</div>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { priv:"Use Custom Code",        scope:"Write JS in Form Builder (sandboxed), use form.* API, create field logic, write cleanup rules" },
                { priv:"Publish Forms",           scope:"Push forms from Draft → Published state, making them live for intake submissions" },
                { priv:"Create Automations",      scope:"Create When/If/Then automation rules, connect triggers to intake and record events" },
                { priv:"Manage Integrations",     scope:"Connect/disconnect third-party integrations, configure webhook endpoints and sync settings" },
                { priv:"AI Advanced Features",    scope:"Generate schemas with AI, use AI to write custom JavaScript, map CSVs with AI assist, suggest validation rules" },
              ].map((x,i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-40 flex-shrink-0">
                    <PrivChip id={ADVANCED_PRIVS.find(p=>p.label===x.priv)?.id || ""}/>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{x.scope}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ AUDIT LOG ════════════════════════ */}
      {tab === "Audit Log" && (
        <div className="space-y-4">
          {/* Filter strip */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-lg">
              {["All","Info","Warning","Critical"].map(s => (
                <button key={s} onClick={() => setAuditSev(s)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors whitespace-nowrap ${auditSev===s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{filteredAudit.length} events</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Entity</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Actor</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Severity</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAudit.map((e,i) => (
                  <tr key={i} className={`hover:bg-slate-50/60 transition-colors ${e.sev==="Critical" ? "border-l-2 border-l-rose-400" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-bold text-slate-800">{e.event}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">{e.desc}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500 hidden sm:table-cell">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{e.entity}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-700 font-medium hidden md:table-cell">{e.actor}</td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><SevBadge sev={e.sev}/></td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 hidden lg:table-cell whitespace-nowrap">{fmt(e.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
