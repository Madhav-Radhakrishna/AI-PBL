import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { BayesianPredictionResult } from "../types";
import { Binary, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export const BayesianLab: React.FC = () => {
  const [rainfall, setRainfall] = useState<number>(78.0);
  const [waterLevel, setWaterLevel] = useState<number>(82.0);
  const [elevation, setElevation] = useState<number>(490.0);
  const [severity, setSeverity] = useState<number>(8.0);

  const [prediction, setPrediction] = useState<BayesianPredictionResult | null>(null);
  const [dag, setDag] = useState<any>(null);

  useEffect(() => {
    loadDAG();
    calculateInference();
  }, []);

  const loadDAG = async () => {
    try {
      const d = await api.getBayesianDAG();
      setDag(d);
    } catch (err) {
      console.error("Failed to load DAG", err);
    }
  };

  const calculateInference = async () => {
    try {
      const res = await api.predictBayesian({
        rainfall_mm_hr: rainfall,
        water_level_cm: waterLevel,
        elevation_m: elevation,
        hazard_severity: severity
      });
      setPrediction(res);
    } catch (err) {
      console.error("Failed bayes inference", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
          <Binary className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Bayesian Uncertainty Reasoning Lab (Unit V)</h2>
          <p className="text-xs text-slate-400">
            Handles incomplete and uncertain disaster evidence using Bayes' Rule and Bayesian Networks to compute exact posterior probability P(Road Unsafe | Evidence).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence Inputs */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">EVIDENCE INPUTS</h3>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Rainfall ({rainfall} mm/hr)</label>
            <input
              type="range"
              min="0"
              max="150"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Water Level ({waterLevel} cm)</label>
            <input
              type="range"
              min="0"
              max="150"
              value={waterLevel}
              onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Elevation ({elevation} m)</label>
            <input
              type="range"
              min="450"
              max="600"
              value={elevation}
              onChange={(e) => setElevation(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Hazard Severity ({severity}/10)</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={severity}
              onChange={(e) => setSeverity(parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <button
            onClick={calculateInference}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg"
          >
            Compute Bayesian Probabilities
          </button>
        </div>

        {/* Bayesian Network Diagram & Inference Output (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Bayesian Result Box */}
          {prediction && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Posterior Inference Output</div>
                  <h3 className="text-xl font-black text-purple-400">P(Road Becoming Unsafe | Evidence)</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-red-400">{(prediction.prob_road_unsafe * 100).toFixed(1)}%</div>
                  <div className="text-xs text-slate-400">Confidence: <span className="font-bold text-slate-200">{prediction.confidence}</span></div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prediction.prob_road_unsafe * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Evidence Breakdown Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Evidence Contribution Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {prediction.evidence_contributions.map((c) => (
                    <div key={c.variable} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="text-slate-400 font-bold">{c.variable}</div>
                      <div className="text-slate-200 font-mono text-sm mt-0.5">{c.val}</div>
                      <div className="text-purple-400 font-bold mt-1">+{c.contribution_pct}% Impact</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bayesian DAG Visualization */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">BAYESIAN NETWORK DIRECTED ACYCLIC GRAPH (DAG)</h3>
            <div className="bg-slate-950 p-4 rounded-lg flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <div className="flex flex-col space-y-2">
                <div className="bg-purple-950/80 border border-purple-800 p-2 rounded text-purple-300 font-bold">Rainfall</div>
                <div className="bg-purple-950/80 border border-purple-800 p-2 rounded text-purple-300 font-bold">Water Level</div>
                <div className="bg-purple-950/80 border border-purple-800 p-2 rounded text-purple-300 font-bold">Elevation</div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600" />

              <div className="bg-blue-950/80 border border-blue-800 p-3 rounded text-blue-300 font-bold">
                P(Flooding) = {prediction ? prediction.prob_flooding.toFixed(2) : "0.82"}
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600" />

              <div className="bg-red-950/80 border border-red-800 p-3 rounded text-red-300 font-bold text-center">
                <div>P(Road Unsafe)</div>
                <div className="text-sm font-black mt-1">{prediction ? (prediction.prob_road_unsafe * 100).toFixed(1) : "87.0"}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
