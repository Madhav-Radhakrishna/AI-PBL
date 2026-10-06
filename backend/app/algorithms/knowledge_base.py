"""
Unit III: Knowledge Representation and Reasoning (Logic & Expert Systems)
Implements:
- First-Order Logic (FOL) representation with Horn clauses
- Unification & Generalized Modus Ponens
- Forward Chaining Inference Engine (Data-driven deduction)
- Backward Chaining Inference Engine (Goal-driven theorem prover)
- Disaster Ontology and Semantic Disaster Rule Base
"""

import re
from typing import Dict, List, Set, Tuple, Optional, Any, Iterator

def parse_predicate(p_str: str) -> Tuple[str, List[str]]:
    p_str = p_str.strip()
    m = re.match(r"^([A-Za-z0-9_]+)\((.*)\)$", p_str)
    if not m:
        return p_str, []
    name = m.group(1)
    args_str = m.group(2).strip()
    if not args_str:
        return name, []
    args = [a.strip() for a in args_str.split(",") if a.strip()]
    return name, args

def is_variable(term: str) -> bool:
    return len(term) == 1 and term.isupper()

def instantiate(p_str: str, binding: Dict[str, str]) -> str:
    name, args = parse_predicate(p_str)
    if not args:
        return f"{name}()"
    new_args = [binding.get(a, a) for a in args]
    return f"{name}({', '.join(new_args)})"

class HornRule:
    def __init__(self, rule_id: str, premises: List[str], conclusion: str, description: str, category: str = "HAZARD"):
        self.rule_id = rule_id
        self.premises = [p.strip() for p in premises]
        self.conclusion = conclusion.strip()
        self.description = description
        self.category = category

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "premises": self.premises,
            "conclusion": self.conclusion,
            "description": self.description,
            "category": self.category,
            "fol_representation": f"{' ∧ '.join(self.premises)} ⇒ {self.conclusion}"
        }

