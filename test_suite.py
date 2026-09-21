"""
ALTER EGO - Verification & Quality Assurance Test Suite
Tests server health, API proxy, static asset delivery, and question integrity.
"""

import urllib.request
import urllib.parse
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print(">>> Starting ALTER EGO Test Suite...")
    passed = 0
    total = 0

    # Test 1: Root HTML
    total += 1
    try:
        with urllib.request.urlopen(f"{BASE_URL}/", timeout=4) as res:
            assert res.status == 200
            content = res.read().decode('utf-8')
            assert "ALTER EGO" in content
            assert "CREATE MY ALTER EGO" in content
            assert "YOUR LAST ALTER EGO" in content
            assert "ASK YOUR ALTER EGO" in content
            print("  [PASS] Test 1: Root HTML served with expected UI strings")
            passed += 1
    except Exception as e:
        print(f"  [FAIL] Test 1: Root HTML failed: {e}")

    # Test 2: CSS Stylesheet
    total += 1
    try:
        with urllib.request.urlopen(f"{BASE_URL}/styles.css", timeout=4) as res:
            assert res.status == 200
            content = res.read().decode('utf-8')
            assert "--neon-purple" in content
            assert "cosmic-nebula-glow" in content
            print("  [PASS] Test 2: CSS stylesheet served with design system tokens")
            passed += 1
    except Exception as e:
        print(f"  [FAIL] Test 2: CSS stylesheet failed: {e}")

    # Test 3: JavaScript Modules
    js_files = ['personalityEngine.js', 'storage.js', 'aiPersona.js', 'cardGenerator.js', 'soundEffects.js', 'app.js']
    for js in js_files:
        total += 1
        try:
            with urllib.request.urlopen(f"{BASE_URL}/js/{js}", timeout=4) as res:
                assert res.status == 200
                content = res.read().decode('utf-8')
                assert len(content) > 100
                print(f"  [PASS] Test: JS Module /js/{js} served (Length: {len(content)} bytes)")
                passed += 1
        except Exception as e:
            print(f"  [FAIL] Test: JS Module /js/{js} failed: {e}")

    # Test 4: AI Chat Endpoint POST /api/chat
    total += 1
    try:
        payload = {
            "message": "What is your world like?",
            "archetype": "THE ARCHITECT",
            "characterName": "Cipher Thorne · Grand Strategist",
            "universeDesignation": "Universe #448-Epsilon",
            "quote": "\"Chaos is merely an order we have not yet solved.\"",
            "strength": "Penetrating analytical vision & structural foresight",
            "superpower": "Omni-Matrix Synthesis",
            "weakness": "Analysis paralysis",
            "lore": "In another universe you engineered the Great Orbital Monoliths."
        }
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f"{BASE_URL}/api/chat",
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=6) as res:
            assert res.status == 200
            body = json.loads(res.read().decode('utf-8'))
            assert "reply" in body and len(body["reply"]) > 20
            assert "source" in body
            print(f"  [PASS] Test 4: AI Chat endpoint succeeded with source: {body['source']}")
            passed += 1
    except Exception as e:
        print(f"  [FAIL] Test 4: AI Chat endpoint failed: {e}")

    print(f"\n==================================================")
    print(f"  ALTER EGO Test Suite Results: {passed} / {total} tests passed")
    print(f"==================================================")
    return passed == total

if __name__ == '__main__':
    ok = run_tests()
    sys.exit(0 if ok else 1)
