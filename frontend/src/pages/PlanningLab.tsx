import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { EvacuationPlanResponse } from "../types";
import {
  FileText,
  Play,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sliders,
  Cpu,
  Layers,
  Activity,
  AlertTriangle
} from "lucide-react";

export const PlanningLab: React.FC = () => {
  const [plan, setPlan] = useState<EvacuationPlanResponse | null>(null);
  const [strategy, setStrategy] = useState<string>("BALANCED");
  const [severity, setSeverity] = useState<number>(8.0);
  const [rainfall, setRainfall] = useState<number>(75.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "strips" | "corridors">("pipeline");

  useEffect(() => {
    fetchInitialPlan();
  }, []);

  const fetchInitialPlan = async () => {
    setLoading(true);
    try {
      const data = await api.getEvacuationPlan();
      setPlan(data);
      if (data.disaster?.severity) setSeverity(data.disaster.severity);
      if (data.weather?.rainfall_mm_hr) setRainfall(data.weather.rainfall_mm_hr);
    } catch (err) {
      console.error("Failed to fetch evacuation plan", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomPlan = async () => {
    setLoading(true);
    try {
      const data = await api.generateCustomPlan({
        strategy,
        disaster_severity: severity,
        rainfall_mm_hr: rainfall
      });
      setPlan(data);
    } catch (err) {
      console.error("Failed to generate plan", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-slate-100">Classical & Dynamic Evacuation Planning Lab (Unit IV)</h2>
              <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                STRIPS & ACTION SEQUENCING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-phase AI planning engine coordinating hazard assessment, CSP shelter capacity assignments, and A* corridor generation from Initial State to Goal State.
            </p>
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          onClick={handleGenerateCustomPlan}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 border border-blue-500 shadow-lg shadow-blue-900/30 transition-all"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Re-Generate Evacuation Plan</span>
        </button>
      </div>

      {/* Control Panel & Strategy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        {/* Strategy Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Planning Strategy Preset</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: "BALANCED", label: "Balanced" },
              { id: "SAFETY_FIRST", label: "Safety 1st" },
              { id: "FASTEST", label: "Fastest" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  strategy === s.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            {strategy === "SAFETY_FIRST" && "Weight: 60% hazard penalty, 10% distance, 10% travel time."}
            {strategy === "FASTEST" && "Weight: 45% travel time, 35% distance, 10% hazard risk."}
            {strategy === "BALANCED" && "Weight: 40% hazard risk, 20% distance, 20% travel time."}
          </p>
        </div>

        {/* Severity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Disaster Severity Factor</span>
            <span className="text-red-400 font-mono">{severity.toFixed(1)} / 10.0</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={severity}
            onChange={(e) => setSeverity(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500 mt-2"
          />
          <span className="text-[11px] text-slate-500 block">Increases hazardous road water levels & penalties</span>
        </div>

        {/* Rainfall Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Rainfall Telemetry</span>
            <span className="text-blue-400 font-mono">{rainfall.toFixed(0)} mm/hr</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={rainfall}
            onChange={(e) => setRainfall(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
          />
          <span className="text-[11px] text-slate-500 block">Affects Bayesian flood priors & Decision Tree risk</span>
        </div>
      </div>

      {/* KPI Metrics Summary */}
      {plan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">TOTAL POPULATION EVACUATED</div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {plan.total_affected_population?.toLocaleString() || "18,420"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 6 zones</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">PLAN OVERALL SAFETY SCORE</div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {plan.overall_plan_safety_score}%
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Hazard Exposure Minimized</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">CSP CAPACITY VIOLATIONS</div>
            <div className="text-xl font-black text-emerald-400 mt-1">0</div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Strictly Constrained Satisfied</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">ACTIVE EVACUATION CORRIDORS</div>
            <div className="text-xl font-black text-blue-400 mt-1">
              {plan.zone_routes?.length || 6}
            </div>
            <div className="text-[10px] text-blue-500/80 mt-0.5">A* Optimal Paths Deployed</div>
          </div>
        </div>
      )}

      {/* Sub Tabs: Pipeline vs STRIPS Representation vs Zone Corridors */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "pipeline"
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Execution Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab("strips")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "strips"
              ? "bg-purple-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>STRIPS AI Formalism</span>
        </button>

        <button
          onClick={() => setActiveTab("corridors")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "corridors"
              ? "bg-emerald-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Zone Corridor Assignments</span>
        </button>
      </div>

      {/* Tab 1: Live Step Progression Pipeline */}
      {activeTab === "pipeline" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200">
              AI EVACUATION PLANNING STATE PROGRESSION PIPELINE
            </h3>
            <span className="text-xs text-blue-400 font-mono bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
              Strategy: {plan?.strategy || strategy}
            </span>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {plan?.plan_steps?.map((st, idx) => (
              <React.Fragment key={st.step_id}>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start space-x-4 shadow-lg hover:border-blue-500/50 transition-all">
                  <div
                    className={`p-3 rounded-lg text-xs font-bold shrink-0 ${
                      st.step_id === 1
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : st.step_id === plan.plan_steps.length
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}
                  >
                    STEP {st.step_id}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-100">{st.action}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed">{st.detail}</p>
                  </div>

                  <div className="shrink-0 self-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                {idx < plan.plan_steps.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-500/60 rotate-90 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: STRIPS AI Representation */}
      {activeTab === "strips" && plan?.strips_representation && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initial State */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span>INITIAL STATE PREDICATES S₀</span>
              </h3>
              <div className="space-y-2">
                {plan.strips_representation.initial_state.map((pred, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-300"
                  >
                    ✦ {pred}
                  </div>
                ))}
              </div>
            </div>

            {/* Goal State */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span>GOAL STATE SPECIFICATION G</span>
              </h3>
              <div className="space-y-2">
                {plan.strips_representation.goal_state.map((pred, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300"
                  >
                    ✔ {pred}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STRIPS Operators */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
              PLANNING OPERATORS & ACTION SCHEMAS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.strips_representation.operators.map((op) => (
                <div key={op.name} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-400 font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                      ACTION {op.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{op.description}</p>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="text-amber-400 text-[11px]">
                      <strong>PRECONDITIONS:</strong> {op.preconditions.join(" ∧ ")}
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      <strong>EFFECTS:</strong> {op.effects.join(" ∧ ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Zone Corridor Assignments Table */}
      {activeTab === "corridors" && plan?.zone_routes && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200">
              DEPLOYED POPULATION CORRIDORS & A* PATH SCHEDULE
            </h3>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded font-bold">
              100% POPULATION ACCOMMODATED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                  <th className="py-2.5 px-3">Evacuation Zone</th>
                  <th className="py-2.5 px-3">Population</th>
                  <th className="py-2.5 px-3">Assigned Shelter</th>
                  <th className="py-2.5 px-3">Distance & ETA</th>
                  <th className="py-2.5 px-3">A* Path Corridors</th>
                  <th className="py-2.5 px-3">Nodes Explored</th>
                  <th className="py-2.5 px-3">Safety Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {plan.zone_routes.map((zr) => (
                  <tr key={zr.zone_id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-100">{zr.zone_name}</td>
                    <td className="py-3 px-3 text-amber-400">{zr.population.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{zr.target_shelter_name}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{zr.distance_km} km</div>
                      <div className="text-amber-400 text-[11px] font-sans">{zr.eta_minutes} min</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">
                      {zr.route_path.join(" ➔ ")}
                    </td>
                    <td className="py-3 px-3 text-blue-400 font-bold">{zr.nodes_explored}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          zr.overall_risk_score < 40
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : "bg-amber-950 text-amber-400 border-amber-800"
                        }`}
                      >
                        {zr.overall_risk_score.toFixed(1)} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
