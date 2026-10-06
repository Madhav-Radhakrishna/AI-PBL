import axios from "axios";
import {
  FindRouteResponse,
  MLPredictionResult,
  BayesianPredictionResult,
  ShelterInfo,
  SimulationState,
  MultiAgentRoute
} from "../types";

const API_BASE = "http://localhost:8000/api/v1";

export const api = {
  getGraph: async () => {
    const res = await axios.get(`${API_BASE}/routing/graph`);
    return res.data;
  },

  findRoute: async (startNodeId: string, targetShelterId: string, algorithm: string = "A*", weights?: any) => {
    const res = await axios.post<FindRouteResponse>(`${API_BASE}/routing/find-route`, {
      start_node_id: startNodeId,
      target_shelter_id: targetShelterId,
      algorithm,
      weights
    });
    return res.data;
  },

  compareAlgorithms: async (startNodeId: string, targetShelterId: string, weights?: any) => {
    const res = await axios.post(`${API_BASE}/routing/compare-algorithms`, {
      start_node_id: startNodeId,
      target_shelter_id: targetShelterId,
      weights
    });
    return res.data;
  },

  predictRisk: async (input: any) => {
    const res = await axios.post<MLPredictionResult>(`${API_BASE}/ai-engine/predict-risk`, input);
    return res.data;
  },

  getDecisionTreeStructure: async () => {
    const res = await axios.get(`${API_BASE}/ai-engine/decision-tree-structure`);
    return res.data;
  },

  predictBayesian: async (input: any) => {
    const res = await axios.post<BayesianPredictionResult>(`${API_BASE}/ai-engine/bayesian-uncertainty`, input);
    return res.data;
  },

  getBayesianDAG: async () => {
    const res = await axios.get(`${API_BASE}/ai-engine/bayesian-network-dag`);
    return res.data;
  },

  getShelters: async () => {
    const res = await axios.get<ShelterInfo[]>(`${API_BASE}/shelters/`);
    return res.data;
  },

  solveCSP: async () => {
    const res = await axios.get(`${API_BASE}/shelters/solve-csp`);
    return res.data;
  },

  optimizeLocalSearch: async (algorithm: string = "Hill Climbing", maxIterations: number = 200) => {
    const res = await axios.post(`${API_BASE}/shelters/optimize-local-search`, {
      algorithm,
      max_iterations: maxIterations
    });
    return res.data;
  },

  getSimulationState: async () => {
    const res = await axios.get<SimulationState>(`${API_BASE}/simulation/current-state`);
    return res.data;
  },

  updateSimulation: async (updates: any) => {
    const res = await axios.post(`${API_BASE}/simulation/update`, updates);
    return res.data;
  },

  planMultiAgentRoutes: async (agents: Array<{ agent_id: string; role: string; start_node: string; target_node: string }>) => {
    const res = await axios.post<{ multi_agent_routes: MultiAgentRoute[] }>(`${API_BASE}/routing/multi-agent-routes`, { agents });
    return res.data;
  },

  getAdminSummary: async () => {
    const res = await axios.get(`${API_BASE}/admin/summary`);
    return res.data;
  },

  getEvacuationPlan: async () => {
    const res = await axios.get<any>(`${API_BASE}/planning/plan`);
    return res.data;
  },

  generateCustomPlan: async (payload: { strategy: string; disaster_severity?: number; rainfall_mm_hr?: number; weights?: any }) => {
    const res = await axios.post<any>(`${API_BASE}/planning/generate`, payload);
    return res.data;
  },

  getStripsRepresentation: async () => {
    const res = await axios.get<any>(`${API_BASE}/planning/strips`);
    return res.data;
  },

  getKnowledgeBaseDetails: async () => {
    const res = await axios.get<any>(`${API_BASE}/knowledge/facts-and-rules`);
    return res.data;
  },

  runForwardChaining: async (payload: { custom_facts?: string[]; use_telemetry_facts?: boolean }) => {
    const res = await axios.post<any>(`${API_BASE}/knowledge/forward-chain`, payload);
    return res.data;
  },

  runBackwardChaining: async (payload: { goal: string; custom_facts?: string[]; use_telemetry_facts?: boolean }) => {
    const res = await axios.post<any>(`${API_BASE}/knowledge/query-backward-chain`, payload);
    return res.data;
  }
};

