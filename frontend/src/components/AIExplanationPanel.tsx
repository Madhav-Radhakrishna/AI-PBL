import React from "react";
import { MLPredictionResult, BayesianPredictionResult } from "../types";
import { Brain, Cpu, Binary, CheckCircle } from "lucide-react";

interface AIExplanationPanelProps {
  mlPrediction?: MLPredictionResult | null;
  bayesianPrediction?: BayesianPredictionResult | null;
  overallScore?: number;
}

export const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  mlPrediction,
  bayesianPrediction,
  overallScore = 87
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-5 shadow-xl">
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="font-bold text-base">AI DECISION EXPLANATION PANEL</h3>
      </div>

      {/* AI Score Bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Hazard Risk Assessment</span>
            <span className="font-bold text-red-400">82%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: "82%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Traffic Congestion Risk</span>
            <span className="font-bold text-amber-400">61%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "61%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Future Hazard Expansion Exposure</span>
            <span className="font-bold text-yellow-400">72%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full rounded-full" style={{ width: "72%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Shelter Available Capacity</span>
            <span className="font-bold text-emerald-400">91%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "91%" }}></div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between border border-slate-700 mt-2">
          <span className="text-xs font-bold text-slate-300">Overall Route Safety Score</span>
          <span className="text-lg font-black text-emerald-400">{overallScore}/100</span>
        </div>
      </div>

      {/* Grid comparing ML Model vs Bayesian Uncertainty Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* ML Model Card */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 border-b border-slate-800 pb-1.5">
            <Cpu className="w-4 h-4" />
            <span>ML MODEL (SUPERVISED LEARNING)</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Classifier:</span>
              <span className="font-bold text-slate-200">Decision Tree</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Risk Category:</span>
              <span className="font-bold text-emerald-400">
                {mlPrediction?.risk_category || "SAFE"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Confidence:</span>
              <span className="font-bold text-slate-200">
                {mlPrediction?.confidence ? `${mlPrediction.confidence}%` : "91.0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Bayesian Model Card */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 border-b border-slate-800 pb-1.5">
            <Binary className="w-4 h-4" />
            <span>BAYESIAN UNCERTAINTY MODEL</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>P(Road Unsafe):</span>
              <span className="font-bold text-red-400">
                {bayesianPrediction?.prob_road_unsafe ? bayesianPrediction.prob_road_unsafe : 0.13}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>P(Road Safe):</span>
              <span className="font-bold text-emerald-400">
                {bayesianPrediction?.prob_road_safe ? bayesianPrediction.prob_road_safe : 0.87}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Confidence:</span>
              <span className="font-bold text-slate-200">
                {bayesianPrediction?.confidence || "High"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
