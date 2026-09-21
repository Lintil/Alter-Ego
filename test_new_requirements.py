"""
End-to-End Acceptance Test for New Requirements via Chrome DevTools Protocol
Tests:
1. Home Navigation from Quiz & Result
2. Result Persistence across Refresh
3. 6 Questions Limit, Decrementing Count, and Duplicate/Empty Question Handling
4. Persistence of Question Counter across Refresh
5. Lock state after 6 questions
6. Question counter reset on creating a new alter ego
7. Mobile Responsiveness at 375px
"""

import socket
import base64
import os
import sys
import json
import time
import urllib.request
import subprocess

def create_ws_client(ws_url):
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
    frame = bytearray([0x81])
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
    print(">>> Launching Chrome Headless for Detailed Acceptance QA...")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--remote-debugging-port=9224",
        "--disable-gpu",
        "--window-size=1280,900",
        "http://127.0.0.1:8000/"
    ])
    time.sleep(2)

    try:
        with urllib.request.urlopen("http://127.0.0.1:9224/json", timeout=5) as res:
            targets = json.loads(res.read().decode('utf-8'))
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]
        cdp = CDPClient(ws_url)

        # Clear any prior storage
        cdp.evaluate("localStorage.clear()")
        cdp.evaluate("location.reload()")
        time.sleep(1.5)

        # -------------------------------------------------------------
        # TEST 1: Home Navigation from Quiz without deleting anything
        # -------------------------------------------------------------
        print("\n--- TEST 1: Home Navigation from Quiz ---")
        cdp.evaluate("document.querySelector('#btn-start-quiz').click()")
        time.sleep(0.3)
        assert cdp.evaluate("!document.querySelector('#view-quiz').classList.contains('hidden')")
        
        # Select option 0 for Q1
        cdp.evaluate("document.querySelectorAll('.option-btn')[0].click()")
        
        # Click Quiz Home button
        cdp.evaluate("document.querySelector('#btn-quiz-home').click()")
        time.sleep(0.3)
        assert cdp.evaluate("!document.querySelector('#view-landing').classList.contains('hidden')")
        print("  [PASS] Successfully returned to Home from Quiz via #btn-quiz-home")

        # -------------------------------------------------------------
        # TEST 2: Complete Quiz & Generate Alter Ego
        # -------------------------------------------------------------
        print("\n--- TEST 2: Complete Quiz & Generate Result ---")
        cdp.evaluate("document.querySelector('#btn-start-quiz').click()")
        time.sleep(0.3)

        for q in range(8):
            opt_idx = (q % 4)
            cdp.evaluate(f"document.querySelectorAll('.option-btn')[{opt_idx}].click()")
            cdp.evaluate("document.querySelector('#btn-quiz-next').click()")
            time.sleep(0.25)

        time.sleep(2.0)
        assert cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        char_name = cdp.evaluate("document.querySelector('#ego-character-name').textContent")
        archetype = cdp.evaluate("document.querySelector('#ego-archetype-name').textContent")
        quote = cdp.evaluate("document.querySelector('#ego-signature-quote').textContent")
        lore = cdp.evaluate("document.querySelector('#ego-in-another-universe').textContent")
        print(f"  [PASS] Result generated: '{char_name}' ({archetype})")
        assert len(char_name) > 0 and len(quote) > 0 and len(lore) > 0

        # -------------------------------------------------------------
        # TEST 3: Result Persistence on Browser Refresh
        # -------------------------------------------------------------
        print("\n--- TEST 3: Result Persistence on Refresh ---")
        cdp.evaluate("location.reload()")
        time.sleep(2.0)
        is_result_view = cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        restored_name = cdp.evaluate("document.querySelector('#ego-character-name').textContent")
        assert is_result_view, "Result view was not restored on refresh!"
        assert restored_name == char_name, f"Expected {char_name}, got {restored_name}"
        print(f"  [PASS] Refresh restored full result page directly: '{restored_name}'")

        # -------------------------------------------------------------
        # TEST 4: Home Navigation from Result & Viewing again
        # -------------------------------------------------------------
        print("\n--- TEST 4: Home Navigation from Result View ---")
        cdp.evaluate("document.querySelector('#btn-result-home').click()")
        time.sleep(0.3)
        assert cdp.evaluate("!document.querySelector('#view-landing').classList.contains('hidden')")
        last_card_visible = cdp.evaluate("!document.querySelector('#landing-saved-card').classList.contains('hidden')")
        assert last_card_visible, "Saved Alter Ego card not visible on landing page"
        
        # Click view profile
        cdp.evaluate("document.querySelector('#btn-view-saved').click()")
        time.sleep(0.3)
        assert cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        print("  [PASS] Home navigation preserves saved result; 'VIEW PROFILE' reopens it")

        # -------------------------------------------------------------
        # TEST 5: Ask Your Alter Ego - 6 Questions Limit & Rules
        # -------------------------------------------------------------
        print("\n--- TEST 5: 6 Questions per Alter Ego Rules ---")
        initial_counter = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "6/6" in initial_counter, f"Expected 6/6, got {initial_counter}"
        print(f"  Initial counter: {initial_counter}")

        # Rule A: Empty questions don't count
        cdp.evaluate("document.querySelector('#chat-input').value = '   '")
        cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
        time.sleep(0.3)
        counter_after_empty = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "6/6" in counter_after_empty, f"Empty question decremented counter! Got {counter_after_empty}"
        print("  [PASS] Empty question correctly ignored (counter remained 6/6)")

        # Ask Question 1 (Valid)
        q1 = "What is your world like?"
        cdp.evaluate(f"document.querySelector('#chat-input').value = '{q1}'")
        cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
        time.sleep(1.8)
        counter_q1 = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "5/6" in counter_q1, f"Expected 5/6, got {counter_q1}"
        reply_1 = cdp.evaluate("Array.from(document.querySelectorAll('.chat-bubble')).pop().textContent")
        print(f"  Q1 answered. Counter: {counter_q1}. Reply: \"{reply_1[:80]}...\"")

        # Rule B: Identical repeated questions don't count against limit
        cdp.evaluate(f"document.querySelector('#chat-input').value = '{q1}'")
        cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
        time.sleep(1.8)
        counter_repeat = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "5/6" in counter_repeat, f"Repeated question decremented counter! Got {counter_repeat}"
        print("  [PASS] Identical repeated question correctly did NOT decrement counter (remained 5/6)")

        # Ask Question 2
        q2 = "What should I do when I feel stuck?"
        cdp.evaluate(f"document.querySelector('#chat-input').value = '{q2}'")
        cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
        time.sleep(1.8)
        counter_q2 = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "4/6" in counter_q2, f"Expected 4/6, got {counter_q2}"
        print(f"  Q2 answered. Counter: {counter_q2}")

        # Rule C: Counter and Chat History survive refresh
        print("\n--- TEST 6: Refreshing Preserves Counter & Chat History ---")
        cdp.evaluate("location.reload()")
        time.sleep(2.0)
        assert cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        refreshed_counter = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        assert "4/6" in refreshed_counter, f"Expected 4/6 after refresh, got {refreshed_counter}"
        msg_count = cdp.evaluate("document.querySelectorAll('.chat-bubble').length")
        assert msg_count >= 5, f"Expected chat history preserved, found {msg_count} bubbles"
        print(f"  [PASS] Refreshed successfully: Counter preserved ({refreshed_counter}), history intact ({msg_count} bubbles)")

        # Ask Questions 3, 4, 5, 6
        questions = [
            "What is your biggest regret?",
            "Do you believe in love and friendship?",
            "What is your greatest superpower and strength?",
            "What is your biggest weakness?"
        ]

        expected_counters = ["3/6", "2/6", "1/6", "0/6"]
        for idx, (question_text, exp_c) in enumerate(zip(questions, expected_counters)):
            cdp.evaluate(f"document.querySelector('#chat-input').value = '{question_text}'")
            cdp.evaluate("document.querySelector('#chat-form').dispatchEvent(new Event('submit'))")
            time.sleep(1.8)
            current_c = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
            assert exp_c in current_c, f"Expected {exp_c}, got {current_c}"
            print(f"  Q{idx+3} answered. Counter: {current_c}")

        # Rule D: Input and buttons are disabled after 6 questions, limit notice shown
        print("\n--- TEST 7: Lockout & Notice after 6 Questions ---")
        input_disabled = cdp.evaluate("document.querySelector('#chat-input').disabled")
        btn_disabled = cdp.evaluate("document.querySelector('#btn-chat-send').disabled")
        notice_visible = cdp.evaluate("!document.querySelector('#chat-limit-notice').classList.contains('hidden')")
        notice_text = cdp.evaluate("document.querySelector('#chat-limit-notice span').textContent")

        assert input_disabled, "Input should be disabled after 6 questions"
        assert btn_disabled, "Send button should be disabled after 6 questions"
        assert notice_visible, "Limit notice banner should be visible"
        assert "You've used all 6 questions for this alter ego" in notice_text
        print(f"  [PASS] Lockout active: Input disabled, notice shown: '{notice_text}'")

        # Refresh while at 0/6 questions -> verify lockout persists
        cdp.evaluate("location.reload()")
        time.sleep(2.0)
        input_disabled_after_refresh = cdp.evaluate("document.querySelector('#chat-input').disabled")
        notice_after_refresh = cdp.evaluate("!document.querySelector('#chat-limit-notice').classList.contains('hidden')")
        assert input_disabled_after_refresh, "Input must stay disabled after refresh when 0/6"
        assert notice_after_refresh, "Notice must stay visible after refresh when 0/6"
        print("  [PASS] Lockout and 0/6 counter persisted across refresh!")

        # -------------------------------------------------------------
        # TEST 8: Generating a new Alter Ego resets count to 6/6
        # -------------------------------------------------------------
        print("\n--- TEST 8: Counter Resets to 6/6 for New Alter Ego ---")
        cdp.evaluate("document.querySelector('#btn-retake-quiz').click()")
        time.sleep(0.4)
        assert cdp.evaluate("!document.querySelector('#view-quiz').classList.contains('hidden')")

        # Answer with all option 3s
        for q in range(8):
            cdp.evaluate("document.querySelectorAll('.option-btn')[3].click()")
            cdp.evaluate("document.querySelector('#btn-quiz-next').click()")
            time.sleep(0.25)

        time.sleep(2.0)
        assert cdp.evaluate("!document.querySelector('#view-result').classList.contains('hidden')")
        new_counter = cdp.evaluate("document.querySelector('#chat-remaining-text').textContent")
        new_input_enabled = cdp.evaluate("!document.querySelector('#chat-input').disabled")
        new_notice_hidden = cdp.evaluate("document.querySelector('#chat-limit-notice').classList.contains('hidden')")

        assert "6/6" in new_counter, f"Expected counter reset to 6/6, got {new_counter}"
        assert new_input_enabled, "Input should be enabled for new alter ego"
        assert new_notice_hidden, "Limit notice should be hidden for new alter ego"
        print(f"  [PASS] New Alter Ego generated: Counter reset to {new_counter}, input re-enabled!")

        # -------------------------------------------------------------
        # TEST 9: Mobile Viewport Responsiveness
        # -------------------------------------------------------------
        print("\n--- TEST 9: Mobile Responsiveness (375x667) ---")
        cdp.call("Emulation.setDeviceMetricsOverride", {
            "width": 375,
            "height": 667,
            "deviceScaleFactor": 2,
            "mobile": True
        })
        time.sleep(0.5)
        body_scroll_w = cdp.evaluate("document.body.scrollWidth")
        window_w = cdp.evaluate("window.innerWidth")
        print(f"  Mobile viewport check: innerWidth={window_w}, scrollWidth={body_scroll_w}")
        assert body_scroll_w <= window_w + 5, f"Horizontal scroll detected on mobile! {body_scroll_w} > {window_w}"
        print("  [PASS] Mobile layout responsive with no horizontal overflow!")

        print("\n=======================================================")
        print("  ALL 9 SPECIFIC QA ACCEPTANCE TESTS PASSED!")
        print("=======================================================")

    finally:
        proc.kill()

if __name__ == '__main__':
    main()
