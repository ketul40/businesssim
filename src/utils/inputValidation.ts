/**
 * Input validation utilities with clear error messages
 * Implements validation as per Requirements 10.5
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates email input
 */
export function validateEmail(email: any): ValidationResult {
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

/**
 * Validates password input
 */
export function validatePassword(password: any): ValidationResult {
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

/**
 * Validates display name input
 */
export function validateDisplayName(name: any): ValidationResult {
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

/**
 * Validates message content input
 */
export function validateMessageContent(content: any): ValidationResult {
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

/**
 * Validates turn limit input
 */
export function validateTurnLimit(turnLimit: any): ValidationResult {
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