class DisasterKnowledgeBase:
    """
    Knowledge Base (KB) and Inference Engine for Disaster Response.
    Unit III: Knowledge Representation & Logic Reasoning.
    """
    def __init__(self):
        self.rules: List[HornRule] = []
        self._init_disaster_rules()

    def _init_disaster_rules(self):
        self.rules = [
            HornRule(
                rule_id="RULE_01",
                premises=["WaterLevelCritical(X)", "Road(X)"],
                conclusion="ImpassableForCivilian(X)",
                description="If road flood water level exceeds safety threshold (>60cm), it is impassable for civilian vehicles.",
                category="HAZARD_CLASSIFICATION"
            ),
            HornRule(
                rule_id="RULE_02",
                premises=["ImpassableForCivilian(X)", "CorridorIncludes(C, X)"],
                conclusion="CorridorCompromised(C)",
                description="If an active evacuation corridor relies on an impassable road, the corridor is compromised.",
                category="EVACUATION_SAFETY"
            ),
            HornRule(
                rule_id="RULE_03",
                premises=["CorridorCompromised(C)"],
                conclusion="TriggerDynamicReroute(C)",
                description="A compromised corridor immediately triggers automated dynamic replanning.",
                category="DYNAMIC_REPLANNING"
            ),
            HornRule(
                rule_id="RULE_04",
                premises=["RainfallExtreme()", "LowElevationZone(Z)"],
                conclusion="HighRiskFlashFlood(Z)",
                description="Extreme rainfall over 70mm/hr in low elevation terrain causes high-risk flash flooding.",
                category="HYDROLOGY"
            ),
            HornRule(
                rule_id="RULE_05",
                premises=["HighRiskFlashFlood(Z)", "HighPopulationDensity(Z)"],
                conclusion="MandatoryEvacuationOrder(Z)",
                description="Zones facing high-risk flash floods with high population density require mandatory evacuation.",
                category="CIVIL_PROTECTION"
            ),
            HornRule(
                rule_id="RULE_06",
                premises=["HospitalInZone(H, Z)", "HighRiskFlashFlood(Z)", "PowerGridOffline(Z)"],
                conclusion="PriorityEmergencyDispatch(H)",
                description="Hospitals in flooded zones facing power grid failures receive critical priority emergency dispatch.",
                category="EMERGENCY_DISPATCH"
            ),
            HornRule(
                rule_id="RULE_07",
                premises=["HeavyRescueVehicle(A)", "WaterDepthModerate(X)"],
                conclusion="PassableForRescue(A, X)",
                description="Heavy all-terrain rescue vehicles can traverse moderate flood depths impassable to civilians.",
                category="MULTI_AGENT_MOBILITY"
            ),
            HornRule(
                rule_id="RULE_08",
                premises=["ShelterCapacityExceeded(S)"],
                conclusion="DivertEvacueesFromShelter(S)",
                description="When shelter reaches full capacity, incoming evacuees must be diverted to secondary shelters.",
                category="SHELTER_MANAGEMENT"
            ),
            HornRule(
                rule_id="RULE_09",
                premises=["DivertEvacueesFromShelter(S)", "AssignedZone(Z, S)"],
                conclusion="TriggerCSPReallocation(Z)",
                description="Diverted shelters force constraint relaxation and CSP re-solving for affected zones.",
                category="CSP_INTEGRATION"
            ),
            HornRule(
                rule_id="RULE_10",
                premises=["StructuralBridgeDamage(B)"],
                conclusion="QuarantineCorridor(B)",
                description="Suspected structural flood damage requires complete quarantine and traffic diversion.",
                category="INFRASTRUCTURE"
            )
        ]

    def get_rules(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.rules]

    def _find_bindings(self, premises: List[str], facts: Set[str], current_binding: Dict[str, str]) -> Iterator[Dict[str, str]]:
        if not premises:
            yield current_binding
            return

        prem = premises[0]
        p_name, p_args = parse_predicate(prem)

        for fact in facts:
            f_name, f_args = parse_predicate(fact)
            if p_name != f_name or len(p_args) != len(f_args):
                continue

            match = True
            new_binding = current_binding.copy()
            for p_arg, f_arg in zip(p_args, f_args):
                if is_variable(p_arg):
                    if p_arg in new_binding:
                        if new_binding[p_arg] != f_arg:
                            match = False
                            break
                    else:
                        new_binding[p_arg] = f_arg
                else:
                    if p_arg != f_arg:
                        match = False
                        break

            if match:
                yield from self._find_bindings(premises[1:], facts, new_binding)

    def forward_chain(self, initial_facts: Set[str]) -> Dict[str, Any]:
        """
        Forward Chaining Inference Engine using Generalized Modus Ponens.
        Finds substitutions for rules and derives new ground facts.
        """
        known_facts = set(initial_facts)
        derivation_trace = []
        iteration = 0
        applied_instances: Set[Tuple[str, str]] = set()

        while True:
            iteration += 1
            added_in_pass = False

            facts_snapshot = list(known_facts)
            for rule in self.rules:
                for binding in self._find_bindings(rule.premises, facts_snapshot, {}):
                    derived_fact = instantiate(rule.conclusion, binding)
                    instance_key = (rule.rule_id, derived_fact)

                    if instance_key not in applied_instances:
                        applied_instances.add(instance_key)
                        if derived_fact not in known_facts:
                            known_facts.add(derived_fact)
                            added_in_pass = True

                            matched_premises = [instantiate(p, binding) for p in rule.premises]
                            derivation_trace.append({
                                "step": len(derivation_trace) + 1,
                                "iteration": iteration,
                                "rule_id": rule.rule_id,
                                "description": rule.description,
                                "premises": matched_premises,
                                "derived_fact": derived_fact,
                                "fol_formula": f"{' ∧ '.join(matched_premises)} ⇒ {derived_fact}"
                            })

            if not added_in_pass:
                break

        return {
            "initial_facts": sorted(list(initial_facts)),
            "derived_facts": sorted(list(known_facts - initial_facts)),
            "all_facts": sorted(list(known_facts)),
            "derivation_trace": derivation_trace,
            "rules_applied_count": len(applied_instances),
            "iterations_required": iteration
        }

    def backward_chain(self, goal: str, initial_facts: Set[str]) -> Dict[str, Any]:
        """
        Backward Chaining Inference Engine (Goal-Driven Theorem Prover with Unification).
        """
        visited = set()

        def prove(current_goal: str, depth: int = 0) -> Tuple[bool, Dict[str, Any]]:
            node: Dict[str, Any] = {
                "goal": current_goal,
                "depth": depth,
                "proven": False,
                "reason": "",
                "subproofs": []
            }

            # 1. Base case: already in initial facts
            if current_goal in initial_facts:
                node["proven"] = True
                node["reason"] = "Ground fact directly present in Knowledge Base"
                return True, node

            if current_goal in visited:
                node["proven"] = False
                node["reason"] = "Cycle detected in backward search path"
                return False, node

            visited.add(current_goal)

            g_name, g_args = parse_predicate(current_goal)

            # 2. Search for rules whose conclusion can unify with current_goal
            for rule in self.rules:
                c_name, c_args = parse_predicate(rule.conclusion)
                if c_name != g_name or len(c_args) != len(g_args):
                    continue

                # Unify conclusion with goal
                binding = {}
                can_unify = True
                for c_arg, g_arg in zip(c_args, g_args):
                    if is_variable(c_arg):
                        binding[c_arg] = g_arg
                    else:
                        if c_arg != g_arg:
                            can_unify = False
                            break

                if not can_unify:
                    continue

                # Check premises with this binding
                all_premises_proven = True
                subnodes = []

                # If premises contain remaining free variables, we look for matching ground facts
                # For standard backward chaining with Horn clauses:
                inst_premises = [instantiate(p, binding) for p in rule.premises]

                for p in inst_premises:
                    prem_proven, subnode = prove(p, depth + 1)
                    subnodes.append(subnode)
                    if not prem_proven:
                        all_premises_proven = False
                        break

                if all_premises_proven:
                    node["proven"] = True
                    node["reason"] = f"Proven by rule {rule.rule_id}: {rule.description}"
                    node["subproofs"] = subnodes
                    node["applied_rule"] = rule.to_dict()
                    visited.remove(current_goal)
                    return True, node

            node["proven"] = False
            node["reason"] = "No rule satisfied all required premises."
            visited.remove(current_goal)
            return False, node

        proven, tree = prove(goal)

        return {
            "query_goal": goal,
            "is_proven": proven,
            "proof_tree": tree
        }

# Global instance
disaster_kb = DisasterKnowledgeBase()
