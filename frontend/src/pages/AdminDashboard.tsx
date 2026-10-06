import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ShieldAlert, Users, Home, AlertOctagon, Activity, Bell } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [shelters, setShelters] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getAdminSummary();
      setSummary(data);

      const sData = await api.getShelters();
      setShelters(sData);
    } catch (err) {
      console.error("Failed to load admin summary", err);
    }
  };

  const metrics = summary?.metrics || {
    active_disasters: 2,
    affected_people: 18420,
    open_shelters: 7,
    available_capacity: 4850,
    blocked_roads: 12,
    high_risk_roads: 18,
    active_evacuations: 6
  };

  const shelterChartData = shelters.map((s) => ({
    name: s.name.replace("Shelter", "").replace("Stadium", "").trim(),
    occupancy: s.current_occupancy,
    capacity: s.capacity,
    available: s.available_capacity
  }));

  const riskPieData = [
    { name: "SAFE (0-25)", value: 8, color: "#10b981" },
    { name: "MODERATE (25-50)", value: 9, color: "#f59e0b" },
    { name: "HIGH RISK (50-75)", value: 6, color: "#f97316" },
    { name: "CRITICAL (75-100)", value: 12, color: "#ef4444" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Page Title */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Emergency Management Command Center (Admin)</h2>
          <p className="text-xs text-slate-400">Real-time disaster metrics, shelter occupancy status, blocked corridors, and AI prediction feeds.</p>
        </div>
      </div>

      {/* Metrics Grid (Requirement 22) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">ACTIVE DISASTERS</div>
          <div className="text-xl font-black text-red-400 mt-1">{metrics.active_disasters}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">AFFECTED PEOPLE</div>
          <div className="text-xl font-black text-slate-100 mt-1">{metrics.affected_people.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">OPEN SHELTERS</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{metrics.open_shelters}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">AVAIL CAPACITY</div>
          <div className="text-xl font-black text-blue-400 mt-1">{metrics.available_capacity.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">BLOCKED ROADS</div>
          <div className="text-xl font-black text-red-500 mt-1">{metrics.blocked_roads}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">HIGH-RISK ROADS</div>
          <div className="text-xl font-black text-amber-400 mt-1">{metrics.high_risk_roads}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">EVACUATION ZONES</div>
          <div className="text-xl font-black text-purple-400 mt-1">{metrics.active_evacuations}</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shelter Capacity Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200">Shelter Occupancy vs Available Capacity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                <Bar dataKey="occupancy" name="Current Occupancy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Space" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200">Road Corridor Risk Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent AI Dynamic Replanning Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
          <Bell className="w-4 h-4" />
          <span>System Alerts & AI Replanning Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Trigger Reason / Event</th>
                <th className="py-2 px-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {summary?.recent_alerts?.length > 0 ? (
                summary.recent_alerts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(a.created_at).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 font-bold text-red-400">{a.title}</td>
                    <td className="py-2.5 px-3 whitespace-pre-line text-slate-300 font-mono">{a.message}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    Hyderabad Flood Emergency simulation initialized. All AI engines active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
