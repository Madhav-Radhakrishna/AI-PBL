import React from "react";
import { Role } from "../types";
import {
  ShieldAlert,
  Activity,
  Sliders,
  Search,
  Binary,
  GitFork,
  CheckSquare,
  FileText,
  Users,
  Compass,
  Zap,
  Brain
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  disasterSeverity: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  role,
  setRole,
  disasterSeverity
}) => {
  const tabs = [
    { id: "citizen", label: "Evacuation", icon: Compass, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "admin", label: "Command Center", icon: ShieldAlert, roles: ["ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "simulation", label: "Simulation Lab", icon: Sliders, roles: ["ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "search", label: "Search Lab (A*)", icon: Search, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "bayesian", label: "Bayesian Net", icon: Binary, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "tree", label: "Decision Tree", icon: GitFork, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "knowledge", label: "Logic & Rules", icon: Brain, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "csp", label: "CSP Lab", icon: CheckSquare, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "planning", label: "Planning", icon: FileText, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "multiagent", label: "Multi-Agent", icon: Users, roles: ["ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "localsearch", label: "Local Search", icon: Zap, roles: ["ADMIN", "EMERGENCY_RESPONDER"] },
    { id: "mapping", label: "AI Concepts", icon: Activity, roles: ["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg leading-tight tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Disaster Evacuation AI System
              </h1>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                SIMULATION: HYDERABAD FLOOD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI Problem-Based Learning (PBL) System • Severity: <span className="text-red-400 font-semibold">{disasterSeverity}/10</span>
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 px-2 font-medium">Role:</span>
          {(["CITIZEN", "ADMIN", "EMERGENCY_RESPONDER"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                role === r
                  ? r === "ADMIN"
                    ? "bg-red-600 text-white shadow"
                    : r === "EMERGENCY_RESPONDER"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
