import { useState } from "react";
import { Search, Download, X, ChevronRight, Database } from "lucide-react";
import Badge from "../components/ui/Badge";

const objectTypes = ["All","Vendor","Work Order","Inspection","Invoice","Employee Change Request","Property","Asset"];
const objColor = {
  Vendor:"bg-blue-50 text-blue-700 ring-blue-200",
  "Work Order":"bg-amber-50 text-amber-700 ring-amber-200",
  Inspection:"bg-purple-50 text-purple-700 ring-purple-200",
  Invoice:"bg-green-50 text-green-700 ring-green-200",
  "Employee Change Request":"bg-slate-100 text-slate-600 ring-slate-200",
  Property:"bg-emerald-50 text-emerald-700 ring-emerald-200",
  Asset:"bg-indigo-50 text-indigo-700 ring-indigo-200",
};

const allRecords = [
  { id:"REC-V-001",   object_type:"Vendor",     name:"Apex Electrical Services",           status:"Active", created_by:"Taylor Brooks", approved_by:"Morgan Patel",  created_date:"2026-05-30T10:45:00Z", data:{"Category":"Electrical","Payment Terms":"Net 30","Contact":"james@apexelec.com"} },
  { id:"REC-V-002",   object_type:"Vendor",     name:"BlueSky Maintenance",                status:"Active", created_by:"Casey Rivera",  approved_by:"Morgan Patel",  created_date:"2026-05-28T09:15:00Z", data:{"Category":"General Maintenance","Payment Terms":"Net 45"} },
  { id:"REC-V-003",   object_type:"Vendor",     name:"Pacific HVAC Solutions",             status:"Active", created_by:"Jordan Lee",    approved_by:"Avery Morgan",  created_date:"2026-05-15T14:00:00Z", data:{"Category":"HVAC","Payment Terms":"Net 30"} },
  { id:"REC-WO-001",  object_type:"Work Order", name:"Lobby Lighting Repair",              status:"Active", created_by:"Taylor Brooks", approved_by:"Jordan Lee",    created_date:"2026-05-29T11:00:00Z", data:{"Priority":"Medium","Location":"Building A, Lobby","WO Status":"In Progress"} },
  { id:"REC-WO-002",  object_type:"Work Order", name:"Parking Lot Resurfacing",            status:"Active", created_by:"Jordan Lee",    approved_by:"Jordan Lee",    created_date:"2026-05-27T08:30:00Z", data:{"Priority":"Low","Location":"North Lot","WO Status":"Scheduled"} },
  { id:"REC-INS-001", object_type:"Inspection", name:"111 Harbor View — Annual Fire Safety",status:"Active",created_by:"Morgan Patel",  approved_by:"Morgan Patel",  created_date:"2026-05-22T16:00:00Z", data:{"Result":"Pass","Inspector":"R. Montoya","Type":"Annual Fire Safety"} },
  { id:"REC-INS-002", object_type:"Inspection", name:"400 Commerce Blvd — Elevator",       status:"Active", created_by:"Morgan Patel",  approved_by:"Morgan Patel",  created_date:"2026-05-20T10:00:00Z", data:{"Result":"Pass","Inspector":"K. Tanaka","Type":"Elevator Safety"} },
  { id:"REC-INV-001", object_type:"Invoice",    name:"Pacific HVAC — INV-2026-0441",       status:"Active", created_by:"Taylor Brooks", approved_by:"Avery Morgan",  created_date:"2026-05-26T09:00:00Z", data:{"Amount":"$8,400","PO Number":"PO-2026-0211","Pmt Status":"Paid"} },
  { id:"REC-INV-002", object_type:"Invoice",    name:"BlueSky Maintenance — INV-2026-0438",status:"Active", created_by:"Taylor Brooks", approved_by:"Avery Morgan",  created_date:"2026-05-24T14:00:00Z", data:{"Amount":"$3,200","PO Number":"PO-2026-0204","Pmt Status":"Paid"} },
];

