/**
 * Validation utilities for form inputs
 * Includes input sanitization and max length validation for security
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Max length constants for security (prevent DoS)
export const MAX_LENGTHS = {
  name: 100,
  email: 254, // RFC 5321 limit
  phone: 20,
  businessName: 200,
  website: 253, // Domain name limit
  message: 2000,
} as const;

/**
 * Sanitize input to prevent XSS - strips HTML tags and trims
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate max length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    };
  }
  return { isValid: true };
};

/**
 * Email validation using RFC 5322 simplified regex
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  // Check max length first
  const lengthCheck = validateMaxLength(email, MAX_LENGTHS.email, 'Email');
  if (!lengthCheck.isValid) return lengthCheck;

  // RFC 5322 simplified regex - covers 99% of valid emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Phone validation - supports multiple international formats
 * Accepts: +1234567890, (123) 456-7890, 123-456-7890, etc.
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Check max length first
  const lengthCheck = validateMaxLength(phone, MAX_LENGTHS.phone, 'Phone number');
  if (!lengthCheck.isValid) return lengthCheck;

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Must have 10-15 digits (international range)
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  // Basic format validation - must contain some digits
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

/**
 * Website/domain validation - optional field
 * Accepts formats like: website.com, www.website.com, https://website.com
 */
export const validateUrl = (url: string): ValidationResult => {
  // Empty is valid since field is optional
  if (!url || url.trim() === '') {
    return { isValid: true };
  }

  // Check max length first
  const lengthCheck = validateMaxLength(url, MAX_LENGTHS.website, 'Website');
  if (!lengthCheck.isValid) return lengthCheck;

  const trimmed = url.trim().toLowerCase();

  // Domain pattern: allows optional protocol, optional www, domain.tld format
  const domainRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

  if (!domainRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid website (e.g., yoursite.com)' };
  }

  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Name validation - ensures minimum quality and max length
 */
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const requiredCheck = validateRequired(name, fieldName);
  if (!requiredCheck.isValid) return requiredCheck;

  // Check max length
  const lengthCheck = validateMaxLength(name, MAX_LENGTHS.name, fieldName);
  if (!lengthCheck.isValid) return lengthCheck;

  // Must be at least 2 characters
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(name)) {
    return { isValid: false, error: `${fieldName} must contain letters` };
  }

  return { isValid: true };
};

/**
 * Business name validation - required with max length
 */
export const validateBusinessName = (name: string): ValidationResult => {
  const requiredCheck = validateRequired(name, 'Business name');
  if (!requiredCheck.isValid) return requiredCheck;

  // Check max length
  const lengthCheck = validateMaxLength(name, MAX_LENGTHS.businessName, 'Business name');
  if (!lengthCheck.isValid) return lengthCheck;

  // Must be at least 2 characters
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Business name must be at least 2 characters' };
  }

  return { isValid: true };
};

/**
 * Message validation - optional with max length
 */
export const validateMessage = (message: string): ValidationResult => {
  // Empty is valid since field is optional
  if (!message || message.trim() === '') {
    return { isValid: true };
  }

  // Check max length
  const lengthCheck = validateMaxLength(message, MAX_LENGTHS.message, 'Message');
  if (!lengthCheck.isValid) return lengthCheck;

  return { isValid: true };
};
