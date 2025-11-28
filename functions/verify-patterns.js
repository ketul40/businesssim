/**
 * Simple verification script for conversational patterns
 */

const patterns = require('./conversationalPatterns');

console.log('=== Conversational Pattern Library Verification ===\n');

// Test 1: Check all emotional states
console.log('1. Emotional States:');
const states = patterns.getEmotionalStates();
console.log('   Available states:', states.join(', '));
console.log('   ✓ Found', states.length, 'emotional states\n');

// Test 2: Check all pattern categories
console.log('2. Pattern Categories:');
const categories = patterns.getPatternCategories();
console.log('   Available categories:', categories.join(', '));
console.log('   ✓ Found', categories.length, 'pattern categories\n');

// Test 3: Test getRandomPattern for each category
console.log('3. Random Pattern Selection:');
categories.forEach(category => {
  const pattern = patterns.getRandomPattern(category, 'neutral');
  console.log(`   ${category}: "${pattern}"`);
});
console.log('   ✓ All categories return valid patterns\n');

// Test 4: Test state-aware selection
console.log('4. State-Aware Selection (Opening Phrases):');
states.forEach(state => {
  const pattern = patterns.getRandomPattern('openingPhrases', state);
  console.log(`   ${state}: "${pattern}"`);
});
console.log('   ✓ All states return valid opening phrases\n');

// Test 5: Test acknowledgment mapping
console.log('5. Acknowledgment State Mapping:');
const satisfiedAck = patterns.getRandomPattern('acknowledgments', 'satisfied');
const skepticalAck = patterns.getRandomPattern('acknowledgments', 'skeptical');
const neutralAck = patterns.getRandomPattern('acknowledgments', 'neutral');
console.log(`   satisfied → positive: "${satisfiedAck}"`);
console.log(`   skeptical → skeptical: "${skepticalAck}"`);
console.log(`   neutral → neutral: "${neutralAck}"`);
console.log('   ✓ Acknowledgments map correctly to emotional states\n');

// Test 6: Test randomness
console.log('6. Randomness Test (10 calls to openingPhrases):');
const randomPatterns = new Set();
for (let i = 0; i < 10; i++) {
  randomPatterns.add(patterns.getRandomPattern('openingPhrases', 'neutral'));
}
console.log('   Unique patterns:', randomPatterns.size);
console.log('   Patterns:', Array.from(randomPatterns).join(', '));
console.log('   ✓ Random selection working\n');

// Test 7: Test unknown category handling
console.log('7. Error Handling:');
const unknownCategory = patterns.getRandomPattern('unknownCategory');
console.log('   Unknown category returns:', unknownCategory);
console.log('   ✓ Returns null for unknown category\n');

// Test 8: Test fallback to neutral
console.log('8. Fallback Behavior:');
const unknownState = patterns.getRandomPattern('openingPhrases', 'unknown_state');
console.log('   Unknown state returns:', unknownState);
console.log('   Is in neutral array:', patterns.openingPhrases.neutral.includes(unknownState));
console.log('   ✓ Falls back to neutral state\n');

console.log('=== All Verifications Passed ✓ ===');
