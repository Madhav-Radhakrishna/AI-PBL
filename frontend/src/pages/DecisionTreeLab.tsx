import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { GitFork, Cpu, CheckCircle } from "lucide-react";

export const DecisionTreeLab: React.FC = () => {
  const [treeData, setTreeData] = useState<any>(null);
  const [importances, setImportances] = useState<Record<string, number>>({});
  const [predResult, setPredResult] = useState<any>(null);

  // Features
  const [rainfall, setRainfall] = useState<number>(78.0);
  const [waterLevel, setWaterLevel] = useState<number>(82.0);
  const [distHazard, setDistHazard] = useState<number>(0.7);
  const [traffic, setTraffic] = useState<number>(71.0);
  const [elevation, setElevation] = useState<number>(490.0);

  useEffect(() => {
    loadTreeStructure();
    runPredict();
  }, []);

  const loadTreeStructure = async () => {
    try {
      const data = await api.getDecisionTreeStructure();
      setTreeData(data.tree);
      setImportances(data.feature_importances);
    } catch (err) {
      console.error("Failed to load decision tree", err);
    }
  };

  const runPredict = async () => {
    try {
      const res = await api.predictRisk({
        rainfall,
        water_level: waterLevel,
        distance_from_hazard: distHazard,
        hazard_severity: 8.0,
        road_condition: 2,
        traffic_density: traffic,
        population_density: 12000.0,
        elevation,
        wind_speed: 40.0
      });
      setPredResult(res);
    } catch (err) {
      console.error("Failed prediction", err);
    }
  };

  const renderTreeNode = (node: any, depth: number = 0) => {
    if (!node) return null;
    const isLeaf = Boolean(node.category);

    return (
      <div className="ml-4 my-2 text-xs font-mono border-l-2 border-slate-700 pl-3">
        {isLeaf ? (
          <div className="bg-slate-950 p-2 rounded border border-emerald-800 text-emerald-300 font-bold inline-block">
            🌱 {node.name} (Conf: {node.confidence}%, Samples: {node.samples})
          </div>
        ) : (
          <div className="bg-slate-800 p-2 rounded border border-slate-700 text-blue-300 font-semibold inline-block">
            🔀 {node.name}
          </div>
        )}
        {node.children && node.children.map((c: any, idx: number) => (
          <div key={idx}>{renderTreeNode(c, depth + 1)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
          <GitFork className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Decision Tree ML Lab (Unit V — Supervised Learning)</h2>
          <p className="text-xs text-slate-400">
            Supervised Decision Tree & Random Forest classifiers trained on disaster road risk features.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">FEATURE INPUTS</h3>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Rainfall ({rainfall} mm/hr)</label>
            <input type="range" min="0" max="150" value={rainfall} onChange={(e) => setRainfall(parseFloat(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Water Level ({waterLevel} cm)</label>
            <input type="range" min="0" max="150" value={waterLevel} onChange={(e) => setWaterLevel(parseFloat(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Distance to Hazard ({distHazard} km)</label>
            <input type="range" min="0.1" max="10.0" step="0.1" value={distHazard} onChange={(e) => setDistHazard(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-bold">Traffic Density ({traffic} %)</label>
            <input type="range" min="0" max="100" value={traffic} onChange={(e) => setTraffic(parseFloat(e.target.value))} className="w-full accent-amber-500" />
          </div>

          <button onClick={runPredict} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg">
            Predict Road Risk
          </button>
        </div>

        {/* Prediction Results & Tree Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {predResult && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Decision Tree Model Output</div>
                  <h3 className="text-xl font-black text-blue-400">Risk Prediction</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-red-400">{predResult.risk_score} / 100</div>
                  <div className="text-xs text-slate-400">Category: <span className="font-bold text-red-400">{predResult.risk_category}</span></div>
                </div>
              </div>

              {/* Decision Path Rules */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Tree Traversal Path Rules</h4>
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs space-y-1 border border-slate-800 text-slate-300">
                  {predResult.decision_path?.map((rule: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-blue-400">Step {idx + 1}:</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trained Decision Tree Visualizer */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">TRAINED DECISION TREE STRUCTURE</h3>
            <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-96">
              {renderTreeNode(treeData)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
