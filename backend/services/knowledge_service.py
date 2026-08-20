"""
Knowledge Service module for backward compatibility and centralized access.
Re-exports CropKnowledgeService and provides seamless database lookup.
"""

from services.crop_knowledge_service import (
    CropKnowledgeService,
    get_crop_knowledge_service,
    CROP_ALIASES,
    normalize_str,
    strip_parentheses
)

# Alias for full backward compatibility
KnowledgeService = CropKnowledgeService

__all__ = [
    "CropKnowledgeService",
    "KnowledgeService",
    "get_crop_knowledge_service",
    "CROP_ALIASES",
    "normalize_str",
    "strip_parentheses"
]
