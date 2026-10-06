import math
import random
from typing import Dict, List, Tuple

class LocalSearchOptimizer:
    """
    Hill Climbing and Simulated Annealing for Evacuation Plan & Shelter Assignment Optimization.
    Minimizes total system cost:
    Cost = sum over zones( distance_cost + congestion_cost + shelter_overflow_penalty + risk_penalty )
    """
    def __init__(self, zones: List[dict], shelters: List[dict], distance_matrix: Dict[Tuple[str, str], float]):
        self.zones = zones # List of {"id": str, "population": int, ...}
        self.shelters = shelters # List of {"id": str, "capacity": int, ...}
        self.distance_matrix = distance_matrix # (zone_id, shelter_id) -> dist_km

    def evaluate_assignment(self, assignment: Dict[str, str]) -> float:
        """
        assignment: dict mapping zone_id -> shelter_id
        Returns scalar total evaluation cost (lower is better).
        """
        total_cost = 0.0
        shelter_loads = {s["id"]: 0 for s in self.shelters}

        for z in self.zones:
            zid = z["id"]
            pop = z["population"]
            assigned_sid = assignment.get(zid)
            if not assigned_sid:
                total_cost += 10000.0
                continue

            dist = self.distance_matrix.get((zid, assigned_sid), 15.0)
            total_cost += (dist * 2.0) * (pop / 1000.0)
            shelter_loads[assigned_sid] += pop

        # Shelter capacity overflow penalties & congestion costs
        for s in self.shelters:
            sid = s["id"]
            cap = s["capacity"]
            load = shelter_loads[sid]
            if load > cap:
                overflow = load - cap
                total_cost += (overflow ** 1.5) * 5.0 # quadratic penalty for exceeding shelter capacity
            else:
                utilization = load / max(cap, 1)
                total_cost += (utilization ** 2) * 50.0 # moderate penalty for heavy congestion

        return round(total_cost, 2)

    def hill_climbing(self, max_iterations: int = 200) -> dict:
        # Initial random or greedy assignment
        shelter_ids = [s["id"] for s in self.shelters]
        current_assignment = {z["id"]: random.choice(shelter_ids) for z in self.zones}
        initial_cost = self.evaluate_assignment(current_assignment)
        current_cost = initial_cost

        history = [{"step": 0, "cost": initial_cost}]

        for iteration in range(1, max_iterations + 1):
            # Generate neighbors by swapping shelter for a random zone
            z_to_swap = random.choice(self.zones)["id"]
            new_s = random.choice([s for s in shelter_ids if s != current_assignment[z_to_swap]])

            neighbor_assignment = current_assignment.copy()
            neighbor_assignment[z_to_swap] = new_s
            neighbor_cost = self.evaluate_assignment(neighbor_assignment)

            if neighbor_cost < current_cost:
                current_assignment = neighbor_assignment
                current_cost = neighbor_cost
                history.append({"step": iteration, "cost": current_cost, "improved": True})

        improvement_pct = round(((initial_cost - current_cost) / max(initial_cost, 1)) * 100.0, 1)

        return {
            "algorithm": "Hill Climbing",
            "initial_cost": initial_cost,
            "optimized_cost": current_cost,
            "improvement_pct": max(improvement_pct, 0.0),
            "final_assignment": current_assignment,
            "history": history[:30]
        }

    def simulated_annealing(self, initial_temp: float = 100.0, cooling_rate: float = 0.95, max_iterations: int = 300) -> dict:
        shelter_ids = [s["id"] for s in self.shelters]
        current_assignment = {z["id"]: random.choice(shelter_ids) for z in self.zones}
        best_assignment = current_assignment.copy()

        initial_cost = self.evaluate_assignment(current_assignment)
        current_cost = initial_cost
        best_cost = initial_cost

        temp = initial_temp
        history = [{"step": 0, "cost": initial_cost, "temp": temp}]

        for step in range(1, max_iterations + 1):
            if temp <= 0.1:
                break

            z_to_swap = random.choice(self.zones)["id"]
            new_s = random.choice([s for s in shelter_ids if s != current_assignment[z_to_swap]])

            neighbor_assignment = current_assignment.copy()
            neighbor_assignment[z_to_swap] = new_s
            neighbor_cost = self.evaluate_assignment(neighbor_assignment)

            delta = neighbor_cost - current_cost
            if delta < 0 or random.random() < math.exp(-delta / temp):
                current_assignment = neighbor_assignment
                current_cost = neighbor_cost

                if current_cost < best_cost:
                    best_cost = current_cost
                    best_assignment = current_assignment.copy()

            history.append({"step": step, "cost": current_cost, "temp": round(temp, 2)})
            temp *= cooling_rate

        improvement_pct = round(((initial_cost - best_cost) / max(initial_cost, 1)) * 100.0, 1)

        return {
            "algorithm": "Simulated Annealing",
            "initial_cost": initial_cost,
            "optimized_cost": best_cost,
            "improvement_pct": max(improvement_pct, 0.0),
            "final_assignment": best_assignment,
            "history": history[:30]
        }

    def genetic_algorithm(self, population_size: int = 40, generations: int = 100, mutation_rate: float = 0.15) -> dict:
        shelter_ids = [s["id"] for s in self.shelters]
        zone_ids = [z["id"] for z in self.zones]

        # Initialize population
        population = []
        for _ in range(population_size):
            chromosome = {zid: random.choice(shelter_ids) for zid in zone_ids}
            cost = self.evaluate_assignment(chromosome)
            population.append((chromosome, cost))

        population.sort(key=lambda x: x[1])
        initial_cost = population[0][1]
        best_chromosome, best_cost = population[0]

        history = [{"step": 0, "cost": initial_cost, "fitness": round(1000.0 / (1.0 + initial_cost), 3)}]

        for gen in range(1, generations + 1):
            new_population = [population[0], population[1]] # Elitism: preserve top 2

            while len(new_population) < population_size:
                # Tournament selection (size 3)
                p1_sample = random.sample(population, min(3, len(population)))
                parent1 = min(p1_sample, key=lambda x: x[1])[0]
                p2_sample = random.sample(population, min(3, len(population)))
                parent2 = min(p2_sample, key=lambda x: x[1])[0]

                # Uniform Crossover
                child = {}
                for zid in zone_ids:
                    child[zid] = parent1[zid] if random.random() < 0.5 else parent2[zid]

                # Mutation
                if random.random() < mutation_rate:
                    mutate_zone = random.choice(zone_ids)
                    child[mutate_zone] = random.choice(shelter_ids)

                child_cost = self.evaluate_assignment(child)
                new_population.append((child, child_cost))

            new_population.sort(key=lambda x: x[1])
            population = new_population

            if population[0][1] < best_cost:
                best_chromosome, best_cost = population[0]

            if gen % 3 == 0 or gen == generations:
                history.append({
                    "step": gen,
                    "cost": population[0][1],
                    "fitness": round(1000.0 / (1.0 + population[0][1]), 3)
                })

        improvement_pct = round(((initial_cost - best_cost) / max(initial_cost, 1)) * 100.0, 1)

        return {
            "algorithm": "Genetic Algorithm",
            "initial_cost": initial_cost,
            "optimized_cost": best_cost,
            "improvement_pct": max(improvement_pct, 0.0),
            "final_assignment": best_chromosome,
            "history": history[:35]
        }
