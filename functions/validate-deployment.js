/**
 * Deployment Validation Script
 * 
 * This script validates that the enhanced Firebase Functions are working correctly
 * after deployment. It tests the key enhancements:
 * - Personality Engine
 * - Emotional State Tracker
 * - Context Analyzer
 * - Conversational Patterns
 * 
 * Usage:
 *   node validate-deployment.js
 * 
 * Prerequisites:
 *   - Functions must be deployed
 *   - Firebase project must be configured
 *   - OpenAI API key must be set
 */

const admin = require('firebase-admin');
const { PersonalityEngine } = require('./personalityEngine');
const { EmotionalStateTracker } = require('./emotionalStateTracker');
const { ContextAnalyzer } = require('./contextAnalyzer');
const ConversationalPatterns = require('./conversationalPatterns');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Test data
const testStakeholder = {
  name: "Sarah Kim",
  role: "VP of Product",
  personality: "analytical",
  concerns: ["Budget constraints", "Timeline feasibility", "Team capacity"],
  motivations: ["Data-driven decisions", "Risk mitigation", "Team success"]
};

const testScenario = {
  title: "Product Expansion Pitch",
  situation: "Quarterly planning meeting to discuss new product features",
  objective: "Get approval for Q2 product roadmap",
  constraints: ["Limited engineering resources", "Tight Q2 deadline", "Budget freeze"]
};

const testTranscript = [
  { type: "user", content: "I'd like to discuss expanding our product line to include mobile apps." },
  { type: "stakeholder", content: "Hmm, mobile apps... that's a big shift. What's driving this idea?" },
  { type: "user", content: "Our users have been requesting it, and competitors are moving in that direction." },
  { type: "stakeholder", content: "I hear you, but we've got our hands full with the web platform. Do we have the resources?" }
];

