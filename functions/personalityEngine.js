/**
 * Personality Engine
 * 
 * Maps stakeholder personality traits to specific communication patterns.
 * Provides language instructions and sample phrases for each personality type.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

/**
 * Personality pattern mappings
 * Each personality type has specific language characteristics
 */
const personalityPatterns = {
  direct: {
    sentenceLength: 'short',
    assertiveness: 'high',
    hedging: 'minimal',
    questionStyle: 'pointed',
    characteristics: [
      'Uses short, declarative sentences',
      'Employs assertive verbs (need, want, must)',
      'Minimal hedging or qualifiers',
      'Direct questions without softening',
      'Gets straight to the point',
    ],
  },
  collaborative: {
    sentenceLength: 'medium',
    assertiveness: 'moderate',
    hedging: 'moderate',
    questionStyle: 'inclusive',
    characteristics: [
      'Uses inclusive pronouns (we, us, our)',
      'Asks questions to build understanding',
      'Uses building phrases (let\'s, how about, what if)',
      'Seeks input and consensus',
      'Emphasizes partnership',
    ],
  },
  analytical: {
    sentenceLength: 'medium-long',
    assertiveness: 'moderate',
    hedging: 'conditional',
    questionStyle: 'probing',
    characteristics: [
      'Requests specific data and metrics',
      'Uses precise, technical terminology',
      'Employs conditional language (if-then)',
      'Asks for evidence and reasoning',
      'Focuses on logic and details',
    ],
  },
  creative: {
    sentenceLength: 'varied',
    assertiveness: 'moderate',
    hedging: 'exploratory',
    questionStyle: 'open-ended',
    characteristics: [
      'Uses metaphors and analogies',
      'Asks exploratory, open-ended questions',
      'Employs possibility language (could, might, imagine)',
      'Thinks outside conventional boundaries',
      'Connects disparate ideas',
    ],
  },
  supportive: {
    sentenceLength: 'medium',
    assertiveness: 'low-moderate',
    hedging: 'empathetic',
    questionStyle: 'encouraging',
    characteristics: [
      'Uses encouraging phrases and validation',
      'Employs empathy markers (I understand, I see)',
      'Offers help and resources',
      'Acknowledges feelings and concerns',
      'Builds confidence',
    ],
  },
  skeptical: {
    sentenceLength: 'medium',
    assertiveness: 'high',
    hedging: 'challenging',
    questionStyle: 'probing',
    characteristics: [
      'Asks challenging questions',
      'Uses "but" statements frequently',
      'Requests proof and evidence',
      'Points out potential problems',
      'Questions assumptions',
    ],
  },
  balanced: {
    sentenceLength: 'medium',
    assertiveness: 'moderate',
    hedging: 'moderate',
    questionStyle: 'varied',
    characteristics: [
      'Mixes different communication styles',
      'Adapts to conversation context',
      'Uses varied sentence structures',
      'Balances directness with diplomacy',
      'Flexible approach',
    ],
  },
};

/**
 * Sample phrases for each personality type
 */
const samplePhrases = {
  direct: [
    "I need to see results by Friday.",
    "What's the bottom line here?",
    "Let's cut to the chase.",
    "That won't work. Here's why.",
    "I want three specific examples.",
  ],
  collaborative: [
    "How can we solve this together?",
    "What if we tried combining our approaches?",
    "Let's build on that idea.",
    "I'd love to hear your thoughts on this.",
    "We're in this together.",
  ],
  analytical: [
    "What data supports that conclusion?",
    "Can you walk me through the numbers?",
    "If we do X, then Y will happen, correct?",
    "I need to understand the methodology.",
    "What are the key metrics we're tracking?",
  ],
  creative: [
    "What if we looked at this from a different angle?",
    "Imagine if we could...",
    "This reminds me of how...",
    "Let's think outside the box here.",
    "What possibilities are we not seeing?",
  ],
  supportive: [
    "I can see you've put a lot of thought into this.",
    "That's a really valid concern.",
    "How can I help you move forward?",
    "I appreciate you bringing this up.",
    "You're on the right track.",
  ],
  skeptical: [
    "I'm not convinced. What evidence do you have?",
    "That sounds good, but what about the risks?",
    "I've seen this fail before. Why would it work now?",
    "Prove it to me.",
    "What are you not telling me?",
  ],
  balanced: [
    "I see your point, and I have some questions.",
    "That's interesting. Let me think about it.",
    "I appreciate the idea. Can we explore it further?",
    "Fair enough. What's the next step?",
    "I'm open to this, but I need more details.",
  ],
};

