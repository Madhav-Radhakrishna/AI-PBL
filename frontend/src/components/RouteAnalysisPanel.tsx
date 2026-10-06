import React from "react";
import { FindRouteResponse } from "../types";
import { ShieldCheck, Clock, MapPin, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

interface RouteAnalysisPanelProps {
  routeData: FindRouteResponse | null;
  targetShelterName?: string;
  onCompareClicked?: () => void;
}

export const RouteAnalysisPanel: React.FC<RouteAnalysisPanelProps> = ({
  routeData,
  targetShelterName = "Shelter",
  onCompareClicked
}) => {
  if (!routeData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400">
        <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-sm">Select an evacuation start point and click <strong>"Find Safest Evacuation Route"</strong> to generate A* route analysis.</p>
      </div>
    );
  }

  const { route, safety_score, eta_minutes, explanations } = routeData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 text-white shadow-xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800/80 px-2.5 py-1 rounded-md">
            RECOMMENDED SAFE ROUTE (A* SEARCH)
          </span>
          <h3 className="font-bold text-base mt-1.5 text-slate-100">Dest: {targetShelterName}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400">{safety_score}/100</div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Safety Score</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg text-center">
          <MapPin className="w-4 h-4 mx-auto text-blue-400 mb-1" />
          <div className="text-xs text-slate-400">Distance</div>
          <div className="text-sm font-bold text-slate-100">{route.cost.toFixed(1)} km</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg text-center">
          <Clock className="w-4 h-4 mx-auto text-amber-400 mb-1" />
          <div className="text-xs text-slate-400">Est. ETA</div>
          <div className="text-sm font-bold text-slate-100">{eta_minutes} min</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg text-center">
          <ShieldCheck className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
          <div className="text-xs text-slate-400">Risk Level</div>
          <div className="text-sm font-bold text-emerald-400">
            {route.overall_risk < 35 ? "LOW" : route.overall_risk < 65 ? "MODERATE" : "HIGH"}
          </div>
        </div>
      </div>

      {/* Why this route? Checklist */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Why was this route selected?</h4>
        <div className="space-y-1.5">
          {explanations.map((exp, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{exp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Comparison Box */}
      <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>ROUTE TRADE-OFF COMPARISON</span>
          {onCompareClicked && (
            <button
              onClick={onCompareClicked}
              className="text-blue-400 hover:text-blue-300 flex items-center text-[11px]"
            >
              Open AI Search Lab <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-red-950/40 border border-red-900/50">
            <div>
              <span className="font-semibold text-red-300">FASTEST ROUTE</span>
              <p className="text-[10px] text-slate-400">3.8 km • 9 min</p>
            </div>
            <span className="text-red-400 font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800 text-[10px]">
              CRITICAL RISK (FLOOD)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-emerald-950/60 border border-emerald-800">
            <div>
              <span className="font-semibold text-emerald-300">RECOMMENDED ROUTE (A*)</span>
              <p className="text-[10px] text-slate-400">{route.cost.toFixed(1)} km • {eta_minutes} min</p>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
              OPTIMAL SAFETY
            </span>
          </div>
        </div>

        <p className="text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded border border-amber-900/40 flex items-center space-x-1.5 mt-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>The fastest route is NOT recommended because its predicted hazard risk is significantly higher.</span>
        </p>
      </div>
    </div>
  );
};
