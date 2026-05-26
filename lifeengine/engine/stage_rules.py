# -*- coding: utf-8 -*-
"""
ArgOS // LifeOS Calibration Engine
stage_rules.py - Simple verification script to simulate and stress-test the calibration loop.
"""

from niche_manager import NicheManager
from stage_engine import StageEngine
from plan_engine import PlanEngine

def run_simulation():
    print("========================================================================")
    print("ARGOS -- LIFEENGINE OPERATIONAL STRESS-TEST & CRITERIA SIMULATION")
    print("========================================================================\n")
    
    nm = NicheManager()
    se = StageEngine()
    pe = PlanEngine()

    # User Profile 1: Fragile finance state
    user_finance_fragile = {
        "income_stability": "stable",
        "emergency_fund_months": 0.5,
        "has_high_interest_debt": True,
        "saves_regularly": False
    }

    # User Profile 2: High compounding finance state
    user_finance_rich = {
        "income_stability": "stable",
        "emergency_fund_months": 5.0,
        "has_high_interest_debt": False,
        "saves_regularly": True,
        "invests": True,
        "has_side_income": True
    }

    for idx, (name, profile) in enumerate([("Fragile Case", user_finance_fragile), ("High Compounder Case", user_finance_rich)], 1):
        try:
            print(f"Simulation Profile {idx}: {name}")
            niche_data = nm.get_niche("finance")
            
            # 1. Assign stage
            assigned = se.assign_stage(niche_data, profile)
            print(f" -> Assigned: [Stage {assigned['stage_id']}: {assigned['stage_name']}]")
            print(f" -> Details:  {assigned['description']}")
            
            # 2. Extract plan
            plan = pe.get_plan(niche_data, assigned["stage_id"])
            m1_tasks = plan["schedule"]["month_1"]
            print(f" -> Month 1 Tasks Loaded: {len(m1_tasks)}")
            for t in m1_tasks:
                print(f"    - [✓] {t['task']} ({t['time_estimate']})")
            print()
            
        except Exception as err:
            print(f"Simulation error: {err}")

if __name__ == "__main__":
    run_simulation()
