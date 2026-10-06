import React, { useState } from "react";
import { Role } from "./types";
import { Header } from "./components/Header";
import { DynamicReplanningToast } from "./components/DynamicReplanningToast";

import { CitizenDashboard } from "./pages/CitizenDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SimulationLab } from "./pages/SimulationLab";
import { SearchLab } from "./pages/SearchLab";
import { BayesianLab } from "./pages/BayesianLab";
import { DecisionTreeLab } from "./pages/DecisionTreeLab";
import { CSPLab } from "./pages/CSPLab";
import { PlanningLab } from "./pages/PlanningLab";
import { MultiAgentLab } from "./pages/MultiAgentLab";
import { LocalSearchLab } from "./pages/LocalSearchLab";
import { KnowledgeBaseLab } from "./pages/KnowledgeBaseLab";
import { AIPblMappingPage } from "./pages/AIPblMappingPage";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("citizen");
  const [role, setRole] = useState<Role>("CITIZEN");
  const [disasterSeverity, setDisasterSeverity] = useState<number>(8.0);
  const [activeAlert, setActiveAlert] = useState<any>(null);

  const renderActivePage = () => {
    switch (currentTab) {
      case "citizen":
        return <CitizenDashboard onOpenSearchLab={() => setCurrentTab("search")} />;
      case "admin":
        return <AdminDashboard />;
      case "simulation":
        return <SimulationLab onTriggerReplanningAlert={(alert) => setActiveAlert(alert)} />;
      case "search":
        return <SearchLab />;
      case "bayesian":
        return <BayesianLab />;
      case "tree":
        return <DecisionTreeLab />;
      case "knowledge":
        return <KnowledgeBaseLab />;
      case "csp":
        return <CSPLab />;
      case "planning":
        return <PlanningLab />;
      case "multiagent":
        return <MultiAgentLab />;
      case "localsearch":
        return <LocalSearchLab />;
      case "mapping":
        return <AIPblMappingPage />;
      default:
        return <CitizenDashboard onOpenSearchLab={() => setCurrentTab("search")} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        role={role}
        setRole={setRole}
        disasterSeverity={disasterSeverity}
      />

      <main className="flex-1 pb-12">
        {renderActivePage()}
      </main>

      {/* Dynamic Replanning Alert Toast Overlay */}
      <DynamicReplanningToast alert={activeAlert} onClose={() => setActiveAlert(null)} />

      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <p>Intelligent Disaster Evacuation Route Planning System • Artificial Intelligence Problem-Based Learning (PBL) Project</p>
        <p className="text-[11px] text-slate-600 mt-0.5">Hyderabad Flood Emergency — Fictional Simulation Data for Academic Demonstration</p>
      </footer>
    </div>
  );
}

export default App;
