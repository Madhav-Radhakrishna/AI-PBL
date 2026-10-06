import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Zap, Play, RefreshCw, TrendingDown, Dna } from "lucide-react";

export const LocalSearchLab: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<string>("Hill Climbing");
  const [iterations, setIterations] = useState<number>(200);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runOptimization();
  }, []);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeLocalSearch(algorithm, iterations);
      setResult(res);
    } catch (err) {
      console.error("Failed local search optimization", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Local Search & Metaheuristics Lab (Unit I — Hill Climbing, Annealing & Genetic)</h2>
            <p className="text-xs text-slate-400">
              Iteratively optimizes zone-shelter assignment configurations to minimize distance, congestion, and overflow penalty functions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-2 rounded-lg font-bold outline-none"
          >
            <option value="Hill Climbing">Hill Climbing</option>
            <option value="Simulated Annealing">Simulated Annealing</option>
            <option value="Genetic Algorithm">Genetic Algorithm</option>
          </select>

          <button
            onClick={runOptimization}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-amber-500 shadow-lg transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run {algorithm}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-slate-400">INITIAL PLAN COST</div>
            <div className="text-2xl font-black text-red-400 mt-1">{result.initial_cost}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-slate-400">AFTER OPTIMIZATION COST</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{result.optimized_cost}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-xs uppercase font-bold text-slate-400">PLAN IMPROVEMENT</div>
            <div className="text-2xl font-black text-blue-400 mt-1">+{result.improvement_pct}%</div>
          </div>
        </div>
      )}

      {/* Convergence Curve Chart & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Convergence Curve Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>Local Search Cost Function Convergence Curve ({algorithm})</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result?.history || []}>
                <XAxis dataKey="step" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Final Optimized Assignment Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Dna className="w-4 h-4 text-amber-400" />
            <span>OPTIMIZED SHELTER ASSIGNMENTS</span>
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result?.final_assignment &&
              Object.entries(result.final_assignment).map(([zone, shelter]: [string, any]) => (
                <div
                  key={zone}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex justify-between items-center"
                >
                  <span className="font-bold text-slate-200 font-mono">{zone.replace("ZONE_", "")}</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">➔ {shelter.replace("SHELTER_", "")}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
