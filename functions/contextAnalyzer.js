/**
 * Context Analyzer
 * 
 * Extracts key points from conversation for natural referencing.
 * Detects contradictions and tracks user commitments.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

/**
 * Importance scoring weights for key point extraction
 */
const importanceWeights = {
  hasNumbers: 2,
  hasCommitment: 3,
  hasQuestion: 1,
  hasConcern: 2,
  hasDecision: 3,
  longMessage: 1,
  hasSpecifics: 2,
};

/**
 * Commitment indicator patterns
 */
const commitmentPatterns = [
  /\bI will\b/i,
  /\bI'll\b/i,
  /\bwe will\b/i,
  /\bwe'll\b/i,
  /\bI can\b/i,
  /\bwe can\b/i,
  /\bI promise\b/i,
  /\bI commit\b/i,
  /\bI agree to\b/i,
  /\blet me\b/i,
  /\bI plan to\b/i,
  /\bI intend to\b/i,
];

/**
 * Decision indicator patterns
 */
const decisionPatterns = [
  /\bI've decided\b/i,
  /\bwe've decided\b/i,
  /\bI think we should\b/i,
  /\blet's go with\b/i,
  /\bI propose\b/i,
  /\bI suggest\b/i,
  /\bmy recommendation\b/i,
  /\bI recommend\b/i,
];

/**
 * Concern indicator patterns
 */
const concernPatterns = [
  /\bI'm worried\b/i,
  /\bI'm concerned\b/i,
  /\bmy concern\b/i,
  /\bthe problem is\b/i,
  /\bthe issue is\b/i,
  /\bwhat if\b/i,
  /\bhow do we\b/i,
  /\bwhat about\b/i,
];

/**
 * ContextAnalyzer class
 * Analyzes conversation transcript for key points and patterns
 */
class ContextAnalyzer {
  /**
   * Create a ContextAnalyzer
   * @param {Array} transcript - Conversation history
   */
  constructor(transcript) {
    if (transcript === null || transcript === undefined) {
      throw new Error('ContextAnalyzer requires a transcript array (can be empty)');
    }
    if (!Array.isArray(transcript)) {
      throw new Error('ContextAnalyzer transcript must be an array');
    }
    this.transcript = transcript;
    this.keyPoints = [];
    this.userCommitments = [];
    this.stakeholderConcerns = [];
    this.contradictions = [];
    this.topicsDiscussed = new Set();
    
    // Analyze transcript on initialization
    if (this.transcript.length > 0) {
      this._analyzeTranscript();
    }
  }

  /**
   * Analyze the full transcript
   * @private
   */
  _analyzeTranscript() {
    try {
      this.extractKeyPoints();
      this.findContradictions();
      this._extractCommitments();
      this._extractConcerns();
    } catch (error) {
      console.error('Error analyzing transcript:', error.message);
      // Gracefully continue with empty analysis results
    }
  }

  /**
   * Extract key points from conversation
   * Identifies important statements based on various signals
   * @return {Array} Key points with metadata
   */
  extractKeyPoints() {
    this.keyPoints = [];

    this.transcript.forEach((message, index) => {
      const content = message.content;
      const speaker = message.type; // 'user' or 'stakeholder'
      
      // Calculate importance score
      const importance = this._calculateImportance(content);
      
      // Only include messages with sufficient importance
      if (importance >= 3) {
        this.keyPoints.push({
          turn: index,
          speaker: speaker,
          content: content,
          importance: importance,
          summary: this._summarizePoint(content),
        });
      }

      // Extract topics
      this._extractTopics(content);
    });

    // Sort by importance
    this.keyPoints.sort((a, b) => b.importance - a.importance);

    return this.keyPoints;
  }

