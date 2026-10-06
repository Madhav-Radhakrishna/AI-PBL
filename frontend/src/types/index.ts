export type Role = "CITIZEN" | "ADMIN" | "EMERGENCY_RESPONDER";

export interface MapNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "ZONE" | "SHELTER";
}

export interface GraphEdge {
  id: string;
  name: string;
  u: string;
  v: string;
  distance_km: number;
  travel_time_min: number;
  hazard_risk: number;
  risk_category: string;
  traffic_density: number;
  future_risk: number;
  is_blocked: boolean;
}

export interface ShelterInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  available_capacity: number;
  occupancy_pct: number;
  facilities: string[];
  risk_level: string;
  status: string;
}

export interface RouteResult {
  algorithm: string;
  found: boolean;
  path: string[];
  path_edges: GraphEdge[];
  nodes_explored: number;
  cost: number;
  overall_risk: number;
  execution_time_ms: number;
  node_details?: Record<string, { node_id: string; g: number; h: number; f: number }>;
  steps?: Array<any>;
}

export interface FindRouteResponse {
  route: RouteResult;
  safety_score: number;
  eta_minutes: number;
  explanations: string[];
}

export interface MLPredictionResult {
  risk_score: number;
  risk_category: string;
  confidence: number;
  decision_path: string[];
  feature_importances: Record<string, number>;
}

export interface BayesianPredictionResult {
  prob_flooding: number;
  prob_road_unsafe: number;
  prob_road_safe: number;
  confidence: string;
  evidence_discrete: Record<string, string>;
  evidence_contributions: Array<{
    variable: string;
    val: string;
    contribution_pct: number;
    impact: string;
  }>;
}

export interface SimulationState {
  disaster: {
    type: string;
    name: string;
    severity: number;
    affected_radius: number;
    status: string;
  };
  weather: {
    rainfall_mm_hr: number;
    wind_speed_kmh: number;
    water_level_avg_cm: number;
  };
  stats: {
    affected_population: number;
    open_shelters: number;
    blocked_roads_count: number;
    total_roads_count: number;
    avg_traffic_pct: number;
  };
}

export interface MultiAgentRoute {
  agent_id: string;
  role: string;
  agent_name: string;
  priority_description: string;
  color: string;
  start_node: string;
  target_node: string;
  found: boolean;
  path: string[];
  path_edges: GraphEdge[];
  cost: number;
  eta_min: number;
  overall_risk: number;
}

export interface StripsOperator {
  name: string;
  description: string;
  preconditions: string[];
  effects: string[];
}

export interface StripsRepresentation {
  initial_state: string[];
  goal_state: string[];
  operators: StripsOperator[];
}

export interface PlanStep {
  step_id: number;
  action: string;
  detail: string;
}

export interface ZoneRoute {
  zone_id: string;
  zone_name: string;
  population: number;
  target_shelter_id: string;
  target_shelter_name: string;
  route_path: string[];
  distance_km: number;
  eta_minutes: number;
  overall_risk_score: number;
  nodes_explored: number;
}

export interface EvacuationPlanResponse {
  disaster: { type: string; name: string; severity: number };
  weather: { rainfall_mm_hr: number; wind_speed_kmh: number };
  plan_steps: PlanStep[];
  total_affected_population: number;
  overall_plan_safety_score: number;
  csp_shelter_assignment: any;
  zone_routes: ZoneRoute[];
  strategy?: string;
  weights_used?: any;
  strips_representation: StripsRepresentation;
}

export interface HornRuleInfo {
  rule_id: string;
  premises: string[];
  conclusion: string;
  description: string;
  category: string;
  fol_representation: string;
}

export interface OntologyPredicate {
  predicate: string;
  arity: number;
  meaning: string;
}

export interface KnowledgeBaseData {
  unit: string;
  description: string;
  ontology_predicates: OntologyPredicate[];
  rules: HornRuleInfo[];
  ground_facts: string[];
  sample_queries: string[];
}

export interface ForwardChainResult {
  initial_facts: string[];
  derived_facts: string[];
  all_facts: string[];
  derivation_trace: Array<{
    step: number;
    iteration: number;
    rule_id: string;
    description: string;
    premises: string[];
    derived_fact: string;
    fol_formula: string;
  }>;
  rules_applied_count: number;
  iterations_required: number;
}

export interface BackwardChainProofNode {
  goal: string;
  depth: number;
  proven: boolean;
  reason: string;
  subproofs?: BackwardChainProofNode[];
  applied_rule?: HornRuleInfo;
}

export interface BackwardChainResult {
  query_goal: string;
  is_proven: boolean;
  proof_tree: BackwardChainProofNode;
}
