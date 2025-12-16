/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation using RFC 5322 simplified regex
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

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
 * URL validation - optional field
 */
export const validateUrl = (url: string): ValidationResult => {
  // Empty is valid since field is optional
  if (!url || url.trim() === '') {
    return { isValid: true };
  }

  try {
    const urlObj = new URL(url);
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must start with http:// or https://' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
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
 * Name validation - ensures minimum quality
 */
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const requiredCheck = validateRequired(name, fieldName);
  if (!requiredCheck.isValid) return requiredCheck;

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
