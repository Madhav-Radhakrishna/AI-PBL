import React from "react";
import { Activity, Search, CheckSquare, FileText, Binary, GitFork, ShieldCheck, Brain } from "lucide-react";

export const AIPblMappingPage: React.FC = () => {
  const syllabusMapping = [
    {
      unit: "Unit I — Uninformed & Informed Search",
      icon: Search,
      concepts: [
        { name: "Breadth-First Search (BFS)", usage: "Explores road graph layer by layer without cost heuristics.", example: "Demonstrated in AI Search Lab comparing nodes expanded vs A*." },
        { name: "Uniform Cost Search (UCS)", usage: "Dijkstra ordering by accumulated g(n) cost.", example: "Evaluates lowest travel cost path." },
        { name: "Greedy Best First Search", usage: "Orders frontier purely by remaining heuristic h(n).", example: "Fast search but sub-optimal path risk." },
        { name: "A* Search", usage: "Combines accumulated cost g(n) + estimated cost to target h(n).", example: "Used for citizen evacuation routing. g(n) combines distance, time, hazard risk, traffic, future risk." },
        { name: "Heuristic Functions", usage: "h(n) calculates Euclidean distance to shelter + risk penalty factor.", example: "Displayed in Algorithm Details panel." },
        { name: "Local Search (Hill Climbing, Simulated Annealing & Genetic Algorithm)", usage: "Optimizes zone-shelter allocation configuration to minimize system penalty function.", example: "Evaluated in Local Search Lab showing convergence curves." }
      ]
    },
    {
      unit: "Unit II — Constraint Satisfaction Problems (CSP)",
      icon: CheckSquare,
      concepts: [
        { name: "Variables & Domains", usage: "Variables = Evacuation Population Zones. Domains = Candidate Shelters.", example: "Zone Ameerpet -> Shelter Begumpet / Shelter Nizam / Shelter Gachibowli." },
        { name: "Constraints Representation", usage: "Capacity Constraint, Safety Constraint, Distance Constraint, Accessibility Constraint.", example: "Shelter capacity must not be exceeded." },
        { name: "Backtracking Search & MRV", usage: "Backtracking solver with Minimum Remaining Values heuristic and Constraint Propagation.", example: "Executed in CSP Lab." }
      ]
    },
    {
      unit: "Unit III — Knowledge Representation & Reasoning (Logic & Expert Systems)",
      icon: Brain,
      concepts: [
        { name: "First-Order Logic (FOL) & Disaster Ontology", usage: "Defines formal vocabulary of domain predicates: Road(X), WaterLevelCritical(X), ImpassableForCivilian(X), MandatoryEvacuationOrder(Z).", example: "Visualized in Ontology Vocabulary table." },
        { name: "Horn Clauses & Rule-Based Expert Systems", usage: "Represents crisis directives as Horn clauses: P₁(X) ∧ P₂(X) ⇒ Q(X) for flood hazard classification and hospital emergency dispatches.", example: "Inspected in Horn Clause Rule Base." },
        { name: "Forward Chaining (Data-Driven Deduction)", usage: "Applies Generalized Modus Ponens iteratively to derive all deductive consequences from telemetry ground facts.", example: "Executed in Knowledge Base Lab with step-by-step derivation trace." },
        { name: "Backward Chaining (Goal-Driven Theorem Prover)", usage: "Recursively proves goal propositions (e.g. 'MandatoryEvacuationOrder(ZONE_BEGUMPET)') by resolving subgoals depth-first.", example: "Visualized as interactive proof tree in Knowledge Base Lab." }
      ]
    },
    {
      unit: "Unit IV — Planning & Multi-Agent Systems",
      icon: FileText,
      concepts: [
        { name: "Classical Evacuation Planning", usage: "Generates multi-phase evacuation strategy from Initial State to Goal State.", example: "Visible in Planning Lab." },
        { name: "Dynamic Environment Replanning", usage: "Monitors disaster environment changes (blocked roads, rainfall surge, full shelter) and automatically recalculates routes and assignments.", example: "Triggered in Simulation Lab emitting live notifications." },
        { name: "Multi-Agent Planning", usage: "Pathfinding for multiple emergency agents (Civilian, Ambulance, Fire Truck, Rescue Team, Police) with different objective weights.", example: "Visualized on map in Multi-Agent Lab." }
      ]
    },
    {
      unit: "Unit V — Uncertainty & Machine Learning",
      icon: Binary,
      concepts: [
        { name: "Bayes' Rule & Bayesian Networks", usage: "Calculates exact conditional probability P(Road Unsafe | Rainfall, WaterLevel, Elevation, Severity).", example: "Demonstrated in Bayesian Net Lab." },
        { name: "Supervised Learning (Decision Trees & Random Forest)", usage: "Predicts road risk score 0-100, category (SAFE, MODERATE, HIGH RISK, CRITICAL), and confidence %.", example: "Trained scikit-learn model visualized in Decision Tree Lab." }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Syllabus Concepts Mapping Page</h2>
          <p className="text-xs text-slate-400">
            Comprehensive mapping showing how each Artificial Intelligence syllabus topic is implemented in this Problem-Based Learning (PBL) system.
          </p>
        </div>
      </div>

      {/* Syllabus Grid */}
      <div className="space-y-6">
        {syllabusMapping.map((unitGroup) => {
          const Icon = unitGroup.icon;
          return (
            <div key={unitGroup.unit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-emerald-400 font-bold text-sm">
                <Icon className="w-5 h-5" />
                <h3>{unitGroup.unit}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unitGroup.concepts.map((c) => (
                  <div key={c.name} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-100 text-sm">{c.name}</h4>
                    <p className="text-slate-300 leading-relaxed font-sans">{c.usage}</p>
                    <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] text-emerald-300 font-mono">
                      💡 <strong>Example:</strong> {c.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
