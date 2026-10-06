import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { CheckSquare, RefreshCw, Play, ShieldAlert, Check } from "lucide-react";

export const CSPLab: React.FC = () => {
  const [cspResult, setCspResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    solveCSP();
  }, []);

  const solveCSP = async () => {
    setLoading(true);
    try {
      const res = await api.solveCSP();
      setCspResult(res);
    } catch (err) {
      console.error("Failed to solve CSP", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Constraint Satisfaction Problem (CSP) Lab (Unit II)</h2>
            <p className="text-xs text-slate-400">
              Allocates population zones to shelters subject to Capacity, Safety, Distance, and Accessibility constraints using Backtracking Search & MRV Heuristic.
            </p>
          </div>
        </div>

        <button
          onClick={solveCSP}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-emerald-500 shadow-lg"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Run Backtracking CSP Solver</span>
        </button>
      </div>

      {/* Constraints Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 border-t-2 border-t-blue-500">
          <div className="font-bold text-blue-400">1. Capacity Constraint</div>
          <div className="text-slate-400">Total assigned population ≤ Shelter Capacity - Occupancy</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 border-t-2 border-t-red-500">
          <div className="font-bold text-red-400">2. Safety Constraint</div>
          <div className="text-slate-400">Do not assign zones through CRITICAL risk flood paths</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 border-t-2 border-t-amber-500">
          <div className="font-bold text-amber-400">3. Distance Constraint</div>
          <div className="text-slate-400">Prefer closest available shelter (max 25 km emergency threshold)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 border-t-2 border-t-emerald-500">
          <div className="font-bold text-emerald-400">4. Accessibility</div>
          <div className="text-slate-400">Must have unblocked road corridor connection</div>
        </div>
      </div>

      {/* Assignments Results */}
      {cspResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Table (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200">CSP Solution: Population Zone Shelter Allocation</h3>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold">
                SATISFIED ({cspResult.total_population_assigned.toLocaleString()} evacuees)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Evacuation Zone</th>
                    <th className="py-2.5 px-3">Population</th>
                    <th className="py-2.5 px-3">Assigned Shelter</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  {cspResult.assignments?.map((a: any) => (
                    <tr key={a.zone_id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold text-slate-100">{a.zone_name}</td>
                      <td className="py-3 px-3 text-amber-400">{a.population.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{a.assigned_shelter_name}</td>
                      <td className="py-3 px-3 text-slate-300">{a.distance_km} km</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          ASSIGNED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shelter Utilization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">SHELTER CAPACITY UTILIZATION</h3>
            <div className="space-y-3">
              {cspResult.shelter_utilization?.map((u: any) => (
                <div key={u.shelter_id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>{u.shelter_name}</span>
                    <span className="font-mono text-emerald-400">{u.assigned_population} / {u.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${u.occupancy_pct > 90 ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(u.occupancy_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
