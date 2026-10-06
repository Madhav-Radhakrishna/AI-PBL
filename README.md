# Intelligent Disaster Evacuation Route Planning System (AI PBL)

An end-to-end Problem-Based Learning (PBL) Artificial Intelligence system designed for disaster crisis management and evacuation route planning, simulated on the Hyderabad Urban Flood Emergency scenario.

This application integrates the entire classical and modern Artificial Intelligence curriculum into an interactive web platform and REST API.

---

## 🏛️ Comprehensive AI Curriculum Mapping (Units I – V)

| Syllabus Unit | Core AI Concepts | Implementation in this System | Interactive Dashboard Lab |
| :--- | :--- | :--- | :--- |
| **Unit I: Uninformed & Informed Search** | BFS, UCS, Greedy Best-First, A* Search, Heuristics, Local Search (Hill Climbing, Simulated Annealing, Genetic Algorithm) | Computes safe evacuation routes avoiding submerged corridors. Heuristic $h(n) = \text{EuclideanDist} + \text{RiskPenalty}$. Local search optimizes global zone-to-shelter configuration. | `Search Lab (A*)`, `Local Search Lab`, `Citizen Evacuation` |
| **Unit II: Constraint Satisfaction Problems (CSP)** | CSP Modeling (Variables, Domains, Constraints), Backtracking Search, MRV Heuristic, LCV, Constraint Propagation | Allocates affected population zones to shelters subject to capacity limits, hazard avoidance, distance thresholds, and road accessibility. | `CSP Lab` |
| **Unit III: Knowledge Representation & Logic** | First-Order Logic (FOL), Disaster Ontology, Horn Clauses, Forward Chaining, Backward Chaining Theorem Prover | Rule-based crisis expert system. Deduces emergency directives (e.g. mandatory evacuation, hospital priority dispatch) using Generalized Modus Ponens and goal-driven proof trees. | `Logic & Rules Lab` |
| **Unit IV: Planning & Multi-Agent Systems** | Classical Planning (STRIPS), Preconditions/Effects, Dynamic Replanning, Multi-Agent Coordination | Generates end-to-end multi-phase evacuation strategy. Plans simultaneous paths for heterogeneous agents (Ambulance, Fire Truck, Police, Civilian, Rescue Team) with dynamic edge deconfliction. | `Planning Lab`, `Multi-Agent Lab`, `Simulation Lab` |
| **Unit V: Uncertainty & Machine Learning** | Bayes' Rule, Bayesian Networks, Conditional Probability Tables (CPTs), Decision Trees, Random Forest | Calculates exact conditional uncertainty $P(\text{Road Unsafe} \mid \text{Evidence})$ under sensor ambiguity. Classifies road hazard risk (0–100) and feature importances. | `Bayesian Net Lab`, `Decision Tree Lab` |

---

## 🏗️ System Architecture & Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.10+) with Uvicorn
- **Database / ORM:** SQLAlchemy with SQLite
- **Machine Learning & AI:**
  - `scikit-learn`: Supervised Decision Tree & Random Forest classifiers
  - Custom Bayesian Belief Network Inference Engine
  - Custom First-Order Logic Horn Clause Forward/Backward Chaining Engine
  - Custom STRIPS Classical Planning & Multi-Agent Deconfliction Planners
  - Custom CSP MRV Backtracking Solver & Local Search Metaheuristics (Hill Climbing, Annealing, Genetic)
- **Testing:** Pytest

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Dark Mode, Slate/Emerald palette)
- **Mapping:** Leaflet & React-Leaflet (Interactive Hyderabad disaster road network)
- **Data Visualization:** Recharts (Shelter capacity charts, convergence curves, risk distributions)
- **Icons:** Lucide React

---

## 🚀 Quickstart Guide

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (starts on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

- **Web Application URL:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

Run the full backend test suite covering all AI algorithms:

```bash
# From workspace root
python -m pytest backend/tests -v
```

Expected output:
```
backend/tests/test_bayesian.py ..                                        [ 16%]
backend/tests/test_csp.py .                                              [ 25%]
backend/tests/test_knowledge.py ...                                      [ 50%]
backend/tests/test_ml.py ...                                             [ 75%]
backend/tests/test_planning.py .                                         [ 83%]
backend/tests/test_search.py ..                                          [100%]
============================= 12 passed in 3.09s ==============================
```

Build the frontend production bundle:

```bash
cd frontend
npm run build
```

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Routing & Search** | `/api/v1/routing/graph` | `GET` | Fetches Hyderabad graph nodes and dynamic road conditions |
| | `/api/v1/routing/find-route` | `POST` | Computes route using BFS, UCS, Greedy, or A* |
| | `/api/v1/routing/compare-algorithms` | `POST` | Benchmarks BFS, UCS, Greedy, and A* side-by-side |
| | `/api/v1/routing/multi-agent-routes` | `POST` | Coordinates simultaneous multi-agent dispatches with edge deconfliction |
| **AI ML & Bayes** | `/api/v1/ai-engine/predict-risk` | `POST` | Decision Tree road risk prediction (0–100) |
| | `/api/v1/ai-engine/decision-tree-structure` | `GET` | Returns full Decision Tree hierarchy and feature importances |
| | `/api/v1/ai-engine/bayesian-uncertainty` | `POST` | Computes $P(\text{Unsafe} \mid \text{Evidence})$ and variable impact % |
| | `/api/v1/ai-engine/bayesian-network-dag` | `GET` | Returns Bayesian Network DAG nodes, edges, and prior CPTs |
| **Knowledge (Unit III)** | `/api/v1/knowledge/facts-and-rules` | `GET` | Returns disaster ontology, Horn clause rules, and ground facts |
| | `/api/v1/knowledge/forward-chain` | `POST` | Executes data-driven forward chaining deduction |
| | `/api/v1/knowledge/query-backward-chain` | `POST` | Proves query goal using backward chaining theorem prover |
| **Shelters & CSP** | `/api/v1/shelters/` | `GET` | Returns shelters, capacities, and occupancies |
| | `/api/v1/shelters/solve-csp` | `GET` | Solves shelter allocation via MRV Backtracking CSP |
| | `/api/v1/shelters/optimize-local-search` | `POST` | Runs Hill Climbing, Simulated Annealing, or Genetic Algorithm |
| **Planning & STRIPS** | `/api/v1/planning/plan` | `GET` | Generates full multi-stage evacuation strategy with STRIPS model |
| | `/api/v1/planning/generate` | `POST` | Generates custom plan for selected strategy (Safety First, Fastest, Balanced) |
| | `/api/v1/planning/strips` | `GET` | Returns STRIPS Initial State, Goal State, and Operators |
| **Simulation & Admin** | `/api/v1/simulation/current-state` | `GET` | Returns disaster telemetry and network status |
| | `/api/v1/simulation/update` | `POST` | Triggers dynamic disaster updates (rainfall surge, blocked roads) |
| | `/api/v1/admin/summary` | `GET` | Emergency Command Center summary metrics and recent alerts |

---

## 👥 Roles Supported
- **Citizen:** Calculate safest evacuation path to nearest available shelter with AI explanation cards.
- **Emergency Responder:** Multi-vehicle coordinated dispatch (Ambulance, Fire, Rescue) with deconfliction.
- **Disaster Admin:** Real-time command center, live simulation sliders, shelter monitoring, and planning triggers.
