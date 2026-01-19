/**
 * PII scrubbing patterns for Sentry events
 * Per CLAUDE.md: VIN, email, phone, free-text notes are sensitive
 */

// VIN pattern: 17 alphanumeric characters (excluding I, O, Q)
const VIN_PATTERN = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;

// Email pattern
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// Phone patterns (US formats)
const PHONE_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 123-456-7890
  /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // (123) 456-7890
  /\b\+1\s?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // +1 123-456-7890
];

// Known sensitive field names (case-insensitive check)
const SENSITIVE_FIELDS = ['vin', 'email', 'phone', 'notes', 'password', 'token'];

/**
 * Scrub PII patterns from a string
 */
export function scrubPII(text: string): string {
  if (typeof text !== 'string') return text;

  let result = text;

  // Scrub VINs
  result = result.replace(VIN_PATTERN, '[VIN_REDACTED]');

  // Scrub emails
  result = result.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]');

  // Scrub phone numbers
  for (const pattern of PHONE_PATTERNS) {
    result = result.replace(pattern, '[PHONE_REDACTED]');
  }

  return result;
}

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some((field) => lowerKey.includes(field));
}

/**
 * Recursively scrub PII from an object
 * Used in Sentry's beforeSend hook
 */
export function scrubObjectPII<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return scrubPII(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObjectPII(item)) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Completely redact known sensitive fields
      if (isSensitiveField(key)) {
        result[key] = `[${key.toUpperCase()}_REDACTED]`;
      } else {
        result[key] = scrubObjectPII(value);
      }
    }
    return result as T;
  }

  return obj;
}