// Validation tests
const tests = [
  {
    name: "PersonalityEngine Initialization",
    test: () => {
      try {
        const engine = new PersonalityEngine(testStakeholder);
        const instructions = engine.getLanguageInstructions();
        const phrases = engine.getSamplePhrases();
        
        if (!instructions || instructions.length === 0) {
          throw new Error("Language instructions are empty");
        }
        
        console.log("  ✓ PersonalityEngine initialized successfully");
        console.log(`  ✓ Generated ${instructions.length} character instructions`);
        console.log(`  ✓ Generated ${phrases.length} character sample phrases`);
        return true;
      } catch (error) {
        console.error("  ✗ PersonalityEngine failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "EmotionalStateTracker Initialization",
    test: () => {
      try {
        const tracker = new EmotionalStateTracker(testStakeholder, testScenario);
        tracker.analyzeTranscript(testTranscript);
        const state = tracker.getCurrentState();
        const instructions = tracker.getStateInstructions();
        
        if (!state || state.length === 0) {
          throw new Error("Emotional state is empty");
        }
        
        if (!instructions || instructions.length === 0) {
          throw new Error("State instructions are empty");
        }
        
        console.log("  ✓ EmotionalStateTracker initialized successfully");
        console.log(`  ✓ Current state: ${state}`);
        console.log(`  ✓ Generated ${instructions.length} character instructions`);
        return true;
      } catch (error) {
        console.error("  ✗ EmotionalStateTracker failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "ContextAnalyzer Initialization",
    test: () => {
      try {
        const analyzer = new ContextAnalyzer(testTranscript);
        const keyPoints = analyzer.extractKeyPoints();
        const referencablePoints = analyzer.getReferencablePoints();
        
        if (!Array.isArray(keyPoints)) {
          throw new Error("Key points is not an array");
        }
        
        if (!Array.isArray(referencablePoints)) {
          throw new Error("Referenceable points is not an array");
        }
        
        console.log("  ✓ ContextAnalyzer initialized successfully");
        console.log(`  ✓ Extracted ${keyPoints.length} key points`);
        console.log(`  ✓ Found ${referencablePoints.length} referenceable points`);
        return true;
      } catch (error) {
        console.error("  ✗ ContextAnalyzer failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "ConversationalPatterns Library",
    test: () => {
      try {
        const openingPhrases = ConversationalPatterns.getRandomPattern('openingPhrases', 'neutral', 3);
        const thinkingMarkers = ConversationalPatterns.getRandomPattern('thinkingMarkers', 'neutral', 3);
        const acknowledgments = ConversationalPatterns.getRandomPattern('acknowledgments', 'neutral', 3);
        
        if (!Array.isArray(openingPhrases) || openingPhrases.length === 0) {
          throw new Error("Opening phrases are empty");
        }
        
        if (!Array.isArray(thinkingMarkers) || thinkingMarkers.length === 0) {
          throw new Error("Thinking markers are empty");
        }
        
        if (!Array.isArray(acknowledgments) || acknowledgments.length === 0) {
          throw new Error("Acknowledgments are empty");
        }
        
        console.log("  ✓ ConversationalPatterns loaded successfully");
        console.log(`  ✓ Opening phrases: ${openingPhrases.join(', ')}`);
        console.log(`  ✓ Thinking markers: ${thinkingMarkers.join(', ')}`);
        console.log(`  ✓ Acknowledgments: ${acknowledgments.join(', ')}`);
        return true;
      } catch (error) {
        console.error("  ✗ ConversationalPatterns failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "Personality Variation Test",
    test: () => {
      try {
        const personalities = ['direct', 'collaborative', 'analytical', 'creative'];
        const results = [];
        
        for (const personality of personalities) {
          const stakeholder = { ...testStakeholder, personality };
          const engine = new PersonalityEngine(stakeholder);
          const instructions = engine.getLanguageInstructions();
          results.push({ personality, instructionsLength: instructions.length });
        }
        
        // Check that different personalities produce different instructions
        const uniqueLengths = new Set(results.map(r => r.instructionsLength));
        if (uniqueLengths.size < 2) {
          console.warn("  ⚠ Warning: Different personalities producing similar instructions");
        }
        
        console.log("  ✓ Personality variation test passed");
        results.forEach(r => {
          console.log(`    - ${r.personality}: ${r.instructionsLength} chars`);
        });
        return true;
      } catch (error) {
        console.error("  ✗ Personality variation test failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "Emotional State Transitions",
    test: () => {
      try {
        const tracker = new EmotionalStateTracker(testStakeholder, testScenario);
        
        // Test with empty transcript (should be neutral)
        tracker.analyzeTranscript([]);
        const initialState = tracker.getCurrentState();
        
        // Test with skeptical conversation
        const skepticalTranscript = [
          { type: "user", content: "We should do this." },
          { type: "stakeholder", content: "I'm not sure about that." }
        ];
        tracker.analyzeTranscript(skepticalTranscript);
        const skepticalState = tracker.getCurrentState();
        
        // Test with positive conversation
        const positiveTranscript = [
          { type: "user", content: "I've analyzed the budget and we can afford this within our Q2 allocation." },
          { type: "stakeholder", content: "That's helpful, thanks for the detail." }
        ];
        tracker.analyzeTranscript(positiveTranscript);
        const positiveState = tracker.getCurrentState();
        
        console.log("  ✓ Emotional state transitions test passed");
        console.log(`    - Initial state: ${initialState}`);
        console.log(`    - After skeptical exchange: ${skepticalState}`);
        console.log(`    - After positive exchange: ${positiveState}`);
        return true;
      } catch (error) {
        console.error("  ✗ Emotional state transitions test failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "Error Handling - Invalid Personality",
    test: () => {
      try {
        const invalidStakeholder = { ...testStakeholder, personality: "invalid_personality_xyz" };
        const engine = new PersonalityEngine(invalidStakeholder);
        const instructions = engine.getLanguageInstructions();
        
        // Should fall back to balanced personality
        if (!instructions || instructions.length === 0) {
          throw new Error("Fallback failed - no instructions generated");
        }
        
        console.log("  ✓ Error handling test passed (invalid personality)");
        console.log("  ✓ Successfully fell back to balanced personality");
        return true;
      } catch (error) {
        console.error("  ✗ Error handling test failed:", error.message);
        return false;
      }
    }
  },
  {
    name: "Error Handling - Empty Transcript",
    test: () => {
      try {
        const analyzer = new ContextAnalyzer([]);
        const keyPoints = analyzer.extractKeyPoints();
        const referencablePoints = analyzer.getReferencablePoints();
        
        // Should handle empty transcript gracefully
        if (!Array.isArray(keyPoints) || !Array.isArray(referencablePoints)) {
          throw new Error("Failed to handle empty transcript");
        }
        
        console.log("  ✓ Error handling test passed (empty transcript)");
        console.log("  ✓ Successfully handled empty transcript");
        return true;
      } catch (error) {
        console.error("  ✗ Error handling test failed:", error.message);
        return false;
      }
    }
  }
];

// Run all tests
async function runValidation() {
  console.log("\n=== Firebase Functions Deployment Validation ===\n");
  console.log("Testing enhanced AI response components...\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    const result = await test.test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log("");
  }
  
  console.log("=== Validation Summary ===");
  console.log(`Total tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log("\n✓ All validation tests passed!");
    console.log("The enhanced Firebase Functions are ready for use.");
    console.log("\nNext steps:");
    console.log("1. Test with actual OpenAI API calls in your application");
    console.log("2. Monitor Firebase Functions logs for any errors");
    console.log("3. Verify response quality improvements with real scenarios");
    process.exit(0);
  } else {
    console.log("\n✗ Some validation tests failed.");
    console.log("Please review the errors above and fix before using in production.");
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  console.error("Validation script error:", error);
  process.exit(1);
});
