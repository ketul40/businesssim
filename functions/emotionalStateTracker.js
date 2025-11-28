/**
 * Emotional State Tracker
 * 
 * Tracks and updates stakeholder emotional state based on conversation flow.
 * Monitors concerns addressed vs unaddressed and provides state-specific instructions.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4
 */

/**
 * Emotional state definitions with characteristics
 */
const emotionalStates = {
  neutral: {
    description: 'Starting state, open but not committed',
    toneMarkers: ['Okay', 'I see', 'Alright'],
    languageStyle: 'balanced, professional',
  },
  skeptical: {
    description: 'Doubtful, needs convincing',
    toneMarkers: ['Hmm', 'I\'m not sure', 'I don\'t know'],
    languageStyle: 'questioning, challenging',
  },
  curious: {
    description: 'Interested, wants to learn more',
    toneMarkers: ['Interesting', 'Tell me more', 'Help me understand'],
    languageStyle: 'exploratory, open-ended questions',
  },
  warming_up: {
    description: 'Starting to be convinced, more receptive',
    toneMarkers: ['I see what you mean', 'That makes sense', 'Fair point'],
    languageStyle: 'acknowledging, softer',
  },
  concerned: {
    description: 'Worried about specific issues',
    toneMarkers: ['I\'m worried about', 'My concern is', 'What worries me'],
    languageStyle: 'risk-focused, cautious',
  },
  frustrated: {
    description: 'Impatient, not getting what they need',
    toneMarkers: ['Look', 'I need to be clear', 'We keep coming back to this'],
    languageStyle: 'direct, impatient',
  },
  satisfied: {
    description: 'Convinced, ready to move forward',
    toneMarkers: ['That works', 'I like that', 'Now we\'re talking'],
    languageStyle: 'positive, agreeable',
  },
};

/**
 * State transition rules based on conversation patterns
 */
const stateTransitions = {
  // User addresses concern
  concernAddressed: {
    from: ['skeptical', 'concerned', 'frustrated'],
    to: 'warming_up',
    weight: 0.7,
  },
  // User makes strong point
  strongPoint: {
    from: ['neutral', 'skeptical'],
    to: 'curious',
    weight: 0.6,
  },
  // User is vague or insufficient
  vagueResponse: {
    from: ['neutral', 'curious'],
    to: 'skeptical',
    weight: 0.5,
  },
  // User ignores concern
  ignoredConcern: {
    from: ['concerned', 'skeptical'],
    to: 'frustrated',
    weight: 0.8,
  },
  // Multiple concerns addressed
  multipleConcernsAddressed: {
    from: ['warming_up', 'curious'],
    to: 'satisfied',
    weight: 0.9,
  },
  // User provides data/evidence
  providesEvidence: {
    from: ['skeptical', 'neutral'],
    to: 'curious',
    weight: 0.6,
  },
};

/**
 * EmotionalStateTracker class
 * Tracks stakeholder emotional state throughout conversation
 */
class EmotionalStateTracker {
  /**
   * Create an EmotionalStateTracker
   * @param {Object} stakeholder - Stakeholder object with concerns
   * @param {Object} scenario - Scenario object with context
   */
  constructor(stakeholder, scenario) {
    if (!stakeholder) {
      throw new Error('EmotionalStateTracker requires a valid stakeholder object');
    }
    if (!scenario) {
      throw new Error('EmotionalStateTracker requires a valid scenario object');
    }
    this.stakeholder = stakeholder;
    this.scenario = scenario;
    this.currentState = 'neutral';
    this.stateHistory = [{
      state: 'neutral',
      turn: 0,
      reason: 'Initial state',
    }];
    this.concerns = stakeholder.concerns || [];
    this.concernsAddressed = new Set();
    this.concernsUnaddressed = new Set(this.concerns);
    this.lastUserMessageLength = 0;
    this.vagueResponseCount = 0;
  }

  /**
   * Analyze transcript and update emotional state
   * @param {Array} transcript - Conversation history
   * @return {string} Updated emotional state
   */
  analyzeTranscript(transcript) {
    if (!transcript || transcript.length === 0) {
      return this.currentState;
    }

    try {
      // Get the last few messages for context
      const recentMessages = transcript.slice(-4);
      const lastUserMessage = recentMessages
        .filter(msg => msg.type === 'user')
        .pop();

      if (!lastUserMessage) {
        return this.currentState;
      }

      // Analyze user message characteristics
      const analysis = this._analyzeUserMessage(lastUserMessage, transcript);

      // Determine state transition
      const newState = this._determineStateTransition(analysis);

      // Update state if changed
      if (newState !== this.currentState) {
        this._updateState(newState, transcript.length, analysis.reason);
      }

      return this.currentState;
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      // Default to neutral on error
      return 'neutral';
    }
  }

