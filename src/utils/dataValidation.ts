/**
 * Data validation utilities for handling corrupted or malformed data
 * Implements graceful handling as per Requirements 10.2
 */

export interface ValidationResult<T> {
  valid: boolean;
  sanitized: T | null;
  errors?: string[];
}

/**
 * Validates and sanitizes user data from storage or API
 */
export function validateUserData(data: any): ValidationResult<any> {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null, errors: ['Invalid user data structure'] };
    }

    // Check required fields
    if (!data.email || typeof data.email !== 'string') {
      return { valid: false, sanitized: null, errors: ['Missing or invalid email'] };
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
    return { valid: false, sanitized: null, errors: ['Error validating user data'] };
  }
}

/**
 * Validates and sanitizes session data from storage or API
 */
export function validateSessionData(data: any): ValidationResult<any> {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null, errors: ['Invalid session data structure'] };
    }

    // Check required fields
    if (!data.userId || typeof data.userId !== 'string') {
      return { valid: false, sanitized: null, errors: ['Missing or invalid userId'] };
    }

    if (!data.scenario || typeof data.scenario !== 'object') {
      return { valid: false, sanitized: null, errors: ['Missing or invalid scenario'] };
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
    return { valid: false, sanitized: null, errors: ['Error validating session data'] };
  }
}

/**
 * Validates and sanitizes evaluation data from storage or API
 */
export function validateEvaluationData(data: any): ValidationResult<any> {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, sanitized: null, errors: ['Invalid evaluation data structure'] };
    }

    // Check required fields
    if (!data.sessionId || typeof data.sessionId !== 'string') {
      return { valid: false, sanitized: null, errors: ['Missing or invalid sessionId'] };
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
    return { valid: false, sanitized: null, errors: ['Error validating evaluation data'] };
  }
}
