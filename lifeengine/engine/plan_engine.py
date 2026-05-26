# -*- coding: utf-8 -*-
"""
ArgOS // LifeOS Calibration Engine
plan_engine.py - Delivers and customized 90-day task schedules.
"""

class PlanEngine:
    def get_plan(self, niche_data, stage_id):
        """
        Extracts month-by-month tasks matching the assigned Stage level.
        """
        all_plans = niche_data.get("plans", {})
        plan_key = f"stage_{stage_id}_90_day"
        
        # If the direct key doesn't exist, fallback to stage 1 plans
        if plan_key not in all_plans:
            plan_key = "stage_1_90_day"
            
        stage_plan = all_plans.get(plan_key, {})
        
        return {
            "stage_id": stage_id,
            "period": "90 Days",
            "schedule": {
                "month_1": stage_plan.get("month_1", []),
                "month_2": stage_plan.get("month_2", []),
                "month_3": stage_plan.get("month_3", [])
            }
        }
