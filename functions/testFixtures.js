/**
 * Test fixtures for property-based testing
 * Sample conversations, stakeholder profiles, and scenarios
 */

/**
 * Sample stakeholder profiles with different personalities
 */
const sampleStakeholders = {
  direct: {
    name: "Alex Chen",
    role: "VP of Engineering",
    personality: "direct",
    relationshipType: "superior",
    concerns: [
      "Timeline feasibility",
      "Resource allocation",
      "Technical risks"
    ],
    motivations: [
      "Deliver on time",
      "Maintain team morale",
      "Minimize technical debt"
    ],
    communicationStyle: {
      directness: "direct",
      formality: "professional",
      emotionalExpressiveness: "low",
      questioningStyle: "challenging"
    },
    speechPatterns: {
      averageSentenceLength: "short",
      usesIdioms: false,
      usesHumor: false,
      thinkingPauses: "rare"
    }
  },

  collaborative: {
    name: "Sarah Martinez",
    role: "Product Manager",
    personality: "collaborative",
    relationshipType: "peer",
    concerns: [
      "User impact",
      "Team alignment",
      "Stakeholder buy-in"
    ],
    motivations: [
      "Build consensus",
      "Ensure user value",
      "Foster collaboration"
    ],
    communicationStyle: {
      directness: "balanced",
      formality: "casual",
      emotionalExpressiveness: "high",
      questioningStyle: "supportive"
    },
    speechPatterns: {
      averageSentenceLength: "medium",
      usesIdioms: true,
      usesHumor: true,
      thinkingPauses: "occasional"
    }
  },

  analytical: {
    name: "Dr. James Wilson",
    role: "Data Science Lead",
    personality: "analytical",
    relationshipType: "peer",
    concerns: [
      "Data accuracy",
      "Statistical validity",
      "Model performance"
    ],
    motivations: [
      "Ensure rigor",
      "Validate assumptions",
      "Optimize outcomes"
    ],
    communicationStyle: {
      directness: "indirect",
      formality: "formal",
      emotionalExpressiveness: "low",
      questioningStyle: "probing"
    },
    speechPatterns: {
      averageSentenceLength: "long",
      usesIdioms: false,
      usesHumor: false,
      thinkingPauses: "frequent"
    }
  },

  creative: {
    name: "Maya Patel",
    role: "Design Director",
    personality: "creative",
    relationshipType: "peer",
    concerns: [
      "User experience",
      "Brand consistency",
      "Innovation potential"
    ],
    motivations: [
      "Push boundaries",
      "Delight users",
      "Create impact"
    ],
    communicationStyle: {
      directness: "indirect",
      formality: "casual",
      emotionalExpressiveness: "high",
      questioningStyle: "supportive"
    },
    speechPatterns: {
      averageSentenceLength: "medium",
      usesIdioms: true,
      usesHumor: true,
      thinkingPauses: "occasional"
    }
  },

  skeptical: {
    name: "Robert Kim",
    role: "CFO",
    personality: "skeptical",
    relationshipType: "superior",
    concerns: [
      "Budget impact",
      "ROI justification",
      "Risk mitigation"
    ],
    motivations: [
      "Protect resources",
      "Ensure accountability",
      "Minimize waste"
    ],
    communicationStyle: {
      directness: "direct",
      formality: "professional",
      emotionalExpressiveness: "medium",
      questioningStyle: "challenging"
    },
    speechPatterns: {
      averageSentenceLength: "short",
      usesIdioms: false,
      usesHumor: false,
      thinkingPauses: "rare"
    }
  },

  supportive: {
    name: "Linda Thompson",
    role: "HR Director",
    personality: "supportive",
    relationshipType: "peer",
    concerns: [
      "Team wellbeing",
      "Work-life balance",
      "Professional development"
    ],
    motivations: [
      "Support growth",
      "Build culture",
      "Enable success"
    ],
    communicationStyle: {
      directness: "balanced",
      formality: "casual",
      emotionalExpressiveness: "high",
      questioningStyle: "supportive"
    },
    speechPatterns: {
      averageSentenceLength: "medium",
      usesIdioms: true,
      usesHumor: true,
      thinkingPauses: "occasional"
    }
  }
};

/**
 * Sample scenarios for testing
 */
const sampleScenarios = {
  budgetRequest: {
    id: "budget-request-1",
    title: "Budget Request for New Initiative",
    situation: "You need to request additional budget for a new project initiative",
    objective: "Secure approval for $50K additional budget",
    constraints: [
      "Q4 budget is already allocated",
      "Need to show clear ROI",
      "Competing priorities exist"
    ],
    stakeholders: [sampleStakeholders.skeptical]
  },

  teamExpansion: {
    id: "team-expansion-1",
    title: "Team Expansion Proposal",
    situation: "You want to hire two additional engineers for your team",
    objective: "Get approval to open two new headcount positions",
    constraints: [
      "Hiring freeze in other departments",
      "Need to justify business impact",
      "Onboarding capacity concerns"
    ],
    stakeholders: [sampleStakeholders.direct]
  },

  productPitch: {
    id: "product-pitch-1",
    title: "New Product Feature Pitch",
    situation: "You're proposing a new feature for the product roadmap",
    objective: "Get buy-in for feature development in next quarter",
    constraints: [
      "Engineering bandwidth is limited",
      "User research is incomplete",
      "Competitive pressure exists"
    ],
    stakeholders: [sampleStakeholders.collaborative]
  },

  designReview: {
    id: "design-review-1",
    title: "Design Review Meeting",
    situation: "Presenting a new design direction for the product",
    objective: "Get approval to proceed with new design system",
    constraints: [
      "Implementation will take 3 months",
      "Requires coordination across teams",
      "Brand guidelines need updating"
    ],
    stakeholders: [sampleStakeholders.creative]
  }
};

