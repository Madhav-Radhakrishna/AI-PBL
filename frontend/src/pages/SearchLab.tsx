import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { Search, Play, RefreshCw, BarChart2, Cpu } from "lucide-react";

export const SearchLab: React.FC = () => {
  const [startNode, setStartNode] = useState<string>("ZONE_BEGUMPET");
  const [targetShelter, setTargetShelter] = useState<string>("SHELTER_GACHIBOWLI");
  const [comparison, setComparison] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [selectedAlgDetail, setSelectedAlgDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runComparison();
  }, []);

  const runComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareAlgorithms(startNode, targetShelter);
      setComparison(res.comparison);
      setDetails(res.details);
      // Default select A*
      const astarRes = res.details.find((d: any) => d.algorithm === "A*");
      setSelectedAlgDetail(astarRes || res.details[0]);
    } catch (err) {
      console.error("Failed to run algorithm search comparison", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Search Lab (Unit I — Uninformed & Informed Search)</h2>
            <p className="text-xs text-slate-400">
              Benchmark and visualize BFS, Uniform Cost Search, Greedy Best First, and A* on the actual Hyderabad road graph.
            </p>
          </div>
        </div>

        <button
          onClick={runComparison}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-emerald-500 shadow-lg"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Run All Algorithms on Graph</span>
        </button>
      </div>

      {/* Comparison Benchmark Table (Requirement 7) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 font-bold text-sm text-slate-200">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span>Real-time Search Algorithm Performance Comparison</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-4">Algorithm</th>
                <th className="py-2.5 px-4">Nodes Explored</th>
                <th className="py-2.5 px-4">Path Cost</th>
                <th className="py-2.5 px-4">Hazard Risk</th>
                <th className="py-2.5 px-4">Execution Time</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {comparison.map((row) => (
                <tr
                  key={row.algorithm}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    selectedAlgDetail?.algorithm === row.algorithm ? "bg-blue-950/40 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-100 flex items-center space-x-2">
                    <span>{row.algorithm}</span>
                    {row.algorithm === "A*" && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        RECOMMENDED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">{row.nodes_explored}</td>
                  <td className="py-3 px-4 font-mono text-slate-200">{row.path_cost}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className={row.overall_risk > 50 ? "text-red-400" : "text-emerald-400"}>
                      {row.overall_risk} ({row.overall_risk > 50 ? "HIGH" : "LOW"})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-400">{row.execution_time_ms} ms</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const dt = details.find((d: any) => d.algorithm === row.algorithm);
                        setSelectedAlgDetail(dt);
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded border border-slate-700 font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Algorithm Heuristic & Step Details Panel (Section 6) */}
      {selectedAlgDetail && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base text-slate-100">
                Algorithm Execution Details: <span className="text-blue-400">{selectedAlgDetail.algorithm}</span>
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Explored {selectedAlgDetail.nodes_explored} nodes in {selectedAlgDetail.execution_time_ms} ms
            </span>
          </div>

          {/* Node Heuristics Table f(n) = g(n) + h(n) */}
          {selectedAlgDetail.node_details && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Node Heuristic Evaluation Matrix f(n) = g(n) + h(n)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.values(selectedAlgDetail.node_details).map((nd: any) => (
                  <div key={nd.node_id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono">
                    <div className="font-bold text-blue-400 text-ellipsis overflow-hidden">{nd.node_id}</div>
                    <div className="text-slate-400">g(n) = <span className="text-slate-200">{nd.g}</span></div>
                    <div className="text-slate-400">h(n) = <span className="text-slate-200">{nd.h}</span></div>
                    <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1 mt-1">f(n) = {nd.f}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Traversal Steps Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Search Frontier Step Log</h4>
            <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] bg-slate-950 p-3 rounded border border-slate-800">
              {selectedAlgDetail.steps?.map((st: any, idx: number) => (
                <div key={idx} className="text-slate-400 flex items-center space-x-2 border-b border-slate-900 pb-1">
                  <span className="text-slate-600">Step {idx + 1}:</span>
                  <span className="text-blue-300 font-bold">Node {st.current}</span>
                  {st.f !== undefined && <span className="text-emerald-400">f(n)={st.f} (g={st.g}, h={st.h})</span>}
                  <span className="text-slate-500">Visited: {st.visited_count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
