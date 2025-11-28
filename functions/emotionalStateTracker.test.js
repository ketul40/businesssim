/**
 * Unit tests for Emotional State Tracker
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

const { EmotionalStateTracker, emotionalStates } = require('./emotionalStateTracker');

describe('EmotionalStateTracker', () => {
  let stakeholder;
  let scenario;

  beforeEach(() => {
    stakeholder = {
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

    scenario = {
      title: 'Product Proposal',
      situation: 'Proposing a new feature',
    };
  });

  describe('Initialization', () => {
    test('should initialize with neutral state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      expect(tracker.getCurrentState()).toBe('neutral');
    });

    test('should track all concerns as unaddressed initially', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      expect(tracker.getConcernsUnaddressed()).toHaveLength(3);
      expect(tracker.getConcernsAddressed()).toHaveLength(0);
    });

    test('should initialize state history with neutral state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const history = tracker.getStateHistory();
      expect(history).toHaveLength(1);
      expect(history[0].state).toBe('neutral');
      expect(history[0].turn).toBe(0);
    });

    test('should handle stakeholder without concerns', () => {
      const stakeholderNoConcerns = { ...stakeholder, concerns: [] };
      const tracker = new EmotionalStateTracker(stakeholderNoConcerns, scenario);
      expect(tracker.getConcernsUnaddressed()).toHaveLength(0);
    });
  });

  describe('State Transitions', () => {
    test('should transition to skeptical on vague responses', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'I think this is good.' },
        { type: 'stakeholder', content: 'Can you elaborate?' },
        { type: 'user', content: 'Yes, it is.' },
      ];
      tracker.analyzeTranscript(transcript);
      expect(tracker.getCurrentState()).toBe('skeptical');
    });

    test('should transition to curious when user provides evidence', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'Based on our research with 500 users and data analysis, we found that 75% want this feature. The results show significant improvement.' },
      ];
      tracker.analyzeTranscript(transcript);
      expect(tracker.getCurrentState()).toBe('curious');
    });

    test('should transition to warming_up when concern is addressed', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      // First make skeptical
      tracker._updateState('skeptical', 1, 'test');
      
      const transcript = [
        { type: 'user', content: 'Regarding the budget constraints, we can work within the existing Q2 budget of $50K. The development costs are estimated at $45K.' },
      ];
      tracker.analyzeTranscript(transcript);
      expect(tracker.getCurrentState()).toBe('warming_up');
    });

    test('should transition to satisfied when multiple concerns addressed', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('warming_up', 1, 'test');
      
      const transcript = [
        { type: 'user', content: 'Let me address the budget constraints, timeline feasibility, and team capacity. We have $50K allocated, a 3-month timeline with milestones, and sufficient team capacity with 5 developers.' },
      ];
      tracker.analyzeTranscript(transcript);
      
      // Should have addressed multiple concerns
      expect(tracker.getConcernsAddressed().length).toBeGreaterThan(1);
      expect(tracker.getCurrentState()).toBe('satisfied');
    });

    test('should transition to frustrated after repeated vague responses', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('concerned', 1, 'test');
      
      const transcript = [
        { type: 'user', content: 'Maybe.' },
        { type: 'stakeholder', content: 'Can you be more specific?' },
        { type: 'user', content: 'Sure.' },
      ];
      tracker.analyzeTranscript(transcript);
      expect(tracker.getCurrentState()).toBe('frustrated');
    });

    test('should transition to concerned when concerns remain unaddressed', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      // Simulate several turns without addressing concerns
      tracker._updateState('neutral', 1, 'test');
      tracker._updateState('neutral', 2, 'test');
      tracker._updateState('neutral', 3, 'test');
      tracker._updateState('neutral', 4, 'test');
      
      const transcript = [
        { type: 'user', content: 'This is a great opportunity for innovation and growth.' },
      ];
      tracker.analyzeTranscript(transcript);
      expect(tracker.getCurrentState()).toBe('concerned');
    });
  });

  describe('Concern Tracking', () => {
    test('should mark concern as addressed when keywords match', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'Regarding the budget constraints, we have allocated sufficient funds and can work within the budget limits.' },
      ];
      tracker.analyzeTranscript(transcript);
      
      const addressed = tracker.getConcernsAddressed();
      expect(addressed.length).toBeGreaterThan(0);
      expect(addressed[0]).toContain('Budget');
    });

    test('should track multiple concerns addressed in one message', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'We can handle the budget constraints with our $50K allocation, the timeline is feasible with our 3-month plan, and our team capacity is sufficient with 5 developers.' },
      ];
      tracker.analyzeTranscript(transcript);
      
      const addressed = tracker.getConcernsAddressed();
      expect(addressed.length).toBeGreaterThanOrEqual(2);
    });

    test('should maintain unaddressed concerns list', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'The budget constraints are covered with our allocation.' },
      ];
      tracker.analyzeTranscript(transcript);
      
      const unaddressed = tracker.getConcernsUnaddressed();
      expect(unaddressed.length).toBeLessThan(3);
      expect(unaddressed.some(c => c.includes('Timeline') || c.includes('Team'))).toBe(true);
    });
  });

  describe('State Instructions', () => {
    test('should generate instructions for current state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toContain('Current Emotional State');
      expect(instructions).toContain('neutral');
      expect(instructions).toContain('Tone and Language');
    });

    test('should include concern status in instructions', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toContain('Concern Status');
      expect(instructions).toContain('Unaddressed concerns');
    });

    test('should provide state-specific guidance for skeptical state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('skeptical', 1, 'test');
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toContain('skeptical');
      expect(instructions).toContain('challenging questions');
    });

    test('should provide state-specific guidance for satisfied state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('satisfied', 1, 'test');
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toContain('satisfied');
      expect(instructions).toContain('agreement');
    });

    test('should list addressed concerns in instructions', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: 'The budget constraints are handled with our $50K allocation.' },
      ];
      tracker.analyzeTranscript(transcript);
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toContain('Addressed concerns');
    });
  });

  describe('Trajectory Calculation', () => {
    test('should return stable for initial state', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      expect(tracker.getTrajectory()).toBe('stable');
    });

    test('should return improving for positive state progression', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('skeptical', 1, 'test');
      tracker._updateState('curious', 2, 'test');
      tracker._updateState('warming_up', 3, 'test');
      
      expect(tracker.getTrajectory()).toBe('improving');
    });

    test('should return declining for negative state progression', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('curious', 1, 'test');
      tracker._updateState('skeptical', 2, 'test');
      tracker._updateState('frustrated', 3, 'test');
      
      expect(tracker.getTrajectory()).toBe('declining');
    });

    test('should return stable for minimal change', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('neutral', 1, 'test');
      tracker._updateState('curious', 2, 'test');
      tracker._updateState('neutral', 3, 'test');
      
      expect(tracker.getTrajectory()).toBe('stable');
    });
  });

  describe('Error Handling', () => {
    test('should handle null transcript gracefully', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const result = tracker.analyzeTranscript(null);
      expect(result).toBe('neutral');
    });

    test('should handle empty transcript gracefully', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const result = tracker.analyzeTranscript([]);
      expect(result).toBe('neutral');
    });

    test('should handle transcript with no user messages', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'stakeholder', content: 'Tell me more.' },
      ];
      const result = tracker.analyzeTranscript(transcript);
      expect(result).toBe('neutral');
    });

    test('should default to neutral on analysis errors', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const transcript = [
        { type: 'user', content: null }, // Invalid content
      ];
      const result = tracker.analyzeTranscript(transcript);
      expect(result).toBe('neutral');
    });
  });

  describe('Message Analysis', () => {
    test('should detect specifics in user messages', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const message = {
        type: 'user',
        content: 'We have 5 developers working for 3 months, with a budget of $50K and weekly milestones.',
      };
      const analysis = tracker._analyzeUserMessage(message, [message]);
      
      expect(analysis.hasSpecifics).toBe(true);
    });

    test('should detect vague messages', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const message = {
        type: 'user',
        content: 'Yes, I agree.',
      };
      const analysis = tracker._analyzeUserMessage(message, [message]);
      
      expect(analysis.isVague).toBe(true);
    });

    test('should detect evidence in messages', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const message = {
        type: 'user',
        content: 'Our research data shows that 85% of users reported positive results in the study.',
      };
      const analysis = tracker._analyzeUserMessage(message, [message]);
      
      expect(analysis.hasEvidence).toBe(true);
    });
  });

  describe('State History', () => {
    test('should track state transitions in history', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('curious', 1, 'User provided details');
      tracker._updateState('warming_up', 2, 'Concern addressed');
      
      const history = tracker.getStateHistory();
      expect(history).toHaveLength(3); // neutral + 2 updates
      expect(history[1].state).toBe('curious');
      expect(history[2].state).toBe('warming_up');
    });

    test('should include reasons for state transitions', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('curious', 1, 'User provided evidence');
      
      const history = tracker.getStateHistory();
      expect(history[1].reason).toBe('User provided evidence');
    });

    test('should track turn numbers in history', () => {
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker._updateState('curious', 5, 'test');
      
      const history = tracker.getStateHistory();
      expect(history[1].turn).toBe(5);
    });
  });
});
