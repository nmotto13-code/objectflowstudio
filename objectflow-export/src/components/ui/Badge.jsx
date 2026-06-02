export const statusConfig = {
  // General
  "Active":         { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  "Draft":          { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-600 ring-slate-500/20" },
  "Archived":       { dot: "bg-gray-400",    pill: "bg-gray-50 text-gray-500 ring-gray-400/20" },
  "Paused":         { dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 ring-amber-500/20" },
  // Intake
  "Pending Review": { dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 ring-amber-500/20" },
  "Needs Fix":      { dot: "bg-rose-500",    pill: "bg-rose-50 text-rose-700 ring-rose-500/20" },
  "Validated":      { dot: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 ring-blue-500/20" },
  "Approved":       { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  "Rejected":       { dot: "bg-rose-500",    pill: "bg-rose-50 text-rose-700 ring-rose-500/20" },
  // Validation
  "Passed":         { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  "Failed":         { dot: "bg-rose-500",    pill: "bg-rose-50 text-rose-700 ring-rose-500/20" },
  "Warning":        { dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 ring-amber-500/20" },
  "Pending":        { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-600 ring-slate-500/20" },
  // Integrations
  "Connected":      { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  "Disconnected":   { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-600 ring-slate-500/20" },
  "Error":          { dot: "bg-rose-500",    pill: "bg-rose-50 text-rose-700 ring-rose-500/20" },
  "Coming Soon":    { dot: "bg-indigo-400",  pill: "bg-indigo-50 text-indigo-600 ring-indigo-500/20" },
  // Forms
  "Published":      { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  // Users
  "Inactive":       { dot: "bg-gray-400",    pill: "bg-gray-50 text-gray-500 ring-gray-400/20" },
};

export default function Badge({ status, className = "" }) {
  const cfg = statusConfig[status] || { dot: "bg-gray-400", pill: "bg-gray-50 text-gray-600 ring-gray-400/20" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${cfg.pill} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}
