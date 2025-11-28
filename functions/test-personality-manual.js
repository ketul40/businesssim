// Quick manual test of PersonalityEngine
const { PersonalityEngine } = require('./personalityEngine');

// Test all personality types
const personalities = ['direct', 'collaborative', 'analytical', 'creative', 'supportive', 'skeptical'];

console.log('Testing PersonalityEngine...\n');

let allPassed = true;

personalities.forEach(personality => {
  try {
    const stakeholder = { personality, name: `Test ${personality}` };
    const engine = new PersonalityEngine(stakeholder);
    
    const type = engine.getPersonalityType();
    const instructions = engine.getLanguageInstructions();
    const phrases = engine.getSamplePhrases();
    
    // Verify outputs
    if (type !== personality) {
      console.error(`❌ FAIL: ${personality} - Wrong type returned: ${type}`);
      allPassed = false;
    } else if (!instructions || instructions.length < 50) {
      console.error(`❌ FAIL: ${personality} - Instructions too short or missing`);
      allPassed = false;
    } else if (!phrases || phrases.length === 0) {
      console.error(`❌ FAIL: ${personality} - No sample phrases`);
      allPassed = false;
    } else {
      console.log(`✓ ${personality}: OK`);
    }
  } catch (error) {
    console.error(`❌ FAIL: ${personality} - Error: ${error.message}`);
    allPassed = false;
  }
});

// Test fallback behavior
try {
  const unknownStakeholder = { personality: 'unknown-type', name: 'Test Unknown' };
  const unknownEngine = new PersonalityEngine(unknownStakeholder);
  
  if (unknownEngine.getPersonalityType() !== 'balanced') {
    console.error('❌ FAIL: Unknown personality should default to balanced');
    allPassed = false;
  } else {
    console.log('✓ unknown personality fallback: OK');
  }
} catch (error) {
  console.error(`❌ FAIL: Unknown personality - Error: ${error.message}`);
  allPassed = false;
}

// Test missing personality
try {
  const noPersonalityStakeholder = { name: 'Test No Personality' };
  const noPersonalityEngine = new PersonalityEngine(noPersonalityStakeholder);
  
  if (noPersonalityEngine.getPersonalityType() !== 'balanced') {
    console.error('❌ FAIL: Missing personality should default to balanced');
    allPassed = false;
  } else {
    console.log('✓ missing personality fallback: OK');
  }
} catch (error) {
  console.error(`❌ FAIL: Missing personality - Error: ${error.message}`);
  allPassed = false;
}

console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));
process.exit(allPassed ? 0 : 1);
