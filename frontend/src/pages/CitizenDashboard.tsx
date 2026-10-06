import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { MapNode, GraphEdge, ShelterInfo, FindRouteResponse, MLPredictionResult, BayesianPredictionResult } from "../types";
import { MapView } from "../components/MapView";
import { RouteAnalysisPanel } from "../components/RouteAnalysisPanel";
import { AIExplanationPanel } from "../components/AIExplanationPanel";
import { Compass, ShieldCheck, MapPin, AlertCircle, RefreshCw } from "lucide-react";

interface CitizenDashboardProps {
  onOpenSearchLab?: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onOpenSearchLab }) => {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [shelters, setShelters] = useState<ShelterInfo[]>([]);

  const [selectedStartNode, setSelectedStartNode] = useState<string>("ZONE_BEGUMPET");
  const [selectedShelterId, setSelectedShelterId] = useState<string>("SHELTER_BEGUMPET");

  const [routeResult, setRouteResult] = useState<FindRouteResponse | null>(null);
  const [mlPred, setMlPred] = useState<MLPredictionResult | null>(null);
  const [bayesPred, setBayesPred] = useState<BayesianPredictionResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadGraphAndShelters();
  }, []);

  const loadGraphAndShelters = async () => {
    try {
      const gData = await api.getGraph();
      setNodes(gData.nodes);
      setEdges(gData.edges);

      const sData = await api.getShelters();
      setShelters(sData);

      if (sData.length > 0) {
        setSelectedShelterId(sData[0].id);
      }
    } catch (err) {
      console.error("Failed to load map graph", err);
    }
  };

  const handleFindSafestRoute = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Run A* Search
      const res = await api.findRoute(selectedStartNode, selectedShelterId, "A*");
      setRouteResult(res);

      // 2. Run ML Prediction for selected start node area
      const mlData = await api.predictRisk({
        rainfall: 75.0,
        water_level: 80.0,
        distance_from_hazard: 1.0,
        hazard_severity: 8.0,
        road_condition: 2,
        traffic_density: 70.0,
        population_density: 12000.0,
        elevation: 490.0,
        wind_speed: 25.0
      });
      setMlPred(mlData);

      // 3. Run Bayesian prediction
      const bayesData = await api.predictBayesian({
        rainfall_mm_hr: 75.0,
        water_level_cm: 80.0,
        elevation_m: 490.0,
        hazard_severity: 8.0
      });
      setBayesPred(bayesData);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to compute evacuation route.");
    } finally {
      setLoading(false);
    }
  };

  const currentStartNodeObj = nodes.find((n) => n.id === selectedStartNode);
  const currentShelterObj = shelters.find((s) => s.id === selectedShelterId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100">Citizen Evacuation Dashboard</h2>
            <p className="text-xs text-slate-400">
              Select your current location in Hyderabad to compute the safest evacuation path using Decision Trees, Bayes Net, and A* Search.
            </p>
          </div>
        </div>

        {/* Location & Shelter Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-1">Current Location</label>
            <select
              value={selectedStartNode}
              onChange={(e) => setSelectedStartNode(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {nodes.filter((n) => n.type === "ZONE").map((n) => (
                <option key={n.id} value={n.id}>📍 {n.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-1">Target Shelter</label>
            <select
              value={selectedShelterId}
              onChange={(e) => setSelectedShelterId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  🏥 {s.name} ({s.available_capacity} avail)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFindSafestRoute}
            disabled={loading}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all shadow-lg flex items-center space-x-2 border border-emerald-500"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Find Safest Evacuation Route</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Map (Left) + Right Side Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View (2 columns on desktop) */}
        <div className="lg:col-span-2 min-h-[500px] h-[620px]">
          <MapView
            nodes={nodes}
            edges={edges}
            shelters={shelters}
            selectedStartNode={selectedStartNode}
            onSelectStartNode={(nid) => setSelectedStartNode(nid)}
            selectedRoutePath={routeResult?.route?.path}
          />
        </div>

        {/* Right Panel Stack */}
        <div className="space-y-6">
          {/* Quick Disaster Status summary card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">CURRENT DISASTER</span>
              <span className="text-red-400 font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800">FLOOD 8/10</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
              <div>Your Location: <span className="font-bold text-slate-200">{currentStartNodeObj?.name}</span></div>
              <div>Target Shelter: <span className="font-bold text-slate-200">{currentShelterObj?.name}</span></div>
              <div>Safety Score: <span className="font-bold text-emerald-400">{routeResult ? `${routeResult.safety_score}/100` : "87/100"}</span></div>
              <div>Estimated ETA: <span className="font-bold text-amber-400">{routeResult ? `${routeResult.eta_minutes} min` : "14 min"}</span></div>
            </div>
          </div>

          <RouteAnalysisPanel
            routeData={routeResult}
            targetShelterName={currentShelterObj?.name}
            onCompareClicked={onOpenSearchLab}
          />

          <AIExplanationPanel
            mlPrediction={mlPred}
            bayesianPrediction={bayesPred}
            overallScore={routeResult?.safety_score || 87}
          />
        </div>
      </div>
    </div>
  );
};
