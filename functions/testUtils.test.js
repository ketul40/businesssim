/**
 * Unit tests for test utilities
 * Verifies that our analysis functions work correctly
 */

const {
  analyzeSentenceStructure,
  calculateFormalityScore,
  detectConversationalFillers,
  analyzeContractions,
  findRepeatedPhrases,
  detectThinkingMarkers,
  analyzeResponseLengthVariation,
  calculateWordOverlap
} = require('./testUtils');

describe('Test Utilities', () => {
  describe('analyzeSentenceStructure', () => {
    test('should analyze basic sentence structure', () => {
      const text = "This is a short sentence. This is another sentence with more words in it.";
      const result = analyzeSentenceStructure(text);
      
      expect(result.sentenceCount).toBe(2);
      expect(result.lengths).toHaveLength(2);
      expect(result.pattern).toBeTruthy();
    });

    test('should handle empty text', () => {
      const result = analyzeSentenceStructure('');
      expect(result.sentenceCount).toBe(0);
    });

    test('should handle text with multiple punctuation types', () => {
      const text = "Really? Yes! That's great.";
      const result = analyzeSentenceStructure(text);
      expect(result.sentenceCount).toBe(3);
    });
  });

  describe('calculateFormalityScore', () => {
    test('should detect formal language', () => {
      const text = "I would like to inquire about this matter. Furthermore, it is necessary to proceed.";
      const score = calculateFormalityScore(text);
      expect(score).toBeGreaterThan(0.5);
    });

    test('should detect informal language', () => {
      const text = "I'm not sure about that. You know, it's kinda tricky. Don't worry though.";
      const score = calculateFormalityScore(text);
      expect(score).toBeLessThan(0.5);
    });

    test('should return neutral for text without indicators', () => {
      const text = "The project will start next week.";
      const score = calculateFormalityScore(text);
      expect(score).toBe(0.5);
    });
  });

  describe('detectConversationalFillers', () => {
    test('should detect thinking markers', () => {
      const text = "Hmm, let me think about that for a moment.";
      const result = detectConversationalFillers(text);
      
      expect(result.hasFillers).toBe(true);
      expect(result.count).toBeGreaterThan(0);
      expect(result.types).toContain('thinking');
    });

    test('should detect hedges', () => {
      const text = "Maybe we could try that. I'm not entirely sure though.";
      const result = detectConversationalFillers(text);
      
      expect(result.hasFillers).toBe(true);
      expect(result.types).toContain('hedge');
    });

    test('should detect discourse markers', () => {
      const text = "You know, look, here's the thing about that.";
      const result = detectConversationalFillers(text);
      
      expect(result.hasFillers).toBe(true);
      expect(result.types).toContain('discourse');
    });

    test('should return false for text without fillers', () => {
      const text = "The project deadline is next Friday.";
      const result = detectConversationalFillers(text);
      
      expect(result.hasFillers).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('analyzeContractions', () => {
    test('should count contractions correctly', () => {
      const text = "I'm not sure. We're going to try. That's the plan.";
      const result = analyzeContractions(text);
      
      expect(result.contractionCount).toBe(3);
      expect(result.contractionRate).toBeGreaterThan(0);
    });

    test('should count full forms correctly', () => {
      const text = "I am not sure. We are going to try. That is the plan.";
      const result = analyzeContractions(text);
      
      expect(result.fullFormCount).toBe(3);
      expect(result.contractionCount).toBe(0);
    });

    test('should calculate contraction rate', () => {
      const text = "I'm happy but I am also nervous.";
      const result = analyzeContractions(text);
      
      expect(result.totalApplicable).toBe(2);
      expect(result.contractionRate).toBe(0.5);
    });
  });

  describe('findRepeatedPhrases', () => {
    test('should find repeated phrases', () => {
      const text = "That's a good point. I think that's worth considering. That's a good point again.";
      const result = findRepeatedPhrases(text, 3);
      
      expect(result.repeatedPhrases.length).toBeGreaterThan(0);
      expect(result.maxRepetitions).toBeGreaterThan(1);
    });

    test('should not find repetitions in unique text', () => {
      const text = "Every sentence here is completely different from the others.";
      const result = findRepeatedPhrases(text, 3);
      
      expect(result.repeatedPhrases.length).toBe(0);
    });
  });

  describe('detectThinkingMarkers', () => {
    test('should detect thinking markers', () => {
      const text = "Hmm, let me think about that. Give me a second.";
      const result = detectThinkingMarkers(text);
      
      expect(result.hasThinkingMarkers).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    test('should return false for text without thinking markers', () => {
      const text = "The answer is clearly yes.";
      const result = detectThinkingMarkers(text);
      
      expect(result.hasThinkingMarkers).toBe(false);
    });
  });

  describe('analyzeResponseLengthVariation', () => {
    test('should calculate variation statistics', () => {
      const responses = [
        "Short.",
        "This is a bit longer sentence.",
        "This is an even longer sentence with more words.",
        "Okay."
      ];
      const result = analyzeResponseLengthVariation(responses);
      
      expect(result.stdDev).toBeGreaterThan(0);
      expect(result.lengths).toHaveLength(4);
      expect(result.min).toBeLessThan(result.max);
    });

    test('should handle empty array', () => {
      const result = analyzeResponseLengthVariation([]);
      expect(result.stdDev).toBe(0);
    });
  });

  describe('calculateWordOverlap', () => {
    test('should calculate overlap between similar texts', () => {
      const text1 = "The quick brown fox jumps over the lazy dog";
      const text2 = "The quick brown cat jumps over the lazy dog";
      const overlap = calculateWordOverlap(text1, text2);
      
      expect(overlap).toBeGreaterThan(0.5);
    });

    test('should return low overlap for different texts', () => {
      const text1 = "Machine learning algorithms process data";
      const text2 = "Cooking recipes require fresh ingredients";
      const overlap = calculateWordOverlap(text1, text2);
      
      expect(overlap).toBeLessThan(0.3);
    });

    test('should exclude common words', () => {
      const text1 = "The cat is on the mat";
      const text2 = "The dog is on the rug";
      const overlap = calculateWordOverlap(text1, text2);
      
      // Should be low because common words are excluded
      expect(overlap).toBeLessThan(0.5);
    });
  });
});