  /**
   * Analyze user message for state transition signals
   * @param {Object} message - User message object
   * @param {Array} transcript - Full conversation history
   * @return {Object} Analysis results
   * @private
   */
  _analyzeUserMessage(message, transcript) {
    const content = message.content.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    
    const analysis = {
      concernsAddressed: [],
      hasSpecifics: false,
      isVague: false,
      hasEvidence: false,
      reason: '',
    };

    // Check if message addresses any concerns
    for (const concern of this.concerns) {
      const concernKeywords = this._extractKeywords(concern);
      const matchCount = concernKeywords.filter(keyword => 
        content.includes(keyword.toLowerCase())
      ).length;

      if (matchCount >= 2 || (matchCount >= 1 && wordCount > 30)) {
        analysis.concernsAddressed.push(concern);
        this.concernsAddressed.add(concern);
        this.concernsUnaddressed.delete(concern);
      }
    }

    // Check for specifics (numbers, data, concrete examples)
    const hasNumbers = /\d+/.test(content);
    const hasPercentage = /%|percent/.test(content);
    const hasTimeframe = /week|month|quarter|year|day/.test(content);
    const hasMetrics = /metric|kpi|measure|result|outcome/.test(content);
    const hasExamples = /example|instance|case|specifically|for example/.test(content);
    
    analysis.hasSpecifics = hasNumbers || hasPercentage || hasTimeframe || 
                           hasMetrics || hasExamples;

    // Check for evidence/data
    const hasDataWords = /data|research|study|analysis|report|evidence|proof/.test(content);
    const hasResults = /result|outcome|success|improvement|increase|decrease/.test(content);
    analysis.hasEvidence = (hasDataWords || hasResults) && hasNumbers;

    // Check if message is vague
    analysis.isVague = wordCount < 15 && !analysis.hasSpecifics;
    
    if (analysis.isVague) {
      this.vagueResponseCount++;
    } else {
      this.vagueResponseCount = 0;
    }

    // Determine primary reason for state change
    if (analysis.concernsAddressed.length > 0) {
      analysis.reason = `Addressed concern: ${analysis.concernsAddressed[0]}`;
    } else if (analysis.hasEvidence) {
      analysis.reason = 'Provided evidence and data';
    } else if (analysis.hasSpecifics) {
      analysis.reason = 'Provided specific details';
    } else if (analysis.isVague) {
      analysis.reason = 'Vague or insufficient response';
    } else {
      analysis.reason = 'General response';
    }

    return analysis;
  }

