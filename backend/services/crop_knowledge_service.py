import os
import json
import re
import logging
from typing import Dict, Any, Optional, Tuple, List

logger = logging.getLogger("smart_ag_backend.crop_knowledge_service")

# Static mapping for standard agricultural aliases to canonical DB crop names
CROP_ALIASES: Dict[str, str] = {
    "soyabean": "Soybean",
    "soya bean": "Soybean",
    "soybean": "Soybean",
    "jowar": "Sorghum (Jowar)",
    "sorghum": "Sorghum (Jowar)",
    "sorghum jowar": "Sorghum (Jowar)",
    "bajra": "Pearl Millet (Bajra)",
    "pearl millet": "Pearl Millet (Bajra)",
    "pearl millet bajra": "Pearl Millet (Bajra)",
    "corn": "Corn (Maize)",
    "maize": "Corn (Maize)",
    "corn maize": "Corn (Maize)",
    "paddy": "Rice",
    "rice": "Rice",
    "tur": "Pigeon Pea (Tur)",
    "arhar": "Pigeon Pea (Tur)",
    "red gram": "Pigeon Pea (Tur)",
    "pigeon pea": "Pigeon Pea (Tur)",
    "pigeon pea tur": "Pigeon Pea (Tur)",
    "moong": "Green Gram (Moong)",
    "mung": "Green Gram (Moong)",
    "green gram": "Green Gram (Moong)",
    "green gram moong": "Green Gram (Moong)",
    "urad": "Black Gram (Urad)",
    "black gram": "Black Gram (Urad)",
    "black gram urad": "Black Gram (Urad)",
    "gram": "Chickpea (Gram)",
    "chana": "Chickpea (Gram)",
    "chickpea": "Chickpea (Gram)",
    "chickpea gram": "Chickpea (Gram)",
    "bhindi": "Okra (Bhindi)",
    "okra": "Okra (Bhindi)",
    "okra bhindi": "Okra (Bhindi)",
    "capsicum": "Bell Pepper",
    "pepper": "Bell Pepper",
    "bell pepper": "Bell Pepper",
    "pepper bell": "Bell Pepper",
    "brinjal": "Brinjal",
    "eggplant": "Brinjal",
    "aubergine": "Brinjal",
    "cotton": "Cotton",
    "sugarcane": "Sugarcane",
    "wheat": "Wheat",
    "apple": "Apple",
    "cherry": "Cherry",
    "grape": "Grape",
    "orange": "Orange",
    "peach": "Peach",
    "potato": "Potato",
    "squash": "Squash",
    "strawberry": "Strawberry",
    "tomato": "Tomato",
    "cabbage": "Cabbage",
    "cauliflower": "Cauliflower",
    "groundnut": "Groundnut",
    "peanut": "Groundnut",
    "onion": "Onion",
}


