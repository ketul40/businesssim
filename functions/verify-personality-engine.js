/**
 * Verification script for PersonalityEngine
 * Tests basic functionality without formal test framework
 */

const { PersonalityEngine } = require('./personalityEngine');

console.log('=== PersonalityEngine Verification ===\n');

// Test 1: Direct personality
console.log('Test 1: Direct Personality');
const directStakeholder = { personality: 'direct', name: 'Test Direct' };
const directEngine = new PersonalityEngine(directStakeholder);
console.log('Personality Type:', directEngine.getPersonalityType());
console.log('Sample Phrases:', directEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', directEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 2: Collaborative personality
console.log('Test 2: Collaborative Personality');
const collabStakeholder = { personality: 'collaborative', name: 'Test Collab' };
const collabEngine = new PersonalityEngine(collabStakeholder);
console.log('Personality Type:', collabEngine.getPersonalityType());
console.log('Sample Phrases:', collabEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', collabEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 3: Analytical personality
console.log('Test 3: Analytical Personality');
const analyticalStakeholder = { personality: 'analytical', name: 'Test Analytical' };
const analyticalEngine = new PersonalityEngine(analyticalStakeholder);
console.log('Personality Type:', analyticalEngine.getPersonalityType());
console.log('Sample Phrases:', analyticalEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', analyticalEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 4: Creative personality
console.log('Test 4: Creative Personality');
const creativeStakeholder = { personality: 'creative', name: 'Test Creative' };
const creativeEngine = new PersonalityEngine(creativeStakeholder);
console.log('Personality Type:', creativeEngine.getPersonalityType());
console.log('Sample Phrases:', creativeEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', creativeEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 5: Supportive personality
console.log('Test 5: Supportive Personality');
const supportiveStakeholder = { personality: 'supportive', name: 'Test Supportive' };
const supportiveEngine = new PersonalityEngine(supportiveStakeholder);
console.log('Personality Type:', supportiveEngine.getPersonalityType());
console.log('Sample Phrases:', supportiveEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', supportiveEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 6: Skeptical personality
console.log('Test 6: Skeptical Personality');
const skepticalStakeholder = { personality: 'skeptical', name: 'Test Skeptical' };
const skepticalEngine = new PersonalityEngine(skepticalStakeholder);
console.log('Personality Type:', skepticalEngine.getPersonalityType());
console.log('Sample Phrases:', skepticalEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', skepticalEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 7: Unknown personality (should default to balanced)
console.log('Test 7: Unknown Personality (should default to balanced)');
const unknownStakeholder = { personality: 'xyz-unknown', name: 'Test Unknown' };
const unknownEngine = new PersonalityEngine(unknownStakeholder);
console.log('Personality Type:', unknownEngine.getPersonalityType());
console.log('Sample Phrases:', unknownEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', unknownEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 8: Missing personality (should default to balanced)
console.log('Test 8: Missing Personality (should default to balanced)');
const noPersonalityStakeholder = { name: 'Test No Personality' };
const noPersonalityEngine = new PersonalityEngine(noPersonalityStakeholder);
console.log('Personality Type:', noPersonalityEngine.getPersonalityType());
console.log('Sample Phrases:', noPersonalityEngine.getSamplePhrases().slice(0, 2));
console.log('Instructions Preview:', noPersonalityEngine.getLanguageInstructions().substring(0, 100) + '...\n');

// Test 9: Partial match (e.g., "Direct and assertive" should match "direct")
console.log('Test 9: Partial Match');
const partialStakeholder = { personality: 'Direct and assertive', name: 'Test Partial' };
const partialEngine = new PersonalityEngine(partialStakeholder);
console.log('Personality Type:', partialEngine.getPersonalityType());
console.log('Sample Phrases:', partialEngine.getSamplePhrases().slice(0, 2));
console.log('\n');

console.log('=== All Tests Completed Successfully ===');
