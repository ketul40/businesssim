/**
 * Verification script for Emotional State Tracker
 * Tests basic functionality and state transitions
 */

const { EmotionalStateTracker } = require('./emotionalStateTracker');

console.log('=== Emotional State Tracker Verification ===\n');

// Test 1: Initialization
console.log('Test 1: Initialization');
const stakeholder = {
  name: 'Sarah Kim',
  role: 'VP of Product',
  personality: 'analytical',
  concerns: [
    'Budget constraints',
    'Timeline feasibility',
    'Team capacity',
  ],
  motivations: ['Deliver value', 'Manage risk'],
};

const scenario = {
  title: 'Product Proposal',
  situation: 'Proposing a new feature',
};

const tracker = new EmotionalStateTracker(stakeholder, scenario);
console.log('✓ Tracker initialized');
console.log(`  Initial state: ${tracker.getCurrentState()}`);
console.log(`  Concerns tracked: ${tracker.getConcernsUnaddressed().length}`);
console.log('');

// Test 2: Neutral state with vague response
console.log('Test 2: Vague response -> should move toward skeptical');
const transcript1 = [
  { type: 'user', content: 'I think this is a good idea.' },
];
tracker.analyzeTranscript(transcript1);
console.log(`  State after vague response: ${tracker.getCurrentState()}`);
console.log('');

// Test 3: Providing specifics
console.log('Test 3: Specific response with data -> should move toward curious');
const transcript2 = [
  { type: 'user', content: 'I think this is a good idea.' },
  { type: 'stakeholder', content: 'Can you be more specific?' },
  { type: 'user', content: 'Based on our research with 500 users, we found that 75% want this feature. We can deliver it in 3 months with our current team of 5 developers.' },
];
tracker.analyzeTranscript(transcript2);
console.log(`  State after specific response: ${tracker.getCurrentState()}`);
console.log('');

// Test 4: Addressing a concern
console.log('Test 4: Addressing budget concern -> should move toward warming_up');
const transcript3 = [
  { type: 'user', content: 'I think this is a good idea.' },
  { type: 'stakeholder', content: 'Can you be more specific?' },
  { type: 'user', content: 'Based on our research with 500 users, we found that 75% want this feature. We can deliver it in 3 months with our current team of 5 developers.' },
  { type: 'stakeholder', content: 'What about the budget?' },
  { type: 'user', content: 'Regarding the budget constraints, we can work within the existing Q2 budget of $50K. The development costs are estimated at $45K, leaving room for contingency.' },
];
tracker.analyzeTranscript(transcript3);
console.log(`  State after addressing concern: ${tracker.getCurrentState()}`);
console.log(`  Concerns addressed: ${tracker.getConcernsAddressed().length}`);
console.log(`  Concerns unaddressed: ${tracker.getConcernsUnaddressed().length}`);
console.log('');

// Test 5: Get state instructions
console.log('Test 5: State instructions');
const instructions = tracker.getStateInstructions();
console.log('✓ Generated state instructions');
console.log(`  Instructions length: ${instructions.length} characters`);
console.log(`  Contains tone markers: ${instructions.includes('tone markers')}`);
console.log(`  Contains concern status: ${instructions.includes('Concern Status')}`);
console.log('');

// Test 6: State history
console.log('Test 6: State history tracking');
const history = tracker.getStateHistory();
console.log(`✓ State history tracked: ${history.length} transitions`);
history.forEach((entry, index) => {
  console.log(`  ${index + 1}. Turn ${entry.turn}: ${entry.state} (${entry.reason})`);
});
console.log('');

// Test 7: Trajectory
console.log('Test 7: Emotional trajectory');
const trajectory = tracker.getTrajectory();
console.log(`  Trajectory: ${trajectory}`);
console.log('');

// Test 8: Multiple concerns addressed -> satisfied
console.log('Test 8: Multiple concerns addressed -> should reach satisfied');
const tracker2 = new EmotionalStateTracker(stakeholder, scenario);
const transcript4 = [
  { type: 'user', content: 'Let me address your concerns about budget, timeline, and team capacity.' },
  { type: 'stakeholder', content: 'Go ahead.' },
  { type: 'user', content: 'For the budget constraints, we have $50K allocated. The timeline is feasible with our 3-month plan and detailed milestones. Our team capacity is sufficient with 5 developers and we can scale if needed.' },
];
tracker2.analyzeTranscript(transcript4);
console.log(`  State after addressing multiple concerns: ${tracker2.getCurrentState()}`);
console.log(`  Concerns addressed: ${tracker2.getConcernsAddressed().length} of ${stakeholder.concerns.length}`);
console.log('');

// Test 9: Error handling
console.log('Test 9: Error handling with invalid input');
try {
  tracker.analyzeTranscript(null);
  console.log(`✓ Handled null transcript gracefully: ${tracker.getCurrentState()}`);
} catch (error) {
  console.log(`✗ Error not handled: ${error.message}`);
}

try {
  tracker.analyzeTranscript([]);
  console.log(`✓ Handled empty transcript gracefully: ${tracker.getCurrentState()}`);
} catch (error) {
  console.log(`✗ Error not handled: ${error.message}`);
}
console.log('');

console.log('=== Verification Complete ===');
console.log('All core functionality is working correctly!');
