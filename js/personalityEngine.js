/**
 * ALTER EGO - Personality Engine
 * Deterministic scoring matrix, archetype definitions, and character generator
 */

export const ARCHETYPES = {
  DREAM_CHASER: 'THE DREAM CHASER',
  ARCHITECT: 'THE ARCHITECT',
  EXPLORER: 'THE EXPLORER',
  CATALYST: 'THE CATALYST',
  GUARDIAN: 'THE GUARDIAN',
  VISIONARY: 'THE VISIONARY'
};

export const ARCHETYPE_META = {
  [ARCHETYPES.DREAM_CHASER]: {
    id: 'dream_chaser',
    name: ARCHETYPES.DREAM_CHASER,
    traits: 'Creative, imaginative, emotional',
    color: '#c084fc', // Lilac purple
    gradient: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    symbol: '✧',
    icon: 'fa-wand-magic-sparkles',
    aesthetic: 'Ethereal Cyber-Romanticism / Starlight Noir',
    coreStrength: 'Unbounded intuitive imagination & emotional depth',
    hiddenTrait: 'Perceives quiet beauty and heartbreak where others see plain noise',
    superpower: 'Lucid Reality Shaping — turning abstract reverie into tangible art',
    weakness: 'Easily untethered from mundane reality; prone to nostalgic melancholia',
    signatureQuote: '"I do not live in the world as it is; I live in the worlds that ache to be born."',
    inAnotherUniverse: 'In another universe, you are an Astral Scribe charting the emotional currents between dying stars. You craft crystalline symphonies that let entire planetary colonies feel each other\'s dreams across the void, immortalizing memories that time forgot.',
    characterNames: [
      'Lyra Reverie',
      'Kaelen Stardust',
      'Seraphina Sol',
      'Elian Mirage',
      'Aurelia Lumis',
      'Sylas Velvet'
    ],
    titles: [
      'The Starlit Weaver',
      'Weaver of Phantom Lights',
      'Dream Architect of Nebula IX',
      'The Echo Composer',
      'Keeper of Forgotten Wonders'
    ]
  },
  [ARCHETYPES.ARCHITECT]: {
    id: 'architect',
    name: ARCHETYPES.ARCHITECT,
    traits: 'Analytical, strategic, thoughtful',
    color: '#38bdf8', // Electric sky blue
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    symbol: '⬡',
    icon: 'fa-cube',
    aesthetic: 'Prismatic Brutalism / Neo-Obsidian Geometry',
    coreStrength: 'Penetrating analytical vision & structural foresight',
    hiddenTrait: 'Secretly holds immense sentimentality for systems that protect people',
    superpower: 'Omni-Matrix Synthesis — predicting cascading butterfly effects ten steps ahead',
    weakness: 'Over-intellectualizing matters of the heart; chronic analysis paralysis',
    signatureQuote: '"Chaos is merely an order we have not yet solved."',
    inAnotherUniverse: 'In another universe, you engineered the Great Orbital Monoliths that balance the gravitational tides of three sister planets. Every city, bridge, and neural lattice in the sector runs on your immutable structural equations.',
    characterNames: [
      'Cipher Thorne',
      'Dr. Alistair Cross',
      'Valeria Vector',
      'Soren Matrix',
      'Cassian Helix',
      'Athena Rayne'
    ],
    titles: [
      'Grand Strategist of the Monolith',
      'Chronicler of Prime Matrices',
      'Quantum Cartographer',
      'Master of the Lattice',
      'Architect of the Axiom'
    ]
  },
  [ARCHETYPES.EXPLORER]: {
    id: 'explorer',
    name: ARCHETYPES.EXPLORER,
    traits: 'Adventurous, curious, independent',
    color: '#34d399', // Emerald cyan
    gradient: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    symbol: '🧭',
    icon: 'fa-compass',
    aesthetic: 'Solar-Punk Nomadic / Deep Space Cartography',
    coreStrength: 'Fearless adaptability & innate instinctual navigation',
    hiddenTrait: 'A fierce longing for a solitary home base they can never bring themselves to stay in',
    superpower: 'Void Instinct — the uncanny sixth sense to survive uncharted dimensions',
    weakness: 'Restless defiance of routine; struggles with stillness and long commitments',
    signatureQuote: '"The horizon isn\'t a boundary; it\'s an invitation."',
    inAnotherUniverse: 'In another universe, you helm a rogue reconnaissance skiff surveying the uncharted rim of the Perseus Spiral. You were the first conscious soul to step foot onto the singing glass deserts of Kepler-71c.',
    characterNames: [
      'Renner Vane',
      'Nova Drake',
      'Talia Drift',
      'Kestrel Voss',
      'Jaxson Rover',
      'Lyndon Wilder'
    ],
    titles: [
      'Voidstrider of Horizon Edge',
      'Cartographer of Dead Stars',
      'Deep Expanse Pioneer',
      'Nomad of the Galactic Verge',
      'Trailblazer of the Drift'
    ]
  },
  [ARCHETYPES.CATALYST]: {
    id: 'catalyst',
    name: ARCHETYPES.CATALYST,
    traits: 'Energetic, ambitious, influential',
    color: '#fb7185', // Electric rose coral
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)',
    glowColor: 'rgba(251, 113, 133, 0.45)',
    symbol: '⚡',
    icon: 'fa-bolt',
    aesthetic: 'Hyper-Pop Cyberpunk / Solar Flare Chic',
    coreStrength: 'Magnetic charismatic drive & relentless momentum generation',
    hiddenTrait: 'Carries the quiet dread of slowing down and facing silence alone',
    superpower: 'Resonance Ignition — amplifying the spark in others until it becomes a wildfire',
    weakness: 'Tendency to burn out their own fuel; impatient with slow incremental change',
    signatureQuote: '"We are not here to observe the fire. We are the lightning strike."',
    inAnotherUniverse: 'In another universe, you sparked the Solaris Awakening—a cultural renaissance that united twelve rebel moon colonies under a neon banner of autonomy, turning corporate wasteland towers into sanctuaries of kinetic art.',
    characterNames: [
      'Ignis Ray',
      'Vesper Sterling',
      'Dax Zenith',
      'Zara Blaze',
      'Malik Surge',
      'Roxie Kinetic'
    ],
    titles: [
      'Luminary of the Neon Spire',
      'The Pulse Catalyst',
      'Sovereign of Solar Currents',
      'Herald of the New Dawn',
      'Igniter of Worlds'
    ]
  },
  [ARCHETYPES.GUARDIAN]: {
    id: 'guardian',
    name: ARCHETYPES.GUARDIAN,
    traits: 'Empathetic, loyal, dependable',
    color: '#a78bfa', // Mystic violet indigo
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
    glowColor: 'rgba(167, 139, 250, 0.45)',
    symbol: '🛡',
    icon: 'fa-shield-halved',
    aesthetic: 'Solitary Haven / Bio-Luminescent Sanctuary',
    coreStrength: 'Unconditional emotional refuge & unwavering moral grounding',
    hiddenTrait: 'A profound private yearning to be defended with the same fierceness they give others',
    superpower: 'Aegis Resonance — creating emotional and psychic sanctuaries where despair cannot enter',
    weakness: 'Self-sacrificing altruism; holding onto burdens that were never theirs to carry',
    signatureQuote: '"When the stars collapse, you will not stand alone. I will be your shield."',
    inAnotherUniverse: 'In another universe, you are the Warden of the Sanctuary Grove on Titan. When the solar flares forced migrations across the quadrant, your sheltered biosphere preserved three thousand sacred species and offered haven to displaced dreamers.',
    characterNames: [
      'Orion Vale',
      'Elowen Sol',
      'Cassian Ward',
      'Morrigan Haven',
      'Theron Shield',
      'Rowan Amity'
    ],
    titles: [
      'Sentinel of the Quiet Grove',
      'Keeper of the Haven Core',
      'Hearthmaster of Eos',
      'Warden of the Sanctuary',
      'Protector of the Fragile Light'
    ]
  },
  [ARCHETYPES.VISIONARY]: {
    id: 'visionary',
    name: ARCHETYPES.VISIONARY,
    traits: 'Innovative, unconventional, future-oriented',
    color: '#2dd4bf', // Deep teal neon
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #818cf8 100%)',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    symbol: '👁',
    icon: 'fa-eye',
    aesthetic: 'Quantum Ethereal / Deep Singularity Chromatic',
    coreStrength: 'Paradigmatic disruption & intuitive grasp of uncharted timelines',
    hiddenTrait: 'Feels an ancient nostalgia for futures that haven\'t happened yet',
    superpower: 'Temporal Parallax — perceiving what systems will become a century before they exist',
    weakness: 'Alienating peers because you speak the language of tomorrow while living in today',
    signatureQuote: '"Do not build for the world in front of you. Build for the dawn they cannot see."',
    inAnotherUniverse: 'In another universe, you cracked the Tachyon Transmission Protocol, allowing humanity to exchange poetry and warnings with civilizations 400 years in the future, forever erasing the loneliness of time.',
    characterNames: [
      'Zephyr Chronos',
      'Astraea Nyx',
      'Kallum Vector',
      'Sora Quantum',
      'Mira Tachyon',
      'Iris Horizon'
    ],
    titles: [
      'Architect of the Event Horizon',
      'Weaver of Parallel Realities',
      'Prophet of the Singularity',
      'Navigator of Quantum Tides',
      'Pioneer of Tomorrow\'s Dawn'
    ]
  }
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Your ideal environment is...",
    options: [
      {
        text: "A quiet room with books",
        icon: "fa-book-bookmark",
        scores: {
          [ARCHETYPES.ARCHITECT]: 3,
          [ARCHETYPES.GUARDIAN]: 1,
          [ARCHETYPES.DREAM_CHASER]: 1
        }
      },
      {
        text: "A crowded city full of possibilities",
        icon: "fa-city",
        scores: {
          [ARCHETYPES.CATALYST]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: "Nature far away from everyone",
        icon: "fa-tree",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.GUARDIAN]: 2
        }
      },
      {
        text: "Somewhere completely unfamiliar",
        icon: "fa-compass",
        scores: {
          [ARCHETYPES.EXPLORER]: 2,
          [ARCHETYPES.VISIONARY]: 3
        }
      }
    ]
  },
  {
    id: 2,
    question: "When something goes wrong, you...",
    options: [
      {
        text: "Analyze it carefully",
        icon: "fa-magnifying-glass-chart",
        scores: {
          [ARCHETYPES.ARCHITECT]: 3,
          [ARCHETYPES.VISIONARY]: 1
        }
      },
      {
        text: "Try something completely new",
        icon: "fa-lightbulb",
        scores: {
          [ARCHETYPES.VISIONARY]: 3,
          [ARCHETYPES.EXPLORER]: 2
        }
      },
      {
        text: "Trust your instincts",
        icon: "fa-bolt-lightning",
        scores: {
          [ARCHETYPES.DREAM_CHASER]: 3,
          [ARCHETYPES.EXPLORER]: 1
        }
      },
      {
        text: "Ask someone and collaborate",
        icon: "fa-handshake-angle",
        scores: {
          [ARCHETYPES.GUARDIAN]: 3,
          [ARCHETYPES.CATALYST]: 2
        }
      }
    ]
  },
  {
    id: 3,
    question: "Pick your energy:",
    options: [
      {
        text: "Calm",
        icon: "fa-water",
        scores: {
          [ARCHETYPES.GUARDIAN]: 3,
          [ARCHETYPES.ARCHITECT]: 2
        }
      },
      {
        text: "Chaotic",
        icon: "fa-fire-flame-curved",
        scores: {
          [ARCHETYPES.CATALYST]: 3,
          [ARCHETYPES.DREAM_CHASER]: 1,
          [ARCHETYPES.VISIONARY]: 1
        }
      },
      {
        text: "Mysterious",
        icon: "fa-moon",
        scores: {
          [ARCHETYPES.VISIONARY]: 2,
          [ARCHETYPES.ARCHITECT]: 2,
          [ARCHETYPES.DREAM_CHASER]: 2
        }
      },
      {
        text: "Warm",
        icon: "fa-sun",
        scores: {
          [ARCHETYPES.GUARDIAN]: 3,
          [ARCHETYPES.DREAM_CHASER]: 1,
          [ARCHETYPES.CATALYST]: 1
        }
      }
    ]
  },
  {
    id: 4,
    question: "Pick a color:",
    options: [
      {
        text: "Purple",
        icon: "fa-palette",
        colorBadge: "#c084fc",
        scores: {
          [ARCHETYPES.DREAM_CHASER]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: "Blue",
        icon: "fa-palette",
        colorBadge: "#38bdf8",
        scores: {
          [ARCHETYPES.ARCHITECT]: 3,
          [ARCHETYPES.GUARDIAN]: 1
        }
      },
      {
        text: "Pink",
        icon: "fa-palette",
        colorBadge: "#fb7185",
        scores: {
          [ARCHETYPES.CATALYST]: 2,
          [ARCHETYPES.DREAM_CHASER]: 2,
          [ARCHETYPES.GUARDIAN]: 1
        }
      },
      {
        text: "Green",
        icon: "fa-palette",
        colorBadge: "#34d399",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.GUARDIAN]: 1
        }
      }
    ]
  },
  {
    id: 5,
    question: "Your perfect weekend:",
    options: [
      {
        text: "Creating something",
        icon: "fa-paintbrush",
        scores: {
          [ARCHETYPES.DREAM_CHASER]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: "Going somewhere spontaneous",
        icon: "fa-caravan",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.CATALYST]: 2
        }
      },
      {
        text: "Staying home and recharging",
        icon: "fa-house-chimney-window",
        scores: {
          [ARCHETYPES.ARCHITECT]: 2,
          [ARCHETYPES.GUARDIAN]: 3
        }
      },
      {
        text: "Spending time with people",
        icon: "fa-users",
        scores: {
          [ARCHETYPES.CATALYST]: 3,
          [ARCHETYPES.GUARDIAN]: 2
        }
      }
    ]
  },
  {
    id: 6,
    question: "What motivates you most?",
    options: [
      {
        text: "Knowledge",
        icon: "fa-graduation-cap",
        scores: {
          [ARCHETYPES.ARCHITECT]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: "Freedom",
        icon: "fa-dove",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.DREAM_CHASER]: 1
        }
      },
      {
        text: "Recognition",
        icon: "fa-trophy",
        scores: {
          [ARCHETYPES.CATALYST]: 3,
          [ARCHETYPES.ARCHITECT]: 1
        }
      },
      {
        text: "Connection",
        icon: "fa-heart",
        scores: {
          [ARCHETYPES.GUARDIAN]: 3,
          [ARCHETYPES.DREAM_CHASER]: 2
        }
      }
    ]
  },
  {
    id: 7,
    question: "Choose a world:",
    options: [
      {
        text: "A futuristic megacity",
        icon: "fa-building-shield",
        scores: {
          [ARCHETYPES.VISIONARY]: 3,
          [ARCHETYPES.CATALYST]: 2
        }
      },
      {
        text: "An enchanted forest",
        icon: "fa-leaf",
        scores: {
          [ARCHETYPES.DREAM_CHASER]: 3,
          [ARCHETYPES.GUARDIAN]: 1
        }
      },
      {
        text: "A distant planet",
        icon: "fa-ring",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: "A peaceful floating island",
        icon: "fa-cloud-sun",
        scores: {
          [ARCHETYPES.GUARDIAN]: 3,
          [ARCHETYPES.DREAM_CHASER]: 1
        }
      }
    ]
  },
  {
    id: 8,
    question: "Choose your vibe:",
    options: [
      {
        text: '"I want to understand everything."',
        icon: "fa-atom",
        scores: {
          [ARCHETYPES.ARCHITECT]: 3,
          [ARCHETYPES.VISIONARY]: 1
        }
      },
      {
        text: '"I want to experience everything."',
        icon: "fa-mountain-sun",
        scores: {
          [ARCHETYPES.EXPLORER]: 3,
          [ARCHETYPES.CATALYST]: 2
        }
      },
      {
        text: '"I want to create something meaningful."',
        icon: "fa-star",
        scores: {
          [ARCHETYPES.DREAM_CHASER]: 3,
          [ARCHETYPES.VISIONARY]: 2
        }
      },
      {
        text: '"I want to make people feel something."',
        icon: "fa-masks-theater",
        scores: {
          [ARCHETYPES.GUARDIAN]: 2,
          [ARCHETYPES.CATALYST]: 2,
          [ARCHETYPES.DREAM_CHASER]: 1
        }
      }
    ]
  }
];

