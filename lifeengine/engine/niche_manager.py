# -*- coding: utf-8 -*-
"""
ArgOS // LifeOS Calibration Engine
niche_manager.py - Loads and validates niche configurations.
"""

import os
import yaml

class NicheManager:
    def __init__(self, niches_dir="lifeengine/niches"):
        self.niches_dir = niches_dir
        self.niches_cache = {}

    def get_niche(self, domain_id):
        """
        Loads and parses a niche YAML configuration file.
        Cache results in memory for high frequency CLI use.
        """
        if domain_id in self.niches_cache:
            return self.niches_cache[domain_id]

        file_path = os.path.join(self.niches_dir, f"{domain_id}.yaml")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Niche configuration not found for domain: '{domain_id}' at path '{file_path}'")

        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = yaml.safe_load(f)
                self.niches_cache[domain_id] = data
                return data
            except yaml.YAMLError as exc:
                raise ValueError(f"YAML parsing error in {file_path}: {exc}")

    def get_stages(self, domain_id):
        niche = self.get_niche(domain_id)
        return niche.get("stages", [])

    def get_onboarding_questions(self, domain_id):
        niche = self.get_niche(domain_id)
        return niche.get("onboarding_questions", [])

    def get_custom_fields(self, domain_id):
        niche = self.get_niche(domain_id)
        return niche.get("custom_fields", [])
