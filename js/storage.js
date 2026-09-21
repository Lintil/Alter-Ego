/**
 * ALTER EGO - Local Storage & State Persistence Manager
 */

const STORAGE_KEY_RESULT = 'alter_ego_saved_profile_v1';
const STORAGE_KEY_PROGRESS = 'alter_ego_quiz_progress_v1';
const STORAGE_KEY_CHAT = 'alter_ego_chat_history_v1';
const STORAGE_KEY_ACTIVE_VIEW = 'alter_ego_active_view_v1';
const STORAGE_KEY_QUESTIONS_LEFT = 'alter_ego_questions_remaining_v1';
const STORAGE_KEY_ASKED_QUESTIONS = 'alter_ego_asked_questions_v1';

export const Storage = {
  /**
   * Save the complete generated Alter Ego result
   * @param {Object} result 
   * @returns {boolean} Success status
   */
  saveAlterEgo(result) {
    try {
      if (!result) return false;
      const dataToSave = {
        answers: result.answers || [],
        scores: result.rawScores || {},
        rawScores: result.rawScores || {},
        breakdown: result.breakdown || {},
        archetype: result.archetype,
        characterName: result.characterName,
        rawName: result.rawName,
        title: result.title,
        universeDesignation: result.universeDesignation,
        savedAt: new Date().toISOString(),
        totalPoints: result.totalPoints,
        meta: result.meta ? {
          id: result.meta.id,
          name: result.meta.name,
          traits: result.meta.traits,
          color: result.meta.color,
          gradient: result.meta.gradient,
          glowColor: result.meta.glowColor,
          symbol: result.meta.symbol,
          icon: result.meta.icon,
          aesthetic: result.meta.aesthetic,
          coreStrength: result.meta.coreStrength,
          hiddenTrait: result.meta.hiddenTrait,
          superpower: result.meta.superpower,
          weakness: result.meta.weakness,
          signatureQuote: result.meta.signatureQuote,
          inAnotherUniverse: result.meta.inAnotherUniverse,
          characterNames: result.meta.characterNames,
          titles: result.meta.titles
        } : null
      };
      localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(dataToSave));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  },

  /**
   * Retrieve saved Alter Ego profile
   * @returns {Object|null}
   */
  getSavedAlterEgo() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RESULT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return null;
    }
  },

  /**
   * Clear saved profile
   */
  clearSavedAlterEgo() {
    try {
      localStorage.removeItem(STORAGE_KEY_RESULT);
      localStorage.removeItem(STORAGE_KEY_CHAT);
      localStorage.removeItem(STORAGE_KEY_QUESTIONS_LEFT);
      localStorage.removeItem(STORAGE_KEY_ASKED_QUESTIONS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_VIEW);
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Track current active view for seamless refresh restoration
   */
  setActiveView(viewId) {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_VIEW, viewId);
    } catch (e) {
      console.warn(e);
    }
  },

  getActiveView() {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_VIEW);
    } catch (e) {
      return null;
    }
  },

  /**
   * Question limit tracking (strictly 6 questions per alter ego)
   */
  getQuestionsRemaining() {
    try {
      const val = localStorage.getItem(STORAGE_KEY_QUESTIONS_LEFT);
      if (val === null) return 6;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 6 : Math.max(0, Math.min(6, parsed));
    } catch (e) {
      return 6;
    }
  },

  setQuestionsRemaining(count) {
    try {
      const safeCount = Math.max(0, Math.min(6, count));
      localStorage.setItem(STORAGE_KEY_QUESTIONS_LEFT, safeCount.toString());
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Repeated question tracker
   */
  getAskedQuestions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ASKED_QUESTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  setAskedQuestions(list) {
    try {
      localStorage.setItem(STORAGE_KEY_ASKED_QUESTIONS, JSON.stringify(list || []));
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Save in-progress quiz answers
   */
  saveProgress(stepIndex, answers) {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify({
        stepIndex,
        answers,
        updatedAt: Date.now()
      }));
    } catch (e) {
      console.warn('Progress save failed:', e);
    }
  },

  /**
   * Get in-progress quiz answers
   */
  getProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Clear in-progress answers
   */
  clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Save persona chat history
   */
  saveChatHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(history));
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Load persona chat history
   */
  getChatHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHAT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  clearChatHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
    } catch (e) {
      console.warn(e);
    }
  }
};
