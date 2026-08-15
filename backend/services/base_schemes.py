import json
import logging
import os
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "government_schemes_dataset.json")


class GovernmentSchemesService:
    def __init__(self):
        self._dataset: Optional[Dict[str, Any]] = None
        self._load_local_dataset()

    def _load_local_dataset(self):
        try:
            if os.path.exists(DATASET_PATH):
                with open(DATASET_PATH, "r", encoding="utf-8") as f:
                    self._dataset = json.load(f)
                logger.info("[SchemesService] Loaded verified government schemes catalog.")
            else:
                logger.warning(f"[SchemesService] Schemes dataset not found at {DATASET_PATH}")
                self._dataset = {"categories": [], "schemes": []}
        except Exception as e:
            logger.error(f"[SchemesService] Failed to load schemes dataset: {e}")
            self._dataset = {"categories": [], "schemes": []}

    def get_categories(self) -> List[Dict[str, Any]]:
        if not self._dataset:
            self._load_local_dataset()
        categories = self._dataset.get("categories", [])
        schemes = self._dataset.get("schemes", [])

        # Dynamically compute scheme count per category
        for cat in categories:
            cat_name = cat.get("name", "")
            cat["count"] = sum(1 for s in schemes if s.get("category", "").lower() == cat_name.lower())

        return categories

    def get_schemes(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        level: Optional[str] = None,
        state: Optional[str] = None,
        crop: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if not self._dataset:
            self._load_local_dataset()

        schemes = self._dataset.get("schemes", [])
        results = []

        q_lower = query.strip().lower() if query else None
        cat_lower = category.strip().lower() if category and category != "all" else None
        lvl_lower = level.strip().lower() if level and level != "all" else None
        state_lower = state.strip().lower() if state and state != "all" else None
        crop_lower = crop.strip().lower() if crop and crop != "all" else None

        for s in schemes:
            # Query filter (matches name, shortName, description, category, or benefits)
            if q_lower:
                name_match = q_lower in s.get("name", "").lower() or q_lower in s.get("shortName", "").lower()
                desc_match = q_lower in s.get("description", "").lower()
                cat_match = q_lower in s.get("category", "").lower()
                benefit_match = any(q_lower in b.lower() for b in s.get("benefits", []))
                crop_match = any(q_lower in c.lower() for c in s.get("applicableCrops", []))
                if not (name_match or desc_match or cat_match or benefit_match or crop_match):
                    continue

            # Category filter
            if cat_lower:
                if cat_lower not in s.get("category", "").lower():
                    continue

            # Level filter (Central vs State)
            if lvl_lower:
                if lvl_lower != s.get("level", "").lower():
                    continue

            # State filter
            if state_lower and state_lower != "all india":
                scheme_state = s.get("state", "").lower()
                if scheme_state != "all india" and state_lower not in scheme_state:
                    continue

            # Crop filter
            if crop_lower:
                app_crops = [c.lower() for c in s.get("applicableCrops", [])]
                if "all crops" not in app_crops and not any(crop_lower in c for c in app_crops):
                    continue

            results.append(s)

        return results

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        if not self._dataset:
            self._load_local_dataset()

        schemes = self._dataset.get("schemes", [])
        for s in schemes:
            if s.get("id", "").lower() == scheme_id.strip().lower():
                return s
        return None

    def check_eligibility(self, scheme_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses eligibility against official criteria based on farmer's answers.
        Returns matched and unmatched criteria with direct official guidance.
        """
        scheme = self.get_scheme_by_id(scheme_id)
        if not scheme:
            return {
                "schemeId": scheme_id,
                "eligible": False,
                "statusText": "Scheme not found",
                "matchedCriteria": [],
                "unmatchedCriteria": ["The requested scheme record could not be located."],
                "recommendation": "Please select a valid government scheme.",
                "officialUrl": "https://myscheme.gov.in/"
            }

        matched = []
        unmatched = []

        # Common evaluation parameters
        is_landowner = answers.get("isLandowner", True)
        has_aadhaar = answers.get("hasAadhaar", True)
        has_bank_account = answers.get("hasBankAccount", True)
        is_income_tax_payer = answers.get("isIncomeTaxPayer", False)
        state = answers.get("state", "Maharashtra")

        # Specific scheme evaluations
        if scheme_id == "pm-kisan":
            if is_landowner:
                matched.append("Applicant holds agricultural cultivable land in their name.")
            else:
                unmatched.append("Cultivable landholding title is required for PM-KISAN.")

            if has_aadhaar and has_bank_account:
                matched.append("Aadhaar-linked bank account is available for Direct Benefit Transfer (DBT).")
            else:
                unmatched.append("Aadhaar linked to an active bank account is mandatory.")

            if is_income_tax_payer:
                unmatched.append("Institutional landholders and income tax payees are excluded under official PM-KISAN guidelines.")
            else:
                matched.append("Non-taxpayer criteria met.")

        elif scheme_id == "pmfby":
            matched.append("Farmer cultivates notified crops in an insurable season.")
            if has_aadhaar:
                matched.append("Aadhaar verification available.")
            else:
                unmatched.append("Aadhaar is required for policy issuance.")

        elif scheme_id == "namo-shetkari-yojana":
            if state.lower() == "maharashtra":
                matched.append("Land is located within Maharashtra State jurisdiction.")
            else:
                unmatched.append("Namo Shetkari Yojana is exclusive to agricultural landholders in Maharashtra.")

            if is_landowner and not is_income_tax_payer:
                matched.append("Meets PM-KISAN beneficiary baseline requirement for Maharashtra.")
            else:
                unmatched.append("Requires active eligibility under PM-KISAN.")

        elif scheme_id in ["pmksy-pdmc", "solar-pump-maharashtra", "magel-tyala-shettale"]:
            has_water_source = answers.get("hasWaterSource", True)
            if is_landowner:
                matched.append("Verified agricultural land title.")
            else:
                unmatched.append("Clear landownership title (7/12 extract) is required.")

            if has_water_source or scheme_id == "magel-tyala-shettale":
                matched.append("Water source or site feasibility requirement met.")
            else:
                unmatched.append("Assured water source is necessary for micro-irrigation/solar pump installation.")

        else:
            # General baseline check
            if is_landowner:
                matched.append("Agricultural landownership verified.")
            if has_aadhaar and has_bank_account:
                matched.append("Aadhaar and banking documentation complete.")

        is_eligible = len(unmatched) == 0

        status_text = (
            "You appear to meet the primary criteria based on official guidelines"
            if is_eligible
            else "You may not meet some of the required official eligibility conditions"
        )

        recommendation = (
            "You are likely eligible for this scheme. Proceed to the official portal to complete registration with your 7/12 and Aadhaar details."
            if is_eligible
            else "Please review the unmatched criteria above or consult your local Taluka Agriculture Officer / CSC center."
        )

        return {
            "schemeId": scheme_id,
            "eligible": is_eligible,
            "statusText": status_text,
            "matchedCriteria": matched,
            "unmatchedCriteria": unmatched,
            "recommendation": recommendation,
            "officialUrl": scheme.get("officialUrl", "https://myscheme.gov.in/")
        }


# Singleton instance
schemes_service = GovernmentSchemesService()
