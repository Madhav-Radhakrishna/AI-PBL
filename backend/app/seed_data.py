from app.models import (
    Disaster, Hazard, Road, RoadCondition, Shelter, EvacuationZone, PopulationData, WeatherData, TrafficData
)

HYDERABAD_NODES = {
    "ZONE_BEGUMPET": {"id": "ZONE_BEGUMPET", "name": "Begumpet", "lat": 17.444, "lng": 78.466, "type": "ZONE"},
    "ZONE_AMEERPET": {"id": "ZONE_AMEERPET", "name": "Ameerpet", "lat": 17.437, "lng": 78.448, "type": "ZONE"},
    "ZONE_PUNJAGUTTA": {"id": "ZONE_PUNJAGUTTA", "name": "Punjagutta", "lat": 17.426, "lng": 78.452, "type": "ZONE"},
    "ZONE_KHAIRATABAD": {"id": "ZONE_KHAIRATABAD", "name": "Khairatabad", "lat": 17.412, "lng": 78.461, "type": "ZONE"},
    "ZONE_LAKDIKAPUL": {"id": "ZONE_LAKDIKAPUL", "name": "Lakdikapul", "lat": 17.404, "lng": 78.464, "type": "ZONE"},
    "ZONE_HITEC_CITY": {"id": "ZONE_HITEC_CITY", "name": "HITEC City", "lat": 17.443, "lng": 78.377, "type": "ZONE"},
    "ZONE_JUBILEE_HILLS": {"id": "ZONE_JUBILEE_HILLS", "name": "Jubilee Hills", "lat": 17.431, "lng": 78.407, "type": "ZONE"},
    "ZONE_CHARMINAR": {"id": "ZONE_CHARMINAR", "name": "Charminar", "lat": 17.361, "lng": 78.474, "type": "ZONE"},
    "ZONE_MALAKPET": {"id": "ZONE_MALAKPET", "name": "Malakpet", "lat": 17.373, "lng": 78.498, "type": "ZONE"},
    "ZONE_LB_NAGAR": {"id": "ZONE_LB_NAGAR", "name": "LB Nagar", "lat": 17.348, "lng": 78.552, "type": "ZONE"},
    "ZONE_SECUNDERABAD": {"id": "ZONE_SECUNDERABAD", "name": "Secunderabad", "lat": 17.439, "lng": 78.498, "type": "ZONE"},
    "ZONE_KOTI": {"id": "ZONE_KOTI", "name": "Koti", "lat": 17.385, "lng": 78.486, "type": "ZONE"},
    "ZONE_MEHDIPATNAM": {"id": "ZONE_MEHDIPATNAM", "name": "Mehdipatnam", "lat": 17.395, "lng": 78.438, "type": "ZONE"},
    "ZONE_TANK_BUND": {"id": "ZONE_TANK_BUND", "name": "Tank Bund", "lat": 17.424, "lng": 78.475, "type": "ZONE"},

    # Shelters as graph target nodes
    "SHELTER_BEGUMPET": {"id": "SHELTER_BEGUMPET", "name": "Begumpet Indoor Stadium", "lat": 17.448, "lng": 78.470, "type": "SHELTER"},
    "SHELTER_NIZAM": {"id": "SHELTER_NIZAM", "name": "Nizam College Grounds", "lat": 17.398, "lng": 78.472, "type": "SHELTER"},
    "SHELTER_GACHIBOWLI": {"id": "SHELTER_GACHIBOWLI", "name": "Gachibowli Sports Complex", "lat": 17.440, "lng": 78.348, "type": "SHELTER"},
    "SHELTER_SECUNDERABAD": {"id": "SHELTER_SECUNDERABAD", "name": "Secunderabad Gymkhana", "lat": 17.445, "lng": 78.505, "type": "SHELTER"},
    "SHELTER_LB_NAGAR": {"id": "SHELTER_LB_NAGAR", "name": "LB Nagar Community Hall", "lat": 17.345, "lng": 78.558, "type": "SHELTER"},
    "SHELTER_JUBILEE": {"id": "SHELTER_JUBILEE", "name": "Jubilee Hills Cultural Club", "lat": 17.428, "lng": 78.412, "type": "SHELTER"},
    "SHELTER_MEHDIPATNAM": {"id": "SHELTER_MEHDIPATNAM", "name": "Mehdipatnam Disaster Shelter", "lat": 17.390, "lng": 78.432, "type": "SHELTER"}
}

