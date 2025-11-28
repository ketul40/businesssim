/**
 * Unit tests for test fixtures
 * Verifies that our sample data is properly structured
 */

const {
  sampleStakeholders,
  sampleScenarios,
  sampleTranscripts,
  sampleResponses
} = require('./testFixtures');

describe('Test Fixtures', () => {
  describe('sampleStakeholders', () => {
    test('should have all personality types', () => {
      const personalities = ['direct', 'collaborative', 'analytical', 'creative', 'skeptical', 'supportive'];
      
      personalities.forEach(personality => {
        expect(sampleStakeholders[personality]).toBeDefined();
        expect(sampleStakeholders[personality].personality).toBe(personality);
      });
    });

    test('should have required fields for each stakeholder', () => {
      Object.values(sampleStakeholders).forEach(stakeholder => {
        expect(stakeholder.name).toBeDefined();
        expect(stakeholder.role).toBeDefined();
        expect(stakeholder.personality).toBeDefined();
        expect(stakeholder.concerns).toBeInstanceOf(Array);
        expect(stakeholder.motivations).toBeInstanceOf(Array);
        expect(stakeholder.communicationStyle).toBeDefined();
        expect(stakeholder.speechPatterns).toBeDefined();
      });
    });

    test('should have valid communication styles', () => {
      Object.values(sampleStakeholders).forEach(stakeholder => {
        const style = stakeholder.communicationStyle;
        expect(['direct', 'indirect', 'balanced']).toContain(style.directness);
        expect(['formal', 'casual', 'professional']).toContain(style.formality);
        expect(['high', 'medium', 'low']).toContain(style.emotionalExpressiveness);
        expect(['probing', 'supportive', 'challenging']).toContain(style.questioningStyle);
      });
    });
  });

  describe('sampleScenarios', () => {
    test('should have multiple scenarios', () => {
      expect(Object.keys(sampleScenarios).length).toBeGreaterThan(0);
    });

    test('should have required fields for each scenario', () => {
      Object.values(sampleScenarios).forEach(scenario => {
        expect(scenario.id).toBeDefined();
        expect(scenario.title).toBeDefined();
        expect(scenario.situation).toBeDefined();
        expect(scenario.objective).toBeDefined();
        expect(scenario.constraints).toBeInstanceOf(Array);
        expect(scenario.stakeholders).toBeInstanceOf(Array);
        expect(scenario.stakeholders.length).toBeGreaterThan(0);
      });
    });
  });

  describe('sampleTranscripts', () => {
    test('should have multiple transcript types', () => {
      expect(Object.keys(sampleTranscripts).length).toBeGreaterThan(0);
    });

    test('should have valid message structure', () => {
      Object.values(sampleTranscripts).forEach(transcript => {
        expect(transcript).toBeInstanceOf(Array);
        transcript.forEach(message => {
          expect(message.type).toBeDefined();
          expect(['user', 'stakeholder']).toContain(message.type);
          expect(message.content).toBeDefined();
          expect(typeof message.content).toBe('string');
        });
      });
    });

    test('natural transcript should have conversational elements', () => {
      const natural = sampleTranscripts.natural;
      const allContent = natural.map(m => m.content).join(' ');
      
      // Should have some informal elements
      expect(allContent.toLowerCase()).toMatch(/hey|hmm|okay|what's/);
    });

    test('formal transcript should be more formal', () => {
      const formal = sampleTranscripts.formal;
      const allContent = formal.map(m => m.content).join(' ');
      
      // Should have formal language
      expect(allContent).toMatch(/would like|certainly|please/i);
    });
  });

  describe('sampleResponses', () => {
    test('should have responses with different characteristics', () => {
      expect(sampleResponses.withFillers).toBeDefined();
      expect(sampleResponses.withoutFillers).toBeDefined();
      expect(sampleResponses.withContractions).toBeDefined();
      expect(sampleResponses.withoutContractions).toBeDefined();
    });

    test('withFillers should contain conversational elements', () => {
      const allText = sampleResponses.withFillers.join(' ');
      expect(allText.toLowerCase()).toMatch(/hmm|you know|well|okay/);
    });

    test('withContractions should contain contractions', () => {
      const allText = sampleResponses.withContractions.join(' ');
      expect(allText).toMatch(/I'm|we're|that's|don't|doesn't/);
    });

    test('withoutContractions should not contain contractions', () => {
      const allText = sampleResponses.withoutContractions.join(' ');
      expect(allText).not.toMatch(/I'm|we're|that's|don't|doesn't/);
    });

    test('varyingLengths should have different lengths', () => {
      const lengths = sampleResponses.varyingLengths.map(r => r.length);
      const min = Math.min(...lengths);
      const max = Math.max(...lengths);
      
      expect(max).toBeGreaterThan(min * 3); // Significant variation
    });
  });
});
