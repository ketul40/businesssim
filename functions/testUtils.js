/**
 * Test utilities for analyzing AI response characteristics
 * Used for property-based testing of human-like AI responses
 */

/**
 * Analyze sentence structure in a response
 * @param {string} text - The response text to analyze
 * @return {object} Sentence structure analysis
 */
function analyzeSentenceStructure(text) {
  if (!text || typeof text !== 'string') {
    return {
      sentenceCount: 0,
      averageLength: 0,
      lengths: [],
      pattern: ''
    };
  }

  // Split into sentences (handle various punctuation)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const averageLength = lengths.length > 0 
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length 
    : 0;

  // Create a pattern signature (S=short <5, M=medium 5-15, L=long >15)
  const pattern = lengths.map(len => {
    if (len < 5) return 'S';
    if (len <= 15) return 'M';
    return 'L';
  }).join('');

  return {
    sentenceCount: sentences.length,
    averageLength: Math.round(averageLength * 10) / 10,
    lengths,
    pattern,
    sentences
  };
}

/**
 * Calculate formality score of text
 * @param {string} text - The text to analyze
 * @return {number} Formality score (0-1, higher = more formal)
 */
function calculateFormalityScore(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const lowerText = text.toLowerCase();
  
  // Formal indicators
  const formalPhrases = [
    'i would like to',
    'i am uncertain',
    'it is important',
    'one must',
    'it is necessary',
    'furthermore',
    'moreover',
    'nevertheless',
    'consequently',
    'therefore',
    'thus',
    'hence',
    'accordingly'
  ];

  // Informal indicators
  const informalPhrases = [
    "i'm", "we're", "that's", "it's", "don't", "can't", "won't",
    'i want to', 'i\'m not sure', 'hmm', 'okay', 'yeah', 'nope',
    'you know', 'look', 'here\'s the thing', 'on the same page',
    'move the needle', 'circle back'
  ];

  let formalCount = 0;
  let informalCount = 0;

  formalPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = lowerText.match(regex);
    if (matches) formalCount += matches.length;
  });

  informalPhrases.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/'/g, "'"), 'gi');
    const matches = lowerText.match(regex);
    if (matches) informalCount += matches.length;
  });

  const totalIndicators = formalCount + informalCount;
  if (totalIndicators === 0) return 0.5; // Neutral if no indicators

  return formalCount / totalIndicators;
}

/**
 * Detect conversational fillers in text
 * @param {string} text - The text to analyze
 * @return {object} Filler analysis
 */
function detectConversationalFillers(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasFillers: false,
      fillers: [],
      count: 0
    };
  }

  const lowerText = text.toLowerCase();
  
  const fillerPatterns = [
    // Thinking markers
    { pattern: /\bhmm+\b/gi, type: 'thinking' },
    { pattern: /\buh+\b/gi, type: 'thinking' },
    { pattern: /\bum+\b/gi, type: 'thinking' },
    { pattern: /let me think/gi, type: 'thinking' },
    
    // Hedges
    { pattern: /\bmaybe\b/gi, type: 'hedge' },
    { pattern: /\bpossibly\b/gi, type: 'hedge' },
    { pattern: /\bperhaps\b/gi, type: 'hedge' },
    { pattern: /i'm not (entirely )?sure/gi, type: 'hedge' },
    { pattern: /\bkind of\b/gi, type: 'hedge' },
    { pattern: /\bsort of\b/gi, type: 'hedge' },
    
    // Discourse markers
    { pattern: /\byou know\b/gi, type: 'discourse' },
    { pattern: /\blook\b/gi, type: 'discourse' },
    { pattern: /here's the thing/gi, type: 'discourse' },
    { pattern: /\bso\b/gi, type: 'discourse' },
    { pattern: /\bwell\b/gi, type: 'discourse' },
    { pattern: /\bokay\b/gi, type: 'discourse' },
    { pattern: /\bright\b/gi, type: 'discourse' },
    
    // Acknowledgments
    { pattern: /i see/gi, type: 'acknowledgment' },
    { pattern: /fair point/gi, type: 'acknowledgment' },
    { pattern: /that makes sense/gi, type: 'acknowledgment' },
    { pattern: /i hear you/gi, type: 'acknowledgment' },
    
    // Transitions
    { pattern: /going back to/gi, type: 'transition' },
    { pattern: /on that note/gi, type: 'transition' },
    { pattern: /speaking of/gi, type: 'transition' },
    { pattern: /\bactually\b/gi, type: 'transition' },
    { pattern: /on second thought/gi, type: 'transition' }
  ];

  const foundFillers = [];
  
  fillerPatterns.forEach(({ pattern, type }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        foundFillers.push({ text: match, type });
      });
    }
  });

  return {
    hasFillers: foundFillers.length > 0,
    fillers: foundFillers,
    count: foundFillers.length,
    types: [...new Set(foundFillers.map(f => f.type))]
  };
}

/**
 * Count contractions in text
 * @param {string} text - The text to analyze
 * @return {object} Contraction analysis
 */
