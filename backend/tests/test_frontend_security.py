import os
import re
import pytest

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIRESTORE_RULES_PATH = os.path.join(WORKSPACE_ROOT, "firestore.rules")
APP_JS_PATH = os.path.join(WORKSPACE_ROOT, "frontend", "js", "app.js")
SCHEMES_JS_PATH = os.path.join(WORKSPACE_ROOT, "frontend", "js", "schemes.js")
AUTH_JS_PATH = os.path.join(WORKSPACE_ROOT, "frontend", "js", "auth.js")


# ============================================================================
# 1. FIRESTORE SECURITY RULES VALIDATION
# ============================================================================

def test_firestore_rules_file_exists():
    """Ensure firestore.rules exists in the repository root."""
    assert os.path.exists(FIRESTORE_RULES_PATH), "firestore.rules file must exist at project root."


def test_firestore_rules_content_and_security_invariants():
    """
    Verify production security constraints in firestore.rules:
    1. rules_version = '2'
    2. Users can only access users/{userId}/scans/{scanId} when request.auth.uid == userId
    3. Default deny on all other paths
    """
    with open(FIRESTORE_RULES_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert "rules_version = '2'" in content
    assert "service cloud.firestore" in content
    assert "match /users/{userId}/scans/{scanId}" in content
    assert "request.auth != null && request.auth.uid == userId" in content
    assert "match /{document=**}" in content
    assert "allow read, write: if false;" in content


# ============================================================================
# 2. FRONTEND DOM XSS DEFENSE VALIDATION
# ============================================================================

def test_app_js_escapes_display_name_in_greeting():
    """
    Ensure app.js sanitizes displayName before inserting into innerHTML.
    """
    with open(APP_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert "escapeHtml(value)" in content, "App module must define an escapeHtml method."
    assert "safeDisplayName = this.escapeHtml(displayName)" in content, "syncUserUI must escape displayName."
    assert "name: safeDisplayName" in content, "Greeting template must receive escaped displayName."


def test_schemes_js_escapes_dynamic_fields_and_sanitizes_urls():
    """
    Ensure schemes.js escapes all dynamic fields and sanitizes external URLs.
    """
    with open(SCHEMES_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert "escapeHtml(value)" in content, "SchemesModule must define an escapeHtml method."
    assert "sanitizeUrl(url)" in content, "SchemesModule must define a sanitizeUrl method."
    
    # URL sanitization regex check in JS
    assert "https?:\\/\\/" in content or "http" in content
    
    # Ensure scheme.name and officialUrl are safely processed
    assert "this.escapeHtml(scheme.name)" in content
    assert "this.sanitizeUrl(scheme.officialUrl)" in content
    assert "this.escapeHtml(scheme.description)" in content


# ============================================================================
# 3. CLIENT SECRETS EXPOSURE AUDIT
# ============================================================================

def test_no_private_api_keys_in_auth_js():
    """
    Verify auth.js only contains public Firebase web config and no private backend keys.
    """
    with open(AUTH_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert "GEMINI_API_KEY" not in content
    assert "SARVAM_API_KEY" not in content
    assert "private_key" not in content
    assert "client_secret" not in content