/**
 * PersonalityEngine class
 * Maps stakeholder personality to language patterns and instructions
 */
class PersonalityEngine {
  /**
   * Create a PersonalityEngine
   * @param {Object} stakeholder - Stakeholder object with personality field
   */
  constructor(stakeholder) {
    if (!stakeholder) {
      throw new Error('PersonalityEngine requires a valid stakeholder object');
    }
    this.stakeholder = stakeholder;
    this.personalityType = this._normalizePersonality(stakeholder.personality);
    this.patterns = this.derivePatterns();
  }

  /**
   * Normalize personality string to match known types
   * @param {string} personality - Raw personality string
   * @return {string} Normalized personality type
   * @private
   */
  _normalizePersonality(personality) {
    if (!personality) {
      return 'balanced';
    }

    const normalized = personality.toLowerCase().trim();
    
    // Check for exact matches
    if (personalityPatterns[normalized]) {
      return normalized;
    }

    // Check for partial matches
    const personalityKeys = Object.keys(personalityPatterns);
    for (const key of personalityKeys) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return key;
      }
    }

    // Default to balanced if no match found
    console.warn(`Unknown personality type: ${personality}. Defaulting to balanced.`);
    return 'balanced';
  }

  /**
   * Derive language patterns from personality type
   * @return {Object} Pattern configuration for this personality
   */
  derivePatterns() {
    return personalityPatterns[this.personalityType] || personalityPatterns.balanced;
  }

  /**
   * Get language instructions for prompt engineering
   * @return {string} Detailed instructions for AI model
   */
  getLanguageInstructions() {
    const patterns = this.patterns;
    const type = this.personalityType;

    let instructions = `Communication Style: ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
    
    instructions += 'Language Characteristics:\n';
    patterns.characteristics.forEach((char, index) => {
      instructions += `${index + 1}. ${char}\n`;
    });

    instructions += '\nSpecific Guidelines:\n';
    
    // Sentence length guidance
    switch (patterns.sentenceLength) {
      case 'short':
        instructions += '- Keep sentences brief and punchy (5-10 words average)\n';
        break;
      case 'medium':
        instructions += '- Use moderate sentence length (10-15 words average)\n';
        break;
      case 'medium-long':
        instructions += '- Use detailed sentences when needed (15-20 words average)\n';
        break;
      case 'varied':
        instructions += '- Vary sentence length dramatically for emphasis\n';
        break;
    }

    // Assertiveness guidance
    switch (patterns.assertiveness) {
      case 'high':
        instructions += '- Be direct and assertive in your statements\n';
        instructions += '- Use strong, definitive verbs\n';
        break;
      case 'moderate':
        instructions += '- Balance assertiveness with openness\n';
        instructions += '- Use a mix of statements and questions\n';
        break;
      case 'low-moderate':
        instructions += '- Use softer, more tentative language\n';
        instructions += '- Emphasize support over direction\n';
        break;
    }

    // Hedging guidance
    switch (patterns.hedging) {
      case 'minimal':
        instructions += '- Avoid hedging language; be definitive\n';
        break;
      case 'moderate':
        instructions += '- Use occasional hedging for diplomacy\n';
        break;
      case 'conditional':
        instructions += '- Use conditional statements (if-then) frequently\n';
        break;
      case 'exploratory':
        instructions += '- Use possibility language (could, might, perhaps)\n';
        break;
      case 'empathetic':
        instructions += '- Use hedging to show understanding and care\n';
        break;
      case 'challenging':
        instructions += '- Use hedging to question and probe\n';
        break;
    }

    // Question style guidance
    instructions += `- Ask ${patterns.questionStyle} questions\n`;

    return instructions;
  }

  /**
   * Get sample phrases for this personality
   * @return {Array<string>} Example phrases demonstrating personality
   */
  getSamplePhrases() {
    return samplePhrases[this.personalityType] || samplePhrases.balanced;
  }

  /**
   * Get personality type
   * @return {string} Current personality type
   */
  getPersonalityType() {
    return this.personalityType;
  }
}

module.exports = {
  PersonalityEngine,
  personalityPatterns,
  samplePhrases,
};