def seed_hyderabad_scenario(db_session):
    """Initializes the Hyderabad Flood Emergency Simulation state in database."""
    # Check if disaster already seeded
    existing = db_session.query(Disaster).first()
    if existing:
        return

    # 1. Create Flood Disaster
    disaster = Disaster(
        type="Flood",
        name="Hyderabad Flood Emergency — Simulation",
        severity=8.0,
        lat=17.424, # Hussain Sagar / Tank Bund center
        lng=78.475,
        affected_radius=3.5,
        status="ACTIVE"
    )
    db_session.add(disaster)
    db_session.flush()

    # 2. Hazard Polygon around Hussain Sagar / Begumpet lowlands
    hazard = Hazard(
        disaster_id=disaster.id,
        hazard_type="Inundation Zone",
        center_lat=17.424,
        center_lng=78.475,
        radius_km=3.0,
        intensity=8.5,
        polygon=[
            [17.435, 78.460], [17.440, 78.480], [17.420, 78.490],
            [17.410, 78.470], [17.415, 78.455], [17.435, 78.460]
        ]
    )
    db_session.add(hazard)

    # 3. Weather
    weather = WeatherData(
        disaster_id=disaster.id,
        rainfall_mm_hr=75.0,
        wind_speed_kmh=25.0,
        temperature_c=26.0,
        visibility_km=4.5
    )
    db_session.add(weather)

    # 4. Shelters
    shelter_list = [
        {"id": "SHELTER_BEGUMPET", "name": "Begumpet Indoor Stadium", "lat": 17.448, "lng": 78.470, "capacity": 3500, "current_occupancy": 1200, "facilities": ["Medical", "Food", "Water"], "risk_level": "LOW"},
        {"id": "SHELTER_NIZAM", "name": "Nizam College Grounds", "lat": 17.398, "lng": 78.472, "capacity": 4500, "current_occupancy": 3800, "facilities": ["Helipad", "Medical", "Generator"], "risk_level": "LOW"},
        {"id": "SHELTER_GACHIBOWLI", "name": "Gachibowli Sports Complex", "lat": 17.440, "lng": 78.348, "capacity": 6000, "current_occupancy": 1500, "facilities": ["High Capacity", "Medical", "Food"], "risk_level": "LOW"},
        {"id": "SHELTER_SECUNDERABAD", "name": "Secunderabad Gymkhana", "lat": 17.445, "lng": 78.505, "capacity": 3000, "current_occupancy": 800, "facilities": ["Water", "Food"], "risk_level": "LOW"},
        {"id": "SHELTER_LB_NAGAR", "name": "LB Nagar Community Hall", "lat": 17.345, "lng": 78.558, "capacity": 2500, "current_occupancy": 900, "facilities": ["Medical"], "risk_level": "LOW"},
        {"id": "SHELTER_JUBILEE", "name": "Jubilee Hills Cultural Club", "lat": 17.428, "lng": 78.412, "capacity": 3200, "current_occupancy": 1100, "facilities": ["Generator", "Food"], "risk_level": "LOW"},
        {"id": "SHELTER_MEHDIPATNAM", "name": "Mehdipatnam Disaster Shelter", "lat": 17.390, "lng": 78.432, "capacity": 2800, "current_occupancy": 600, "facilities": ["Medical", "Water"], "risk_level": "LOW"}
    ]
    for s in shelter_list:
        db_session.add(Shelter(**s))

    # 5. Evacuation Zones & Population
    zones_data = [
        {"id": "ZONE_AMEERPET", "name": "Ameerpet Sector A", "lat": 17.437, "lng": 78.448, "pop": 4200, "vulnerable": 850},
        {"id": "ZONE_BEGUMPET", "name": "Begumpet Lowlands", "lat": 17.444, "lng": 78.466, "pop": 3800, "vulnerable": 920},
        {"id": "ZONE_PUNJAGUTTA", "name": "Punjagutta Colony", "lat": 17.426, "lng": 78.452, "pop": 2900, "vulnerable": 400},
        {"id": "ZONE_KHAIRATABAD", "name": "Khairatabad Circle", "lat": 17.412, "lng": 78.461, "pop": 2500, "vulnerable": 310},
        {"id": "ZONE_CHARMINAR", "name": "Charminar Old City", "lat": 17.361, "lng": 78.474, "pop": 3020, "vulnerable": 700},
        {"id": "ZONE_MALAKPET", "name": "Malakpet Residential", "lat": 17.373, "lng": 78.498, "pop": 2000, "vulnerable": 250}
    ]
    for z in zones_data:
        ez = EvacuationZone(id=z["id"], name=z["name"], lat=z["lat"], lng=z["lng"])
        db_session.add(ez)
        pop = PopulationData(zone_id=z["id"], population_count=z["pop"], vulnerable_count=z["vulnerable"])
        db_session.add(pop)

    # 6. Road Graph Edges (around 25 key road links)
    roads_list = [
        {"id": "R_AMEERPET_BEGUMPET", "name": "Ameerpet - Begumpet Main Rd", "u": "ZONE_AMEERPET", "v": "ZONE_BEGUMPET", "dist": 2.2, "elev": 485, "blocked": True, "water": 85, "traffic": 78},
        {"id": "R_BEGUMPET_SHELTER", "name": "Begumpet Flyover to Shelter", "u": "ZONE_BEGUMPET", "v": "SHELTER_BEGUMPET", "dist": 0.8, "elev": 490, "blocked": False, "water": 30, "traffic": 60},
        {"id": "R_AMEERPET_PUNJAGUTTA", "name": "Ameerpet - Punjagutta X-Roads", "u": "ZONE_AMEERPET", "v": "ZONE_PUNJAGUTTA", "dist": 1.5, "elev": 510, "blocked": False, "water": 10, "traffic": 45},
        {"id": "R_PUNJAGUTTA_KHAIRATABAD", "name": "Punjagutta - Khairatabad Flyover", "u": "ZONE_PUNJAGUTTA", "v": "ZONE_KHAIRATABAD", "dist": 1.8, "elev": 515, "blocked": False, "water": 5, "traffic": 35},
        {"id": "R_KHAIRATABAD_LAKDIKAPUL", "name": "Khairatabad - Lakdikapul Rd", "u": "ZONE_KHAIRATABAD", "v": "ZONE_LAKDIKAPUL", "dist": 1.2, "elev": 505, "blocked": False, "water": 15, "traffic": 50},
        {"id": "R_LAKDIKAPUL_NIZAM", "name": "Lakdikapul to Nizam College Shelter", "u": "ZONE_LAKDIKAPUL", "v": "SHELTER_NIZAM", "dist": 1.0, "elev": 508, "blocked": False, "water": 10, "traffic": 40},
        {"id": "R_KHAIRATABAD_TANKBUND", "name": "Khairatabad to Tank Bund Rd", "u": "ZONE_KHAIRATABAD", "v": "ZONE_TANK_BUND", "dist": 1.9, "elev": 482, "blocked": True, "water": 110, "traffic": 90},
        {"id": "R_BEGUMPET_TANKBUND", "name": "Begumpet to Tank Bund Inundated Rd", "u": "ZONE_BEGUMPET", "v": "ZONE_TANK_BUND", "dist": 2.5, "elev": 480, "blocked": True, "water": 120, "traffic": 95},
        {"id": "R_TANKBUND_SECUNDERABAD", "name": "Tank Bund - Secunderabad Link", "u": "ZONE_TANK_BUND", "v": "ZONE_SECUNDERABAD", "dist": 3.0, "elev": 495, "blocked": True, "water": 90, "traffic": 85},
        {"id": "R_BEGUMPET_SECUNDERABAD", "name": "Begumpet - Secunderabad Express", "u": "ZONE_BEGUMPET", "v": "ZONE_SECUNDERABAD", "dist": 3.8, "elev": 515, "blocked": False, "water": 15, "traffic": 40},
        {"id": "R_SECUNDERABAD_SHELTER", "name": "Secunderabad to Gymkhana Shelter", "u": "ZONE_SECUNDERABAD", "v": "SHELTER_SECUNDERABAD", "dist": 0.9, "elev": 520, "blocked": False, "water": 5, "traffic": 25},
        {"id": "R_AMEERPET_JUBILEE", "name": "Ameerpet to Jubilee Hills Rd", "u": "ZONE_AMEERPET", "v": "ZONE_JUBILEE_HILLS", "dist": 4.1, "elev": 540, "blocked": False, "water": 0, "traffic": 30},
        {"id": "R_JUBILEE_HITEC", "name": "Jubilee Hills to HITEC City Express", "u": "ZONE_JUBILEE_HILLS", "v": "ZONE_HITEC_CITY", "dist": 4.5, "elev": 560, "blocked": False, "water": 0, "traffic": 20},
        {"id": "R_HITEC_GACHIBOWLI", "name": "HITEC City to Gachibowli Shelter", "u": "ZONE_HITEC_CITY", "v": "SHELTER_GACHIBOWLI", "dist": 3.2, "elev": 570, "blocked": False, "water": 0, "traffic": 15},
        {"id": "R_JUBILEE_SHELTER", "name": "Jubilee Hills to Cultural Shelter", "u": "ZONE_JUBILEE_HILLS", "v": "SHELTER_JUBILEE", "dist": 0.7, "elev": 545, "blocked": False, "water": 0, "traffic": 15},
        {"id": "R_PUNJAGUTTA_MEHDIPATNAM", "name": "Punjagutta - Mehdipatnam Arterial", "u": "ZONE_PUNJAGUTTA", "v": "ZONE_MEHDIPATNAM", "dist": 4.2, "elev": 525, "blocked": False, "water": 10, "traffic": 35},
        {"id": "R_MEHDIPATNAM_SHELTER", "name": "Mehdipatnam to Shelter", "u": "ZONE_MEHDIPATNAM", "v": "SHELTER_MEHDIPATNAM", "dist": 0.8, "elev": 522, "blocked": False, "water": 5, "traffic": 20},
        {"id": "R_CHARMINAR_KOTI", "name": "Charminar - Koti Heritage Rd", "u": "ZONE_CHARMINAR", "v": "ZONE_KOTI", "dist": 3.0, "elev": 490, "blocked": True, "water": 75, "traffic": 70},
        {"id": "R_KOTI_MALAKPET", "name": "Koti - Malakpet Link", "u": "ZONE_KOTI", "v": "ZONE_MALAKPET", "dist": 2.1, "elev": 495, "blocked": False, "water": 20, "traffic": 45},
        {"id": "R_MALAKPET_LBNAGAR", "name": "Malakpet - LB Nagar Highway", "u": "ZONE_MALAKPET", "v": "ZONE_LB_NAGAR", "dist": 5.8, "elev": 505, "blocked": False, "water": 10, "traffic": 30},
        {"id": "R_LBNAGAR_SHELTER", "name": "LB Nagar to Community Shelter", "u": "ZONE_LB_NAGAR", "v": "SHELTER_LB_NAGAR", "dist": 0.7, "elev": 510, "blocked": False, "water": 5, "traffic": 15},
        {"id": "R_CHARMINAR_MEHDIPATNAM", "name": "Charminar - Mehdipatnam Ring", "u": "ZONE_CHARMINAR", "v": "ZONE_MEHDIPATNAM", "dist": 4.8, "elev": 510, "blocked": False, "water": 15, "traffic": 40},
    ]

    # Additional blocked roads to reach 12 blocked roads in scenario
    extra_blocked = [
        ("R_BLOCK_1", "Lowland Spillway 1", "ZONE_BEGUMPET", "ZONE_AMEERPET", 1.2),
        ("R_BLOCK_2", "Lowland Spillway 2", "ZONE_TANK_BUND", "ZONE_KOTI", 2.2),
        ("R_BLOCK_3", "Underpass A", "ZONE_BEGUMPET", "ZONE_PUNJAGUTTA", 1.9),
        ("R_BLOCK_4", "Underpass B", "ZONE_CHARMINAR", "ZONE_MALAKPET", 2.0),
        ("R_BLOCK_5", "Canal Rd North", "ZONE_SECUNDERABAD", "ZONE_TANK_BUND", 2.8),
        ("R_BLOCK_6", "Canal Rd South", "ZONE_KOTI", "SHELTER_NIZAM", 1.4),
        ("R_BLOCK_7", "Musiriver Causeway", "ZONE_CHARMINAR", "SHELTER_NIZAM", 3.1)
    ]
    for b_id, b_name, u, v, dist in extra_blocked:
        roads_list.append({"id": b_id, "name": b_name, "u": u, "v": v, "dist": dist, "elev": 475, "blocked": True, "water": 100, "traffic": 90})

    for r in roads_list:
        rd = Road(
            id=r["id"],
            name=r["name"],
            start_node_id=r["u"],
            end_node_id=r["v"],
            distance_km=r["dist"],
            road_condition="Poor" if r["blocked"] else "Good",
            elevation_meters=r["elev"],
            capacity_vph=2000
        )
        db_session.add(rd)

        rc = RoadCondition(
            road_id=r["id"],
            is_blocked=r["blocked"],
            water_level_cm=r["water"],
            current_speed_kmh=5.0 if r["blocked"] else 35.0,
            hazard_proximity_km=1.0 if r["blocked"] else 4.0
        )
        db_session.add(rc)

        tf = TrafficData(
            road_id=r["id"],
            traffic_density_pct=r["traffic"],
            predicted_density_15m=min(r["traffic"] + 15.0, 100.0)
        )
        db_session.add(tf)

    db_session.commit()
