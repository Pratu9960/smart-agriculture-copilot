import os
import json
from typing import Dict, Any, List

class KnowledgeService:
    """
    Crop Disease Agricultural Recommendation Knowledge Base Service.
    Responsible for retrieving treatment, pesticide, fertilizer, and prevention information
    from local knowledge database files without relying on AI generation/hallucination.
    """
    def __init__(self, database_path: str = None):
        if database_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            database_path = os.path.join(base_dir, "data", "crop_disease_database.json")
        self.database_path = database_path
        self._database: Dict[str, Any] = self._load_database()

    def _load_database(self) -> Dict[str, Any]:
        if os.path.exists(self.database_path):
            try:
                with open(self.database_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[KnowledgeService] Error loading database at {self.database_path}: {e}")
        return {}

    def get_recommendations(self, crop: str, disease: str) -> Dict[str, Any]:
        """
        Look up recommendation information by crop and disease.
        Returns severity, symptoms, cause, treatment, pesticides, fertilizer, prevention.
        Falls back to 'Unknown' and un-fabricated empty fields if record is missing.
        """
        # Try direct key formatted as "Crop___Disease_name"
        key = f"{crop}___{disease}".replace(" ", "_")
        
        if key in self._database:
            return self._database[key]
        
        # Case insensitive / soft match fallback
        for db_key, entry in self._database.items():
            db_crop = entry.get("crop", "").lower()
            db_disease = entry.get("disease", "").lower()
            if db_crop == crop.lower() and (db_disease in disease.lower() or disease.lower() in db_disease):
                return entry

        # Un-fabricated fallback if missing from knowledge base
        return {
            "crop": crop,
            "disease": disease,
            "severity": "Unknown",
            "symptoms": [f"No documented symptoms recorded for {disease} in the current knowledge base."],
            "cause": "Specific cause details unavailable in local knowledge base.",
            "treatment": "Please consult a local certified agricultural officer or extension centre for verified diagnosis.",
            "pesticides": [],
            "fertilizer": "Consult local agricultural extension advisor for crop-specific nutrient guidance.",
            "prevention": ["Maintain general plant hygiene and monitor crop progress regularly."]
        }
