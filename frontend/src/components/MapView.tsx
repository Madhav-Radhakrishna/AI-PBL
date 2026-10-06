import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapNode, GraphEdge, ShelterInfo, MultiAgentRoute } from "../types";

// Custom Leaflet Markers
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="background-color: ${color}; border: 2px solid white; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.4); display: flex; items-center: center; gap: 4px;">
        <span>${label}</span>
      </div>
    `,
    iconSize: [80, 26],
    iconAnchor: [40, 13]
  });
};

interface MapViewProps {
  nodes: MapNode[];
  edges: GraphEdge[];
  shelters: ShelterInfo[];
  selectedStartNode?: string;
  onSelectStartNode?: (nodeId: string) => void;
  selectedRoutePath?: string[];
  exploredNodes?: string[];
  multiAgentRoutes?: MultiAgentRoute[];
  hazardRadiusKm?: number;
}

// Map Auto Recenter Helper
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  nodes,
  edges,
  shelters,
  selectedStartNode,
  onSelectStartNode,
  selectedRoutePath,
  exploredNodes,
  multiAgentRoutes,
  hazardRadiusKm = 3.0
}) => {
  const defaultCenter: [number, number] = [17.424, 78.460]; // Hyderabad Center

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Render edges
  const renderEdgePolyline = (e: GraphEdge) => {
    const n1 = nodeMap.get(e.u);
    const n2 = nodeMap.get(e.v);
    if (!n1 || !n2) return null;

    const positions: [number, number][] = [
      [n1.lat, n1.lng],
      [n2.lat, n2.lng]
    ];

    let color = "#3b82f6";
    let dashArray = undefined;
    let weight = 4;
    let opacity = 0.6;

    if (e.is_blocked) {
      color = "#ef4444";
      dashArray = "6, 6";
      weight = 5;
      opacity = 0.9;
    } else if (e.hazard_risk > 65) {
      color = "#f97316";
      weight = 4;
    } else if (e.hazard_risk > 35) {
      color = "#f59e0b";
    } else {
      color = "#10b981";
    }

    return (
      <Polyline
        key={e.id}
        positions={positions}
        pathOptions={{ color, weight, opacity, dashArray }}
      >
        <Popup>
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-800">{e.name}</p>
            <p className="text-slate-600">Distance: {e.distance_km} km</p>
            <p className="text-slate-600">Risk Score: <span className="font-bold">{e.hazard_risk}/100</span> ({e.risk_category})</p>
            <p className="text-slate-600">Traffic Density: {e.traffic_density}%</p>
            {e.is_blocked && <p className="text-red-600 font-bold">⚠️ ROAD BLOCKED BY FLOOD</p>}
          </div>
        </Popup>
      </Polyline>
    );
  };

  // Render recommended route highlight
  const renderRouteHighlight = () => {
    if (!selectedRoutePath || selectedRoutePath.length < 2) return null;

    const pathCoords: [number, number][] = [];
    selectedRoutePath.forEach((nid) => {
      const n = nodeMap.get(nid);
      if (n) pathCoords.push([n.lat, n.lng]);
    });

    return (
      <Polyline
        positions={pathCoords}
        pathOptions={{ color: "#10b981", weight: 8, opacity: 0.95 }}
      />
    );
  };

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        {...({
          center: defaultCenter,
          zoom: 13,
          scrollWheelZoom: true,
          className: "w-full h-full"
        } as any)}
      >
        <MapRecenter center={defaultCenter} />

        {/* Dark Matter OSM Tile Layer */}
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          } as any)}
        />

        {/* Inundation Zone Hazard Polygon around Hussain Sagar / Begumpet */}
        <Polygon
          positions={[
            [17.435, 78.460],
            [17.440, 78.480],
            [17.420, 78.490],
            [17.410, 78.470],
            [17.415, 78.455],
            [17.435, 78.460]
          ]}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.25,
            weight: 2,
            dashArray: "4, 4"
          }}
        />

        {/* Hazard Radius Circle */}
        <Circle
          {...({
            center: [17.424, 78.475],
            radius: hazardRadiusKm * 1000,
            pathOptions: {
              color: "#dc2626",
              fillColor: "#dc2626",
              fillOpacity: 0.15,
              weight: 1.5
            }
          } as any)}
        />

        {/* Road Edges */}
        {edges.map(renderEdgePolyline)}

        {/* Recommended Active Route Highlight */}
        {renderRouteHighlight()}

        {/* Explored Nodes in Search Lab */}
        {exploredNodes && exploredNodes.map((nid) => {
          const n = nodeMap.get(nid);
          if (!n) return null;
          return (
            <Circle
              key={`explored-${nid}`}
              {...({
                center: [n.lat, n.lng],
                radius: 350,
                pathOptions: { color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.6 }
              } as any)}
            />
          );
        })}

        {/* Node Markers */}
        {nodes.map((n) => {
          const isSelected = selectedStartNode === n.id;
          const isShelter = n.type === "SHELTER";
          const shelterObj = shelters.find((s) => s.id === n.id);

          let color = isShelter ? "#2563eb" : "#475569";
          if (isSelected) color = "#10b981";

          return (
            <Marker
              key={n.id}
              {...({
                position: [n.lat, n.lng],
                icon: createCustomIcon(color, isShelter ? `🏥 ${n.name}` : `📍 ${n.name}`),
                eventHandlers: {
                  click: () => {
                    if (onSelectStartNode && !isShelter) {
                      onSelectStartNode(n.id);
                    }
                  }
                }
              } as any)}
            >
              <Popup>
                <div className="text-xs space-y-1 text-slate-800">
                  <p className="font-bold text-sm">{n.name}</p>
                  <p className="text-slate-600">Type: {n.type}</p>
                  {shelterObj && (
                    <div className="bg-slate-100 p-2 rounded text-slate-700 font-mono mt-1">
                      <p>Capacity: {shelterObj.capacity}</p>
                      <p>Occupancy: {shelterObj.current_occupancy} ({shelterObj.occupancy_pct}%)</p>
                      <p>Available: <span className="font-bold text-emerald-600">{shelterObj.available_capacity}</span></p>
                    </div>
                  )}
                  {!isShelter && onSelectStartNode && (
                    <button
                      onClick={() => onSelectStartNode(n.id)}
                      className="mt-2 w-full bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700"
                    >
                      Set Evacuation Start Point
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Multi-Agent Emergency Vehicles */}
        {multiAgentRoutes && multiAgentRoutes.map((ma) => {
          if (!ma.found || ma.path.length === 0) return null;
          const startN = nodeMap.get(ma.start_node);
          if (!startN) return null;
          return (
            <Marker
              key={`agent-${ma.agent_id}`}
              {...({
                position: [startN.lat, startN.lng],
                icon: createCustomIcon(ma.color, `🚑 ${ma.agent_name}`)
              } as any)}
            />
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs backdrop-blur-md z-[1000] space-y-1.5 shadow-xl">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">Hyd Disasters Map Legend</p>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          <span className="text-slate-300">Blocked / Inundated Road</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-300">High Risk Flood Corridor</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">A* Recommended Safe Route</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-300">Designated Safe Shelter</span>
        </div>
      </div>
    </div>
  );
};