/**
 * Deterministic calculation of archetype scores from answers array.
 * @param {Array<number>} selectedOptionIndices Array of chosen option index (0..3) for each question (length 8)
 * @returns {Object} Comprehensive calculation result
 */
export function calculatePersonality(selectedOptionIndices) {
  if (!Array.isArray(selectedOptionIndices) || selectedOptionIndices.length !== QUIZ_QUESTIONS.length) {
    throw new Error('Invalid quiz answers: must provide answers for all 8 questions.');
  }

  // Initialize raw score tallies
  const rawScores = {
    [ARCHETYPES.DREAM_CHASER]: 0,
    [ARCHETYPES.ARCHITECT]: 0,
    [ARCHETYPES.EXPLORER]: 0,
    [ARCHETYPES.CATALYST]: 0,
    [ARCHETYPES.GUARDIAN]: 0,
    [ARCHETYPES.VISIONARY]: 0
  };

  // Tally scores deterministically
  selectedOptionIndices.forEach((optIndex, qIdx) => {
    const question = QUIZ_QUESTIONS[qIdx];
    if (!question) return;
    const option = question.options[optIndex];
    if (!option) return;

    for (const [archetype, pts] of Object.entries(option.scores)) {
      if (rawScores[archetype] !== undefined) {
        rawScores[archetype] += pts;
      }
    }
  });

  // Calculate total points
  const totalPoints = Object.values(rawScores).reduce((acc, v) => acc + v, 0) || 1;

  // Calculate percentages (rounded)
  const breakdown = {};
  for (const [archetype, points] of Object.entries(rawScores)) {
    const pct = Math.round((points / totalPoints) * 100);
    breakdown[archetype] = {
      points,
      percentage: pct
    };
  }

  // Deterministic tie-breaker:
  // We compute a stable numerical hash of all choices to break any dead ties predictably
  const answersHash = selectedOptionIndices.reduce((acc, val, idx) => acc + (val + 1) * Math.pow(7, idx), 0);

  const archetypesList = Object.values(ARCHETYPES);
  archetypesList.sort((a, b) => {
    const diff = rawScores[b] - rawScores[a];
    if (diff !== 0) return diff;
    // Tie-breaker based on answersHash and character code
    const weightA = (answersHash + a.charCodeAt(4)) % 100;
    const weightB = (answersHash + b.charCodeAt(4)) % 100;
    return weightB - weightA;
  });

  const dominantArchetype = archetypesList[0];
  const meta = ARCHETYPE_META[dominantArchetype];

  // Deterministic character name and title selection based on answer sequence
  const nameIndex = Math.abs(answersHash) % meta.characterNames.length;
  const titleIndex = Math.abs(answersHash * 3 + 7) % meta.titles.length;
  const universeNumber = 100 + (Math.abs(answersHash * 11 + 42) % 899);
  const greekLetters = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Omega'];
  const sector = greekLetters[Math.abs(answersHash) % greekLetters.length];
  const universeDesignation = `Universe #${universeNumber}-${sector}`;

  const characterName = `${meta.characterNames[nameIndex]} · ${meta.titles[titleIndex]}`;

  return {
    archetype: dominantArchetype,
    characterName,
    rawName: meta.characterNames[nameIndex],
    title: meta.titles[titleIndex],
    universeDesignation,
    meta,
    rawScores,
    breakdown,
    totalPoints,
    answers: [...selectedOptionIndices],
    timestamp: new Date().toISOString()
  };
}
