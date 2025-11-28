console.log('Starting simple test...');

try {
  const {PersonalityEngine} = require('./personalityEngine');
  console.log('PersonalityEngine loaded');
  
  const stakeholder = {name: 'Test', personality: 'direct'};
  const engine = new PersonalityEngine(stakeholder);
  console.log('PersonalityEngine created:', engine.getPersonalityType());
} catch (error) {
  console.error('Error:', error.message);
}

console.log('Test complete');
