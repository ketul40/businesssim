/**
 * Manual verification script for error handling and fallbacks
 * Tests that the system continues to work even when components fail
 */

const {PersonalityEngine} = require('./personalityEngine');
const {EmotionalStateTracker} = require('./emotionalStateTracker');
const {ContextAnalyzer} = require('./contextAnalyzer');
const ConversationalPatterns = require('./conversationalPatterns');

console.log('=== Error Handling Verification ===\n');

// Test 1: PersonalityEngine with unknown personality
console.log('Test 1: PersonalityEngine with unknown personality');
try {
  const stakeholder = {
    name: 'Test User',
    personality: 'completely-unknown-type',
  };
  const engine = new PersonalityEngine(stakeholder);
  console.log('✓ PersonalityEngine handled unknown personality');
  console.log(`  Fallback type: ${engine.getPersonalityType()}`);
  console.log(`  Instructions: ${engine.getLanguageInstructions().substring(0, 50)}...`);
} catch (error) {
  console.log('✗ PersonalityEngine failed:', error.message);
}
console.log();

// Test 2: PersonalityEngine with missing personality
console.log('Test 2: PersonalityEngine with missing personality');
try {
  const stakeholder = {
    name: 'Test User',
  };
  const engine = new PersonalityEngine(stakeholder);
  console.log('✓ PersonalityEngine handled missing personality');
  console.log(`  Fallback type: ${engine.getPersonalityType()}`);
} catch (error) {
  console.log('✗ PersonalityEngine failed:', error.message);
}
console.log();

// Test 3: PersonalityEngine with null stakeholder
console.log('Test 3: PersonalityEngine with null stakeholder');
try {
  const engine = new PersonalityEngine(null);
  console.log('✗ PersonalityEngine should have thrown error');
} catch (error) {
  console.log('✓ PersonalityEngine correctly threw error for null stakeholder');
  console.log(`  Error: ${error.message}`);
}
console.log();

// Test 4: EmotionalStateTracker with empty transcript
console.log('Test 4: EmotionalStateTracker with empty transcript');
try {
  const stakeholder = {
    name: 'Test User',
    concerns: ['budget', 'timeline'],
  };
  const scenario = {
    title: 'Test Scenario',
  };
  const tracker = new EmotionalStateTracker(stakeholder, scenario);
  tracker.analyzeTranscript([]);
  console.log('✓ EmotionalStateTracker handled empty transcript');
  console.log(`  State: ${tracker.getCurrentState()}`);
  console.log(`  Instructions: ${tracker.getStateInstructions().substring(0, 50)}...`);
} catch (error) {
  console.log('✗ EmotionalStateTracker failed:', error.message);
}
console.log();

// Test 5: EmotionalStateTracker with malformed transcript
console.log('Test 5: EmotionalStateTracker with malformed transcript');
try {
  const stakeholder = {
    name: 'Test User',
    concerns: ['budget'],
  };
  const scenario = {
    title: 'Test Scenario',
  };
  const tracker = new EmotionalStateTracker(stakeholder, scenario);
  tracker.analyzeTranscript([
    {type: 'user'}, // missing content
    {content: 'test'}, // missing type
    null,
  ]);
  console.log('✓ EmotionalStateTracker handled malformed transcript');
  console.log(`  State: ${tracker.getCurrentState()}`);
} catch (error) {
  console.log('✗ EmotionalStateTracker failed:', error.message);
}
console.log();

// Test 6: ContextAnalyzer with empty transcript
console.log('Test 6: ContextAnalyzer with empty transcript');
try {
  const analyzer = new ContextAnalyzer([]);
  console.log('✓ ContextAnalyzer handled empty transcript');
  console.log(`  Key points: ${analyzer.keyPoints.length}`);
  console.log(`  Commitments: ${analyzer.userCommitments.length}`);
  console.log(`  Contradictions: ${analyzer.contradictions.length}`);
} catch (error) {
  console.log('✗ ContextAnalyzer failed:', error.message);
}
console.log();

