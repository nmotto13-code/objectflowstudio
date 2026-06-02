import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Settings, RefreshCw, ArrowUpRight, X, Lock, Plug } from "lucide-react";
import Badge from "../components/ui/Badge";

const integrations = [
  { id:"1",  name:"REST Webhook",    type:"webhook",        status:"Connected",    lastSync:"2026-05-30T12:05:00Z", errors:5,  category:"Core",        desc:"Send HTTP POST payloads to external endpoints on record events",       icon:"🔗" },
  { id:"2",  name:"CSV Export",      type:"csv_export",     status:"Connected",    lastSync:"2026-05-29T08:00:00Z", errors:0,  category:"Core",        desc:"Export approved records as structured CSV files on demand",            icon:"📄" },
  { id:"3",  name:"JSON Export",     type:"json_export",    status:"Connected",    lastSync:"2026-05-29T08:00:00Z", errors:0,  category:"Core",        desc:"Export records as JSON for downstream processing and pipelines",       icon:"{ }" },
  { id:"4",  name:"SQL Database",    type:"sql",            status:"Error",        lastSync:"2026-05-28T14:00:00Z", errors:12, category:"Data",        desc:"Sync approved records bidirectionally with an external SQL database",   icon:"🗄️" },
  { id:"5",  name:"Microsoft 365",   type:"microsoft365",   status:"Connected",    lastSync:"2026-05-30T06:00:00Z", errors:1,  category:"Microsoft",   desc:"SSO authentication and identity sync with Microsoft 365 tenants",      icon:"Ⓜ️" },
  { id:"6",  name:"SharePoint",      type:"sharepoint",     status:"Connected",    lastSync:"2026-05-30T06:00:00Z", errors:0,  category:"Microsoft",   desc:"Read and write documents and structured lists in SharePoint Online",   icon:"📁" },
  { id:"7",  name:"Power Automate",  type:"power_automate", status:"Disconnected", lastSync:null,                   errors:0,  category:"Microsoft",   desc:"Trigger Power Automate flows on ObjectFlow record lifecycle events",   icon:"⚡" },
  { id:"8",  name:"Power BI",        type:"powerbi",        status:"Disconnected", lastSync:null,                   errors:0,  category:"Microsoft",   desc:"Stream process metrics and KPIs directly into Power BI dashboards",    icon:"📊" },
  { id:"9",  name:"Microsoft Teams", type:"teams",          status:"Disconnected", lastSync:null,                   errors:0,  category:"Microsoft",   desc:"Send process notifications and approval requests to Teams channels",   icon:"💬" },
  { id:"10", name:"ServiceNow",      type:"servicenow",     status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Bidirectional sync with ServiceNow ITSM tickets and change records",   icon:"🔧" },
  { id:"11", name:"Workday",         type:"workday",        status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Sync HR change requests and employee records with Workday HCM",        icon:"👥" },
  { id:"12", name:"Salesforce",      type:"salesforce",     status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Sync vendor and contact records with Salesforce CRM and pipelines",    icon:"☁️" },
  { id:"13", name:"Oracle ERP",      type:"oracle",         status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Deep integration with Oracle ERP and HCM cloud modules",               icon:"🏛️" },
  { id:"14", name:"SAP S/4HANA",     type:"sap",            status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Connect ObjectFlow processes to SAP business process flows",           icon:"🔵" },
  { id:"15", name:"Slack",           type:"slack",          status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Messaging",   desc:"Send process notifications, approvals, and alerts to Slack channels",  icon:"💬" },
  { id:"16", name:"Jira",            type:"jira",           status:"Coming Soon",  lastSync:null,                   errors:0,  category:"Enterprise",  desc:"Link ObjectFlow issues and work orders directly to Jira tickets",      icon:"🎯" },
];

const categories = ["All","Core","Microsoft","Data","Enterprise","Messaging"];

const statusIcon  = { Connected:CheckCircle2, Disconnected:XCircle, Error:AlertTriangle, "Coming Soon":Lock };
const statusColor = { Connected:"text-emerald-500", Disconnected:"text-slate-300", Error:"text-rose-500", "Coming Soon":"text-indigo-400" };

const fmt = iso => iso ? new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—";

export default function IntegrationsPage() {
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected]  = useState(null);

  const filtered = integrations.filter(i => catFilter === "All" || i.category === catFilter);
  const grouped  = categories.filter(c => c !== "All").reduce((acc,cat) => {
    const items = filtered.filter(i => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const summary = {
    connected:   integrations.filter(i => i.status === "Connected").length,
    errors:      integrations.filter(i => i.status === "Error").length,
    comingSoon:  integrations.filter(i => i.status === "Coming Soon").length,
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Integrations</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {summary.connected} connected · {summary.errors} with errors · {summary.comingSoon} coming soon
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                catFilter === c ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>{c}</button>
          ))}
        </div>

        {/* Grid — grouped or flat */}
        {catFilter === "All" ? (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-8">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map(i => (
                  <IntCard key={i.id} item={i} active={selected?.id === i.id}
                    onClick={() => setSelected(selected?.id === i.id ? null : i)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(i => (
              <IntCard key={i.id} item={i} active={selected?.id === i.id}
                onClick={() => setSelected(selected?.id === i.id ? null : i)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Config panel ── */}
      {selected && (
        <div className="w-[380px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selected.icon}</span>
              <div>
                <div className="text-[13px] font-bold text-slate-800">{selected.name}</div>
                <div className="mt-1"><Badge status={selected.status} /></div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">{selected.desc}</p>

            {selected.status === "Connected" && (
              <>
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-[13px] font-bold text-emerald-800">Connected</span>
                  </div>
                  <div className="text-xs text-emerald-700">Last sync: {fmt(selected.lastSync)}</div>
                  {selected.errors > 0 && (
                    <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {selected.errors} recent errors
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Configuration</div>
                  {selected.type === "webhook" ? (
                    <div className="space-y-3">
                      {[
                        {label:"Webhook URL", val:"https://erp.northstar.com/api/objectflow/webhook", mono:true},
                        {label:"Secret Key",  val:"wh_sec_xk92nq...", mono:true, pw:true},
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-xs text-slate-500 font-medium mb-1">{f.label}</label>
                          <input defaultValue={f.val} type={f.pw ? "password" : "text"}
                            className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${f.mono ? "font-mono" : ""}`} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs text-slate-500 font-medium mb-2">Events</label>
                        {["record.approved","record.rejected","validation.failed"].map(e => (
                          <label key={e} className="flex items-center gap-2 text-xs text-slate-600 mb-1.5">
                            <input type="checkbox" defaultChecked className="accent-indigo-600" /> {e}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      Connection managed via OAuth. Re-authorize below if the token expires.
                    </div>
                  )}
                </div>
              </>
            )}

            {selected.status === "Error" && (
              <div>
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="text-[13px] font-bold text-rose-800">Connection Error</span>
                  </div>
                  <p className="text-xs text-rose-700">{selected.errors} errors in the last sync. Check credentials and endpoint.</p>
                </div>
                <div className="space-y-2">
                  {["Connection refused: host unreachable","Auth token expired — re-authorize","Schema mismatch on 'gl_code' field"].map((err,i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[12px] text-rose-700 font-medium">{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === "Disconnected" && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Plug className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-[13px] text-slate-600 mb-4">Connect {selected.name} to enable this integration.</p>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                  <ArrowUpRight className="w-4 h-4" /> Connect {selected.name}
                </button>
              </div>
            )}

            {selected.status === "Coming Soon" && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-[13px] font-semibold text-slate-700 mb-1">Coming Soon</p>
                <p className="text-xs text-slate-400 mb-4">This integration is in development. Sign up for early access.</p>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors ring-1 ring-indigo-200">
                  Notify Me
                </button>
              </div>
            )}
          </div>

          {(selected.status === "Connected" || selected.status === "Error") && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 flex-shrink-0">
              <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">Save Config</button>
              <button className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Sync
              </button>
              <button className="px-3 py-2 border border-rose-200 bg-white rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">Disconnect</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IntCard({ item, active, onClick }) {
  const SIcon = statusIcon[item.status] || Plug;
  return (
    <div onClick={onClick}
      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
        active ? "border-indigo-400 ring-1 ring-indigo-300" :
        item.status === "Error" ? "border-rose-200 hover:border-rose-300" :
        item.status === "Coming Soon" ? "border-slate-100 opacity-75 hover:opacity-100" :
        "border-slate-200 hover:border-slate-300"
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{item.icon}</span>
          <div>
            <div className="text-[13px] font-bold text-slate-800">{item.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{item.category}</div>
          </div>
        </div>
        <SIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${statusColor[item.status]}`} strokeWidth={2} />
      </div>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{item.desc}</p>
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <Badge status={item.status} />
        {item.status === "Connected" && (
          <span className="text-[11px] text-slate-400">Synced {fmt(item.lastSync)}</span>
        )}
        {item.errors > 0 && (
          <span className="text-[11px] font-bold text-rose-600">{item.errors} errors</span>
        )}
      </div>
    </div>
  );
}
