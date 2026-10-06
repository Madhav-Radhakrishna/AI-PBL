import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { MultiAgentRoute, MapNode, GraphEdge, ShelterInfo } from "../types";
import { MapView } from "../components/MapView";
import { Users, Play, RefreshCw, Plus, Trash2, Shield, Siren, Flame, Cross, AlertCircle } from "lucide-react";

interface AgentItem {
  agent_id: string;
  role: string;
  start_node: string;
  target_node: string;
}

export const MultiAgentLab: React.FC = () => {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [shelters, setShelters] = useState<ShelterInfo[]>([]);
  const [routes, setRoutes] = useState<MultiAgentRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [agentList, setAgentList] = useState<AgentItem[]>([
    { agent_id: "A1", role: "AMBULANCE", start_node: "ZONE_AMEERPET", target_node: "SHELTER_NIZAM" },
    { agent_id: "A2", role: "FIRE_TRUCK", start_node: "ZONE_KHAIRATABAD", target_node: "SHELTER_BEGUMPET" },
    { agent_id: "A3", role: "CIVILIAN", start_node: "ZONE_BEGUMPET", target_node: "SHELTER_GACHIBOWLI" },
    { agent_id: "A4", role: "RESCUE_TEAM", start_node: "ZONE_CHARMINAR", target_node: "SHELTER_MEHDIPATNAM" },
    { agent_id: "A5", role: "POLICE", start_node: "ZONE_MALAKPET", target_node: "SHELTER_LB_NAGAR" }
  ]);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      const gData = await api.getGraph();
      setNodes(gData.nodes);
      setEdges(gData.edges);

      const sData = await api.getShelters();
      setShelters(sData);

      planAgents(agentList);
    } catch (err) {
      console.error("Failed loading multi-agent graph", err);
    }
  };

  const planAgents = async (agents: AgentItem[]) => {
    setLoading(true);
    try {
      const res = await api.planMultiAgentRoutes(agents);
      setRoutes(res.multi_agent_routes);
    } catch (err) {
      console.error("Failed planning multi-agent routes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgent = (idx: number, field: keyof AgentItem, val: string) => {
    const updated = [...agentList];
    updated[idx] = { ...updated[idx], [field]: val };
    setAgentList(updated);
  };

  const handleAddAgent = () => {
    const newId = `A${agentList.length + 1}`;
    const newAgent: AgentItem = {
      agent_id: newId,
      role: "AMBULANCE",
      start_node: nodes.find((n) => n.type === "ZONE")?.id || "ZONE_AMEERPET",
      target_node: shelters[0]?.id || "SHELTER_NIZAM"
    };
    const updated = [...agentList, newAgent];
    setAgentList(updated);
    planAgents(updated);
  };

  const handleRemoveAgent = (idx: number) => {
    if (agentList.length <= 1) return;
    const updated = agentList.filter((_, i) => i !== idx);
    setAgentList(updated);
    planAgents(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-slate-100">Emergency Vehicle Multi-Agent Planning Lab (Unit IV)</h2>
              <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                DYNAMIC DECONFLICTION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simultaneous multi-objective pathfinding for heterogeneous emergency agents with customized role weightings and shared edge traffic penalties.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddAgent}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Agent</span>
          </button>

          <button
            onClick={() => planAgents(agentList)}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-amber-500 shadow-lg transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Re-Plan Multi-Agent Dispatch</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View showing Multi-Agent routes (2 columns) */}
        <div className="lg:col-span-2 min-h-[500px] h-[650px] flex flex-col space-y-4">
          <div className="flex-1">
            <MapView
              nodes={nodes}
              edges={edges}
              shelters={shelters}
              multiAgentRoutes={routes}
            />
          </div>

          {/* Interactive Agent Config Table */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Configure Active Emergency Agents</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {agentList.map((ag, idx) => (
                <div key={ag.agent_id} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                  <div className="col-span-2 font-mono font-bold text-amber-400">{ag.agent_id}</div>

                  <div className="col-span-3">
                    <select
                      value={ag.role}
                      onChange={(e) => handleUpdateAgent(idx, "role", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="AMBULANCE">🚑 AMBULANCE</option>
                      <option value="FIRE_TRUCK">🚒 FIRE TRUCK</option>
                      <option value="CIVILIAN">🚗 CIVILIAN</option>
                      <option value="RESCUE_TEAM">🚤 RESCUE TEAM</option>
                      <option value="POLICE">🚓 POLICE</option>
                    </select>
                  </div>

                  <div className="col-span-3">
                    <select
                      value={ag.start_node}
                      onChange={(e) => handleUpdateAgent(idx, "start_node", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      {nodes.filter((n) => n.type === "ZONE").map((n) => (
                        <option key={n.id} value={n.id}>📍 {n.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <select
                      value={ag.target_node}
                      onChange={(e) => handleUpdateAgent(idx, "target_node", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      {shelters.map((s) => (
                        <option key={s.id} value={s.id}>🏥 {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveAgent(idx)}
                      disabled={agentList.length <= 1}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Agent Cards */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            DISPATCH TELEMETRY & CORRIDORS
          </h3>

          <div className="space-y-3">
            {routes.map((agent) => (
              <div
                key={agent.agent_id}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 shadow-xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }}></span>
                    <span className="font-bold text-xs text-slate-100">{agent.agent_name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                    {agent.priority_description}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1 text-slate-400">
                  <div>From: <span className="text-slate-200">{agent.start_node.replace("ZONE_", "")}</span></div>
                  <div>Dest: <span className="text-slate-200">{agent.target_node.replace("SHELTER_", "")}</span></div>
                  <div>ETA: <span className="text-amber-400 font-bold">{agent.eta_min} min</span></div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Path: <span className="text-slate-300">{agent.path.join(" ➔ ")}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Path Distance: {agent.cost.toFixed(1)} km</span>
                  <span className={agent.overall_risk < 40 ? "text-emerald-400" : "text-amber-400"}>
                    Risk Exposure: {agent.overall_risk.toFixed(1)}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
