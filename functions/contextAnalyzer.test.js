/**
 * Unit tests for Context Analyzer
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

const { ContextAnalyzer, commitmentPatterns, concernPatterns } = require('./contextAnalyzer');

describe('ContextAnalyzer', () => {
  describe('Initialization', () => {
    test('should initialize with empty transcript', () => {
      const analyzer = new ContextAnalyzer([]);
      expect(analyzer.keyPoints).toEqual([]);
      expect(analyzer.userCommitments).toEqual([]);
      expect(analyzer.contradictions).toEqual([]);
    });

    test('should analyze transcript on initialization', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver the report by Friday with 10 key findings.' },
        { type: 'stakeholder', content: 'That sounds good.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.keyPoints.length).toBeGreaterThan(0);
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should handle null transcript', () => {
      const analyzer = new ContextAnalyzer(null);
      expect(analyzer.transcript).toEqual([]);
      expect(analyzer.keyPoints).toEqual([]);
    });
  });

  describe('Key Point Extraction', () => {
    test('should extract key points with high importance', () => {
      const transcript = [
        { type: 'user', content: 'I will implement the feature with 5 developers over 3 months, targeting 80% user satisfaction.' },
        { type: 'stakeholder', content: 'Okay.' },
        { type: 'user', content: 'Yes.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(keyPoints[0].importance).toBeGreaterThanOrEqual(3);
    });

    test('should prioritize messages with numbers', () => {
      const transcript = [
        { type: 'user', content: 'We have 100 users and 50% conversion rate.' },
        { type: 'user', content: 'This is good.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      const firstPoint = keyPoints[0];
      expect(firstPoint.content).toContain('100');
    });

    test('should prioritize messages with commitments', () => {
      const transcript = [
        { type: 'user', content: 'I will complete this by next week.' },
        { type: 'user', content: 'That sounds interesting.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      expect(keyPoints[0].content).toContain('will complete');
    });

    test('should prioritize messages with decisions', () => {
      const transcript = [
        { type: 'user', content: 'I\'ve decided to go with option A for the implementation.' },
        { type: 'user', content: 'Maybe we can discuss this.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      expect(keyPoints[0].content).toContain('decided');
    });

    test('should include turn number and speaker in key points', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver 5 features by Q2 with 90% quality metrics.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      expect(keyPoints[0]).toHaveProperty('turn');
      expect(keyPoints[0]).toHaveProperty('speaker');
      expect(keyPoints[0].speaker).toBe('user');
    });

    test('should create summaries for key points', () => {
      const transcript = [
        { type: 'user', content: 'I will implement the authentication system with OAuth2 support, including social login providers like Google and Facebook, with full security audit compliance.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      expect(keyPoints[0]).toHaveProperty('summary');
      expect(keyPoints[0].summary.length).toBeLessThanOrEqual(103); // 100 chars + '...'
    });

    test('should sort key points by importance', () => {
      const transcript = [
        { type: 'user', content: 'Maybe.' },
        { type: 'user', content: 'I will deliver 10 features with 95% test coverage by Q3, using 5 developers.' },
        { type: 'user', content: 'That\'s interesting.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const keyPoints = analyzer.extractKeyPoints();
      
      // First key point should be the most important one
      expect(keyPoints[0].content).toContain('features');
      expect(keyPoints[0].importance).toBeGreaterThan(keyPoints[keyPoints.length - 1]?.importance || 0);
    });
  });

  describe('Commitment Extraction', () => {
    test('should extract "I will" commitments', () => {
      const transcript = [
        { type: 'user', content: 'I will complete the project by Friday.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
      expect(analyzer.userCommitments[0].commitment).toContain('will complete');
    });

    test('should extract "I\'ll" commitments', () => {
      const transcript = [
        { type: 'user', content: 'I\'ll send you the report tomorrow.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should extract "we will" commitments', () => {
      const transcript = [
        { type: 'user', content: 'We will deliver the feature next sprint.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should extract "I can" commitments', () => {
      const transcript = [
        { type: 'user', content: 'I can provide the data by end of day.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should extract "let me" commitments', () => {
      const transcript = [
        { type: 'user', content: 'Let me get back to you with those numbers.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should only extract commitments from user messages', () => {
      const transcript = [
        { type: 'stakeholder', content: 'I will need that report.' },
        { type: 'user', content: 'I will provide it.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBe(1);
      expect(analyzer.userCommitments[0].commitment).toContain('provide');
    });

    test('should mark commitments as unaddressed initially', () => {
      const transcript = [
        { type: 'user', content: 'I will complete this task.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments[0].addressed).toBe(false);
    });

    test('should allow marking commitments as addressed', () => {
      const transcript = [
        { type: 'user', content: 'I will complete this task.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      analyzer.markCommitmentAddressed(0);
      
      expect(analyzer.userCommitments[0].addressed).toBe(true);
    });
  });

  describe('Concern Extraction', () => {
    test('should extract "I\'m worried" concerns', () => {
      const transcript = [
        { type: 'stakeholder', content: 'I\'m worried about the timeline.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.stakeholderConcerns.length).toBeGreaterThan(0);
      expect(analyzer.stakeholderConcerns[0].concern).toContain('worried');
    });

    test('should extract "my concern" concerns', () => {
      const transcript = [
        { type: 'stakeholder', content: 'My concern is the budget.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.stakeholderConcerns.length).toBeGreaterThan(0);
    });

    test('should extract "what if" concerns', () => {
      const transcript = [
        { type: 'stakeholder', content: 'What if we run out of resources?' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.stakeholderConcerns.length).toBeGreaterThan(0);
    });

    test('should only extract concerns from stakeholder messages', () => {
      const transcript = [
        { type: 'user', content: 'I\'m worried about this.' },
        { type: 'stakeholder', content: 'I\'m concerned about the timeline.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.stakeholderConcerns.length).toBe(1);
      expect(analyzer.stakeholderConcerns[0].concern).toContain('timeline');
    });

    test('should allow marking concerns as addressed', () => {
      const transcript = [
        { type: 'stakeholder', content: 'I\'m worried about the budget.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      analyzer.markConcernAddressed(0);
      
      expect(analyzer.stakeholderConcerns[0].addressed).toBe(true);
    });
  });

  describe('Contradiction Detection', () => {
    test('should detect yes/no contradictions', () => {
      const transcript = [
        { type: 'user', content: 'Yes, I can complete the project on time.' },
        { type: 'stakeholder', content: 'Great.' },
        { type: 'user', content: 'No, I can\'t complete the project on time.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBeGreaterThan(0);
    });

    test('should detect can/can\'t contradictions', () => {
      const transcript = [
        { type: 'user', content: 'I can deliver the feature by Friday.' },
        { type: 'user', content: 'I can\'t deliver the feature by Friday.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0].description).toContain('capability');
    });

    test('should detect will/won\'t contradictions', () => {
      const transcript = [
        { type: 'user', content: 'I will implement the authentication system.' },
        { type: 'user', content: 'I won\'t implement the authentication system.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBeGreaterThan(0);
    });

    test('should detect numeric contradictions', () => {
      const transcript = [
        { type: 'user', content: 'The project will cost 100 thousand dollars.' },
        { type: 'user', content: 'The project will cost 200 thousand dollars.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0].description).toContain('numeric');
    });

    test('should include turn numbers in contradictions', () => {
      const transcript = [
        { type: 'user', content: 'I will do this.' },
        { type: 'stakeholder', content: 'Good.' },
        { type: 'user', content: 'I won\'t do this.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions[0]).toHaveProperty('turn1');
      expect(contradictions[0]).toHaveProperty('turn2');
      expect(contradictions[0].turn1).toBe(0);
      expect(contradictions[0].turn2).toBe(2);
    });

    test('should include content summaries in contradictions', () => {
      const transcript = [
        { type: 'user', content: 'I can complete this task.' },
        { type: 'user', content: 'I cannot complete this task.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions[0]).toHaveProperty('content1');
      expect(contradictions[0]).toHaveProperty('content2');
    });

    test('should not detect contradictions in unrelated statements', () => {
      const transcript = [
        { type: 'user', content: 'I like apples.' },
        { type: 'user', content: 'I don\'t like oranges.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBe(0);
    });

    test('should only check user messages for contradictions', () => {
      const transcript = [
        { type: 'stakeholder', content: 'I can do this.' },
        { type: 'stakeholder', content: 'I can\'t do this.' },
        { type: 'user', content: 'Okay.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.findContradictions();
      
      expect(contradictions.length).toBe(0);
    });
  });

  describe('Referenceable Points', () => {
    test('should return referenceable points', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver 5 features with 90% test coverage by Q2.' },
        { type: 'stakeholder', content: 'That sounds ambitious.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints();
      
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toHaveProperty('referencePhrase');
    });

    test('should limit number of referenceable points', () => {
      const transcript = Array(20).fill(null).map((_, i) => ({
        type: 'user',
        content: `I will complete task ${i} with ${i * 10} resources.`,
      }));
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints(3);
      
      expect(points.length).toBeLessThanOrEqual(3);
    });

    test('should prioritize recent points', () => {
      const transcript = [
        { type: 'user', content: 'Old message.' },
        { type: 'user', content: 'I will deliver 10 features by Q3 with 95% coverage.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints();
      
      // Recent important message should be included
      expect(points.some(p => p.fullContent.includes('features'))).toBe(true);
    });

    test('should generate natural reference phrases', () => {
      const transcript = [
        { type: 'user', content: 'I will implement the authentication system.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints();
      
      expect(points[0].referencePhrase).toMatch(/Going back to|You mentioned|Earlier you said|Like you said|As you pointed out|Building on|Related to/);
    });

    test('should include full content in referenceable points', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver the feature by Friday.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const points = analyzer.getReferencablePoints();
      
      expect(points[0]).toHaveProperty('fullContent');
      expect(points[0].fullContent).toBe('I will deliver the feature by Friday.');
    });
  });

  describe('Topic Extraction', () => {
    test('should extract topics from conversation', () => {
      const transcript = [
        { type: 'user', content: 'We need to discuss the authentication system and database migration.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const topics = analyzer.getTopicsDiscussed();
      
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.some(t => t.includes('authentication') || t.includes('database'))).toBe(true);
    });

    test('should filter out common words from topics', () => {
      const transcript = [
        { type: 'user', content: 'The system will have authentication and authorization features.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const topics = analyzer.getTopicsDiscussed();
      
      expect(topics.includes('the')).toBe(false);
      expect(topics.includes('will')).toBe(false);
      expect(topics.includes('have')).toBe(false);
    });

    test('should only include meaningful words as topics', () => {
      const transcript = [
        { type: 'user', content: 'We need to implement authentication with OAuth2 support.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const topics = analyzer.getTopicsDiscussed();
      
      // Topics should be longer than 4 characters
      topics.forEach(topic => {
        expect(topic.length).toBeGreaterThan(4);
      });
    });
  });

  describe('Context Summary', () => {
    test('should generate context summary', () => {
      const transcript = [
        { type: 'user', content: 'I will implement authentication with 5 developers by Q2.' },
        { type: 'stakeholder', content: 'I\'m worried about the timeline.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('Conversation Context');
      expect(summary).toContain('Key Points');
    });

    test('should include user commitments in summary', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver the report by Friday.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('User Commitments');
    });

    test('should include contradictions in summary', () => {
      const transcript = [
        { type: 'user', content: 'I can do this.' },
        { type: 'user', content: 'I can\'t do this.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('Contradictions Detected');
    });

    test('should include topics in summary', () => {
      const transcript = [
        { type: 'user', content: 'We need to discuss authentication and authorization systems.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('Topics Discussed');
    });

    test('should include reference guidance in summary', () => {
      const transcript = [
        { type: 'user', content: 'I will implement the feature with 5 developers.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('Reference Guidance');
    });

    test('should handle empty transcript in summary', () => {
      const analyzer = new ContextAnalyzer([]);
      const summary = analyzer.getContextSummary();
      
      expect(summary).toContain('Conversation Context');
      expect(summary).not.toContain('Key Points from Conversation');
    });
  });

  describe('Getter Methods', () => {
    test('should return user commitments', () => {
      const transcript = [
        { type: 'user', content: 'I will complete this task.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const commitments = analyzer.getUserCommitments();
      
      expect(Array.isArray(commitments)).toBe(true);
      expect(commitments.length).toBeGreaterThan(0);
    });

    test('should return stakeholder concerns', () => {
      const transcript = [
        { type: 'stakeholder', content: 'I\'m worried about the budget.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const concerns = analyzer.getStakeholderConcerns();
      
      expect(Array.isArray(concerns)).toBe(true);
      expect(concerns.length).toBeGreaterThan(0);
    });

    test('should return contradictions', () => {
      const transcript = [
        { type: 'user', content: 'I will do this.' },
        { type: 'user', content: 'I won\'t do this.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const contradictions = analyzer.getContradictions();
      
      expect(Array.isArray(contradictions)).toBe(true);
      expect(contradictions.length).toBeGreaterThan(0);
    });

    test('should return topics discussed', () => {
      const transcript = [
        { type: 'user', content: 'We need to implement authentication.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      const topics = analyzer.getTopicsDiscussed();
      
      expect(Array.isArray(topics)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long messages', () => {
      const longContent = 'word '.repeat(200);
      const transcript = [
        { type: 'user', content: longContent },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.keyPoints[0].summary.length).toBeLessThanOrEqual(103);
    });

    test('should handle messages with special characters', () => {
      const transcript = [
        { type: 'user', content: 'I will deliver @#$% by 100% completion!' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });

    test('should handle empty message content', () => {
      const transcript = [
        { type: 'user', content: '' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.keyPoints.length).toBe(0);
    });

    test('should handle mixed case in pattern matching', () => {
      const transcript = [
        { type: 'user', content: 'I WILL complete this task.' },
      ];
      const analyzer = new ContextAnalyzer(transcript);
      
      expect(analyzer.userCommitments.length).toBeGreaterThan(0);
    });
  });
});
