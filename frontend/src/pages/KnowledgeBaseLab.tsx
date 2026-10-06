import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { KnowledgeBaseData, ForwardChainResult, BackwardChainResult } from "../types";
import {
  Brain,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  BookOpen,
  Sparkles,
  GitBranch
} from "lucide-react";

export const KnowledgeBaseLab: React.FC = () => {
  const [kbData, setKbData] = useState<KnowledgeBaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customFactInput, setCustomFactInput] = useState<string>("");
  const [useTelemetry, setUseTelemetry] = useState<boolean>(true);

  // Forward Chaining State
  const [forwardResult, setForwardResult] = useState<ForwardChainResult | null>(null);
  const [forwardLoading, setForwardLoading] = useState<boolean>(false);

  // Backward Chaining State
  const [selectedGoal, setSelectedGoal] = useState<string>("MandatoryEvacuationOrder(ZONE_BEGUMPET)");
  const [backwardResult, setBackwardResult] = useState<BackwardChainResult | null>(null);
  const [backwardLoading, setBackwardLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"forward" | "backward" | "rules" | "ontology">("forward");

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeBaseDetails();
      setKbData(data);
      if (data.sample_queries && data.sample_queries.length > 0) {
        setSelectedGoal(data.sample_queries[0]);
      }
      // Auto run forward chaining once
      runForward();
    } catch (err) {
      console.error("Failed to load knowledge base details", err);
    } finally {
      setLoading(false);
    }
  };

  const runForward = async () => {
    setForwardLoading(true);
    try {
      const customFactsList = customFactInput
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const res = await api.runForwardChaining({
        custom_facts: customFactsList,
        use_telemetry_facts: useTelemetry
      });
      setForwardResult(res);
    } catch (err) {
      console.error("Failed forward chaining", err);
    } finally {
      setForwardLoading(false);
    }
  };

  const runBackward = async (goalToProve?: string) => {
    const goal = goalToProve || selectedGoal;
    setBackwardLoading(true);
    try {
      const customFactsList = customFactInput
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const res = await api.runBackwardChaining({
        goal,
        custom_facts: customFactsList,
        use_telemetry_facts: useTelemetry
      });
      setBackwardResult(res);
    } catch (err) {
      console.error("Failed backward chaining", err);
    } finally {
      setBackwardLoading(false);
    }
  };

  const renderProofNode = (node: any, depth: number = 0) => {
    if (!node) return null;
    return (
      <div key={`${node.goal}-${depth}`} className="ml-4 my-2 border-l-2 border-slate-700 pl-3 text-xs space-y-1">
        <div className="flex items-center space-x-2">
          {node.proven ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="font-mono font-bold text-slate-100">{node.goal}</span>
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
              node.proven
                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                : "bg-red-950 text-red-300 border-red-800"
            }`}
          >
            {node.proven ? "PROVEN" : "FAILED"}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 font-sans">{node.reason}</p>

        {node.subproofs && node.subproofs.length > 0 && (
          <div className="mt-2 space-y-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Subgoals:</span>
            {node.subproofs.map((sub: any, i: number) => renderProofNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Title Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-slate-100">
                Knowledge Representation & Logic Reasoning Lab (Unit III)
              </h2>
              <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                FOL & HORN CLAUSE INFERENCE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Disaster domain ontology, First-Order Logic rules, and Forward/Backward Chaining Inference Engines (Generalized Modus Ponens & Theorem Proving).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            loadKnowledgeBase();
            runForward();
          }}
          disabled={loading || forwardLoading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 border border-purple-500 shadow-lg shadow-purple-900/30 transition-all"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Re-Evaluate Knowledge Base</span>
        </button>
      </div>

      {/* Ground Facts & Ingestion Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Ground Facts in Working Memory (Asserted & Live Telemetry)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useTelemetry}
                onChange={(e) => setUseTelemetry(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>Include Live Telemetry Facts</span>
            </label>
          </div>

          <div className="max-h-24 overflow-y-auto bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-wrap gap-1.5 text-xs font-mono">
            {kbData?.ground_facts?.map((fact, i) => (
              <span
                key={i}
                className="bg-slate-900 border border-slate-700/80 text-blue-300 px-2 py-0.5 rounded text-[11px]"
              >
                {fact}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Add Custom Facts (1 per line)</label>
          <textarea
            value={customFactInput}
            onChange={(e) => setCustomFactInput(e.target.value)}
            placeholder="e.g. StructuralBridgeDamage(B_Begumpet)"
            className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-purple-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("forward")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "forward"
              ? "bg-purple-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Forward Chaining (Deduction)</span>
        </button>

        <button
          onClick={() => setActiveTab("backward")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "backward"
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Backward Chaining (Goal Prover)</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "rules"
              ? "bg-amber-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Horn Clause Rules ({kbData?.rules?.length || 10})</span>
        </button>

        <button
          onClick={() => setActiveTab("ontology")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "ontology"
              ? "bg-emerald-600 text-white shadow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ontology Vocabulary</span>
        </button>
      </div>

      {/* Tab 1: Forward Chaining */}
      {activeTab === "forward" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          {forwardResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">INITIAL GROUND FACTS</div>
                <div className="text-xl font-black text-blue-400 mt-1">{forwardResult.initial_facts.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">DERIVED FACTS DEDUCED</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{forwardResult.derived_facts.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">RULES APPLIED</div>
                <div className="text-xl font-black text-purple-400 mt-1">{forwardResult.rules_applied_count}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">ITERATION PASSES</div>
                <div className="text-xl font-black text-amber-400 mt-1">{forwardResult.iterations_required}</div>
              </div>
            </div>
          )}

          {/* Newly Derived Facts Showcase */}
          {forwardResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4" />
                <span>NEWLY DERIVED FACTS BY FORWARD CHAINING</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {forwardResult.derived_facts.map((df, i) => (
                  <span
                    key={i}
                    className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg font-bold shadow"
                  >
                    ✔ {df}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Derivation Step-by-Step Execution Trace */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200">
                GENERALIZED MODUS PONENS DERIVATION TRACE (FORWARD CHAINING)
              </h3>
              <button
                onClick={runForward}
                disabled={forwardLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all"
              >
                {forwardLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute Forward Chaining</span>
              </button>
            </div>

            <div className="space-y-3">
              {forwardResult?.derivation_trace?.map((tr) => (
                <div
                  key={tr.step}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                      STEP {tr.step} • Pass {tr.iteration} • Rule {tr.rule_id}
                    </span>
                    <span className="text-[11px] text-slate-400">{tr.description}</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded font-mono text-xs text-amber-300 border border-slate-850">
                    {tr.fol_formula}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span className="text-slate-500">Satisfied Premises:</span>
                    <span className="text-slate-300 font-mono">{tr.premises.join(" , ")}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-bold font-mono">Deduction: {tr.derived_fact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Backward Chaining Theorem Prover */}
      {activeTab === "backward" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
              GOAL-DIRECTED REASONING & THEOREM PROVER (BACKWARD CHAINING)
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[300px]">
                <label className="text-[11px] uppercase font-bold text-slate-400 mb-1 block">
                  Target Query Goal to Prove
                </label>
                <input
                  type="text"
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. MandatoryEvacuationOrder(ZONE_BEGUMPET)"
                />
              </div>

              <div className="self-end">
                <button
                  onClick={() => runBackward()}
                  disabled={backwardLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 border border-blue-500 shadow-lg shadow-blue-900/30 transition-all"
                >
                  {backwardLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                  <span>Prove Goal Proposition</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-2 pt-2 text-xs">
              <span className="text-slate-400 text-[11px]">Preset Queries:</span>
              {kbData?.sample_queries?.map((sq) => (
                <button
                  key={sq}
                  onClick={() => {
                    setSelectedGoal(sq);
                    runBackward(sq);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono text-[11px] px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Proof Tree Visualization */}
          {backwardResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-200">PROOF TREE FOR QUERY:</h3>
                  <span className="font-mono text-xs text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    {backwardResult.query_goal}
                  </span>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded font-bold border ${
                    backwardResult.is_proven
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : "bg-red-950 text-red-400 border-red-800"
                  }`}
                >
                  {backwardResult.is_proven ? "THEOREM PROVEN (ENTAILMENT HOLDS)" : "REFUTATION / UNPROVABLE"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                {renderProofNode(backwardResult.proof_tree)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Horn Clause Rules */}
      {activeTab === "rules" && kbData?.rules && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kbData.rules.map((rule) => (
            <div
              key={rule.rule_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  {rule.rule_id}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {rule.category}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
                {rule.fol_representation}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{rule.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Ontology Vocabulary */}
      {activeTab === "ontology" && kbData?.ontology_predicates && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            DISASTER DOMAIN FIRST-ORDER ONTOLOGY PREDICATES
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Predicate Schema</th>
                  <th className="py-2.5 px-3">Arity</th>
                  <th className="py-2.5 px-3 font-sans">Formal Domain Semantics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {kbData.ontology_predicates.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-purple-400 font-bold">{p.predicate}</td>
                    <td className="py-3 px-3 text-amber-400">{p.arity}</td>
                    <td className="py-3 px-3 font-sans text-slate-300">{p.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
