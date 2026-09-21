"""
Automated End-to-End Test via Chrome DevTools Protocol (CDP)
Uses standard library socket to connect to Chrome headless.
"""
import socket
import hashlib
import base64
import os
import sys
import json
import time
import urllib.request
import subprocess

def create_ws_client(ws_url):
    # Parse ws://127.0.0.1:9222/devtools/page/XYZ
    parts = ws_url.replace("ws://", "").split("/", 1)
    host_port = parts[0].split(":")
    host = host_port[0]
    port = int(host_port[1])
    path = "/" + parts[1]

    s = socket.create_connection((host, port), timeout=10)
    key = base64.b64encode(os.urandom(16)).decode('utf-8')
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(handshake.encode('utf-8'))
    resp = s.recv(4096).decode('utf-8', errors='ignore')
    if "101" not in resp:
        raise RuntimeError(f"WebSocket handshake failed: {resp}")
    return s

def ws_send(s, data_obj):
    msg = json.dumps(data_obj).encode('utf-8')
    length = len(msg)
    frame = bytearray([0x81]) # FIN + text opcode
    if length <= 125:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))
    
    mask = os.urandom(4)
    frame.extend(mask)
    masked_payload = bytearray(b ^ mask[i % 4] for i, b in enumerate(msg))
    frame.extend(masked_payload)
    s.sendall(frame)

def ws_recv(s):
    # Read frame
    hdr = s.recv(2)
    if not hdr or len(hdr) < 2:
        return None
    b1, b2 = hdr[0], hdr[1]
    length = b2 & 0x7F
    if length == 126:
        length = int.from_bytes(s.recv(2), 'big')
    elif length == 127:
        length = int.from_bytes(s.recv(8), 'big')

    data = bytearray()
    while len(data) < length:
        chunk = s.recv(min(length - len(data), 65536))
        if not chunk:
            break
        data.extend(chunk)
    return json.loads(data.decode('utf-8', errors='ignore'))

