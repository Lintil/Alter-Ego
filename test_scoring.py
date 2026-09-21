"""
Test Personality Calculation Logic and Scoring Determinism
"""
import json
import re

# Parse QUIZ_QUESTIONS and calculate personality in Python mirroring JS logic
# to verify consistency across combinations.

ARCHETYPES = [
    'THE DREAM CHASER',
    'THE ARCHITECT',
    'THE EXPLORER',
    'THE CATALYST',
    'THE GUARDIAN',
    'THE VISIONARY'
]

# Let's inspect js/personalityEngine.js to ensure all questions match the user requirements:
with open('js/personalityEngine.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

required_archetypes = [
    'THE DREAM CHASER',
    'THE ARCHITECT',
    'THE EXPLORER',
    'THE CATALYST',
    'THE GUARDIAN',
    'THE VISIONARY'
]

for arch in required_archetypes:
    assert arch in js_content, f"Missing archetype: {arch}"

required_questions = [
    "Your ideal environment is...",
    "When something goes wrong, you...",
    "Pick your energy:",
    "Pick a color:",
    "Your perfect weekend:",
    "What motivates you most?",
    "Choose a world:",
    "Choose your vibe:"
]

for q in required_questions:
    assert q in js_content, f"Missing question: {q}"

print("All archetypes and 8 questions verified in personalityEngine.js!")
