/**
 * ALTER EGO - Main Application Controller
 */

import { QUIZ_QUESTIONS, ARCHETYPES, calculatePersonality } from './personalityEngine.js';
import { Storage } from './storage.js';
import { PersonaChat } from './aiPersona.js';
import { generateAlterEgoCard } from './cardGenerator.js';
import { sound } from './soundEffects.js';

class AlterEgoApp {
  constructor() {
    // Application State
    this.currentView = 'view-landing';
    this.currentQuestionIndex = 0;
    this.selectedAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
    this.currentResult = null;
    this.personaChat = null;

    // DOM Elements Cache
    this.dom = {
      // Views
      viewLanding: document.getElementById('view-landing'),
      viewQuiz: document.getElementById('view-quiz'),
      viewCalculating: document.getElementById('view-calculating'),
      viewResult: document.getElementById('view-result'),

      // Header Controls & Home Navigation
      btnBrandHome: document.getElementById('btn-brand-home'),
      btnHeaderHome: document.getElementById('btn-header-home'),
      btnQuizHome: document.getElementById('btn-quiz-home'),
      btnResultHome: document.getElementById('btn-result-home'),
      btnActionHome: document.getElementById('btn-action-home'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      soundIcon: document.getElementById('sound-icon'),

      // Landing View
      btnStartQuiz: document.getElementById('btn-start-quiz'),
      landingSavedCard: document.getElementById('landing-saved-card'),
      lastEgoName: document.getElementById('last-ego-name'),
      lastEgoArchetype: document.getElementById('last-ego-archetype'),
      lastEgoUniverse: document.getElementById('last-ego-universe'),
      btnViewSaved: document.getElementById('btn-view-saved'),

      // Quiz View
      quizProgressFill: document.getElementById('quiz-progress-fill'),
      questionCounter: document.getElementById('question-counter'),
      questionProgressPct: document.getElementById('question-progress-pct'),
      questionTitle: document.getElementById('question-title'),
      quizOptionsContainer: document.getElementById('quiz-options-container'),
      btnQuizBack: document.getElementById('btn-quiz-back'),
      btnQuizNext: document.getElementById('btn-quiz-next'),

      // Calculating Interlude
      calcStatusText: document.getElementById('calc-status-text'),

      // Result View
      egoUniverseBadge: document.getElementById('ego-universe-badge'),
      egoArchetypeSymbol: document.getElementById('ego-archetype-symbol'),
      egoArchetypeName: document.getElementById('ego-archetype-name'),
      egoArchetypePill: document.getElementById('ego-archetype-pill'),
      egoCharacterName: document.getElementById('ego-character-name'),
      egoTraitsTagline: document.getElementById('ego-traits-tagline'),
      egoSignatureQuote: document.getElementById('ego-signature-quote'),
      egoInAnotherUniverse: document.getElementById('ego-in-another-universe'),
      egoCoreStrength: document.getElementById('ego-core-strength'),
      egoHiddenTrait: document.getElementById('ego-hidden-trait'),
      egoSuperpower: document.getElementById('ego-superpower'),
      egoWeakness: document.getElementById('ego-weakness'),
      egoAesthetic: document.getElementById('ego-aesthetic'),
      egoBreakdownGrid: document.getElementById('ego-breakdown-grid'),

      // Result Actions
      btnSaveEgo: document.getElementById('btn-save-ego'),
      btnCopyResult: document.getElementById('btn-copy-result'),
      btnShareResult: document.getElementById('btn-share-result'),
      btnDownloadCard: document.getElementById('btn-download-card'),
      btnRetakeQuiz: document.getElementById('btn-retake-quiz'),

      // AI Chat
      chatRemainingBadge: document.getElementById('chat-remaining-badge'),
      chatRemainingText: document.getElementById('chat-remaining-text'),
      chatLimitNotice: document.getElementById('chat-limit-notice'),
      aiSuggestionsContainer: document.getElementById('ai-suggestions-container'),
      chatMessages: document.getElementById('chat-messages'),
      chatForm: document.getElementById('chat-form'),
      chatInput: document.getElementById('chat-input'),
      btnChatSend: document.getElementById('btn-chat-send'),
      suggestionChips: document.querySelectorAll('.suggestion-chip'),

      // Toast container & canvas
      toastContainer: document.getElementById('toast-container'),
      cosmicCanvas: document.getElementById('cosmic-canvas')
    };
  }

  /**
   * Initialize application components, canvas, persistence restoration, and event listeners
   */
  init() {
    this.initCanvasStarfield();
    this.bindEvents();
    this.updateAudioIcon();

    // Check saved state for smart refresh restoration
    const saved = Storage.getSavedAlterEgo();
    const activeView = Storage.getActiveView();

    if (activeView === 'view-result' && saved) {
      // Restore user directly onto their generated result
      this.restoreSavedResult(saved, false);
    } else if (activeView === 'view-quiz') {
      // Restore in-progress quiz if available
      const inProgress = Storage.getProgress();
      if (inProgress && Array.isArray(inProgress.answers)) {
        this.selectedAnswers = inProgress.answers;
        this.currentQuestionIndex = Math.min(inProgress.stepIndex || 0, QUIZ_QUESTIONS.length - 1);
        this.startQuiz();
      } else {
        this.switchView('view-landing');
        this.checkSavedLandingProfile();
      }
    } else {
      this.switchView('view-landing');
      this.checkSavedLandingProfile();
    }
  }

  /**
   * Bind DOM Events and Keyboard Navigation
   */
  bindEvents() {
    // Return to Home Handlers (Header, Brand, Quiz Home, Result Home, Action Home)
    const homeButtons = [
      this.dom.btnBrandHome,
      this.dom.btnHeaderHome,
      this.dom.btnQuizHome,
      this.dom.btnResultHome,
      this.dom.btnActionHome
    ];

    homeButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.navigateHome();
        });
      }
    });

    // Sound Toggle
    this.dom.btnToggleSound.addEventListener('click', () => {
      sound.playClick();
      sound.toggle();
      this.updateAudioIcon();
      this.showToast(sound.enabled ? 'Celestial audio enabled' : 'Audio muted', 'fa-volume-high');
    });

    // Landing: Start Quiz
    this.dom.btnStartQuiz.addEventListener('click', () => {
      sound.playClick();
      this.startQuiz();
    });

    // Landing: View Saved Alter Ego
    this.dom.btnViewSaved.addEventListener('click', () => {
      sound.playClick();
      const saved = Storage.getSavedAlterEgo();
      if (saved) {
        this.restoreSavedResult(saved, true);
      }
    });

    // Quiz: Back & Next
    this.dom.btnQuizBack.addEventListener('click', () => {
      sound.playClick();
      this.previousQuestion();
    });

    this.dom.btnQuizNext.addEventListener('click', () => {
      this.nextQuestion();
    });

    // Result Action Buttons
    this.dom.btnSaveEgo.addEventListener('click', () => {
      sound.playClick();
      this.handleSaveAlterEgo();
    });

    this.dom.btnCopyResult.addEventListener('click', () => {
      sound.playClick();
      this.handleCopyResult();
    });

    this.dom.btnShareResult.addEventListener('click', () => {
      sound.playClick();
      this.handleShareResult();
    });

    this.dom.btnDownloadCard.addEventListener('click', () => {
      sound.playClick();
      this.handleDownloadCard();
    });

    this.dom.btnRetakeQuiz.addEventListener('click', () => {
      sound.playClick();
      this.retakeQuiz();
    });

    // AI Chat Form Submission
    this.dom.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSendChatMessage();
    });

    // AI Suggestion Chips
    this.dom.suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.disabled || Storage.getQuestionsRemaining() <= 0) return;
        sound.playClick();
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          this.dom.chatInput.value = prompt;
          this.handleSendChatMessage();
        }
      });
    });

    // Global Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (this.currentView !== 'view-quiz') return;
      if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        this.selectOption(optionIndex);
      } else if (e.key === 'Enter' && !this.dom.btnQuizNext.disabled) {
        this.nextQuestion();
      } else if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && !this.dom.btnQuizBack.disabled) {
        this.previousQuestion();
      }
    });
  }

  /**
   * Navigate back to Landing Page without deleting or resetting the saved result
   */
  navigateHome() {
    sound.playClick();
    Storage.setActiveView('view-landing');
    this.switchView('view-landing');
    this.checkSavedLandingProfile();
  }

  /**
   * Update audio icon status
   */
  updateAudioIcon() {
    if (sound.enabled) {
      this.dom.soundIcon.className = 'fa-solid fa-volume-high';
    } else {
      this.dom.soundIcon.className = 'fa-solid fa-volume-xmark';
    }
  }

  /**
   * Check if previously saved profile exists and show landing banner
   */
  checkSavedLandingProfile() {
    const saved = Storage.getSavedAlterEgo();
    if (saved && saved.characterName && saved.archetype) {
      this.dom.landingSavedCard.classList.remove('hidden');
      this.dom.lastEgoName.textContent = saved.characterName;
      this.dom.lastEgoArchetype.textContent = `✦ ${saved.archetype}`;
      this.dom.lastEgoUniverse.textContent = saved.universeDesignation || 'UNIVERSE ARCHIVE';
    } else {
      this.dom.landingSavedCard.classList.add('hidden');
    }
  }

  /**
   * Switch active view with smooth animation
   */
  switchView(viewId) {
    const views = [
      this.dom.viewLanding,
      this.dom.viewQuiz,
      this.dom.viewCalculating,
      this.dom.viewResult
    ];

    views.forEach(view => {
      if (view.id === viewId) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    this.currentView = viewId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Start or continue the 8-question quiz
   */
  startQuiz() {
    Storage.setActiveView('view-quiz');
    this.switchView('view-quiz');
    this.renderQuestion(this.currentQuestionIndex);
  }

  /**
   * Render question at given index
   */
  renderQuestion(index) {
    const question = QUIZ_QUESTIONS[index];
    if (!question) return;

    // Update Progress
    const progressPct = Math.round(((index + 1) / QUIZ_QUESTIONS.length) * 100);
    this.dom.quizProgressFill.style.width = `${progressPct}%`;
    this.dom.questionCounter.textContent = `QUESTION 0${index + 1} / 08`;
    this.dom.questionProgressPct.textContent = `${progressPct}% COMPLETED`;
    this.dom.questionTitle.textContent = question.question;

    // Render Options
    this.dom.quizOptionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    question.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', this.selectedAnswers[index] === optIdx ? 'true' : 'false');
      btn.setAttribute('data-index', optIdx);

      if (this.selectedAnswers[index] === optIdx) {
        btn.classList.add('selected');
      }

      // Color Badge or Icon
      let badgeHtml = `<span class="option-key-indicator">${letters[optIdx]}</span>`;
      if (opt.colorBadge) {
        badgeHtml = `<span class="option-key-indicator">${letters[optIdx]}</span><span class="option-badge-color" style="background-color: ${opt.colorBadge}; color: ${opt.colorBadge};"></span>`;
      }

      btn.innerHTML = `
        ${badgeHtml}
        <span class="option-text">${opt.text}</span>
      `;

      btn.addEventListener('click', () => {
        this.selectOption(optIdx);
      });

      this.dom.quizOptionsContainer.appendChild(btn);
    });

    // Update Back / Next Button states
    this.dom.btnQuizBack.disabled = index === 0;
    this.dom.btnQuizNext.disabled = this.selectedAnswers[index] === null;

    if (index === QUIZ_QUESTIONS.length - 1) {
      this.dom.btnQuizNext.innerHTML = `<span>REVEAL MY ALTER EGO</span> <i class="fa-solid fa-sparkles"></i>`;
    } else {
      this.dom.btnQuizNext.innerHTML = `<span>NEXT</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
  }

  /**
   * Handle selecting an option
   */
  selectOption(optIdx) {
    sound.playSelect();
    this.selectedAnswers[this.currentQuestionIndex] = optIdx;

    // Update UI highlights
    const buttons = this.dom.quizOptionsContainer.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      if (idx === optIdx) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('selected');
        btn.setAttribute('aria-checked', 'false');
      }
    });

    this.dom.btnQuizNext.disabled = false;
    Storage.saveProgress(this.currentQuestionIndex, this.selectedAnswers);
  }

  /**
   * Advance to next question or trigger calculation
   */
  nextQuestion() {
    if (this.selectedAnswers[this.currentQuestionIndex] === null) return;

    if (this.currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      sound.playNext();
      this.currentQuestionIndex++;
      this.renderQuestion(this.currentQuestionIndex);
    } else {
      // Quiz complete! Transition to calculation interlude
      this.startCalculation();
    }
  }

  /**
   * Step back to previous question
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderQuestion(this.currentQuestionIndex);
    }
  }

  /**
   * Show calculation scanner with animated status messages
   */
  startCalculation() {
    this.switchView('view-calculating');
    sound.playReveal();

    const statuses = [
      'Scanning quantum coordinate lattices...',
      'Measuring emotional resonance frequencies...',
      'Resolving timeline divergences across 6 archetypes...',
      'Stabilizing parallel consciousness conduit...',
      'Multiverse signature locked!'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < statuses.length) {
        this.dom.calcStatusText.textContent = statuses[step];
      } else {
        clearInterval(interval);
        // Compute Personality
        const result = calculatePersonality(this.selectedAnswers);
        this.currentResult = result;
        
        // Save complete result to persistence
        Storage.saveAlterEgo(result);
        Storage.setActiveView('view-result');

        // Reset question counter to 6 for the newly generated alter ego!
        Storage.setQuestionsRemaining(6);
        Storage.setAskedQuestions([]);
        Storage.clearChatHistory();
        Storage.clearProgress();

        // Render Result Page
        this.renderResultPage(result);
        this.switchView('view-result');
        this.showToast('Multiverse Identity Synchronized!', 'fa-sparkles');
      }
    }, 280);
  }

  /**
   * Restore a previously saved profile
   */
  restoreSavedResult(savedData, notify = true) {
    if (savedData.meta && savedData.characterName) {
      this.currentResult = savedData;
    } else if (savedData.answers && savedData.answers.length === QUIZ_QUESTIONS.length) {
      this.currentResult = calculatePersonality(savedData.answers);
      Storage.saveAlterEgo(this.currentResult);
    } else {
      this.currentResult = savedData;
    }

    Storage.setActiveView('view-result');
    this.renderResultPage(this.currentResult);
    this.switchView('view-result');

    if (notify) {
      this.showToast('Restored Alter Ego Profile', 'fa-bookmark');
    }
  }

  /**
   * Render full result view
   */
  renderResultPage(result) {
    const { archetype, characterName, universeDesignation, meta, breakdown } = result;

    this.dom.egoUniverseBadge.textContent = universeDesignation || 'UNIVERSE ARCHIVE';
    this.dom.egoArchetypeName.textContent = archetype;
    this.dom.egoArchetypeSymbol.textContent = meta?.symbol || '✦';

    if (meta?.color) {
      this.dom.egoArchetypePill.style.borderColor = meta.color;
      this.dom.egoArchetypePill.style.boxShadow = `0 0 20px ${meta.glowColor || 'rgba(192,132,252,0.4)'}`;
    }

    this.dom.egoCharacterName.textContent = characterName;
    this.dom.egoTraitsTagline.textContent = meta?.traits || '';
    this.dom.egoSignatureQuote.textContent = meta?.signatureQuote || '';
    this.dom.egoInAnotherUniverse.textContent = meta?.inAnotherUniverse || '';

    this.dom.egoCoreStrength.textContent = meta?.coreStrength || '';
    this.dom.egoHiddenTrait.textContent = meta?.hiddenTrait || '';
    this.dom.egoSuperpower.textContent = meta?.superpower || '';
    this.dom.egoWeakness.textContent = meta?.weakness || '';
    this.dom.egoAesthetic.textContent = meta?.aesthetic || '';

    // Render 6-Archetype Visual Breakdown
    this.renderBreakdownBars(breakdown, archetype, meta?.color || '#c084fc');

    // Initialize AI Persona Chat with persisted state
    this.initAiChat(result);
  }

  /**
   * Render breakdown bars for 6 archetypes
   */
  renderBreakdownBars(breakdown, dominantArchetype, primaryColor) {
    this.dom.egoBreakdownGrid.innerHTML = '';
    if (!breakdown) return;

    for (const [archName, stats] of Object.entries(breakdown)) {
      const isDominant = archName === dominantArchetype;
      const barItem = document.createElement('div');
      barItem.className = `breakdown-bar-item ${isDominant ? 'dominant' : ''}`;

      barItem.innerHTML = `
        <div class="breakdown-bar-header">
          <span>${archName}</span>
          <span style="color: ${isDominant ? primaryColor : 'rgba(255, 255, 255, 0.6)'}; font-weight: 700;">
            ${stats.percentage}%
          </span>
        </div>
        <div class="breakdown-track">
          <div class="breakdown-fill" style="width: ${stats.percentage}%; ${isDominant ? `background: ${primaryColor}; box-shadow: 0 0 10px ${primaryColor};` : ''}"></div>
        </div>
      `;

      this.dom.egoBreakdownGrid.appendChild(barItem);
    }
  }

  /**
   * Initialize AI Chat for current result with persistent history and question limits
   */
  initAiChat(result) {
    this.personaChat = new PersonaChat(result);
    this.dom.chatMessages.innerHTML = '';

    const savedHistory = Storage.getChatHistory();
    if (savedHistory && Array.isArray(savedHistory) && savedHistory.length > 0) {
      this.personaChat.setHistory(savedHistory);
      savedHistory.forEach(msg => {
        this.renderChatMessageBubble(msg.role, msg.content);
      });
    } else {
      // Initial greeting from the Alter Ego
      const name = result.rawName || result.characterName.split('·')[0].trim();
      const greeting = `Greetings across the fold. I am ${name} of ${result.universeDesignation}. You made the choices that brought you here—what do you wish to ask your other self?`;

      this.appendChatMessage('assistant', greeting);
      Storage.saveChatHistory(this.personaChat.getHistory());
    }

    // Refresh UI for remaining questions count
    this.updateQuestionsRemainingUI();
  }

  /**
   * Updates question counter badge, disabled states, and limit notice banner
   */
  updateQuestionsRemainingUI() {
    const remaining = Storage.getQuestionsRemaining();
    this.dom.chatRemainingText.textContent = `Questions remaining: ${remaining}/6`;

    if (remaining === 0) {
      this.dom.chatRemainingBadge.classList.add('exhausted');
      this.dom.chatInput.disabled = true;
      this.dom.chatInput.placeholder = "All 6 questions used for this alter ego.";
      this.dom.btnChatSend.disabled = true;
      this.dom.chatLimitNotice.classList.remove('hidden');

      // Disable suggestion chips
      this.dom.suggestionChips.forEach(chip => {
        chip.disabled = true;
        chip.classList.add('disabled');
      });
    } else {
      this.dom.chatRemainingBadge.classList.remove('exhausted');
      this.dom.chatInput.disabled = false;
      this.dom.chatInput.placeholder = "Ask your alter ego anything...";
      this.dom.btnChatSend.disabled = false;
      this.dom.chatLimitNotice.classList.add('hidden');

      // Enable suggestion chips
      this.dom.suggestionChips.forEach(chip => {
        chip.disabled = false;
        chip.classList.remove('disabled');
      });
    }
  }

  /**
   * Render single chat bubble
   */
  renderChatMessageBubble(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = role === 'user' ? 'YOU' : '✦';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    msg.appendChild(avatar);
    msg.appendChild(bubble);

    this.dom.chatMessages.appendChild(msg);
    this.dom.chatMessages.scrollTop = this.dom.chatMessages.scrollHeight;
  }

  /**
   * Append a message bubble to the chat window
   */
  appendChatMessage(role, text) {
    this.renderChatMessageBubble(role, text);
  }

  /**
   * Append animated typing dots
   */
  appendTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'chat-message assistant typing-msg';
    msg.id = 'chat-typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = '✦';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    this.dom.chatMessages.appendChild(msg);
    this.dom.chatMessages.scrollTop = this.dom.chatMessages.scrollHeight;
  }

  removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  /**
   * Handle user submitting a question to their Alter Ego
   */
  async handleSendChatMessage() {
    const text = this.dom.chatInput.value.trim();

    // 1. Empty questions don't count
    if (!text) return;

    // 2. Check remaining question limit
    const remaining = Storage.getQuestionsRemaining();
    if (remaining === 0) {
      this.updateQuestionsRemainingUI();
      this.showToast("You've used all 6 questions for this alter ego.", 'fa-lock');
      return;
    }

    // 3. Check for identical repeated questions (repeated questions don't count against limit)
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const askedQuestions = Storage.getAskedQuestions();
    const isRepeated = askedQuestions.includes(normalized);

    // Reset input field
    this.dom.chatInput.value = '';
    sound.playClick();
    this.appendChatMessage('user', text);
    this.appendTypingIndicator();
    this.dom.btnChatSend.disabled = true;

    if (isRepeated) {
      this.showToast('Identical question detected. Repeated questions do not count against your total.', 'fa-circle-info');
    }

    try {
      const response = await this.personaChat.ask(text);
      this.removeTypingIndicator();
      this.appendChatMessage('assistant', response.reply);
      Storage.saveChatHistory(this.personaChat.getHistory());
      if (!isRepeated) {
        askedQuestions.push(normalized);
        Storage.setAskedQuestions(askedQuestions);
        Storage.setQuestionsRemaining(remaining - 1);
      }
      sound.playTone(720, 'sine', 0.2, 0.05);
    } catch (err) {
      this.removeTypingIndicator();
      this.appendChatMessage('assistant', 'The quantum link flickered, but my presence remains steadfast. Speak to me again.');
    } finally {
      this.updateQuestionsRemainingUI();
    }
  }

  /**
   * Action: SAVE MY ALTER EGO
   */
  handleSaveAlterEgo() {
    if (!this.currentResult) return;
    const ok = Storage.saveAlterEgo(this.currentResult);
    if (ok) {
      this.showToast('Alter Ego saved to your local multiverse timeline!', 'fa-floppy-disk');
      this.dom.btnSaveEgo.innerHTML = `<i class="fa-solid fa-check"></i> <span>SAVED</span>`;
      setTimeout(() => {
        this.dom.btnSaveEgo.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>SAVE MY ALTER EGO</span>`;
      }, 2500);
    } else {
      this.showToast('Unable to write to local storage', 'fa-triangle-exclamation');
    }
  }

  /**
   * Action: COPY RESULT
   */
  async handleCopyResult() {
    if (!this.currentResult) return;
    const { characterName, archetype, universeDesignation, meta, breakdown } = this.currentResult;

    let breakdownSummary = '';
    if (breakdown) {
      breakdownSummary = Object.entries(breakdown)
        .map(([k, v]) => `${k.replace('THE ', '')}: ${v.percentage}%`)
        .join(' | ');
    }

    const textToCopy = `✦ ALTER EGO IDENTITY ARCHIVE ✦
Character: ${characterName}
Archetype: ${archetype}
Universe: ${universeDesignation}
Aesthetic: ${meta?.aesthetic || ''}
Core Strength: ${meta?.coreStrength || ''}
Superpower: ${meta?.superpower || ''}
Signature Quote: ${meta?.signatureQuote || ''}
In another universe: ${meta?.inAnotherUniverse || ''}

Resonance Breakdown:
${breakdownSummary}

Discover your multiverse identity with ALTER EGO.`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      this.showToast('Alter Ego identity copied to clipboard!', 'fa-clipboard-check');
    } catch (err) {
      this.showToast('Failed to copy. Please allow clipboard permissions.', 'fa-triangle-exclamation');
    }
  }

  /**
   * Action: SHARE RESULT
   */
  async handleShareResult() {
    if (!this.currentResult) return;
    const { characterName, archetype, universeDesignation } = this.currentResult;
    const shareData = {
      title: `Alter Ego: ${characterName}`,
      text: `I discovered my multiverse identity: ${characterName} (${archetype}) in ${universeDesignation}!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.showToast('Shared across dimensions!', 'fa-share-nodes');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fall back to link copy
        } else {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        this.showToast('Link copied to clipboard!', 'fa-link');
      } else {
        this.handleCopyResult();
      }
    } catch (e) {
      this.showToast('Share link ready to send!', 'fa-share');
    }
  }

  /**
   * Action: DOWNLOAD CARD (High-DPI Canvas PNG)
   */
  async handleDownloadCard() {
    if (!this.currentResult) return;
    this.showToast('Synthesizing high-DPI collector card...', 'fa-palette');

    try {
      const blobOrDataUrl = await generateAlterEgoCard(this.currentResult);
      let url;
      if (blobOrDataUrl instanceof Blob) {
        url = URL.createObjectURL(blobOrDataUrl);
      } else {
        url = blobOrDataUrl;
      }

      const rawName = this.currentResult.rawName || 'alter-ego';
      const cleanFilename = `alter-ego-${rawName.toLowerCase().replace(/\s+/g, '-')}.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = cleanFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (blobOrDataUrl instanceof Blob) {
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      this.showToast('Card downloaded successfully!', 'fa-circle-check');
    } catch (err) {
      console.error(err);
      this.showToast('Card generation failed. Please try again.', 'fa-triangle-exclamation');
    }
  }

  /**
   * Action: RETAKE QUIZ
   */
  retakeQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
    Storage.clearProgress();
    this.startQuiz();
    this.showToast('Starting fresh multiverse calibration', 'fa-rotate-left');
  }

  /**
   * Toast notification system
   */
  showToast(message, icon = 'fa-sparkles', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--neon-purple);"></i> <span>${message}</span>`;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  /**
   * Cosmic Canvas Background
   */
  initCanvasStarfield() {
    const canvas = this.dom.cosmicCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createStars();
    });

    const starCount = 140;
    let stars = [];
    let shootingStar = null;

    function createStars() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    createStars();

    function maybeSpawnShootingStar() {
      if (!shootingStar && Math.random() < 0.008) {
        shootingStar = {
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 10 + 12,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          alpha: 1
        };
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(s => {
        s.phase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.1, s.alpha + Math.sin(s.phase) * 0.3);
        ctx.fillStyle = `rgba(240, 230, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        s.y -= s.speed;
        if (s.y < 0) s.y = height;
      });

      maybeSpawnShootingStar();
      if (shootingStar) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
        grad.addColorStop(1, 'rgba(192, 132, 252, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.02;

        if (shootingStar.alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar = null;
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new AlterEgoApp();
  app.init();
  window._alterEgoApp = app;
});
