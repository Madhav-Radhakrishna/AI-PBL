import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { Sliders, RefreshCw, AlertTriangle, Zap, ShieldAlert, Check } from "lucide-react";

interface SimulationLabProps {
  onTriggerReplanningAlert: (alert: any) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ onTriggerReplanningAlert }) => {
  const [severity, setSeverity] = useState<number>(8.0);
  const [rainfall, setRainfall] = useState<number>(75.0);
  const [traffic, setTraffic] = useState<number>(45.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const state = await api.getSimulationState();
      setSeverity(state.disaster.severity);
      setRainfall(state.weather.rainfall_mm_hr);
      setTraffic(state.stats.avg_traffic_pct);
    } catch (err) {
      console.error("Failed to fetch simulation state", err);
    }
  };

  const handleApplySimulation = async (updates: any) => {
    setLoading(true);
    try {
      const res = await api.updateSimulation(updates);
      setLastResult(res);
      if (res.alert) {
        onTriggerReplanningAlert(res.alert);
      }
    } catch (err) {
      console.error("Failed to update simulation", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Disaster Simulation Lab</h2>
          <p className="text-xs text-slate-400">
            Interactive control center. Modifying parameters re-runs the Decision Tree ML model, Bayesian uncertainty network, A* pathfinder, and CSP shelter solver.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">ENVIRONMENT & DISASTER CONTROLS</h3>

          {/* Disaster Severity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Disaster Severity</span>
              <span className="text-red-400 font-mono text-sm">{severity.toFixed(1)} / 10.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={severity}
              onChange={(e) => setSeverity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Rainfall Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Rainfall Intensity</span>
              <span className="text-blue-400 font-mono text-sm">{rainfall.toFixed(0)} mm/hr</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Traffic Density */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Network Traffic Density</span>
              <span className="text-amber-400 font-mono text-sm">{traffic.toFixed(0)} %</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={traffic}
              onChange={(e) => setTraffic(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={() => handleApplySimulation({ disaster_severity: severity, rainfall_mm_hr: rainfall, traffic_density_pct: traffic })}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg flex items-center justify-center space-x-2 border border-blue-500"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Run Simulation & Re-calculate AI System</span>
          </button>
        </div>

        {/* Quick Disaster Action Triggers (Section 23 Buttons) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">QUICK EVENT TRIGGERS</h3>
          <p className="text-xs text-slate-400">Trigger explicit disaster events to test dynamic replanning.</p>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => handleApplySimulation({ block_road_id: "RANDOM" })}
              disabled={loading}
              className="w-full bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold p-3 rounded-lg text-xs flex items-center justify-between text-left transition-all"
            >
              <span>🚫 Block Random Road Corridor</span>
              <span className="text-[10px] bg-red-900 px-2 py-0.5 rounded font-mono">FLOOD SURGE</span>
            </button>

            <button
              onClick={() => handleApplySimulation({ fill_shelter_id: "RANDOM", fill_amount: 1200 })}
              disabled={loading}
              className="w-full bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold p-3 rounded-lg text-xs flex items-center justify-between text-left transition-all"
            >
              <span>🏥 Fill Random Shelter Occupancy (+1200)</span>
              <span className="text-[10px] bg-amber-900 px-2 py-0.5 rounded font-mono">CSP RE-SOLVE</span>
            </button>

            <button
              onClick={() => handleApplySimulation({ disaster_severity: 9.5, rainfall_mm_hr: 120 })}
              disabled={loading}
              className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold p-3 rounded-lg text-xs flex items-center justify-between text-left transition-all"
            >
              <span>⚡ Trigger Severe Storm Surge (9.5/10)</span>
              <span className="text-[10px] bg-purple-900 px-2 py-0.5 rounded font-mono">BAYES RE-EVAL</span>
            </button>

            <button
              onClick={() => handleApplySimulation({ traffic_density_pct: 90 })}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold p-3 rounded-lg text-xs flex items-center justify-between text-left transition-all"
            >
              <span>🚗 Gridlock Evacuation Traffic (90%)</span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono">A* WEIGHTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recalculation Results Preview */}
      {lastResult && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>AI System Recalculated Successfully</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg text-xs font-mono space-y-1.5 border border-slate-800">
            <p className="text-slate-300 font-bold">Reasons / Changes:</p>
            {lastResult.reasons.map((r: string, idx: number) => (
              <p key={idx} className="text-slate-400">
                • {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