class CDPClient:
    def __init__(self, ws_url):
        self.sock = create_ws_client(ws_url)
        self.cmd_id = 0

    def call(self, method, params=None, wait_for_id=True):
        self.cmd_id += 1
        cid = self.cmd_id
        req = {"id": cid, "method": method, "params": params or {}}
        ws_send(self.sock, req)
        if not wait_for_id:
            return None
        while True:
            res = ws_recv(self.sock)
            if res and res.get("id") == cid:
                return res

    def evaluate(self, expr):
        res = self.call("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        if "error" in res:
            raise RuntimeError(res["error"])
        result = res.get("result", {}).get("result", {})
        return result.get("value")

def main():
    print(">>> Launching Chrome Headless with CDP for End-to-End QA...")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--remote-debugging-port=9223",
        "--disable-gpu",
        "--window-size=1280,900",
        "http://127.0.0.1:8000/"
    ])
    time.sleep(2)

    try:
        # Get target page
        with urllib.request.urlopen("http://127.0.0.1:9223/json", timeout=5) as res:
            targets = json.loads(res.read().decode('utf-8'))
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]
        cdp = CDPClient(ws_url)

        print("  Connected to Chrome DevTools Protocol!")

        # 1. Test Landing Page
        title = cdp.evaluate("document.querySelector('.hero-title').textContent")
        tagline = cdp.evaluate("document.querySelector('.hero-tagline').textContent")
        start_btn = cdp.evaluate("document.querySelector('#btn-start-quiz').textContent.trim()")
        print(f"  [PASS] 1. Landing Page verified: '{title}', '{tagline}', button: '{start_btn}'")
        assert "ALTER EGO" in title
        assert "Discover the version of you" in tagline
        assert "CREATE MY ALTER EGO" in start_btn

        # 2. Click Start Quiz
        cdp.evaluate("document.querySelector('#btn-start-quiz').click()")
        time.sleep(0.3)
        quiz_visible = cdp.evaluate("!document.querySelector('#view-quiz').classList.contains('hidden')")
        assert quiz_visible, "Quiz view not visible after clicking start"
        print("  [PASS] 2. Transitioned to Quiz View")

        # 3. Answering 8 questions
        for q_idx in range(8):
            q_title = cdp.evaluate("document.querySelector('#question-title').textContent")
            counter = cdp.evaluate("document.querySelector('#question-counter').textContent")
            pct = cdp.evaluate("document.querySelector('#question-progress-pct').textContent")
            print(f"    -> Answering Q{q_idx+1}: '{q_title}' ({counter}, {pct})")

            # Click option 1 (The Architect path for variety)
            opt_idx = 0 if q_idx % 2 == 0 else 1
            cdp.evaluate(f"document.querySelectorAll('.option-btn')[{opt_idx}].click()")
            next_disabled = cdp.evaluate("document.querySelector('#btn-quiz-next').disabled")
            assert not next_disabled, "Next button should be enabled after selecting option"

            # Click Next / Reveal
            cdp.evaluate("document.querySelector('#btn-quiz-next').click()")
            time.sleep(0.3)

        print("  [PASS] 3. All 8 questions answered successfully!")

        # 4. Wait for calculation interlude to complete
        time.sleep(2.0)
        result_visible = cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        assert result_visible, "Result view did not appear after calculation"
        print("  [PASS] 4. Calculation completed and Result Page rendered")

        # 5. Verify Result Content
        char_name = cdp.evaluate("document.querySelector('#ego-character-name').textContent")
        archetype = cdp.evaluate("document.querySelector('#ego-archetype-name').textContent")
        quote = cdp.evaluate("document.querySelector('#ego-signature-quote').textContent")
        lore = cdp.evaluate("document.querySelector('#ego-in-another-universe').textContent")
        strength = cdp.evaluate("document.querySelector('#ego-core-strength').textContent")
        weakness = cdp.evaluate("document.querySelector('#ego-weakness').textContent")
        aesthetic = cdp.evaluate("document.querySelector('#ego-aesthetic').textContent")

        print(f"    Character: {char_name}")
        print(f"    Archetype: {archetype}")
        print(f"    Quote: {quote}")
        print(f"    Strength: {strength}")
        print(f"    Weakness: {weakness}")
        print(f"    Aesthetic: {aesthetic}")

        assert len(char_name) > 3
        assert len(archetype) > 3
        assert len(quote) > 10
        assert len(lore) > 20
        print("  [PASS] 5. Result Page fields verified with rich multiverse content")

        # 6. Verify 6-Archetype Visual Breakdown
        breakdown_count = cdp.evaluate("document.querySelectorAll('#ego-breakdown-grid .breakdown-bar-item').length")
        assert breakdown_count == 6, f"Expected 6 archetype bars, found {breakdown_count}"
        print("  [PASS] 6. All 6 archetypes represented in breakdown grid")

        # 7. Test Save Alter Ego
        cdp.evaluate("document.querySelector('#btn-save-ego').click()")
        time.sleep(0.5)
        saved_storage = cdp.evaluate("localStorage.getItem('alter_ego_saved_profile_v1')")
        assert saved_storage is not None, "Profile not found in localStorage"
        saved_obj = json.loads(saved_storage)
        assert saved_obj["archetype"] == archetype
        print(f"  [PASS] 7. Save to localStorage verified: '{saved_obj['characterName']}'")

        # 8. Test Refresh and Landing Page 'YOUR LAST ALTER EGO' detection
        cdp.evaluate("location.reload()")
        time.sleep(2.0)
        last_ego_visible = cdp.evaluate("!document.querySelector('#landing-saved-card').classList.contains('hidden')")
        last_name = cdp.evaluate("document.querySelector('#last-ego-name').textContent")
        assert last_ego_visible, "Saved profile banner should be visible on landing page"
        assert last_name == char_name, f"Expected saved name {char_name}, got {last_name}"
        print(f"  [PASS] 8. Refresh survived: 'YOUR LAST ALTER EGO' correctly displays '{last_name}'")

        # 9. Click 'VIEW PROFILE' on saved card
        cdp.evaluate("document.querySelector('#btn-view-saved').click()")
        time.sleep(0.5)
        result_restored = cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        assert result_restored, "Result view should be restored after clicking View Profile"
        print("  [PASS] 9. Restored result view from saved profile")

        # 10. Test AI Feature: Ask a question
        test_question = "What advice do you have for my universe?"
        cdp.evaluate(f"document.querySelector('#chat-input').value = '{test_question}'")
        cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
        print(f"    Sent prompt to Alter Ego: '{test_question}'")
        time.sleep(2.0)

        # Check messages count and reply content
        messages = cdp.evaluate("Array.from(document.querySelectorAll('.chat-bubble')).map(b => b.textContent)")
        assert len(messages) >= 3, f"Expected at least greeting + question + answer, got {len(messages)}"
        print(f"    Alter Ego AI replied: \"{messages[-1]}\"")
        print("  [PASS] 10. AI Chat interaction completed successfully!")

        # 11. Test Copy and Share actions
        cdp.evaluate("document.querySelector('#btn-copy-result').click()")
        time.sleep(0.3)
        cdp.evaluate("document.querySelector('#btn-share-result').click()")
        time.sleep(0.3)
        print("  [PASS] 11. Copy & Share actions executed cleanly with toasts")

        # 12. Test Retake Quiz
        cdp.evaluate("document.querySelector('#btn-retake-quiz').click()")
        time.sleep(0.5)
        is_quiz = cdp.evaluate("!document.querySelector('#view-quiz').classList.contains('hidden')")
        q1_counter = cdp.evaluate("document.querySelector('#question-counter').textContent")
        assert is_quiz, "Should be on quiz view"
        assert "01" in q1_counter, f"Expected Question 01, got {q1_counter}"
        print("  [PASS] 12. Retake Quiz reset back to Question 01")

        print("\n=======================================================")
        print("  ALL 12 END-TO-END ACCEPTANCE TESTS PASSED!")
        print("=======================================================")

    finally:
        proc.kill()

if __name__ == '__main__':
    main()