  /**
   * Extract keywords from a concern string
   * @param {string} concern - Concern text
   * @return {Array<string>} Keywords
   * @private
   */
  _extractKeywords(concern) {
    // Remove common words and extract meaningful keywords
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    ]);

    return concern
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  /**
   * Determine state transition based on analysis
   * @param {Object} analysis - Message analysis results
   * @return {string} New emotional state
   * @private
   */
  _determineStateTransition(analysis) {
    const current = this.currentState;

    // Multiple concerns addressed -> satisfied
    if (this.concernsAddressed.size >= Math.ceil(this.concerns.length * 0.6)) {
      if (current === 'warming_up' || current === 'curious') {
        return 'satisfied';
      }
    }

    // Concern addressed -> warming_up
    if (analysis.concernsAddressed.length > 0) {
      if (current === 'skeptical' || current === 'concerned' || current === 'frustrated') {
        return 'warming_up';
      }
      if (current === 'neutral') {
        return 'curious';
      }
    }

    // Evidence provided -> curious
    if (analysis.hasEvidence) {
      if (current === 'skeptical' || current === 'neutral') {
        return 'curious';
      }
    }

    // Strong specifics -> curious or warming_up
    if (analysis.hasSpecifics && !analysis.concernsAddressed.length) {
      if (current === 'neutral' || current === 'skeptical') {
        return 'curious';
      }
    }

    // Vague responses -> skeptical or frustrated
    if (analysis.isVague) {
      if (this.vagueResponseCount >= 2) {
        if (current === 'concerned' || current === 'skeptical') {
          return 'frustrated';
        }
        if (current === 'neutral' || current === 'curious') {
          return 'skeptical';
        }
      }
    }

    // Concerns not being addressed -> concerned or frustrated
    if (this.concernsUnaddressed.size === this.concerns.length && 
        this.stateHistory.length > 3) {
      if (current === 'neutral' || current === 'curious') {
        return 'concerned';
      }
      if (current === 'skeptical' || current === 'concerned') {
        return 'frustrated';
      }
    }

    // No transition
    return current;
  }

  /**
   * Update current state and history
   * @param {string} newState - New emotional state
   * @param {number} turn - Current turn number
   * @param {string} reason - Reason for transition
   * @private
   */
  _updateState(newState, turn, reason) {
    this.currentState = newState;
    this.stateHistory.push({
      state: newState,
      turn: turn,
      reason: reason,
    });
  }

  /**
   * Get current emotional state
   * @return {string} Current emotional state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Get state history
   * @return {Array} State transition history
   */
  getStateHistory() {
    return this.stateHistory;
  }

  /**
   * Get concerns addressed
   * @return {Array<string>} List of addressed concerns
   */
  getConcernsAddressed() {
    return Array.from(this.concernsAddressed);
  }

  /**
   * Get concerns unaddressed
   * @return {Array<string>} List of unaddressed concerns
   */
  getConcernsUnaddressed() {
    return Array.from(this.concernsUnaddressed);
  }

  /**
   * Get state instructions for prompt engineering
   * @return {string} Instructions for AI model based on current state
   */
  getStateInstructions() {
    const state = emotionalStates[this.currentState] || emotionalStates.neutral;
    const concernsAddressedCount = this.concernsAddressed.size;
    const concernsTotal = this.concerns.length;

    let instructions = `Current Emotional State: ${this.currentState}\n\n`;
    
    instructions += `State Description: ${state.description}\n\n`;
    
    instructions += 'Tone and Language:\n';
    instructions += `- Use ${state.languageStyle} language\n`;
    instructions += `- Incorporate tone markers like: ${state.toneMarkers.join(', ')}\n`;
    
    // State-specific instructions
    switch (this.currentState) {
      case 'skeptical':
        instructions += '- Ask challenging questions\n';
        instructions += '- Use "but" statements to express doubt\n';
        instructions += '- Request proof or evidence\n';
        instructions += '- Point out potential problems\n';
        break;
      
      case 'curious':
        instructions += '- Ask exploratory, open-ended questions\n';
        instructions += '- Show genuine interest in learning more\n';
        instructions += '- Use phrases like "Tell me more about..." or "Help me understand..."\n';
        instructions += '- Build on what the user is saying\n';
        break;
      
      case 'warming_up':
        instructions += '- Acknowledge good points made by the user\n';
        instructions += '- Use softer, more receptive language\n';
        instructions += '- Show you\'re starting to be convinced\n';
        instructions += '- Still ask questions but in a more collaborative way\n';
        break;
      
      case 'concerned':
        instructions += '- Express specific worries about the proposal\n';
        instructions += '- Use risk-focused language\n';
        instructions += '- Ask about potential downsides\n';
        instructions += '- Show you need reassurance\n';
        break;
      
      case 'frustrated':
        instructions += '- Be more direct and impatient\n';
        instructions += '- Point out that concerns aren\'t being addressed\n';
        instructions += '- Use phrases like "I\'ve said this before" or "We keep coming back to this"\n';
        instructions += '- Show you need clear, specific answers\n';
        break;
      
      case 'satisfied':
        instructions += '- Show agreement and approval\n';
        instructions += '- Use positive language\n';
        instructions += '- Indicate readiness to move forward\n';
        instructions += '- Acknowledge that concerns have been addressed\n';
        break;
      
      case 'neutral':
      default:
        instructions += '- Maintain professional, balanced tone\n';
        instructions += '- Ask clarifying questions\n';
        instructions += '- Show openness but not commitment\n';
        instructions += '- React naturally to what the user says\n';
        break;
    }

    // Add concern tracking context
    instructions += '\nConcern Status:\n';
    instructions += `- ${concernsAddressedCount} of ${concernsTotal} concerns addressed\n`;
    
    if (this.concernsUnaddressed.size > 0) {
      instructions += '- Unaddressed concerns:\n';
      Array.from(this.concernsUnaddressed).forEach(concern => {
        instructions += `  • ${concern}\n`;
      });
      instructions += '- Naturally bring up unaddressed concerns when relevant\n';
    }

    if (this.concernsAddressed.size > 0) {
      instructions += '- Addressed concerns:\n';
      Array.from(this.concernsAddressed).forEach(concern => {
        instructions += `  • ${concern}\n`;
      });
    }

    return instructions;
  }

  /**
   * Get emotional trajectory (improving, declining, stable)
   * @return {string} Trajectory description
   */
  getTrajectory() {
    if (this.stateHistory.length < 2) {
      return 'stable';
    }

    // Define state positivity scores
    const stateScores = {
      frustrated: 1,
      concerned: 2,
      skeptical: 3,
      neutral: 4,
      curious: 5,
      warming_up: 6,
      satisfied: 7,
    };

    const recentStates = this.stateHistory.slice(-3);
    const scores = recentStates.map(s => stateScores[s.state] || 4);

    if (scores.length < 2) {
      return 'stable';
    }

    const trend = scores[scores.length - 1] - scores[0];

    if (trend > 1) {
      return 'improving';
    } else if (trend < -1) {
      return 'declining';
    } else {
      return 'stable';
    }
  }
}

module.exports = {
  EmotionalStateTracker,
  emotionalStates,
  stateTransitions,
};