  /**
   * Calculate importance score for a message
   * @param {string} content - Message content
   * @return {number} Importance score
   * @private
   */
  _calculateImportance(content) {
    let score = 0;

    // Check for numbers/data
    if (/\d+/.test(content)) {
      score += importanceWeights.hasNumbers;
    }

    // Check for commitments
    if (commitmentPatterns.some(pattern => pattern.test(content))) {
      score += importanceWeights.hasCommitment;
    }

    // Check for questions
    if (/\?/.test(content)) {
      score += importanceWeights.hasQuestion;
    }

    // Check for concerns
    if (concernPatterns.some(pattern => pattern.test(content))) {
      score += importanceWeights.hasConcern;
    }

    // Check for decisions
    if (decisionPatterns.some(pattern => pattern.test(content))) {
      score += importanceWeights.hasDecision;
    }

    // Check message length (longer messages often more important)
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 30) {
      score += importanceWeights.longMessage;
    }

    // Check for specific details
    if (this._hasSpecifics(content)) {
      score += importanceWeights.hasSpecifics;
    }

    return score;
  }

  /**
   * Check if content has specific details
   * @param {string} content - Message content
   * @return {boolean} True if has specifics
   * @private
   */
  _hasSpecifics(content) {
    const specificPatterns = [
      /%|percent/i,
      /\$\d+/,
      /\d+\s*(week|month|quarter|year|day)/i,
      /metric|kpi|measure/i,
      /example|instance|specifically/i,
      /data|research|study|analysis/i,
    ];

    return specificPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Create a summary of a key point
   * @param {string} content - Full message content
   * @return {string} Summarized version
   * @private
   */
  _summarizePoint(content) {
    // Take first sentence or first 100 characters
    const firstSentence = content.split(/[.!?]/)[0];
    if (firstSentence.length <= 100) {
      return firstSentence.trim();
    }
    return content.substring(0, 100).trim() + '...';
  }

  /**
   * Extract topics from content
   * @param {string} content - Message content
   * @private
   */
  _extractTopics(content) {
    // Simple topic extraction based on key nouns
    // This is a basic implementation - could be enhanced with NLP
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'we', 'they', 'he', 'she', 'it', 'my', 'your', 'our',
    ]);

    words.forEach(word => {
      // Clean word
      const cleaned = word.replace(/[^a-z]/g, '');
      
      // Add if meaningful
      if (cleaned.length > 4 && !commonWords.has(cleaned)) {
        this.topicsDiscussed.add(cleaned);
      }
    });
  }

  /**
   * Extract user commitments from transcript
   * @private
   */
  _extractCommitments() {
    this.userCommitments = [];

    this.transcript.forEach((message, index) => {
      if (message.type === 'user') {
        const content = message.content;
        
        // Check for commitment patterns
        commitmentPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.userCommitments.push({
              turn: index,
              commitment: content,
              addressed: false, // Will be updated by tracking
              summary: this._summarizePoint(content),
            });
          }
        });
      }
    });
  }

  /**
   * Extract stakeholder concerns from transcript
   * @private
   */
  _extractConcerns() {
    this.stakeholderConcerns = [];

    this.transcript.forEach((message, index) => {
      if (message.type === 'stakeholder') {
        const content = message.content;
        
        // Check for concern patterns
        concernPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.stakeholderConcerns.push({
              turn: index,
              concern: content,
              addressed: false,
              summary: this._summarizePoint(content),
            });
          }
        });
      }
    });
  }

  /**
   * Find contradictions in user statements
   * Detects when user makes conflicting statements
   * @return {Array} List of contradictions found
   */
  findContradictions() {
    this.contradictions = [];

    // Get all user messages
    const userMessages = this.transcript
      .map((msg, index) => ({ ...msg, originalIndex: index }))
      .filter(msg => msg.type === 'user');

    // Compare pairs of messages for contradictions
    for (let i = 0; i < userMessages.length - 1; i++) {
      for (let j = i + 1; j < userMessages.length; j++) {
        const msg1 = userMessages[i];
        const msg2 = userMessages[j];
        
        const contradiction = this._detectContradiction(
          msg1.content,
          msg2.content
        );

        if (contradiction) {
          this.contradictions.push({
            turn1: msg1.originalIndex,
            turn2: msg2.originalIndex,
            description: contradiction,
            content1: this._summarizePoint(msg1.content),
            content2: this._summarizePoint(msg2.content),
          });
        }
      }
    }

    return this.contradictions;
  }

  /**
   * Detect if two statements contradict each other
   * @param {string} content1 - First statement
   * @param {string} content2 - Second statement
   * @return {string|null} Description of contradiction or null
   * @private
   */
  _detectContradiction(content1, content2) {
    const lower1 = content1.toLowerCase();
    const lower2 = content2.toLowerCase();

    // Check for direct negation patterns
    const negationPairs = [
      { positive: /\bcan\b/, negative: /\bcan't\b|\bcannot\b/ },
      { positive: /\bwill\b/, negative: /\bwon't\b|\bwill not\b/ },
      { positive: /\bshould\b/, negative: /\bshouldn't\b|\bshould not\b/ },
      { positive: /\bis\b/, negative: /\bisn't\b|\bis not\b/ },
      { positive: /\bdo\b/, negative: /\bdon't\b|\bdo not\b/ },
      { positive: /\bhave\b/, negative: /\bhaven't\b|\bhave not\b/ },
    ];

    // Check for yes/no contradictions on similar topics
    const hasYes1 = /\byes\b|\bagree\b|\bwill\b|\bcan\b/i.test(lower1);
    const hasNo2 = /\bno\b|\bdisagree\b|\bwon't\b|\bcan't\b/i.test(lower2);
    const hasYes2 = /\byes\b|\bagree\b|\bwill\b|\bcan\b/i.test(lower2);
    const hasNo1 = /\bno\b|\bdisagree\b|\bwon't\b|\bcan't\b/i.test(lower1);

    // Check for topic overlap
    const words1 = new Set(lower1.split(/\s+/).filter(w => w.length > 4));
    const words2 = new Set(lower2.split(/\s+/).filter(w => w.length > 4));
    const overlap = [...words1].filter(w => words2.has(w));

    // If there's topic overlap and opposing sentiment
    if (overlap.length >= 2) {
      if ((hasYes1 && hasNo2) || (hasNo1 && hasYes2)) {
        return `Contradictory statements about ${overlap[0]}`;
      }

      // Check for negation pairs
      for (const pair of negationPairs) {
        const hasPositive1 = pair.positive.test(lower1);
        const hasNegative2 = pair.negative.test(lower2);
        const hasPositive2 = pair.positive.test(lower2);
        const hasNegative1 = pair.negative.test(lower1);

        if ((hasPositive1 && hasNegative2) || (hasNegative1 && hasPositive2)) {
          return `Contradictory statements about capability or commitment`;
        }
      }
    }

    // Check for numeric contradictions
    const numbers1 = content1.match(/\d+/g);
    const numbers2 = content2.match(/\d+/g);
    
    if (numbers1 && numbers2 && overlap.length >= 1) {
      // If discussing same topic with different numbers, might be contradiction
      const num1 = parseInt(numbers1[0]);
      const num2 = parseInt(numbers2[0]);
      
      if (Math.abs(num1 - num2) > num1 * 0.5) {
        return `Contradictory numeric claims about ${overlap[0]}`;
      }
    }

    return null;
  }

  /**
   * Get referenceable points suitable for natural conversation
   * Returns points that can be naturally referenced by the stakeholder
   * @param {number} maxPoints - Maximum number of points to return
   * @return {Array} Referenceable points
   */
  getReferencablePoints(maxPoints = 5) {
    // Filter for high-importance points from recent conversation
    const recentThreshold = Math.max(0, this.transcript.length - 10);
    
    const referenceable = this.keyPoints
      .filter(point => point.turn >= recentThreshold || point.importance >= 5)
      .slice(0, maxPoints)
      .map(point => ({
        turn: point.turn,
        speaker: point.speaker,
        summary: point.summary,
        fullContent: point.content,
        referencePhrase: this._generateReferencePhrase(point),
      }));

    return referenceable;
  }

  /**
   * Generate a natural reference phrase for a key point
   * @param {Object} point - Key point object
   * @return {string} Natural reference phrase
   * @private
   */
  _generateReferencePhrase(point) {
    const phrases = [
      `Going back to what you said about`,
      `You mentioned`,
      `Earlier you said`,
      `Like you said,`,
      `As you pointed out,`,
      `Building on your point about`,
      `Related to what you said about`,
    ];

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    return `${randomPhrase} "${point.summary}"`;
  }

  /**
   * Get user commitments
   * @return {Array} List of user commitments
   */
  getUserCommitments() {
    return this.userCommitments;
  }

  /**
   * Get stakeholder concerns
   * @return {Array} List of stakeholder concerns
   */
  getStakeholderConcerns() {
    return this.stakeholderConcerns;
  }

  /**
   * Get contradictions
   * @return {Array} List of contradictions
   */
  getContradictions() {
    return this.contradictions;
  }

  /**
   * Get topics discussed
   * @return {Array<string>} List of topics
   */
  getTopicsDiscussed() {
    return Array.from(this.topicsDiscussed);
  }

  /**
   * Mark a commitment as addressed
   * @param {number} turn - Turn number of the commitment
   */
  markCommitmentAddressed(turn) {
    const commitment = this.userCommitments.find(c => c.turn === turn);
    if (commitment) {
      commitment.addressed = true;
    }
  }

  /**
   * Mark a concern as addressed
   * @param {number} turn - Turn number of the concern
   */
  markConcernAddressed(turn) {
    const concern = this.stakeholderConcerns.find(c => c.turn === turn);
    if (concern) {
      concern.addressed = true;
    }
  }

  /**
   * Get context summary for prompt engineering
   * @return {string} Context summary for AI model
   */
  getContextSummary() {
    let summary = 'Conversation Context:\n\n';

    // Add key points
    if (this.keyPoints.length > 0) {
      summary += 'Key Points from Conversation:\n';
      this.getReferencablePoints(3).forEach((point, index) => {
        summary += `${index + 1}. ${point.summary}\n`;
      });
      summary += '\n';
    }

    // Add user commitments
    const unaddressedCommitments = this.userCommitments.filter(c => !c.addressed);
    if (unaddressedCommitments.length > 0) {
      summary += 'User Commitments to Track:\n';
      unaddressedCommitments.forEach((commitment, index) => {
        summary += `${index + 1}. ${commitment.summary}\n`;
      });
      summary += '\n';
    }

    // Add contradictions
    if (this.contradictions.length > 0) {
      summary += 'Contradictions Detected:\n';
      this.contradictions.forEach((contradiction, index) => {
        summary += `${index + 1}. ${contradiction.description}\n`;
        summary += `   - Turn ${contradiction.turn1}: "${contradiction.content1}"\n`;
        summary += `   - Turn ${contradiction.turn2}: "${contradiction.content2}"\n`;
      });
      summary += '- Consider addressing these contradictions naturally\n\n';
    }

    // Add topics
    if (this.topicsDiscussed.size > 0) {
      const topicList = Array.from(this.topicsDiscussed).slice(0, 5);
      summary += `Topics Discussed: ${topicList.join(', ')}\n\n`;
    }

    // Add reference guidance
    if (this.keyPoints.length > 0) {
      summary += 'Reference Guidance:\n';
      summary += '- Naturally reference earlier points when relevant\n';
      summary += '- Use phrases like "Going back to..." or "You mentioned..."\n';
      summary += '- Connect current discussion to previous topics\n';
    }

    return summary;
  }
}

module.exports = {
  ContextAnalyzer,
  commitmentPatterns,
  decisionPatterns,
  concernPatterns,
  importanceWeights,
};