// Test 7: ContextAnalyzer with malformed transcript
console.log('Test 7: ContextAnalyzer with malformed transcript');
try {
  const analyzer = new ContextAnalyzer([
    {type: 'user'}, // missing content
    {content: 'test'}, // missing type
  ]);
  console.log('✓ ContextAnalyzer handled malformed transcript');
  console.log(`  Key points: ${analyzer.keyPoints.length}`);
} catch (error) {
  console.log('✗ ContextAnalyzer failed:', error.message);
}
console.log();

// Test 8: ConversationalPatterns with invalid category
console.log('Test 8: ConversationalPatterns with invalid category');
try {
  const patterns = ConversationalPatterns.getRandomPattern('nonexistent-category', 'neutral', 3);
  console.log('✓ ConversationalPatterns handled invalid category');
  console.log(`  Returned: ${patterns.length} patterns`);
} catch (error) {
  console.log('✗ ConversationalPatterns failed:', error.message);
}
console.log();

// Test 9: Full integration with all components
console.log('Test 9: Full integration with all components');
try {
  const stakeholder = {
    name: 'Sarah Kim',
    role: 'Product Manager',
    personality: 'analytical',
    concerns: ['budget', 'timeline'],
    motivations: ['deliver value'],
  };
  const scenario = {
    title: 'Budget Discussion',
    situation: 'Quarterly planning',
  };
  const transcript = [
    {type: 'user', content: 'I want to discuss the budget.'},
    {type: 'stakeholder', content: 'What are your specific concerns?'},
  ];

  const engine = new PersonalityEngine(stakeholder);
  const tracker = new EmotionalStateTracker(stakeholder, scenario);
  tracker.analyzeTranscript(transcript);
  const analyzer = new ContextAnalyzer(transcript);
  const patterns = ConversationalPatterns.getRandomPattern('openingPhrases', 'neutral', 3);

  console.log('✓ All components initialized successfully');
  console.log(`  Personality: ${engine.getPersonalityType()}`);
  console.log(`  Emotional state: ${tracker.getCurrentState()}`);
  console.log(`  Key points: ${analyzer.keyPoints.length}`);
  console.log(`  Patterns: ${patterns.length}`);
} catch (error) {
  console.log('✗ Integration failed:', error.message);
}
console.log();

// Test 10: Simulate buildSimulationPrompt error handling
console.log('Test 10: Simulating buildSimulationPrompt with failures');
try {
  const stakeholder = {
    name: 'Test User',
    personality: 'unknown-type', // Will trigger fallback
    concerns: [],
    motivations: [],
  };
  const scenario = {
    title: 'Test',
    situation: 'Test situation',
    objective: 'Test objective',
    constraints: [],
    stakeholders: [stakeholder],
  };
  const transcript = [];

  // Simulate the error handling logic from buildSimulationPrompt
  const enhancementFailures = [];
  let personalityInstructions = '';
  let emotionalStateInstructions = '';
  let contextReferences = '';

  try {
    const engine = new PersonalityEngine(stakeholder);
    personalityInstructions = engine.getLanguageInstructions();
  } catch (error) {
    enhancementFailures.push('PersonalityEngine');
    personalityInstructions = 'Use a balanced, professional communication style.';
  }

  try {
    const tracker = new EmotionalStateTracker(stakeholder, scenario);
    emotionalStateInstructions = tracker.getStateInstructions();
  } catch (error) {
    enhancementFailures.push('EmotionalStateTracker');
    emotionalStateInstructions = 'Maintain a neutral, professional demeanor.';
  }

  try {
    if (transcript.length > 0) {
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints();
      if (points.length > 0) {
        contextReferences = points.map((p) => p.content).join(', ');
      }
    }
  } catch (error) {
    enhancementFailures.push('ContextAnalyzer');
    contextReferences = '';
  }

  console.log('✓ buildSimulationPrompt error handling simulation successful');
  console.log(`  Failures: ${enhancementFailures.length > 0 ? enhancementFailures.join(', ') : 'none'}`);
  console.log(`  Personality instructions: ${personalityInstructions.substring(0, 50)}...`);
  console.log(`  Emotional state instructions: ${emotionalStateInstructions.substring(0, 50)}...`);
  console.log(`  Context references: ${contextReferences || 'none'}`);
} catch (error) {
  console.log('✗ Simulation failed:', error.message);
}
console.log();

console.log('=== All Error Handling Tests Complete ===');
