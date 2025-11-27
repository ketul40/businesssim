import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 19: Graceful handling of corrupted data
 * Validates: Requirements 10.2
 * 
 * Property: For any data loaded from storage or API, when the data is malformed 
 * or missing required fields, the application should handle it gracefully without crashing
 */

// Helper to validate user data structure
function validateUserData(data: any): { valid: boolean; sanitized: any | null } {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null };
    }

    // Check required fields
    if (!data.email || typeof data.email !== 'string') {
      return { valid: false, sanitized: null };
    }

    // Sanitize and provide defaults
    const sanitized = {
      email: data.email,
      displayName: typeof data.displayName === 'string' ? data.displayName : 'Unknown User',
      photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
      roleLevel: ['individual_contributor', 'manager', 'director', 'executive'].includes(data.roleLevel)
        ? data.roleLevel
        : 'individual_contributor',
      totalSessions: typeof data.totalSessions === 'number' && data.totalSessions >= 0 
        ? data.totalSessions 
        : 0,
      averageScore: typeof data.averageScore === 'number' && data.averageScore >= 0 && data.averageScore <= 100
        ? data.averageScore
        : 0,
    };

    return { valid: true, sanitized };
  } catch (error) {
    return { valid: false, sanitized: null };
  }
}

// Helper to validate session data structure
function validateSessionData(data: any): { valid: boolean; sanitized: any | null } {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null };
    }

    // Check required fields
    if (!data.userId || typeof data.userId !== 'string') {
      return { valid: false, sanitized: null };
    }

    if (!data.scenario || typeof data.scenario !== 'object') {
      return { valid: false, sanitized: null };
    }

    // Sanitize and provide defaults
    const sanitized = {
      userId: data.userId,
      scenario: data.scenario,
      turnLimit: typeof data.turnLimit === 'number' && data.turnLimit > 0 ? data.turnLimit : 10,
      transcript: Array.isArray(data.transcript) ? data.transcript : [],
      state: ['IN_SIM', 'TIMEOUT', 'EXITED', 'EVALUATED'].includes(data.state) 
        ? data.state 
        : 'IN_SIM',
      turnCount: typeof data.turnCount === 'number' && data.turnCount >= 0 ? data.turnCount : 0,
    };

    return { valid: true, sanitized };
  } catch (error) {
    return { valid: false, sanitized: null };
  }
}

// Helper to validate evaluation data structure
function validateEvaluationData(data: any): { valid: boolean; sanitized: any | null } {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null };
    }

    // Check required fields
    if (!data.sessionId || typeof data.sessionId !== 'string') {
      return { valid: false, sanitized: null };
    }

    // Sanitize and provide defaults
    const sanitized = {
      sessionId: data.sessionId,
      rubricId: typeof data.rubricId === 'string' ? data.rubricId : 'default',
      overall_score: typeof data.overall_score === 'number' && data.overall_score >= 0 && data.overall_score <= 100
        ? data.overall_score
        : 0,
      criterion_scores: Array.isArray(data.criterion_scores) ? data.criterion_scores : [],
      missed_opportunities: Array.isArray(data.missed_opportunities) ? data.missed_opportunities : [],
      moments_that_mattered: Array.isArray(data.moments_that_mattered) ? data.moments_that_mattered : [],
      reflection_prompt: typeof data.reflection_prompt === 'string' ? data.reflection_prompt : '',
      drills: Array.isArray(data.drills) ? data.drills : [],
    };

    return { valid: true, sanitized };
  } catch (error) {
    return { valid: false, sanitized: null };
  }
}

describe('Property 19: Graceful handling of corrupted data', () => {
  it('should handle corrupted user data without crashing', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (corruptedData) => {
          // The validation function should never throw
          const result = validateUserData(corruptedData);
          
          // Result should always have valid and sanitized properties
          expect(result).toHaveProperty('valid');
          expect(result).toHaveProperty('sanitized');
          
          // If valid is false, sanitized should be null
          if (!result.valid) {
            expect(result.sanitized).toBeNull();
          }
          
          // If valid is true, sanitized should have required fields
          if (result.valid) {
            expect(result.sanitized).toHaveProperty('email');
            expect(result.sanitized).toHaveProperty('displayName');
            expect(result.sanitized).toHaveProperty('roleLevel');
            expect(result.sanitized).toHaveProperty('totalSessions');
            expect(result.sanitized).toHaveProperty('averageScore');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle corrupted session data without crashing', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (corruptedData) => {
          // The validation function should never throw
          const result = validateSessionData(corruptedData);
          
          // Result should always have valid and sanitized properties
          expect(result).toHaveProperty('valid');
          expect(result).toHaveProperty('sanitized');
          
          // If valid is false, sanitized should be null
          if (!result.valid) {
            expect(result.sanitized).toBeNull();
          }
          
          // If valid is true, sanitized should have required fields
          if (result.valid) {
            expect(result.sanitized).toHaveProperty('userId');
            expect(result.sanitized).toHaveProperty('scenario');
            expect(result.sanitized).toHaveProperty('turnLimit');
            expect(result.sanitized).toHaveProperty('transcript');
            expect(result.sanitized).toHaveProperty('state');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle corrupted evaluation data without crashing', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (corruptedData) => {
          // The validation function should never throw
          const result = validateEvaluationData(corruptedData);
          
          // Result should always have valid and sanitized properties
          expect(result).toHaveProperty('valid');
          expect(result).toHaveProperty('sanitized');
          
          // If valid is false, sanitized should be null
          if (!result.valid) {
            expect(result.sanitized).toBeNull();
          }
          
          // If valid is true, sanitized should have required fields
          if (result.valid) {
            expect(result.sanitized).toHaveProperty('sessionId');
            expect(result.sanitized).toHaveProperty('overall_score');
            expect(result.sanitized).toHaveProperty('criterion_scores');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize partially valid user data with defaults', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: fc.emailAddress(),
          displayName: fc.option(fc.string(), { nil: undefined }),
          totalSessions: fc.option(fc.oneof(fc.integer(), fc.constant(-5), fc.constant('invalid')), { nil: undefined }),
          averageScore: fc.option(fc.oneof(fc.float(), fc.constant(150), fc.constant(-10)), { nil: undefined }),
        }),
        (partialData) => {
          const result = validateUserData(partialData);
          
          // Should be valid since email is present
          expect(result.valid).toBe(true);
          expect(result.sanitized).not.toBeNull();
          
          if (result.sanitized) {
            // Email should be preserved
            expect(result.sanitized.email).toBe(partialData.email);
            
            // Missing or invalid fields should have defaults
            expect(result.sanitized.displayName).toBeDefined();
            expect(typeof result.sanitized.totalSessions).toBe('number');
            expect(result.sanitized.totalSessions).toBeGreaterThanOrEqual(0);
            expect(typeof result.sanitized.averageScore).toBe('number');
            expect(result.sanitized.averageScore).toBeGreaterThanOrEqual(0);
            expect(result.sanitized.averageScore).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
