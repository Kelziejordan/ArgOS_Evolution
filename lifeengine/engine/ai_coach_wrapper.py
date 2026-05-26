# -*- coding: utf-8 -*-
"""
ArgOS // LifeOS Calibration Engine
ai_coach_wrapper.py - Sets up customized coaching prompts with system filters.
"""

import os

class AICoachWrapper:
    def __init__(self, prompts_dir="lifeengine/prompts"):
        self.prompts_dir = prompts_dir

    def load_prompt_template(self, domain_id):
        """
        Loads the raw text template corresponding to the target domain.
        """
        file_path = os.path.join(self.prompts_dir, f"{domain_id}_coach_prompt.txt")
        if not os.path.exists(file_path):
            # Default generalist system prompt fallback
            return """You are the ArgOS Sovereign Coach.
Niche: {domain_id}
Stage: {stage_name}
Data: {user_data}

Provide an elegant analytical, short response to: {user_message}
"""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def hydrate_prompt(self, domain_id, stage_id, stage_name, user_data, user_message):
        """
        Injects real metadata and variables into system prompts for context preservation.
        """
        template = self.load_prompt_template(domain_id)
        
        # Serialize user parameters cleanly as key-value lines
        serialized_data = "\n".join([f" - {k}: {v}" for k, v in user_data.items()])
        
        hydrated = template.replace("{stage_id}", str(stage_id))
        hydrated = hydrated.replace("{stage_name}", str(stage_name))
        hydrated = hydrated.replace("{user_data}", serialized_data)
        hydrated = hydrated.replace("{user_message}", user_message)
        
        return hydrated
