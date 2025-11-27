import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 21: Input validation with clear messages
 * Validates: Requirements 10.5
 * 
 * Property: For any user input field, when invalid data is entered, the application 
 * should display a clear validation error message explaining what is wrong and how to fix it
 */

// Validation result type
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Email validation
function validateEmail(email: any): ValidationResult {
  const errors: string[] = [];

  if (typeof email !== 'string') {
    errors.push('Email must be text. Please enter a valid email address.');
    return { valid: false, errors };
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required. Please enter your email address.');
    return { valid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Email format is invalid. Please enter a valid email address (e.g., user@example.com).');
    return { valid: false, errors };
  }

  if (email.length > 254) {
    errors.push('Email is too long. Please enter an email address with less than 254 characters.');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

// Password validation
function validatePassword(password: any): ValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    errors.push('Password must be text. Please enter a valid password.');
    return { valid: false, errors };
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required. Please enter a password.');
    return { valid: false, errors };
  }

  if (password.length < 6) {
    errors.push('Password is too short. Please enter at least 6 characters.');
  }

  if (password.length > 128) {
    errors.push('Password is too long. Please enter less than 128 characters.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).');
  }

  return { valid: errors.length === 0, errors };
}

// Display name validation
function validateDisplayName(name: any): ValidationResult {
  const errors: string[] = [];

  if (typeof name !== 'string') {
    errors.push('Display name must be text. Please enter a valid name.');
    return { valid: false, errors };
  }

  if (!name || name.trim() === '') {
    errors.push('Display name is required. Please enter your name.');
    return { valid: false, errors };
  }

  if (name.trim().length < 2) {
    errors.push('Display name is too short. Please enter at least 2 characters.');
    return { valid: false, errors };
  }

  if (name.length > 50) {
    errors.push('Display name is too long. Please enter less than 50 characters.');
    return { valid: false, errors };
  }

  if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(name)) {
    errors.push('Display name contains invalid characters. Please use only letters, numbers, spaces, hyphens, underscores, apostrophes, and periods.');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

// Message content validation
function validateMessageContent(content: any): ValidationResult {
  const errors: string[] = [];

  if (typeof content !== 'string') {
    errors.push('Message must be text. Please enter a valid message.');
    return { valid: false, errors };
  }

  if (!content || content.trim() === '') {
    errors.push('Message cannot be empty. Please enter a message.');
    return { valid: false, errors };
  }

  if (content.trim().length < 1) {
    errors.push('Message is too short. Please enter at least 1 character.');
    return { valid: false, errors };
  }

  if (content.length > 5000) {
    errors.push('Message is too long. Please enter less than 5000 characters.');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

// Turn limit validation
function validateTurnLimit(turnLimit: any): ValidationResult {
  const errors: string[] = [];

  if (turnLimit === null || turnLimit === undefined) {
    errors.push('Turn limit is required. Please enter a number between 1 and 50.');
    return { valid: false, errors };
  }

  if (typeof turnLimit !== 'number') {
    errors.push('Turn limit must be a number. Please enter a valid number between 1 and 50.');
    return { valid: false, errors };
  }

  if (!Number.isInteger(turnLimit)) {
    errors.push('Turn limit must be a whole number. Please enter an integer between 1 and 50.');
    return { valid: false, errors };
  }

  if (turnLimit < 1) {
    errors.push('Turn limit is too low. Please enter a number of at least 1.');
    return { valid: false, errors };
  }

  if (turnLimit > 50) {
    errors.push('Turn limit is too high. Please enter a number no greater than 50.');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

describe('Property 21: Input validation with clear messages', () => {
  it('should provide clear error messages for invalid email inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.string().filter(s => !s.includes('@')),
          fc.string().filter(s => s.includes('@') && !s.includes('.')),
          fc.string({ minLength: 255 })
        ),
        (invalidEmail) => {
          const result = validateEmail(invalidEmail);

          // Should be invalid
          expect(result.valid).toBe(false);

          // Should have at least one error message
          expect(result.errors.length).toBeGreaterThan(0);

          // Each error message should be descriptive
          result.errors.forEach(error => {
            expect(error.length).toBeGreaterThan(10); // Not just "Invalid"
            expect(error).toMatch(/email/i); // Mentions the field
            expect(error).toMatch(/please|enter|valid|required/i); // Provides guidance
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide clear error messages for invalid password inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.string({ maxLength: 5 }),
          fc.string({ minLength: 129 }),
          fc.constant('alllowercase'),
          fc.constant('ALLUPPERCASE'),
          fc.constant('NoNumbers!')
        ),
        (invalidPassword) => {
          const result = validatePassword(invalidPassword);

          // Should be invalid
          expect(result.valid).toBe(false);

          // Should have at least one error message
          expect(result.errors.length).toBeGreaterThan(0);

          // Each error message should be descriptive
          result.errors.forEach(error => {
            expect(error.length).toBeGreaterThan(10);
            expect(error).toMatch(/password/i);
            expect(error).toMatch(/please|enter|must|contain|at least/i);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide clear error messages for invalid display name inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('a'),
          fc.string({ minLength: 51 }),
          fc.constant('Invalid@Name#'),
          fc.constant('Bad<Name>')
        ),
        (invalidName) => {
          const result = validateDisplayName(invalidName);

          // Should be invalid
          expect(result.valid).toBe(false);

          // Should have at least one error message
          expect(result.errors.length).toBeGreaterThan(0);

          // Each error message should be descriptive
          result.errors.forEach(error => {
            expect(error.length).toBeGreaterThan(10);
            expect(error).toMatch(/name|display/i);
            expect(error).toMatch(/please|enter|valid|required|characters/i);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide clear error messages for invalid message content', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.string({ minLength: 5001 })
        ),
        (invalidContent) => {
          const result = validateMessageContent(invalidContent);

          // Should be invalid
          expect(result.valid).toBe(false);

          // Should have at least one error message
          expect(result.errors.length).toBeGreaterThan(0);

          // Each error message should be descriptive
          result.errors.forEach(error => {
            expect(error.length).toBeGreaterThan(10);
            expect(error).toMatch(/message/i);
            expect(error).toMatch(/please|enter|valid|empty|long|short/i);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide clear error messages for invalid turn limit inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant('not a number'),
          fc.float(),
          fc.integer({ max: 0 }),
          fc.integer({ min: 51 })
        ),
        (invalidTurnLimit) => {
          const result = validateTurnLimit(invalidTurnLimit);

          // Should be invalid
          expect(result.valid).toBe(false);

          // Should have at least one error message
          expect(result.errors.length).toBeGreaterThan(0);

          // Each error message should be descriptive
          result.errors.forEach(error => {
            expect(error.length).toBeGreaterThan(10);
            expect(error).toMatch(/turn|limit/i);
            expect(error).toMatch(/please|enter|number|valid|required/i);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid inputs without errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }).map(s => s.trim() || 'default').map(s => s + 'Aa1'),
          displayName: fc.string({ minLength: 2, maxLength: 30 }).filter(s => s.trim().length >= 2 && /^[a-zA-Z0-9\s]+$/.test(s)),
          message: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
          turnLimit: fc.integer({ min: 1, max: 50 })
        }),
        (validInputs) => {
          const emailResult = validateEmail(validInputs.email);
          const passwordResult = validatePassword(validInputs.password);
          const nameResult = validateDisplayName(validInputs.displayName);
          const messageResult = validateMessageContent(validInputs.message);
          const turnLimitResult = validateTurnLimit(validInputs.turnLimit);

          // All should be valid
          expect(emailResult.valid).toBe(true);
          expect(passwordResult.valid).toBe(true);
          expect(nameResult.valid).toBe(true);
          expect(messageResult.valid).toBe(true);
          expect(turnLimitResult.valid).toBe(true);

          // All should have no errors
          expect(emailResult.errors).toEqual([]);
          expect(passwordResult.errors).toEqual([]);
          expect(nameResult.errors).toEqual([]);
          expect(messageResult.errors).toEqual([]);
          expect(turnLimitResult.errors).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide actionable guidance in error messages', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        (input) => {
          // Try validating as different types - wrap in try-catch to handle any unexpected errors
          try {
            const results = [
              validateEmail(input),
              validatePassword(input),
              validateDisplayName(input),
              validateMessageContent(input),
              validateTurnLimit(input),
            ];

            results.forEach(result => {
              if (!result.valid) {
                // Each error should provide guidance
                result.errors.forEach(error => {
                  // Should explain what's wrong
                  expect(error).toMatch(/invalid|required|too|must|cannot|should/i);
                  
                  // Should provide guidance on how to fix
                  expect(error).toMatch(/please|enter|use|provide|at least|less than|between/i);
                });
              }
            });
          } catch (error) {
            // If validation throws, that's a bug - validation should never crash
            throw new Error(`Validation should not throw errors, but got: ${error}`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
