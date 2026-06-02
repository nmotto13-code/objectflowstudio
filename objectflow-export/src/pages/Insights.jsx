import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Zap, Plug, ArrowUpRight, GitBranch } from "lucide-react";

function BarChart({ data, color = "bg-indigo-500" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div
            className={`w-full rounded-t-sm ${color} hover:opacity-80 transition-opacity cursor-default`}
            style={{ height: `${Math.max((d.value / max) * 96, d.value > 0 ? 4 : 0)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-slate-400 truncate w-full text-center leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, color = "#6366f1" }) {
  const vals = data.map(d => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const W = 280, H = 64, pad = 8;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = (H - pad) - ((d.value - min) / range) * (H - pad * 2);
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pts[0][0]},${H - pad} ` + polyline + ` ${pts[pts.length-1][0]},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={polyline} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const volumeData = [
  {label:"Apr 28",value:42},{label:"Apr 29",value:55},{label:"Apr 30",value:38},{label:"May 1",value:61},
  {label:"May 5",value:74},{label:"May 10",value:89},{label:"May 15",value:67},{label:"May 20",value:102},
  {label:"May 25",value:118},{label:"May 30",value:124},
];
const cycleData = [
  {label:"Fac. WO",value:3.2},{label:"Vendor",value:7.5},{label:"Inspection",value:1.8},{label:"Emp. Req.",value:4.1},{label:"Invoice",value:2.4},
];
const pendingData = [
  {label:"Invoice",value:31},{label:"Fac. WO",value:24},{label:"Inspection",value:12},{label:"Vendor",value:8},{label:"Emp. Req.",value:5},
];
const approvedByWeek = [
  {label:"W1 Apr",value:48},{label:"W2",value:63},{label:"W3",value:71},{label:"W4",value:58},
  {label:"W1 May",value:82},{label:"W2",value:97},{label:"W3",value:109},{label:"W4",value:124},
];
const autoData = [
  {label:"M 23",value:88},{label:"M 24",value:91},{label:"M 25",value:95},{label:"M 26",value:89},
  {label:"M 27",value:97},{label:"M 28",value:100},{label:"M 29",value:96},{label:"M 30",value:95},
];

const kpis = [
  { label:"Approved (Week)",      value:"124",  delta:"+18%",   good:true,  icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50", ring:"ring-emerald-200" },
  { label:"Avg. Cycle Time",      value:"3.8d", delta:"−0.4d",  good:true,  icon:Clock,         color:"text-indigo-600",  bg:"bg-indigo-50",  ring:"ring-indigo-200"  },
  { label:"Validation Fail Rate", value:"8.2%", delta:"+1.1%",  good:false, icon:AlertTriangle, color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"    },
  { label:"Duplicate Detect",     value:"4.7%", delta:"−0.3%",  good:true,  icon:GitBranch,     color:"text-amber-600",   bg:"bg-amber-50",   ring:"ring-amber-200"   },
  { label:"SLA Breaches",         value:"6",    delta:"+2",     good:false, icon:TrendingUp,    color:"text-orange-600",  bg:"bg-orange-50",  ring:"ring-orange-200"  },
  { label:"Automation Success",   value:"97.1%",delta:"+0.8%",  good:true,  icon:Zap,           color:"text-purple-600",  bg:"bg-purple-50",  ring:"ring-purple-200"  },
  { label:"Integration Errors",   value:"13",   delta:"+13",    good:false, icon:Plug,          color:"text-rose-600",    bg:"bg-rose-50",    ring:"ring-rose-200"    },
  { label:"Intake Volume (Week)", value:"489",  delta:"+42",    good:true,  icon:ArrowUpRight,  color:"text-blue-600",    bg:"bg-blue-50",    ring:"ring-blue-200"    },
];

function ChartCard({ title, badge, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold text-slate-800">{title}</span>
        {badge && <span className="text-[11px] text-indigo-600 font-semibold">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

export default function Insights() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">Process health, performance metrics, and operational efficiency</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex w-9 h-9 rounded-xl ${k.bg} items-center justify-center mb-3 ring-1 ${k.ring}`}>
              <k.icon className={`w-4 h-4 ${k.color}`} strokeWidth={2} />
            </div>
            <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{k.value}</div>
            <div className="text-xs text-slate-500 font-medium leading-tight mb-1.5">{k.label}</div>
            <div className={`text-[11px] flex items-center gap-1 font-semibold ${k.good ? "text-emerald-600" : "text-rose-600"}`}>
              {k.good ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {k.delta} vs last week
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Records Approved — Rolling 30 Days" badge="+18% WoW">
          <LineChart data={volumeData} color="#6366f1" />
          <div className="flex justify-between mt-2">
            {volumeData.filter((_,i)=>i%3===0).map((d,i)=>(
              <span key={i} className="text-[10px] text-slate-400">{d.label}</span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Average Cycle Time by Process (days)" badge="Last 30 days">
          <BarChart data={cycleData} color="bg-indigo-400" />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Pending Approvals by Process">
          <BarChart data={pendingData} color="bg-amber-400" />
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {[
              {label:"Invoice Approval",value:31},
              {label:"Facilities Work Order",value:24},
              {label:"Property Inspection",value:12},
            ].map((d,i)=>(
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Records Approved by Week">
          <BarChart data={approvedByWeek} color="bg-emerald-400" />
        </ChartCard>

        <ChartCard title="Automation Success Rate (%)" badge="8-day avg: 93.9%">
          <LineChart data={autoData} color="#10b981" />
          <div className="flex justify-between mt-2">
            {autoData.filter((_,i)=>i%2===0).map((d,i)=>(
              <span key={i} className="text-[10px] text-slate-400">{d.label}</span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <span className="text-[13px] font-semibold text-slate-800">Validation Summary by Object</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Object</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Passed</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-rose-600 uppercase tracking-wide">Failed</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Fail %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {obj:"Vendor",total:147,passed:131,failed:16},
                {obj:"Work Order",total:312,passed:299,failed:13},
                {obj:"Invoice",total:438,passed:397,failed:41},
                {obj:"Inspection",total:204,passed:201,failed:3},
                {obj:"Emp. Change Req.",total:56,passed:49,failed:7},
              ].map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{r.obj}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{r.total}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{r.passed}</td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-600">{r.failed}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{Math.round(r.failed/r.total*100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <span className="text-[13px] font-semibold text-slate-800">SLA Performance</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Process</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">SLA</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Avg</th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">On Time</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                {name:"Invoice Approval",sla:"48h",avg:"57h",pct:72,breaches:9},
                {name:"Facilities Work Order",sla:"72h",avg:"77h",pct:85,breaches:4},
                {name:"Vendor Onboarding",sla:"168h",avg:"180h",pct:91,breaches:1},
                {name:"Inspection Review",sla:"48h",avg:"43h",pct:96,breaches:0},
                {name:"Emp. Change Req.",sla:"96h",avg:"98h",pct:60,breaches:2},
              ].map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-semibold text-slate-700">{r.name}</td>
                  <td className="px-3 py-3 text-right text-slate-500">{r.sla}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{r.avg}</td>
                  <td className={`px-3 py-3 text-right font-bold ${r.pct>=90?"text-emerald-600":r.pct>=75?"text-amber-600":"text-rose-600"}`}>{r.pct}%</td>
                  <td className={`px-4 py-3 text-right font-bold ${r.breaches>0?"text-rose-600":"text-slate-300"}`}>{r.breaches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
