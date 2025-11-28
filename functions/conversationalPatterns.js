/**
 * Conversational Pattern Library
 * 
 * Provides natural language patterns for human-like AI responses.
 * Patterns are organized by emotional state to enable context-aware selection.
 * 
 * Requirements: 1.1, 1.5, 6.3, 7.1, 7.2, 7.4
 */

/**
 * Opening phrases organized by emotional state
 */
const openingPhrases = {
  neutral: [
    "Look,",
    "Here's the thing,",
    "You know,",
    "So,",
    "Alright,",
    "Okay,",
    "Well,",
  ],
  skeptical: [
    "I hear you, but",
    "Hmm,",
    "I'm not sure about that,",
    "Hold on,",
    "Wait,",
    "I don't know,",
    "That's interesting, but",
  ],
  curious: [
    "Interesting,",
    "Tell me more about",
    "Help me understand",
    "I'm curious about",
    "That's intriguing,",
    "Walk me through",
    "So you're saying",
  ],
  warming_up: [
    "I see what you mean,",
    "That makes sense,",
    "Fair point,",
    "Okay, I'm following,",
    "Right,",
    "I can see that,",
    "That's a good point,",
  ],
  concerned: [
    "I'm worried about",
    "My concern is",
    "The thing is,",
    "I'm not comfortable with",
    "What worries me is",
    "I have to say,",
    "Here's what concerns me,",
  ],
  frustrated: [
    "Look, I need to be clear,",
    "I'm going to be honest,",
    "We keep coming back to this,",
    "I've said this before,",
    "I don't think you're hearing me,",
    "Let me be direct,",
    "I'm not sure we're on the same page,",
  ],
  satisfied: [
    "That works for me,",
    "I like that,",
    "Now we're talking,",
    "That's what I wanted to hear,",
    "Perfect,",
    "Great,",
    "I'm on board with that,",
  ],
};

/**
 * Thinking markers for natural pauses and consideration
 */
const thinkingMarkers = [
  "Let me think about that...",
  "Hmm,",
  "Okay, so...",
  "Let me see...",
  "Give me a second...",
  "Right, so...",
  "Well, let's see...",
  "Hmm, okay...",
];

/**
 * Hedges for expressing uncertainty or softening statements
 */
const hedges = [
  "maybe",
  "possibly",
  "I'm not entirely sure",
  "potentially",
  "I think",
  "probably",
  "it seems like",
  "I'd say",
  "from what I can tell",
  "as far as I know",
  "I suppose",
  "I guess",
];

/**
 * Acknowledgments for showing understanding or agreement
 */
const acknowledgments = {
  neutral: [
    "I see what you're saying",
    "I understand",
    "Got it",
    "Okay",
    "I hear you",
    "Right",
  ],
  positive: [
    "Fair point",
    "That makes sense",
    "Good point",
    "I can see that",
    "That's reasonable",
    "I appreciate that",
    "That's helpful",
  ],
  skeptical: [
    "I hear you, but",
    "Okay, but",
    "Sure, though",
    "I get that, however",
    "Right, but still",
  ],
};

/**
 * Transitions for connecting ideas and referencing previous points
 */
const transitions = [
  "Going back to",
  "On that note,",
  "Speaking of which,",
  "That reminds me,",
  "Along those lines,",
  "Related to that,",
  "Building on that,",
  "Coming back to",
  "Like I mentioned,",
  "As we discussed,",
];

/**
 * Workplace idioms for authentic business context
 */
const workplaceIdioms = [
  "on the same page",
  "move the needle",
  "circle back",
  "touch base",
  "bandwidth",
  "low-hanging fruit",
  "take this offline",
  "run it up the flagpole",
  "get the ball rolling",
  "keep me in the loop",
  "at the end of the day",
  "think outside the box",
];

/**
 * Get random pattern(s) from a category
 * @param {string} category - Pattern category (openingPhrases, thinkingMarkers, etc.)
 * @param {string} state - Emotional state (neutral, skeptical, curious, etc.)
 * @param {number} count - Number of patterns to return (default: 1)
 * @return {string|Array<string>|null} Random pattern(s) or null if not found
 */
function getRandomPattern(category, state = "neutral", count = 1) {
  let patterns;

  switch (category) {
    case "openingPhrases":
      patterns = openingPhrases[state] || openingPhrases.neutral;
      break;
    case "thinkingMarkers":
      patterns = thinkingMarkers;
      break;
    case "hedges":
      patterns = hedges;
      break;
    case "acknowledgments":
      // Map emotional states to acknowledgment types
      if (state === "satisfied" || state === "warming_up") {
        patterns = acknowledgments.positive;
      } else if (state === "skeptical" || state === "frustrated") {
        patterns = acknowledgments.skeptical;
      } else {
        patterns = acknowledgments.neutral;
      }
      break;
    case "transitions":
      patterns = transitions;
      break;
    case "workplaceIdioms":
      patterns = workplaceIdioms;
      break;
    default:
      console.warn(`Unknown pattern category: ${category}`);
      return null;
  }

  if (!patterns || patterns.length === 0) {
    return null;
  }

  // If count is 1, return a single string (backward compatible)
  if (count === 1) {
    const randomIndex = Math.floor(Math.random() * patterns.length);
    return patterns[randomIndex];
  }

  // If count > 1, return an array of random patterns
  const result = [];
  const availablePatterns = [...patterns]; // Copy to avoid modifying original
  const actualCount = Math.min(count, availablePatterns.length);

  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * availablePatterns.length);
    result.push(availablePatterns[randomIndex]);
    availablePatterns.splice(randomIndex, 1); // Remove to avoid duplicates
  }

  return result;
}

/**
 * Get all available emotional states
 * @return {Array<string>} List of emotional states
 */
function getEmotionalStates() {
  return Object.keys(openingPhrases);
}

/**
 * Get all available pattern categories
 * @return {Array<string>} List of pattern categories
 */
function getPatternCategories() {
  return [
    "openingPhrases",
    "thinkingMarkers",
    "hedges",
    "acknowledgments",
    "transitions",
    "workplaceIdioms",
  ];
}

module.exports = {
  openingPhrases,
  thinkingMarkers,
  hedges,
  acknowledgments,
  transitions,
  workplaceIdioms,
  getRandomPattern,
  getEmotionalStates,
  getPatternCategories,
};
