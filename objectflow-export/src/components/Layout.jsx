import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Box, GitBranch, FileText, Download, Inbox,
  Database, Zap, Plug, BarChart2, Shield, Settings, Bell,
  Search, ChevronDown, Menu, X, Layers, ChevronRight
} from "lucide-react";

const navGroups = [
  {
    label: "Platform",
    items: [
      { path: "/home",        label: "Home",              icon: LayoutDashboard },
      { path: "/insights",    label: "Insights",          icon: BarChart2 },
    ],
  },
  {
    label: "Build",
    items: [
      { path: "/objects",     label: "Objects",           icon: Box },
      { path: "/processes",   label: "Processes",         icon: GitBranch },
      { path: "/forms",       label: "Forms & Interfaces",icon: FileText },
      { path: "/automations", label: "Automations",       icon: Zap },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/intake",      label: "Intake",            icon: Download },
      { path: "/curation",    label: "Curation Queue",    icon: Inbox, badge: 4 },
      { path: "/records",     label: "Records",           icon: Database },
    ],
  },
  {
    label: "Admin",
    items: [
      { path: "/integrations",label: "Integrations",      icon: Plug },
      { path: "/access",      label: "Access & Governance",icon: Shield },
      { path: "/settings",    label: "Settings",          icon: Settings },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

const notifications = [
  { title: "INT-2026-0482 needs review", sub: "Invoice — missing PO number", time: "5m ago", type: "warn" },
  { title: "SLA exceeded — Invoice Approval", sub: "3 records past deadline", time: "1h ago", type: "error" },
  { title: "Vendor record approved", sub: "Apex Electrical Services", time: "2h ago", type: "success" },
  { title: "SQL sync error", sub: "Connection refused — 12 failures", time: "4h ago", type: "error" },
];

const notifStyle = {
  warn:    "bg-amber-500",
  error:   "bg-rose-500",
  success: "bg-emerald-500",
  info:    "bg-blue-500",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const location = useLocation();

  const currentPage = allNavItems.find(n => location.pathname.startsWith(n.path))?.label || "ObjectFlow Studio";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 flex flex-col
        w-[220px] bg-slate-950 border-r border-slate-800
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Layers className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-white text-sm font-semibold tracking-tight">ObjectFlow</span>
              <span className="text-slate-500 text-xs ml-1">Studio</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 py-2.5 border-b border-slate-800 flex-shrink-0">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors group">
            <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-400 text-xs font-bold">N</span>
            </div>
            <span className="text-slate-300 text-xs font-medium flex-1 text-left truncate">Northstar Operations</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="px-2.5 mb-1">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{group.label}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon, badge }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} strokeWidth={1.75} />
                        <span className="flex-1 truncate">{label}</span>
                        {badge && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-3 py-3 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">AM</div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-xs font-semibold truncate">Avery Morgan</div>
              <div className="text-slate-500 text-[11px] truncate">Admin</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / page title */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-slate-400">Northstar Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">{currentPage}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm ml-auto lg:ml-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search records, processes, objects…"
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto lg:ml-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4.5 h-4.5" size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifStyle[n.type]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-800 leading-tight">{n.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{n.sub}</div>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">AM</div>
                <div className="hidden sm:block text-left">
                  <div className="text-[13px] font-semibold text-slate-700 leading-tight">Avery Morgan</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Admin</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-800">Avery Morgan</div>
                    <div className="text-xs text-slate-500">avery.morgan@northstar.com</div>
                  </div>
                  {[["Profile", ""], ["Workspace Settings", ""], ["Help & Docs", ""], ["Sign Out", "text-rose-600"]].map(([item, cls], i) => (
                    <button key={i} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${cls || "text-slate-700"}`}
                      onClick={() => setUserMenuOpen(false)}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