def normalize_str(s: str) -> str:
    """
    Safely normalize string for indexing and fuzzy comparison:
    - lowercase
    - treat underscores and hyphens as spaces
    - remove punctuation
    - normalize multiple spaces and trim
    """
    if not s:
        return ""
    s = s.lower().strip()
    s = re.sub(r"[\s_\-]+", " ", s)
    s = re.sub(r"[^\w\s]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def strip_parentheses(s: str) -> str:
    """Remove parenthetical descriptions (e.g. '(Bajra)', '(Green Ear Disease)')."""
    return re.sub(r"\s*\([^)]*\)", "", s).strip()


class CropKnowledgeService:
    """
    Authoritative Crop Disease Knowledge Service.
    Loads and caches crop_disease_database.json, normalizes crop & disease inputs,
    and provides verified agricultural recommendations.
    """
    _instance: Optional["CropKnowledgeService"] = None
    _cached_database: Optional[Dict[str, Any]] = None

    def __init__(self, database_path: Optional[str] = None):
        if database_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            database_path = os.path.join(base_dir, "data", "crop_disease_database.json")
        
        self.database_path = database_path
        self._database = self._load_and_validate_database()
        self._build_indexes()

    def _load_and_validate_database(self) -> Dict[str, Any]:
        """
        Load crop_disease_database.json and strictly validate structure.
        Raises ValueError or RuntimeError on invalid or corrupted files.
        """
        if not os.path.exists(self.database_path):
            logger.error(f"[CropKnowledgeService] Database file not found at {self.database_path}")
            raise FileNotFoundError(f"Crop knowledge database file not found at: {self.database_path}")

        try:
            with open(self.database_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            logger.error(f"[CropKnowledgeService] Failed to parse JSON database at {self.database_path}: {e}")
            raise ValueError(f"Corrupted or invalid JSON in crop knowledge database: {e}") from e

        if not isinstance(data, dict) or len(data) == 0:
            raise ValueError(f"Crop knowledge database at {self.database_path} must be a non-empty JSON object.")

        # Validate schema of entries
        required_keys = {"crop", "disease", "severity", "treatment"}
        for key, record in data.items():
            if not isinstance(record, dict):
                raise ValueError(f"Invalid record under key '{key}': expected JSON object.")
            missing = required_keys - set(record.keys())
            if missing:
                raise ValueError(f"Record under key '{key}' missing required fields: {missing}")

        return data

    def _build_indexes(self):
        """
        Build optimized multi-level lookup indexes.
        """
        self.key_index: Dict[str, Dict[str, Any]] = {}
        self.crop_disease_index: Dict[Tuple[str, str], Dict[str, Any]] = {}
        self.crop_records: Dict[str, List[Tuple[Dict[str, Any], set]]] = {}

        for key, record in self._database.items():
            self.key_index[key] = record
            self.key_index[normalize_str(key)] = record

            crop_name = record.get("crop", "")
            disease_name = record.get("disease", "")

            norm_crop = normalize_str(crop_name)
            norm_disease = normalize_str(disease_name)

            self.crop_disease_index[(crop_name, disease_name)] = record
            self.crop_disease_index[(norm_crop, norm_disease)] = record

            if crop_name not in self.crop_records:
                self.crop_records[crop_name] = []

            # Generate recognizable disease name variants
            variants = {
                norm_disease,
                normalize_str(strip_parentheses(disease_name)),
            }
            if "___" in key:
                variants.add(normalize_str(key.split("___")[-1]))
            if "/" in disease_name:
                for part in disease_name.split("/"):
                    variants.add(normalize_str(part))

            self.crop_records[crop_name].append((record, variants))

    def get_knowledge_record(self, crop: str, disease: str) -> Optional[Tuple[Dict[str, Any], str]]:
        """
        Look up verified agricultural knowledge record for a crop and disease pair.
        Returns:
            (matching_record, match_type) where match_type is 'exact', 'normalized', or 'alias'.
            Returns None if no reliable match exists.
        """
        if not crop or not disease:
            return None

        crop_clean = crop.strip()
        disease_clean = disease.strip()

        # Healthy plant detection check
        if disease_clean.lower() == "healthy":
            # Search if crop has a healthy record in DB, else caller handles fallback
            pass

        # 1. Exact key match (e.g. Soybean___Rust)
        exact_key = f"{crop_clean}___{disease_clean}"
        if exact_key in self.key_index:
            return (self.key_index[exact_key], "exact")

        # 2. Exact tuple match (crop, disease)
        if (crop_clean, disease_clean) in self.crop_disease_index:
            return (self.crop_disease_index[(crop_clean, disease_clean)], "exact")

        norm_crop = normalize_str(crop_clean)
        norm_disease = normalize_str(disease_clean)

        # 3. Normalized exact match
        if (norm_crop, norm_disease) in self.crop_disease_index:
            return (self.crop_disease_index[(norm_crop, norm_disease)], "normalized")

        norm_key = f"{norm_crop} {norm_disease}"
        if norm_key in self.key_index:
            return (self.key_index[norm_key], "normalized")

        # 4. Resolve Canonical Crop via alias dictionary
        canonical_crop = None
        is_alias = False

        if norm_crop in CROP_ALIASES:
            canonical_crop = CROP_ALIASES[norm_crop]
            is_alias = (canonical_crop.lower() != crop_clean.lower())
        else:
            for alias, target in CROP_ALIASES.items():
                if alias == norm_crop or alias in norm_crop:
                    canonical_crop = target
                    is_alias = True
                    break

        if not canonical_crop:
            for db_crop in self.crop_records:
                if normalize_str(db_crop) == norm_crop or norm_crop in normalize_str(db_crop):
                    canonical_crop = db_crop
                    is_alias = (db_crop.lower() != crop_clean.lower())
                    break

        if not canonical_crop:
            return None

        records_for_crop = self.crop_records.get(canonical_crop, [])
        clean_input_disease = normalize_str(strip_parentheses(disease_clean))

        # 5. Direct / variant match on disease within canonical crop
        for record, variants in records_for_crop:
            if norm_disease in variants or clean_input_disease in variants:
                match_type = "alias" if is_alias else "normalized"
                return (record, match_type)

        # 6. High-similarity substring match (e.g. 'Soybean Rust' matching 'Rust' or 'Downy Mildew' matching 'Downy Mildew (Green Ear Disease)')
        for record, variants in records_for_crop:
            for v in variants:
                if (norm_disease and norm_disease in v) or (v and v in norm_disease) or (clean_input_disease and clean_input_disease in v) or (v and v in clean_input_disease):
                    match_type = "alias" if is_alias else "normalized"
                    return (record, match_type)

        return None

    @staticmethod
    def get_healthy_fallback() -> Dict[str, Any]:
        """
        Standardized safe generic healthy crop result.
        """
        return {
            "severity": "None",
            "symptoms": [],
            "cause": "",
            "treatment": "No disease treatment is indicated based on this diagnosis. Continue normal crop monitoring and follow local agronomic guidance.",
            "pesticides": [],
            "fertilizer": "Follow crop-specific nutrient recommendations based on soil testing and local agricultural guidance.",
            "prevention": [
                "Monitor the crop regularly",
                "Maintain field sanitation",
                "Follow locally recommended crop management practices"
            ],
            "sources": [],
            "recommendationsVerified": False,
            "knowledgeMatch": False,
            "knowledgeMatchType": None
        }

    @staticmethod
    def get_unmatched_fallback() -> Dict[str, Any]:
        """
        Standardized non-hallucinated fallback when Gemini detects a condition not in the database.
        """
        return {
            "symptoms": [],
            "cause": "",
            "severity": None,
            "treatment": "Detailed verified guidance for this diagnosis is not yet available in the agricultural knowledge database.",
            "pesticides": [],
            "fertilizer": "",
            "prevention": [],
            "sources": [],
            "recommendationsVerified": False,
            "knowledgeMatch": False,
            "knowledgeMatchType": None
        }

    def get_recommendations(self, crop: str, disease: str) -> Dict[str, Any]:
        """
        Backward compatible helper matching the legacy KnowledgeService interface.
        """
        res = self.get_knowledge_record(crop, disease)
        if res:
            record, _ = res
            return record

        if disease and disease.lower() == "healthy":
            return self.get_healthy_fallback()

        fallback = self.get_unmatched_fallback()
        fallback["crop"] = crop
        fallback["disease"] = disease
        return fallback


# Singleton factory
_service_instance: Optional[CropKnowledgeService] = None

def get_crop_knowledge_service(database_path: Optional[str] = None) -> CropKnowledgeService:
    global _service_instance
    if _service_instance is None or database_path is not None:
        _service_instance = CropKnowledgeService(database_path)
    return _service_instance
