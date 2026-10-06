import pytest
from app.algorithms.knowledge_base import disaster_kb

def test_knowledge_base_forward_chaining():
    # Provide facts that trigger Rule 01 and then Rule 02 and Rule 03
    facts = {
        "Road(R_Punjagutta)",
        "WaterLevelCritical(R_Punjagutta)",
        "CorridorIncludes(Corridor_A, R_Punjagutta)"
    }
    res = disaster_kb.forward_chain(facts)

    assert "ImpassableForCivilian(R_Punjagutta)" in res["derived_facts"]
    assert "CorridorCompromised(Corridor_A)" in res["derived_facts"]
    assert "TriggerDynamicReroute(Corridor_A)" in res["derived_facts"]
    assert len(res["derivation_trace"]) >= 3

def test_knowledge_base_backward_chaining_success():
    facts = {
        "RainfallExtreme()",
        "LowElevationZone(ZONE_BEGUMPET)",
        "HighPopulationDensity(ZONE_BEGUMPET)"
    }
    # Should prove MandatoryEvacuationOrder(ZONE_BEGUMPET) via Rule 04 & Rule 05
    res = disaster_kb.backward_chain("MandatoryEvacuationOrder(ZONE_BEGUMPET)", facts)
    assert res["is_proven"] is True
    assert res["proof_tree"]["proven"] is True

def test_knowledge_base_backward_chaining_failure():
    facts = {
        "LowElevationZone(ZONE_BEGUMPET)"
    }
    # Cannot prove without RainfallExtreme
    res = disaster_kb.backward_chain("MandatoryEvacuationOrder(ZONE_BEGUMPET)", facts)
    assert res["is_proven"] is False
