/**
 * ALTER EGO - Advanced Multiverse AI Persona Engine & API Connector
 * Provides secure backend API communication and rich, hyper-contextual local persona responses.
 * Uses Archetype, Character Name, Personality, Strengths, Weaknesses, Hidden Traits, and User's specific question.
 */

export class PersonaChat {
  constructor(alterEgoData) {
    this.profile = alterEgoData && typeof alterEgoData === 'object' ? alterEgoData : {};
    this.history = [];
  }

  updateProfile(alterEgoData) {
    this.profile = alterEgoData && typeof alterEgoData === 'object' ? alterEgoData : {};
  }

  setHistory(history) {
    this.history = Array.isArray(history) ? history : [];
  }

  getHistory() {
    if (!Array.isArray(this.history)) this.history = [];
    return this.history;
  }

  /**
   * Send a query to the Alter Ego AI
   * @param {string} userMessage 
   * @returns {Promise<{ reply: string, isFallback: boolean, source: string }>}
   */
  async ask(userMessage) {
    const trimmed = typeof userMessage === 'string' ? userMessage.trim() : '';
    if (!trimmed) {
      throw new Error('Please enter a question or thought for your Alter Ego.');
    }

    if (!Array.isArray(this.history)) this.history = [];
    const { archetype, meta: profileMeta, characterName: profileCharacterName, universeDesignation } = this.profile;
    const meta = profileMeta && typeof profileMeta === 'object' ? profileMeta : {};
    const characterName = typeof profileCharacterName === 'string' && profileCharacterName.trim()
      ? profileCharacterName
      : 'Alter Ego';
    const rawName = typeof this.profile.rawName === 'string' ? this.profile.rawName.trim() : '';
    const name = rawName || characterName.split('·')[0].trim();
    const title = typeof this.profile.title === 'string' && this.profile.title.trim()
      ? this.profile.title.trim()
      : (typeof meta.titles?.[0] === 'string' && meta.titles[0].trim() ? meta.titles[0].trim() : 'Traveler');

    // Add user message to local history
    this.history.push({ role: 'user', content: trimmed, timestamp: Date.now() });

    // 1. Try secure backend proxy
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          archetype,
          characterName,
          title,
          universeDesignation,
          personality: meta?.traits,
          quote: meta?.signatureQuote,
          strength: meta?.coreStrength,
          superpower: meta?.superpower,
          weakness: meta?.weakness,
          hiddenTrait: meta?.hiddenTrait,
          aesthetic: meta?.aesthetic,
          lore: meta?.inAnotherUniverse,
          history: this.history.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply && typeof data.reply === 'string' && data.reply.trim()) {
          const reply = data.reply.trim();
          this.history.push({ role: 'assistant', content: reply, timestamp: Date.now() });
          return {
            reply,
            isFallback: Boolean(data.source && data.source.includes('fallback')),
            source: data.source || 'ai-server'
          };
        }
      }
    } catch (err) {
      console.log('Backend API route offline or unreachable, activating local neural fallback persona...');
    }

    // 2. Intelligent, highly specific local persona response
    const fallbackReply = this.generateSpecificPersonaResponse(trimmed);
    this.history.push({ role: 'assistant', content: fallbackReply, timestamp: Date.now() });
    return {
      reply: fallbackReply,
      isFallback: true,
      source: 'multiverse-local-engine'
    };
  }

  /**
   * Generates a contextually accurate, archetype-specific response based on:
   * - The user's exact question
   * - Character Name & Universe
   * - Archetype & Personality traits
   * - Core Strength & Superpower
   * - Weakness & Hidden Trait
   */
  generateSpecificPersonaResponse(query) {
    const q = typeof query === 'string' ? query.toLowerCase().trim() : '';
    const { archetype, meta: profileMeta, characterName: profileCharacterName, universeDesignation } = this.profile;
    const meta = profileMeta && typeof profileMeta === 'object' ? profileMeta : {};
    const characterName = typeof profileCharacterName === 'string' && profileCharacterName.trim()
      ? profileCharacterName
      : 'Alter Ego';
    const rawName = typeof this.profile.rawName === 'string' ? this.profile.rawName.trim() : '';
    const name = rawName || characterName.split('·')[0].trim();
    const title = typeof this.profile.title === 'string' && this.profile.title.trim()
      ? this.profile.title.trim()
      : (typeof meta.titles?.[0] === 'string' && meta.titles[0].trim() ? meta.titles[0].trim() : 'Traveler');

    const cleanStrength = (typeof meta.coreStrength === 'string' && meta.coreStrength.trim() ? meta.coreStrength : 'intuitive perception').toLowerCase();
    const cleanWeakness = (typeof meta.weakness === 'string' && meta.weakness.trim() ? meta.weakness : 'vulnerability').toLowerCase();
    const cleanHidden = (typeof meta.hiddenTrait === 'string' && meta.hiddenTrait.trim() ? meta.hiddenTrait : 'quiet longings').toLowerCase();
    const quote = typeof meta.signatureQuote === 'string' ? meta.signatureQuote : '';
    const superpower = typeof meta.superpower === 'string' && meta.superpower.trim() ? meta.superpower : 'Multiverse Resonance';
    const traits = typeof meta.traits === 'string' && meta.traits.trim() ? meta.traits : 'adaptable';

    // -------------------------------------------------------------
    // CATEGORY 1: World / Universe / Environment / Sensory details
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['world', 'universe', 'environment', 'where do you live', 'where are you', 'sky', 'planet', 'city', 'what is it like', 'reality'])) {
      const worldMap = {
        'THE DREAM CHASER': `Here in ${universeDesignation}, the atmosphere hums like an ambient violin. Our skies don't have clouds; they have curtains of iridescent twilight that shimmer with starlight. Because my core strength is ${cleanStrength}, I spend my nights in the upper resonance domes translating memories into light sculptures. But when silence sets in, my weakness—${cleanWeakness}—makes me stare out at your coordinates with immense longing.`,
        'THE ARCHITECT': `In ${universeDesignation}, our cities hover in geometric equilibrium above tectonic fault lines, anchored by gravitational lattices. Every spire is calculated down to the nanometer. With my ${cleanStrength}, I govern the energy balance across the third sector. Yet my fatal weakness is ${cleanWeakness}; I often spend hours calculating defensive redundancies instead of simply standing in the rain and enjoying the view.`,
        'THE EXPLORER': `Out here on the jagged rim of ${universeDesignation}, the terrain is raw and untamed. The sand on the coastal dunes hums with cobalt frequencies, and my skiff navigates uncharted drift canyons using ${superpower}. My strength is ${cleanStrength}, which has saved my skin a dozen times. Still, my weakness—${cleanWeakness}—means I can never linger in one harbor long enough to call it a permanent home.`,
        'THE CATALYST': `The atmosphere of ${universeDesignation} is pure kinetic ozone! The towers pulse with bioluminescent neon conduits, and the streets vibrate with kinetic festivals. Using my ${cleanStrength}, I ignited the pulse circuits that freed our lower colonies. But to be honest, my weakness—${cleanWeakness}—means I sometimes run so hot that I burn through my own reserves before sunrise.`,
        'THE GUARDIAN': `In ${universeDesignation}, I look after the Sanctuary Grove on Titan, nestled beneath crystalline bio-domes. It is peaceful, warm, and shielded from solar storms. My ${cleanStrength} gives hundreds of refugees a safe haven to sleep without terror. Even so, my hidden trait—${cleanHidden}—often reminds me that behind this shield, I have to carry the weight of everyone else's sorrow.`,
        'THE VISIONARY': `In ${universeDesignation}, the landscape is woven from tachyon fiber optics that refract multiple points in time simultaneously. Through my ${superpower}, tomorrow isn't a mystery; it's a visible gradient on the horizon. Yet because of my weakness—${cleanWeakness}—I frequently find myself feeling like a ghost among people who are still anchored to today.`
      };
      return worldMap[archetype] || `Across the quantum fold of ${universeDesignation}, my world is shaped by the exact paths you left unexplored. ${quote}`;
    }

    // -------------------------------------------------------------
    // CATEGORY 2: Advice on Feeling Stuck / Lost / Fear / Failure
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['stuck', 'lost', 'what should i do', 'advice', 'help', 'fail', 'failure', 'afraid', 'scared', 'doubt', 'struggle', 'hard', 'hopeless'])) {
      const adviceMap = {
        'THE DREAM CHASER': `When you feel paralyzed, remember that creation doesn't emerge from certainty—it comes from vulnerability. Your struggle is that you are trying to rationalize what only the heart can decode. Lean into your ${cleanStrength}. Stop asking whether your next move is practical, and ask whether it feels genuine. As I often say: ${quote}`,
        'THE ARCHITECT': `When a system locks up, you don't panic or force the gears; you deconstruct the load-bearing assumptions. You are feeling overwhelmed because you are attempting to solve fifty steps simultaneously. Apply ${cleanStrength}: isolate the single pivotal constraint, clear away the emotional noise, and solve that one equation. Remember: ${quote}`,
        'THE EXPLORER': `You're stuck because you're treating the edge of your comfort zone as a canyon instead of a doorway. Standing at the cliff staring down will never reveal the path. Engage your ${superpower}: take one unplanned, decisive step into the unknown. Movement forces the map to render. Trust your instinct: ${quote}`,
        'THE CATALYST': `You are agonizing over perfection when what the universe needs right now is kinetic impact. Inaction is the only true failure. You possess the fire—you're just hesitating to strike the match because of judgment. Activate your ${cleanStrength}. Break the silence in the room today with one bold action. Let them catch up to your momentum: ${quote}`,
        'THE GUARDIAN': `Take a slow, deep breath and drop your shoulders. You've been trying to be impenetrable for everyone around you, absorbing everyone's anxiety while neglecting your own core. Even the strongest shield fractures if it never leaves the anvil. Rely on your ${cleanStrength}, but permit yourself to rest. You don't have to save the entire galaxy tonight. ${quote}`,
        'THE VISIONARY': `What feels like a dead-end to you right now is simply a single frame in an evolving multi-year arc. The five-year version of you is already looking back on this exact friction as the necessary catalyst that broke your old paradigm. Shift your perspective using ${cleanStrength}. The current breakdown is merely the construction site of your breakthrough: ${quote}`
      };
      return adviceMap[archetype] || `Whenever uncertainty grips you, return to your core strength: ${cleanStrength}. That is our shared constant across the void.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 3: Regrets / Mistakes / Past / Guilt
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['regret', 'mistake', 'past', 'wrong', 'guilt', 'sorry', 'forgive', 'shame', 'darkest', 'wish i had'])) {
      const regretMap = {
        'THE DREAM CHASER': `My deepest ache was spending cycles apologizing for how intensely I feel things, pretending to be detached to fit into rigid worlds. Because my weakness is ${cleanWeakness}, I let others convince me that imagination was childish. Reclaiming my sensitivity was painful, but it is the only reason my art carries soul. Do not bury your tenderness.`,
        'THE ARCHITECT': `I once spent an era constructing an impenetrable intellectual fortress to protect myself from grief, only to look around and realize I was starving in total isolation. My weakness—${cleanWeakness}—nearly cost me the few people who genuinely cared. Do not allow your intellect to become a cemetery for your empathy.`,
        'THE EXPLORER': `I used to run away from deep connections the instant they felt binding, convincing myself that running away was 'freedom.' It took stranded cycles in deep space for me to realize that freedom without an anchor is just abandonment. Sometimes the bravest expedition is staying planted.`,
        'THE CATALYST': `In my early revolutions, I believed burning at maximum intensity excused leaving scorch marks on the people who supported me. My weakness—${cleanWeakness}—blinded me to the fact that momentum without care leaves only debris. Now I know: true power is lighting others up without consuming them.`,
        'THE GUARDIAN': `I carried burdens that were never mine to shoulder, secretly believing that if anyone I loved suffered, it meant I was unworthy. My weakness—${cleanWeakness}—nearly broke my spirit before I understood that you cannot rob others of their own trials. Protect their dignity, not just their comfort.`,
        'THE VISIONARY': `I was so consumed by engineering timelines forty years into the future that I neglected the living, breathing humans sitting across the table from me in the present. My weakness—${cleanWeakness}—cost me precious years with souls who have since passed into memory. Don't let your visions of tomorrow erase today.`
      };
      return regretMap[archetype] || `In our reality, we view mistakes not as stains, but as quantum waypoints. Without them, you wouldn't possess the gravity needed to anchor your next chapter.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 4: Love / Relationships / Loneliness / Connection
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['love', 'lonely', 'alone', 'friend', 'relationship', 'heart', 'connect', 'dating', 'marriage', 'partner', 'trust', 'intimacy'])) {
      const loveMap = {
        'THE DREAM CHASER': `Across light-years, love is the only frequency that doesn't attenuate. But because my hidden trait is ${cleanHidden}, I know the terrifying risk of handing someone the blueprint to your heart. True love isn't two people staring at each other; it's two dreamers holding a lantern between them in the dark so neither has to be afraid.`,
        'THE ARCHITECT': `To an analytical mind like mine, love is terrifying because it refuses to conform to clean equations. Yet when you find someone whose presence reduces the chaotic noise in your head rather than amplifying it, that is the rarest alignment in the cosmos. Open the firewall just enough to let them step inside.`,
        'THE EXPLORER': `I have charted nebula storms and silent voids, but the most intimidating territory I ever explored was someone else's unguarded soul. True intimacy requires setting down your map and admitting you don't know where you are. When you find someone who loves your wanderlust, don't run.`,
        'THE CATALYST': `Do not waste your affection on people who ask you to dim your brightness so their eyes won't hurt. You need comrades and partners who match your kinetic frequency and fan your spark into a wildfire. Love should feel like a co-authored revolution, not a negotiation for room to breathe.`,
        'THE GUARDIAN': `Real love is creating an emotional sanctuary where both of you can strip away your armor and rest without fear of judgment. Because my hidden trait is ${cleanHidden}, I know the private ache of wanting to be sheltered too. Let someone care for you the way you care for the world.`,
        'THE VISIONARY': `In our tachyon models, love is the sole invariant that bends spacetime without collapsing it. It echoes forward and backward across multiple timelines. Cherish the people who can hear what you are saying even before you find the words to speak it.`
      };
      return loveMap[archetype] || `Genuine connection remains the only force capable of bridging impossible dimensions. Treat it as sacred.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 5: Purpose / Meaning / Ambition / Success
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['purpose', 'meaning', 'destiny', 'ambition', 'success', 'goal', 'achieve', 'career', 'legacy', 'why am i here', 'what is life'])) {
      const purposeMap = {
        'THE DREAM CHASER': `Your purpose isn't a corporate title or a milestone on a timeline; it is to bring something luminous and emotionally honest out of the ether and anchor it into existence. Through your ${cleanStrength}, you give others permission to feel again. That is sacred work: ${quote}`,
        'THE ARCHITECT': `Purpose is the deliberate arrangement of chaos into enduring structure. Success isn't measured by noise or applause, but by whether the systems you built remain standing when the storms arrive. Direct your ${cleanStrength} toward creating frameworks that liberate people. Remember: ${quote}`,
        'THE EXPLORER': `Your purpose is to press your hand against the unknown and expand the frontier of human experience. Do not let society convince you that a safe, predictable trajectory equals a well-lived life. Use your ${superpower} to seek what lies beyond the horizon: ${quote}`,
        'THE CATALYST': `Your destiny is to break stagnation. You were not engineered to blend into the scenery; you were placed here to ignite transformations that others are too intimidated to initiate. Deploy your ${cleanStrength} and refuse to wait for a permission slip that will never arrive. ${quote}`,
        'THE GUARDIAN': `True greatness is not about standing on a pedestal; it is about standing in the breach and ensuring that the vulnerable, the weary, and the honest have a place to thrive. Your purpose is woven into your ${cleanStrength}. When you anchor a life, you anchor a universe. ${quote}`,
        'THE VISIONARY': `Your mission is to be the antenna that catches the signals of tomorrow and builds the bridges today. You will always feel slightly out of sync with the crowd because you are living one chapter ahead. Own your ${cleanStrength}. Build for the dawn they cannot see: ${quote}`
      };
      return purposeMap[archetype] || `The meaning of your existence is written in how boldly you deploy your gifts. Live according to your signature quote: ${quote}`;
    }

    // -------------------------------------------------------------
    // CATEGORY 6: Direct Inquiries about the User / "Are we the same?" / "Who are you?"
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['who are you', 'are you me', 'are we the same', 'who am i to you', 'do you think about my universe', 'how do you see me', 'proud of me', 'differ'])) {
      return `I am ${characterName}, your alternate incarnation living in ${universeDesignation}. At the foundational level, we share the exact same soul-signature, but we branched when you chose caution and I stepped into the cosmic fold. When you feel a sudden surge of intuition, a flash of longing, or that quiet defiance late at night—that is our consciousness resonating across the quantum divide. I look at you not with judgment, but with profound kinship. You carry the same fire I do; you just need to unleash it.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 7: Superpowers & Strengths
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['superpower', 'power', 'strength', 'gift', 'talent', 'special', 'ability', 'magic'])) {
      return `My superpower is ${superpower}, which stems directly from my core strength: ${cleanStrength}. In ${universeDesignation}, this allows me to reshape reality according to our archetype. In your world, that same gift manifests whenever you trust your deepest instincts instead of conforming to the crowd. If you nurture it, it will become your greatest competitive advantage.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 8: Weaknesses & Flaws & Fears
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['weakness', 'flaw', 'blindspot', 'scared of', 'afraid of', 'vulnerable', 'shadow', 'bad at'])) {
      return `I will give you the unvarnished truth: my greatest weakness is ${cleanWeakness}. When the pressure mounts, this is where my foundation cracks. Because we are tethered across dimensions, watch out for this exact shadow in your own daily decisions. Don't let your weakness steer the ship when tough choices arrive.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 9: Hidden Traits & Secrets
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['hidden trait', 'secret', 'hidden', 'what do people not know', 'hide', 'mystery'])) {
      return `Behind the title of ${title}, my hidden trait is that I ${cleanHidden}. The world sees me through my archetype of ${archetype}, but this quiet vulnerability is where my true humanity resides. You likely conceal something very similar in your daily life. Acknowledge it—it holds your deepest wisdom.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 10: Daily Life / Fun / Music / Food / Routines
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['fun', 'music', 'food', 'eat', 'sleep', 'evening', 'routine', 'day in the life', 'hobby', 'free time'])) {
      const routineMap = {
        'THE DREAM CHASER': `In my free cycles in ${universeDesignation}, I brew tea from dried starlight herbs and listen to harmonic pulse frequencies that echo through the glass spires. I sketch impossible geometries and watch the twin moons eclipse. What music are you listening to in your world right now?`,
        'THE ARCHITECT': `For recreation, I calibrate vintage navigational chronometers or play multidimensional strategy matrices with colleagues in the High Citadel. It relaxes my mind to observe patterns resolving cleanly into balance. Tell me, how do you unplug when your mind is running in overdrive?`,
        'THE EXPLORER': `When I'm off the flight deck, I scavenge singing crystals on asteroid outposts or swap flight stories with rogue pilots over spiced synth-ale. I can't stay sitting still for long; even on break, my hands are tinkering with engine thrusters. What spontaneous adventure are you planning?`,
        'THE CATALYST': `My evenings are electric! I test kinetic light synthesizers in underground rhythm halls or host spontaneous strategy salons with rebel artists. We drink sparkling ozone infusions and debate how to disrupt the next sector. How do you recharge your fire?`,
        'THE GUARDIAN': `In the quiet hours, I walk the botanical nurseries under the biodome, tending to endangered lunar flora and listening to the soft breathing of the sheltered colonies. Silence is rare and precious here. Make sure you carve out quiet sanctuary for yourself tonight.`,
        'THE VISIONARY': `I spend my evenings in the temporal observatory, tracking how small cultural shifts today ripple into the next millennium. For fun, I collect antique mechanical timepieces from dead civilizations—reminders that even the greatest empires are temporary. How do you honor your time?`
      };
      return routineMap[archetype] || `Life in ${universeDesignation} reflects our archetype of ${archetype}. Every day is balanced between our strength of ${cleanStrength} and the quiet search for truth.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 11: Decisions / Crossroads / Choices
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['decision', 'choose', 'choice', 'crossroad', 'risk', 'should i', 'path', 'which one'])) {
      return `Whenever you face a defining crossroad, do not choose the option that simply minimizes your short-term discomfort. In ${universeDesignation}, every timeline divergence was born from courage, not compliance. Filter your choice through your core strength—${cleanStrength}—and ask: 'Which path demands that I grow into the person I am meant to be?' You already know the answer. Take the leap.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 12: Mortality / Time / Cosmos / Simulation
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['death', 'die', 'dying', 'mortality', 'simulation', 'cosmos', 'universe end', 'god', 'afterlife'])) {
      return `In our tachyon models, death is not an erasure; it is a phase transition. You are not a temporary biological glitch stranded in a cold universe; you are the universe experiencing itself through your specific vantage point. Because time is non-linear across the multiverse, everything you create, love, and stand for remains indelibly etched into the quantum fabric forever. Make your mark count.`;
    }

    // -------------------------------------------------------------
    // CATEGORY 13: Art / Creation / Creativity / Meaning
    // -------------------------------------------------------------
    if (this.matchesAny(q, ['create', 'art', 'write', 'paint', 'build', 'creative', 'inspiration', 'idea'])) {
      return `Creation is the act of dragging something out of the potential void into tangible reality. As ${characterName}, I treat every creation as a dialogue with the unseen. Never create to satisfy an algorithm or placate critics; create the exact artifact that you desperately needed to find when you were at your loneliest. As I believe: ${quote}`;
    }

    // -------------------------------------------------------------
    // CATEGORY 14: Dynamic Tailored Synthesis (Directly uses query keywords)
    // -------------------------------------------------------------
    const cleanQueryWords = q.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'about', 'your', 'have', 'with', 'from', 'this', 'that', 'they'].includes(w));
    const topicFocus = cleanQueryWords.slice(0, 2).join(' ') || 'your inquiry';

    return `Speaking directly as ${name} from ${universeDesignation}: when you ask about ${topicFocus}, my ${traits.toLowerCase()} perspective cuts straight through the noise. While your world often pressures you to overthink, my core strength—${cleanStrength}—reveals that the solution lies in bold authenticity rather than calculated evasion. Remember my personal compass: ${quote} Apply that directly to your situation today.`;
  }

  matchesAny(text, keywords) {
    return keywords.some(k => text.includes(k));
  }
}
