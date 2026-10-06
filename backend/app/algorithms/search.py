import math
import time
import heapq
from collections import deque
from typing import Dict, List, Tuple, Any, Optional

def compute_euclidean_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Estimates distance in km between two lat/lng coordinates (approx 111 km per degree)."""
    dlat = (lat2 - lat1) * 111.0
    dlng = (lng2 - lng1) * 111.0 * math.cos(math.radians((lat1 + lat2) / 2.0))
    return math.sqrt(dlat * dlat + dlng * dlng)

class DisasterSearchEngine:
    def __init__(self, nodes: Dict[str, dict], edges: List[dict], weights: dict = None):
        self.nodes = nodes
        self.edges = edges
        self.adj = {nid: [] for nid in nodes}
        self.edge_map = {}

        self.weights = weights or {
            "w_distance": 0.20,
            "w_travel_time": 0.20,
            "w_hazard_risk": 0.40,
            "w_traffic": 0.10,
            "w_future_risk": 0.10
        }

        self._build_graph()

    def _build_graph(self):
        for e in self.edges:
            u, v = e["u"], e["v"]
            if u in self.adj:
                self.adj[u].append(e)
            if v in self.adj:
                self.adj[v].append(e)
            self.edge_map[(u, v)] = e
            self.edge_map[(v, u)] = e

    def calculate_edge_cost(self, edge: dict) -> float:
        if edge.get("is_blocked", False):
            return 999999.0

        dist = edge.get("distance_km", 1.0)
        time_m = edge.get("travel_time_min", 5.0)
        risk = edge.get("hazard_risk", 10.0) / 100.0 * 50.0
        traffic = edge.get("traffic_density", 20.0) / 100.0 * 20.0
        future = edge.get("future_risk", 10.0) / 100.0 * 30.0

        w = self.weights
        cost = (
            w["w_distance"] * dist +
            w["w_travel_time"] * (time_m / 2.0) +
            w["w_hazard_risk"] * risk +
            w["w_traffic"] * traffic +
            w["w_future_risk"] * future
        )
        return max(cost, 0.1)

    def heuristic(self, node_id: str, target_id: str) -> float:
        n1 = self.nodes.get(node_id)
        n2 = self.nodes.get(target_id)
        if not n1 or not n2:
            return 0.0

        dist = compute_euclidean_distance(n1["lat"], n1["lng"], n2["lat"], n2["lng"])
        h_val = dist * self.weights["w_distance"] + (dist * 1.5) * (self.weights["w_travel_time"] / 2.0)
        return h_val

    def bfs(self, start_id: str, target_id: str) -> dict:
        t0 = time.perf_counter()
        queue = deque([start_id])
        visited = {start_id: None}
        steps = []
        nodes_explored = 0

        while queue:
            curr = queue.popleft()
            nodes_explored += 1

            steps.append({
                "current": curr,
                "visited_count": len(visited)
            })

            if curr == target_id:
                break

            for e in self.adj.get(curr, []):
                if e.get("is_blocked", False):
                    continue
                neighbor = e["v"] if e["u"] == curr else e["u"]
                if neighbor not in visited:
                    visited[neighbor] = e
                    queue.append(neighbor)

        t1 = time.perf_counter()
        exec_time_ms = round((t1 - t0) * 1000, 2)

        path, path_edges, cost, total_risk = self._reconstruct_path(start_id, target_id, visited)
        return {
            "algorithm": "BFS",
            "found": path is not None,
            "path": path,
            "path_edges": path_edges,
            "nodes_explored": nodes_explored,
            "cost": round(cost, 2),
            "overall_risk": round(total_risk, 1),
            "execution_time_ms": exec_time_ms,
            "steps": steps[:50]
        }

    def ucs(self, start_id: str, target_id: str) -> dict:
        t0 = time.perf_counter()
        pq = [(0.0, start_id)]
        g_scores = {start_id: 0.0}
        visited = {start_id: None}
        steps = []
        nodes_explored = 0

        while pq:
            curr_g, curr = heapq.heappop(pq)
            nodes_explored += 1

            steps.append({
                "current": curr,
                "g_score": round(curr_g, 2),
                "visited_count": len(visited)
            })

            if curr == target_id:
                break

            if curr_g > g_scores.get(curr, float("inf")):
                continue

            for e in self.adj.get(curr, []):
                if e.get("is_blocked", False):
                    continue
                neighbor = e["v"] if e["u"] == curr else e["u"]
                cost = self.calculate_edge_cost(e)
                new_g = curr_g + cost

                if new_g < g_scores.get(neighbor, float("inf")):
                    g_scores[neighbor] = new_g
                    visited[neighbor] = e
                    heapq.heappush(pq, (new_g, neighbor))

        t1 = time.perf_counter()
        exec_time_ms = round((t1 - t0) * 1000, 2)

        path, path_edges, cost, total_risk = self._reconstruct_path(start_id, target_id, visited)
        return {
            "algorithm": "Uniform Cost Search",
            "found": path is not None,
            "path": path,
            "path_edges": path_edges,
            "nodes_explored": nodes_explored,
            "cost": round(cost, 2),
            "overall_risk": round(total_risk, 1),
            "execution_time_ms": exec_time_ms,
            "steps": steps[:50]
        }

    def greedy_best_first(self, start_id: str, target_id: str) -> dict:
        t0 = time.perf_counter()
        h_start = self.heuristic(start_id, target_id)
        pq = [(h_start, start_id)]
        visited = {start_id: None}
        steps = []
        nodes_explored = 0

        while pq:
            curr_h, curr = heapq.heappop(pq)
            nodes_explored += 1

            steps.append({
                "current": curr,
                "h_score": round(curr_h, 2),
                "visited_count": len(visited)
            })

            if curr == target_id:
                break

            for e in self.adj.get(curr, []):
                if e.get("is_blocked", False):
                    continue
                neighbor = e["v"] if e["u"] == curr else e["u"]
                if neighbor not in visited:
                    visited[neighbor] = e
                    h_neighbor = self.heuristic(neighbor, target_id)
                    heapq.heappush(pq, (h_neighbor, neighbor))

        t1 = time.perf_counter()
        exec_time_ms = round((t1 - t0) * 1000, 2)

        path, path_edges, cost, total_risk = self._reconstruct_path(start_id, target_id, visited)
        return {
            "algorithm": "Greedy Best First",
            "found": path is not None,
            "path": path,
            "path_edges": path_edges,
            "nodes_explored": nodes_explored,
            "cost": round(cost, 2),
            "overall_risk": round(total_risk, 1),
            "execution_time_ms": exec_time_ms,
            "steps": steps[:50]
        }

    def a_star(self, start_id: str, target_id: str) -> dict:
        t0 = time.perf_counter()
        h0 = self.heuristic(start_id, target_id)
        pq = [(h0, 0.0, start_id)]
        g_scores = {start_id: 0.0}
        visited = {start_id: None}
        steps = []
        nodes_explored = 0
        node_details = {}

        while pq:
            curr_f, curr_g, curr = heapq.heappop(pq)
            nodes_explored += 1

            curr_h = self.heuristic(curr, target_id)
            node_details[curr] = {
                "node_id": curr,
                "g": round(curr_g, 2),
                "h": round(curr_h, 2),
                "f": round(curr_f, 2)
            }

            steps.append({
                "current": curr,
                "g": round(curr_g, 2),
                "h": round(curr_h, 2),
                "f": round(curr_f, 2),
                "visited_count": len(visited)
            })

            if curr == target_id:
                break

            if curr_g > g_scores.get(curr, float("inf")):
                continue

            for e in self.adj.get(curr, []):
                if e.get("is_blocked", False):
                    continue
                neighbor = e["v"] if e["u"] == curr else e["u"]
                cost = self.calculate_edge_cost(e)
                new_g = curr_g + cost

                if new_g < g_scores.get(neighbor, float("inf")):
                    g_scores[neighbor] = new_g
                    h_neighbor = self.heuristic(neighbor, target_id)
                    new_f = new_g + h_neighbor
                    visited[neighbor] = e
                    heapq.heappush(pq, (new_f, new_g, neighbor))

        t1 = time.perf_counter()
        exec_time_ms = round((t1 - t0) * 1000, 2)

        path, path_edges, cost, total_risk = self._reconstruct_path(start_id, target_id, visited)
        return {
            "algorithm": "A*",
            "found": path is not None,
            "path": path,
            "path_edges": path_edges,
            "nodes_explored": nodes_explored,
            "cost": round(cost, 2),
            "overall_risk": round(total_risk, 1),
            "execution_time_ms": exec_time_ms,
            "node_details": node_details,
            "steps": steps[:50]
        }

    def _reconstruct_path(self, start_id: str, target_id: str, visited: dict):
        if target_id not in visited:
            return None, [], 0.0, 0.0

        curr = target_id
        path = [curr]
        path_edges = []
        total_cost = 0.0
        total_risk = 0.0
        edge_count = 0

        while curr != start_id:
            edge = visited.get(curr)
            if not edge:
                break
            path_edges.append(edge)
            cost = self.calculate_edge_cost(edge)
            total_cost += cost
            total_risk += edge.get("hazard_risk", 0.0)
            edge_count += 1

            prev_node = edge["u"] if edge["v"] == curr else edge["v"]
            curr = prev_node
            path.append(curr)

        path.reverse()
        path_edges.reverse()
        avg_risk = total_risk / max(edge_count, 1)

        return path, path_edges, total_cost, avg_risk

    def compare_all(self, start_id: str, target_id: str) -> List[dict]:
        results = [
            self.bfs(start_id, target_id),
            self.ucs(start_id, target_id),
            self.greedy_best_first(start_id, target_id),
            self.a_star(start_id, target_id)
        ]
        return results