/**
 * Sample conversation transcripts
 */
const sampleTranscripts = {
  natural: [
    { type: "user", content: "Hey, do you have a minute to talk about the Q4 roadmap?" },
    { type: "stakeholder", content: "Sure, I've got about 10 minutes before my next meeting. What's on your mind?" },
    { type: "user", content: "I wanted to pitch adding the analytics dashboard to our priorities." },
    { type: "stakeholder", content: "Hmm, okay. Walk me through why this should jump the queue." }
  ],

  formal: [
    { type: "user", content: "I would like to discuss the quarterly roadmap planning." },
    { type: "stakeholder", content: "Certainly. I have allocated time for this discussion. Please proceed with your proposal." },
    { type: "user", content: "I am proposing that we prioritize the analytics dashboard feature." },
    { type: "stakeholder", content: "I see. Please provide the justification for this prioritization change." }
  ],

  withConcernAddressing: [
    { type: "user", content: "I know you're worried about the timeline. I've worked out a phased approach." },
    { type: "stakeholder", content: "Okay, that's good to hear. Tell me more about how you'd phase it." },
    { type: "user", content: "We'd start with core functionality in sprint 1, then add advanced features in sprint 2." },
    { type: "stakeholder", content: "That makes sense. What about the resource constraints we discussed?" }
  ],

  withContradiction: [
    { type: "user", content: "This project will only take 2 weeks to complete." },
    { type: "stakeholder", content: "Okay, 2 weeks. What's the breakdown?" },
    { type: "user", content: "Well, we need to do design, development, testing, and deployment. Probably 6 weeks total." },
    { type: "stakeholder", content: "Wait, you just said 2 weeks. Now you're saying 6 weeks?" }
  ],

  emotionalProgression: [
    { type: "user", content: "I think we should completely rebuild the authentication system." },
    { type: "stakeholder", content: "That sounds like a massive undertaking. What's driving this?" },
    { type: "user", content: "We've had 3 security incidents in the past month, and our current system can't handle MFA." },
    { type: "stakeholder", content: "Okay, security incidents are serious. Tell me more about what happened." },
    { type: "user", content: "Each incident exposed user data because our session management is flawed. We need modern auth." },
    { type: "stakeholder", content: "I see. If it's a security issue, we need to act. What's your proposed timeline?" }
  ]
};

/**
 * Sample responses with different characteristics
 */
const sampleResponses = {
  withFillers: [
    "Hmm, I'm not entirely sure about that approach. Let me think about it for a second.",
    "You know, that's actually a fair point. Maybe we should explore that option.",
    "Well, I hear what you're saying, but I'm still concerned about the timeline.",
    "Okay, so if I understand correctly, you're proposing we move forward with phase one first?"
  ],

  withoutFillers: [
    "I disagree with that approach.",
    "That is a valid point. We should explore that option.",
    "I understand your position. However, I remain concerned about the timeline.",
    "You are proposing we move forward with phase one first."
  ],

  withContractions: [
    "I'm not sure that's the right approach for our team.",
    "We're already stretched thin, so I don't think we can take this on.",
    "That's interesting, but it doesn't address the core issue.",
    "You're right that it's important, but we've got other priorities."
  ],

  withoutContractions: [
    "I am not sure that is the right approach for our team.",
    "We are already stretched thin, so I do not think we can take this on.",
    "That is interesting, but it does not address the core issue.",
    "You are right that it is important, but we have other priorities."
  ],

  varyingLengths: [
    "Okay.",
    "I see what you mean. That makes sense.",
    "Hmm, I'm not entirely convinced. Can you walk me through the reasoning behind that decision?",
    "Look, I appreciate the thought you've put into this, but I'm concerned about three things: the timeline, the resource allocation, and the potential impact on our other projects. Let's break those down one by one.",
    "Fair point."
  ],

  repetitive: [
    "That's a good point. I think that's worth considering.",
    "That's a good point. We should look into that.",
    "That's a good point. Let me think about that.",
    "That's a good point. I'll take that into account."
  ]
};

/**
 * Generate a random stakeholder profile
 * @param {object} fc - fast-check instance
 * @return {object} Arbitrary stakeholder
 */
function arbitraryStakeholder(fc) {
  return fc.record({
    name: fc.constantFrom("Alex", "Sarah", "James", "Maya", "Robert", "Linda"),
    role: fc.constantFrom("VP Engineering", "Product Manager", "Director", "Lead"),
    personality: fc.constantFrom("direct", "collaborative", "analytical", "creative", "skeptical", "supportive"),
    concerns: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { minLength: 2, maxLength: 4 }),
    motivations: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { minLength: 2, maxLength: 4 })
  });
}

/**
 * Generate a random conversation transcript
 * @param {object} fc - fast-check instance
 * @return {Array} Arbitrary transcript
 */
function arbitraryTranscript(fc) {
  return fc.array(
    fc.record({
      type: fc.constantFrom("user", "stakeholder"),
      content: fc.string({ minLength: 20, maxLength: 200 })
    }),
    { minLength: 2, maxLength: 10 }
  );
}

/**
 * Generate a random response text
 * @param {object} fc - fast-check instance
 * @return {string} Arbitrary response
 */
function arbitraryResponse(fc) {
  return fc.string({ minLength: 50, maxLength: 500 });
}

module.exports = {
  sampleStakeholders,
  sampleScenarios,
  sampleTranscripts,
  sampleResponses,
  arbitraryStakeholder,
  arbitraryTranscript,
  arbitraryResponse
};