function analyzeContractions(text) {
  if (!text || typeof text !== 'string') {
    return {
      contractionCount: 0,
      fullFormCount: 0,
      totalApplicable: 0,
      contractionRate: 0
    };
  }

  // Common contractions and their full forms
  const contractionPairs = [
    { contraction: /\bi'm\b/gi, fullForm: /\bi am\b/gi },
    { contraction: /\byou're\b/gi, fullForm: /\byou are\b/gi },
    { contraction: /\bhe's\b/gi, fullForm: /\bhe is\b/gi },
    { contraction: /\bshe's\b/gi, fullForm: /\bshe is\b/gi },
    { contraction: /\bit's\b/gi, fullForm: /\bit is\b/gi },
    { contraction: /\bwe're\b/gi, fullForm: /\bwe are\b/gi },
    { contraction: /\bthey're\b/gi, fullForm: /\bthey are\b/gi },
    { contraction: /\bthat's\b/gi, fullForm: /\bthat is\b/gi },
    { contraction: /\bwhat's\b/gi, fullForm: /\bwhat is\b/gi },
    { contraction: /\bwho's\b/gi, fullForm: /\bwho is\b/gi },
    { contraction: /\bdon't\b/gi, fullForm: /\bdo not\b/gi },
    { contraction: /\bdoesn't\b/gi, fullForm: /\bdoes not\b/gi },
    { contraction: /\bcan't\b/gi, fullForm: /\bcannot\b/gi },
    { contraction: /\bwon't\b/gi, fullForm: /\bwill not\b/gi },
    { contraction: /\bwouldn't\b/gi, fullForm: /\bwould not\b/gi },
    { contraction: /\bshouldn't\b/gi, fullForm: /\bshould not\b/gi },
    { contraction: /\bisn't\b/gi, fullForm: /\bis not\b/gi },
    { contraction: /\baren't\b/gi, fullForm: /\bare not\b/gi },
    { contraction: /\bwasn't\b/gi, fullForm: /\bwas not\b/gi },
    { contraction: /\bweren't\b/gi, fullForm: /\bwere not\b/gi },
    { contraction: /\bhaven't\b/gi, fullForm: /\bhave not\b/gi },
    { contraction: /\bhasn't\b/gi, fullForm: /\bhas not\b/gi },
    { contraction: /\bhadn't\b/gi, fullForm: /\bhad not\b/gi }
  ];

  let contractionCount = 0;
  let fullFormCount = 0;

  contractionPairs.forEach(({ contraction, fullForm }) => {
    const contractionMatches = text.match(contraction);
    const fullFormMatches = text.match(fullForm);
    
    if (contractionMatches) contractionCount += contractionMatches.length;
    if (fullFormMatches) fullFormCount += fullFormMatches.length;
  });

  const totalApplicable = contractionCount + fullFormCount;
  const contractionRate = totalApplicable > 0 ? contractionCount / totalApplicable : 0;

  return {
    contractionCount,
    fullFormCount,
    totalApplicable,
    contractionRate
  };
}

/**
 * Find repeated phrases in text
 * @param {string} text - The text to analyze
 * @param {number} minWords - Minimum words in a phrase (default: 3)
 * @return {object} Phrase repetition analysis
 */
function findRepeatedPhrases(text, minWords = 3) {
  if (!text || typeof text !== 'string') {
    return {
      repeatedPhrases: [],
      maxRepetitions: 0
    };
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  const phrases = new Map();

  // Extract all n-grams of length minWords or more
  for (let n = minWords; n <= Math.min(words.length, 10); n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  }

  // Filter to only repeated phrases
  const repeatedPhrases = Array.from(phrases.entries())
    .filter(([_, count]) => count > 1)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  const maxRepetitions = repeatedPhrases.length > 0 
    ? repeatedPhrases[0].count 
    : 0;

  return {
    repeatedPhrases,
    maxRepetitions
  };
}

/**
 * Detect thinking markers in text
 * @param {string} text - The text to analyze
 * @return {object} Thinking marker analysis
 */
function detectThinkingMarkers(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasThinkingMarkers: false,
      markers: [],
      count: 0
    };
  }

  const thinkingMarkerPatterns = [
    /\bhmm+\b/gi,
    /let me think/gi,
    /let me see/gi,
    /\buh+\b/gi,
    /\bum+\b/gi,
    /i'm thinking/gi,
    /give me a (second|moment)/gi,
    /hold on/gi
  ];

  const foundMarkers = [];

  thinkingMarkerPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        foundMarkers.push(match);
      });
    }
  });

  return {
    hasThinkingMarkers: foundMarkers.length > 0,
    markers: foundMarkers,
    count: foundMarkers.length
  };
}

/**
 * Calculate response length variation across multiple responses
 * @param {Array<string>} responses - Array of response texts
 * @return {object} Length variation analysis
 */
function analyzeResponseLengthVariation(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return {
      mean: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      lengths: []
    };
  }

  const lengths = responses.map(r => {
    const sentences = r.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  });

  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    lengths
  };
}

/**
 * Calculate word overlap between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @return {number} Overlap percentage (0-1)
 */
function calculateWordOverlap(text1, text2) {
  if (!text1 || !text2) return 0;

  // Common words to exclude
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ]);

  const words1 = text1.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.has(w));

  const words2 = text2.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.has(w));

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(w => set2.has(w)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

module.exports = {
  analyzeSentenceStructure,
  calculateFormalityScore,
  detectConversationalFillers,
  analyzeContractions,
  findRepeatedPhrases,
  detectThinkingMarkers,
  analyzeResponseLengthVariation,
  calculateWordOverlap
};