const audit = [
  { action:"Record approved",   actor:"Morgan Patel",  time:"May 30, 2026 10:52 AM" },
  { action:"Validation passed", actor:"System",        time:"May 30, 2026 10:46 AM" },
  { action:"Record submitted",  actor:"Taylor Brooks", time:"May 30, 2026 10:45 AM" },
];

const fmt = iso => new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

export default function Records() {
  const [objectFilter, setObjectFilter] = useState("All");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);
  const [drawerTab, setDrawerTab]       = useState("Details");

  const filtered = allRecords.filter(r =>
    (objectFilter === "All" || r.object_type === objectFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main pane ── */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Approved Records</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {allRecords.length} records · {new Set(allRecords.map(r => r.object_type)).size} object types
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Object-type pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
          {objectTypes.map(t => (
            <button key={t} onClick={() => setObjectFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors flex-shrink-0 ${
                objectFilter === t
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}>
              {t}
              {t !== "All" && (
                <span className="ml-1.5 opacity-60">{allRecords.filter(r => r.object_type === t).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-xs flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records…"
            className="pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-full bg-white transition-all" />
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Record</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Object</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Approved By</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => {
                const c = objColor[r.object_type] || "bg-slate-100 text-slate-600 ring-slate-200";
                return (
                  <tr key={r.id} onClick={() => { setSelected(r); setDrawerTab("Details"); }}
                    className={`cursor-pointer transition-colors ${selected?.id === r.id ? "bg-indigo-50/50" : "hover:bg-slate-50/60"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ring-1 ${c}`}>
                          {r.object_type[0]}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-slate-800">{r.name}</div>
                          <code className="text-[11px] text-slate-400">{r.id}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ${c}`}>{r.object_type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600 hidden md:table-cell">{r.approved_by}</td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><Badge status={r.status} /></td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-400 hidden lg:table-cell">{fmt(r.created_date)}</td>
                    <td className="px-4 py-3.5 text-slate-300"><ChevronRight className="w-4 h-4" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <div className="w-[360px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
            <div className="min-w-0 pr-3">
              <div className="text-[13px] font-bold text-slate-800 truncate">{selected.name}</div>
              <code className="text-[11px] text-slate-400">{selected.id}</code>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex border-b border-slate-100 px-2 flex-shrink-0">
            {["Details","Related","Audit History","Timeline"].map(tab => (
              <button key={tab} onClick={() => setDrawerTab(tab)}
                className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  drawerTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>{tab}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {drawerTab === "Details" && (
              <div className="space-y-0.5">
                {[
                  ["Object Type", <span key="ot" className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ${objColor[selected.object_type] || ""}`}>{selected.object_type}</span>],
                  ["Status",      <Badge key="st" status={selected.status} />],
                  ["Approved By", <span key="ab" className="text-[13px] font-semibold text-slate-800">{selected.approved_by}</span>],
                  ["Created",     <span key="cr" className="text-[12px] text-slate-600">{fmt(selected.created_date)}</span>],
                ].map(([k,v],i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-xs text-slate-400 font-medium">{k}</span>
                    {v}
                  </div>
                ))}
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Record Data</span>
                </div>
                {Object.entries(selected.data).map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-xs text-slate-400 font-medium">{k}</span>
                    <span className="text-[13px] font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {drawerTab === "Audit History" && (
              <div className="space-y-0.5">
                {audit.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-[13px] font-semibold text-slate-700">{a.action}</div>
                      <div className="text-[11px] text-slate-400">{a.actor} · {a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {drawerTab === "Related" && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No related records configured</p>
                <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">+ Add relationship</button>
              </div>
            )}

            {drawerTab === "Timeline" && (
              <div className="relative pl-5">
                {audit.map((a, i) => (
                  <div key={i} className={`relative pb-5 ${i < audit.length - 1 ? "border-l-2 border-slate-100" : ""}`}>
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                    <div className="ml-4">
                      <div className="text-[13px] font-semibold text-slate-700">{a.action}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{a.actor} · {a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
