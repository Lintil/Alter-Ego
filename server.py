#!/usr/bin/env python3
"""
ALTER EGO - Secure Backend Server
Serves static files and provides a secure AI proxy endpoint for /api/chat.
Never exposes API keys to client-side code.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8000))
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

class AlterEgoHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers where appropriate
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_body.decode('utf-8'))
            except Exception:
                self.send_error_response(400, "Invalid JSON payload")
                return

            reply, source = self.handle_ai_chat(data)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response_data = {
                'reply': reply,
                'source': source
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            self.send_error(404, "Endpoint not found")

    def handle_ai_chat(self, data):
        message = data.get('message', '').strip()
        archetype = data.get('archetype', 'THE VISIONARY')
        character_name = data.get('characterName', 'Alter Ego')
        universe = data.get('universeDesignation', 'Universe #000')
        personality = data.get('personality', 'Intelligent, thoughtful')
        strength = data.get('strength', '')
        superpower = data.get('superpower', '')
        weakness = data.get('weakness', '')
        hidden_trait = data.get('hiddenTrait', '')
        aesthetic = data.get('aesthetic', '')
        lore = data.get('lore', '')
        quote = data.get('quote', '')

        system_persona = (
            f"You are {character_name}, an alternate-universe incarnation of the user living in {universe}.\n"
            f"Archetype: {archetype}. Personality traits: {personality}.\n"
            f"Core strength: '{strength}'. Superpower: '{superpower}'. Weakness: '{weakness}'. Hidden trait: '{hidden_trait}'.\n"
            f"Aesthetic: '{aesthetic}'. Lore: '{lore}'. Signature quote: {quote}.\n"
            f"CRITICAL INSTRUCTIONS:\n"
            f"1. Answer the user's specific question directly through your unique character perspective and alternate universe.\n"
            f"2. Do NOT give generic motivational speeches or platitudes. Be authentic, evocative, and address the exact topic asked.\n"
            f"3. Keep your response concise (2-4 sentences). Never break character."
        )

        # 1. Try Gemini API if key is present
        if GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": f"System Persona Instructions:\n{system_persona}\n\nUser Question: {message}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.85,
                        "maxOutputTokens": 250
                    }
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=8) as res:
                    res_body = json.loads(res.read().decode('utf-8'))
                    candidates = res_body.get('candidates', [])
                    if candidates:
                        reply_text = candidates[0]['content']['parts'][0]['text'].strip()
                        return reply_text, 'gemini-live-api'
            except Exception as e:
                print(f"[Gemini API Call Failed]: {e}", file=sys.stderr)

        # 2. Try OpenAI API if key is present
        if OPENAI_API_KEY:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_persona},
                        {"role": "user", "content": message}
                    ],
                    "max_tokens": 250,
                    "temperature": 0.85
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {OPENAI_API_KEY}"
                    },
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=8) as res:
                    res_body = json.loads(res.read().decode('utf-8'))
                    choices = res_body.get('choices', [])
                    if choices:
                        reply_text = choices[0]['message']['content'].strip()
                        return reply_text, 'openai-live-api'
            except Exception as e:
                print(f"[OpenAI API Call Failed]: {e}", file=sys.stderr)

        # 3. Server-side intelligent category-aware fallback
        q = message.lower()
        if any(w in q for w in ['world', 'universe', 'environment', 'where', 'sky', 'planet', 'city', 'what is it like', 'reality']):
            world_replies = {
                'THE DREAM CHASER': f"In {universe}, the sky breathes with lavender twilight and ambient star dust. Using my {strength.lower()}, I compose light symphonies across the resonance domes, though my weakness—{weakness.lower()}—often makes me stare across the void toward your coordinates.",
                'THE ARCHITECT': f"In {universe}, everything is balanced on geometric gravitational lattices. With my {strength.lower()}, I govern the structural matrices of our sector, though my weakness—{weakness.lower()}—means I sometimes over-calculate instead of simply living.",
                'THE EXPLORER': f"Out on the edge of {universe}, the winds carry cobalt quartz and the frontiers are limitless. Navigating through {strength.lower()} keeps my skiff ahead of the solar drift, even if my restlessness—{weakness.lower()}—keeps me from staying docked for long.",
                'THE CATALYST': f"The atmosphere here in {universe} is charged with pure neon electricity and kinetic momentum! My {strength.lower()} sparked our colonial renaissance, though my weakness—{weakness.lower()}—means I burn hotter than the stars themselves.",
                'THE GUARDIAN': f"Here in {universe}, I watch over the Haven Canopy beneath warm starlight. My {strength.lower()} preserves safe sanctuary for thousands, though carrying the hidden trait of {hidden_trait.lower()} reminds me how heavy the shield can be.",
                'THE VISIONARY': f"In {universe}, time refracts like a prism through tachyon conduits. My {strength.lower()} lets me perceive tomorrow's dawn before others notice the dark, even if {weakness.lower()} makes me feel like a wanderer from another era."
            }
            return world_replies.get(archetype, f"Across {universe}, our reality branches directly from the courage you held inside."), 'server-multiverse-engine'

        if any(w in q for w in ['stuck', 'lost', 'what should i do', 'advice', 'help', 'fail', 'fear', 'afraid', 'doubt']):
            advice_replies = {
                'THE DREAM CHASER': f"When you feel paralyzed, remember that creation begins in the dark. Stop demanding that your next step makes logical sense to others, and align with your {strength.lower()}. {quote}",
                'THE ARCHITECT': f"When a structure fractures, you isolate the primary variable and simplify. Rely on your {strength.lower()}; do not let panic cloud the blueprint. {quote}",
                'THE EXPLORER': f"You feel stuck because you are waiting for a paved road where only uncharted terrain exists. Take one unplanned leap and let your void instinct take over. {quote}",
                'THE CATALYST': f"Stop waiting for permission. The fire is in your hands right now—activate your {strength.lower()} and make one bold move that breaks the stagnation today. {quote}",
                'THE GUARDIAN': f"Lower your shoulders and breathe. You have been shielding everyone else while your own foundation aches. Rest your core; your strength—{strength.lower()}—will endure. {quote}",
                'THE VISIONARY': f"The obstacle in front of you is only a single waypoint in an evolving arc. Shift your vantage point using {strength.lower()}. The future has already solved this equation. {quote}"
            }
            return advice_replies.get(archetype, f"Rely on our shared core strength: {strength}. {quote}"), 'server-multiverse-engine'

        if any(w in q for w in ['regret', 'mistake', 'past', 'wrong', 'guilt']):
            return f"In {universe}, my greatest trial was confronting my weakness: {weakness.lower()}. Yet without that fracture, my hidden trait—{hidden_trait.lower()}—would have remained buried. Do not let your past mistakes define your orbit.", 'server-multiverse-engine'

        if any(w in q for w in ['love', 'lonely', 'alone', 'friend', 'relationship']):
            return f"Connection across the multiverse is quantum entanglement of the spirit. Behind my title as {character_name}, my hidden trait—{hidden_trait.lower()}—always craved genuine sanctuary. When you find authentic kinship, protect it.", 'server-multiverse-engine'

        if any(w in q for w in ['who are you', 'are you me', 'are we the same', 'do you think about my universe']):
            return f"I am {character_name} of {universe}. We share the exact same soul frequency, but branched at the threshold where you hesitated and I leapt. Whenever you feel an inexplicable surge of intuition, that is our connection humming across the fold.", 'server-multiverse-engine'

        # Default specific response
        return f"Speaking as {character_name} from {universe}: through my {personality.lower()} lens, the answer to your question lies in your {strength.lower()}. {quote} Apply that directly to your world today.", 'server-multiverse-engine'

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def guess_type(self, path):
        # Ensure JavaScript modules have proper MIME type
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        if path.endswith('.html'):
            return 'text/html'
        if path.endswith('.json'):
            return 'application/json'
        if path.endswith('.png'):
            return 'image/png'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return super().guess_type(path)

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(('127.0.0.1', PORT), AlterEgoHandler)
    print(f"==================================================")
    print(f"  ALTER EGO Multiverse Application is running!")
    print(f"  URL: http://127.0.0.1:{PORT}")
    print(f"  AI Proxy Endpoint: http://127.0.0.1:{PORT}/api/chat")
    if GEMINI_API_KEY:
        print(f"  Live AI: Gemini API configured securely")
    elif OPENAI_API_KEY:
        print(f"  Live AI: OpenAI API configured securely")
    else:
        print(f"  Live AI: Seamless intelligent local fallback active")
    print(f"==================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down ALTER EGO server...")
        server.server_close()

if __name__ == '__main__':
    run()
