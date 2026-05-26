# -*- coding: utf-8 -*-
"""
ArgOS // LifeOS Calibration Engine
stage_engine.py - Determines user stage placements based on criteria expressions.
"""

class StageEngine:
    @staticmethod
    def evaluate_expression(expr, user_data):
        """
        Evaluates a simple subset of criteria comparison statements.
        E.g., "emergency_fund_months < 1.0" or "days_exercising_per_week < 2"
        """
        try:
            # Clean statement whitespaces
            expr = expr.strip()
            
            # Identify operators in descending order of length
            operators = ["<=", ">=", "==", "!=", "<", ">"]
            operator = None
            for op in operators:
                if op in expr:
                    operator = op
                    break
            
            if not operator:
                return False

            key, raw_val = expr.split(operator, 1)
            key = key.strip()
            raw_val = raw_val.strip()

            # Retrieve user metric
            if key not in user_data:
                return False
            
            user_val = user_data[key]

            # Coerce Types
            if raw_val.lower() == "true":
                target_val = True
            elif raw_val.lower() == "false":
                target_val = False
            elif raw_val.startswith("'") or raw_val.startswith('"'):
                target_val = raw_val.strip("'\"")
            else:
                try:
                    target_val = float(raw_val)
                    user_val = float(user_val)
                except ValueError:
                    target_val = raw_val

            # Compare indices
            if operator == "<":
                return user_val < target_val
            elif operator == ">":
                return user_val > target_val
            elif operator == "==":
                return user_val == target_val
            elif operator == "!=":
                return user_val != target_val
            elif operator == "<=":
                return user_val <= target_val
            elif operator == ">=":
                return user_val >= target_val

        except Exception as e:
            print(f"Error evaluating criteria expression: '{expr}'. Detail: {e}")
            return False
            
        return False

    def assign_stage(self, niche_data, user_data):
        """
        Takes parsed Niche definition + user parameter dict.
        Evaluates criteria. Returns the highest matching stage configuration.
        """
        stages = niche_data.get("stages", [])
        
        # We process stages in descending order to assign the highest achieved level
        for stage in sorted(stages, key=lambda x: x.get("id", 1), reverse=True):
            criteria_list = stage.get("criteria", [])
            
            # If a stage has any criteria and all are evaluated as True, place the user there
            if criteria_list and all(self.evaluate_expression(c, user_data) for c in criteria_list):
                return {
                    "stage_id": stage.get("id"),
                    "stage_name": stage.get("name"),
                    "description": stage.get("description"),
                    "next_stage_description": stage.get("next_stage_description")
                }

        # Fallback to base stage
        if stages:
            first = sorted(stages, key=lambda x: x.get("id", 1))[0]
            return {
                "stage_id": first.get("id"),
                "stage_name": first.get("name"),
                "description": first.get("description"),
                "next_stage_description": first.get("next_stage_description")
            }
        
        return {
            "stage_id": 1,
            "stage_name": "Stage 1: Fragile",
            "description": "Baseline uncalibrated profile.",
            "next_stage_description": "Initialize diagnostics."
        }
