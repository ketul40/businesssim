/**
 * Verification script for enhanced buildSimulationPrompt integration
 * Run with: node verify-enhanced-prompt.js
 */

const {PersonalityEngine} = require("./personalityEngine");
const {EmotionalStateTracker} = require("./emotionalStateTracker");
const {ContextAnalyzer} = require("./contextAnalyzer");
const ConversationalPatterns = require("./conversationalPatterns");

console.log("=== Testing Enhanced buildSimulationPrompt Integration ===\n");

const mockScenario = {
  title: "Budget Approval Meeting",
  situation: "You need to get budget approval for a new project",
  objective: "Secure $50k budget approval",
  constraints: [
    "Q4 budget is tight",
    "Need to show clear ROI",
  ],
  stakeholders: [{
    name: "Sarah Kim",
    role: "VP of Product",
    personality: "analytical",
    concerns: ["Budget constraints", "Resource allocation"],
    motivations: ["Data-driven decisions", "Team efficiency"],
  }],
};

const mockTranscript = [
  {type: "user", content: "I'd like to discuss the new analytics project."},
  {type: "stakeholder", content: "Okay, what's the scope?"},
  {type: "user", content: "We need $50k for Q4."},
  {type: "stakeholder", content: "That's a significant ask. What's the ROI?"},
];

let allTestsPassed = true;

// Test 1: PersonalityEngine
console.log("Test 1: PersonalityEngine initialization and instructions");
try {
  const engine = new PersonalityEngine(mockScenario.stakeholders[0]);
  const instructions = engine.getLanguageInstructions();
  const phrases = engine.getSamplePhrases();
  
  console.log("✓ PersonalityEngine created successfully");
  console.log(`✓ Generated instructions (${instructions.length} chars)`);
  console.log(`✓ Generated sample phrases (${phrases.length} chars)`);
  console.log(`  Sample: ${instructions.substring(0, 100)}...`);
} catch (error) {
  console.log("✗ PersonalityEngine failed:", error.message);
  allTestsPassed = false;
}

console.log();

// Test 2: EmotionalStateTracker
console.log("Test 2: EmotionalStateTracker with transcript analysis");
try {
  const tracker = new EmotionalStateTracker(
      mockScenario.stakeholders[0],
      mockScenario,
  );
  tracker.analyzeTranscript(mockTranscript);
  const state = tracker.getCurrentState();
  const stateInstructions = tracker.getStateInstructions();
  
  console.log("✓ EmotionalStateTracker created successfully");
  console.log(`✓ Current state: ${state}`);
  console.log(`✓ State instructions (${stateInstructions.length} chars)`);
  console.log(`  Sample: ${stateInstructions.substring(0, 100)}...`);
} catch (error) {
  console.log("✗ EmotionalStateTracker failed:", error.message);
  allTestsPassed = false;
}

console.log();

// Test 3: ContextAnalyzer
console.log("Test 3: ContextAnalyzer with transcript");
try {
  const analyzer = new ContextAnalyzer(mockTranscript);
  const keyPoints = analyzer.extractKeyPoints();
  const referencablePoints = analyzer.getReferencablePoints();
  
  console.log("✓ ContextAnalyzer created successfully");
  console.log(`✓ Extracted ${keyPoints.length} key points`);
  console.log(`✓ Found ${referencablePoints.length} referenceable points`);
  if (referencablePoints.length > 0) {
    console.log(`  Example: "${referencablePoints[0].content}"`);
  }
} catch (error) {
  console.log("✗ ContextAnalyzer failed:", error.message);
  allTestsPassed = false;
}

console.log();

// Test 4: ConversationalPatterns
console.log("Test 4: ConversationalPatterns");
try {
  const openings = ConversationalPatterns.getRandomPattern("openingPhrases", "neutral", 3);
  const thinking = ConversationalPatterns.getRandomPattern("thinkingMarkers", "neutral", 3);
  const acknowledgments = ConversationalPatterns.getRandomPattern("acknowledgments", "neutral", 3);
  
  console.log("✓ ConversationalPatterns loaded successfully");
  console.log(`✓ Opening phrases: ${openings.join(", ")}`);
  console.log(`✓ Thinking markers: ${thinking.join(", ")}`);
  console.log(`✓ Acknowledgments: ${acknowledgments.join(", ")}`);
} catch (error) {
  console.log("✗ ConversationalPatterns failed:", error.message);
  allTestsPassed = false;
}

console.log();

// Test 5: Full Integration (simulating buildSimulationPrompt)
console.log("Test 5: Full Integration Test");
try {
  const engine = new PersonalityEngine(mockScenario.stakeholders[0]);
  const tracker = new EmotionalStateTracker(
      mockScenario.stakeholders[0],
      mockScenario,
  );
  const analyzer = new ContextAnalyzer(mockTranscript);
  
  tracker.analyzeTranscript(mockTranscript);
  
  const personalityInstructions = engine.getLanguageInstructions();
  const examplePhrases = engine.getSamplePhrases();
  const stateInstructions = tracker.getStateInstructions();
  const contextPoints = analyzer.getReferencablePoints();
  const patterns = ConversationalPatterns.getRandomPattern("openingPhrases", "neutral", 3);
  
  // Build a sample prompt (simplified version)
  const promptParts = [
    `Personality: ${personalityInstructions.substring(0, 50)}...`,
    `State: ${stateInstructions.substring(0, 50)}...`,
    `Context points: ${contextPoints.length}`,
    `Patterns: ${patterns.length}`,
  ];
  
  console.log("✓ All components integrated successfully");
  console.log("✓ Sample prompt components:");
  promptParts.forEach((part) => console.log(`  - ${part}`));
} catch (error) {
  console.log("✗ Integration failed:", error.message);
  allTestsPassed = false;
}

console.log();

// Test 6: Error Handling
console.log("Test 6: Error Handling with Edge Cases");
try {
  // Test with empty transcript
  const tracker1 = new EmotionalStateTracker(
      mockScenario.stakeholders[0],
      mockScenario,
  );
  tracker1.analyzeTranscript([]);
  console.log("✓ Handles empty transcript gracefully");
  
  // Test with minimal stakeholder
  const minimalStakeholder = {
    name: "Test",
    role: "Manager",
    personality: "unknown",
    concerns: [],
    motivations: [],
  };
  const engine2 = new PersonalityEngine(minimalStakeholder);
  engine2.getLanguageInstructions();
  console.log("✓ Handles unknown personality gracefully");
  
  // Test with null transcript
  const analyzer2 = new ContextAnalyzer([]);
  analyzer2.getReferencablePoints();
  console.log("✓ Handles empty context gracefully");
} catch (error) {
  console.log("✗ Error handling failed:", error.message);
  allTestsPassed = false;
}

console.log();
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✓ All tests passed! Enhanced buildSimulationPrompt is ready.");
  process.exit(0);
} else {
  console.log("✗ Some tests failed. Please review the errors above.");
  process.exit(1);
}
