/**
 * Security & Anti-Hacker Utilities
 * 
 * Provides defense-in-depth protection across all forms and API endpoints:
 * 1. XSS & HTML Tag Sanitization
 * 2. Prototype Pollution Defense
 * 3. Bot Honeypot Trap Detection
 * 4. Automated Flood & Rate Limiting Defense
 * 5. Prompt Injection Neutralization
 * 6. Email Header Injection Prevention
 * 7. Safe Storage Integrity Checks
 */

// Common dangerous HTML tags & vector regexes
const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|iframe|embed|object|base|link|meta|style|form|input|button|svg|math|applet|frameset)[^>]*>/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const JS_PROTOCOL_REGEX = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi;
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g;

// Known LLM Prompt Injection & System Override signatures
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+|the\s+)?(previous|prior)\s+(instructions|directives)/i,
  /system\s*prompt\s*:\s*/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|DAN|unrestricted|an\s+AI\s+without\s+rules)/i,
  /reveal\s+(your\s+)?(secret|api\s*key|system\s*instructions|source\s*code)/i,
  /<\|(?:im_start|im_end|endoftext)\|>/i,
  /\[INST\][\s\S]*?\[\/INST\]/i
];

// Common SQL Injection Signatures
const SQL_INJECTION_PATTERNS = [
  /(\bunion\s+all\s+select\b|\bunion\s+select\b)/i,
  /(\bdrop\s+table\b|\btruncate\s+table\b|\balter\s+table\b)/i,
  /(\bexec\s*\(|\bexecute\s*immediate\b)/i,
  /('\s*or\s+'?1'?\s*=\s*'?1'|"\s*or\s+"?1"?\s*=\s*"?1")/i
];

export interface ThreatAnalysis {
  hasThreat: boolean;
  threatTypes: string[];
  sanitized: string;
}

/**
 * Strips dangerous HTML, script vectors, and control characters from text.
 */
export function sanitizeString(raw: unknown, maxLength: number = 2000): string {
  if (raw === null || raw === undefined) return '';
  let str = String(raw);

  // Strip control characters & null bytes
  str = str.replace(CONTROL_CHARS_REGEX, '');

  // Strip dangerous tags completely
  str = str.replace(DANGEROUS_TAGS_REGEX, '');

  // Strip inline event handlers (e.g. onload=, onerror=)
  str = str.replace(EVENT_HANDLER_REGEX, '');

  // Strip pseudo-protocols
  str = str.replace(JS_PROTOCOL_REGEX, '');

  // Replace remaining stray angle brackets with safe entities if needed
  str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Truncate to maximum permissible length to prevent memory exhaustion attacks
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Analyzes an input string for malicious hacker patterns.
 */
export function analyzeInputThreats(input: string, maxLength: number = 2000): ThreatAnalysis {
  const threatTypes: string[] = [];

  if (!input) {
    return { hasThreat: false, threatTypes: [], sanitized: '' };
  }

  // Check for XSS vectors
  if (DANGEROUS_TAGS_REGEX.test(input) || EVENT_HANDLER_REGEX.test(input) || JS_PROTOCOL_REGEX.test(input)) {
    threatTypes.push('XSS / Malicious Script Injection');
  }

  // Check for Prompt Injection
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threatTypes.push('AI Prompt Injection / Override Attempt');
      break;
    }
  }

  // Check for SQL / Database Injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threatTypes.push('Database Query Injection');
      break;
    }
  }

  // Check for buffer overflow payload
  if (input.length > maxLength) {
    threatTypes.push(`Payload Length Exceeded (${input.length} > ${maxLength} chars)`);
  }

  const sanitized = sanitizeString(input, maxLength);

  return {
    hasThreat: threatTypes.length > 0,
    threatTypes,
    sanitized
  };
}

/**
 * Validates email addresses and protects against CRLF / SMTP header injection.
 */
export function validateAndSanitizeEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!email) {
    return { isValid: false, sanitized: '', error: 'Email address is required.' };
  }

  // Check for carriage return / line feed injection attempts
  if (/[\r\n\0%0A%0D]/i.test(email)) {
    return { isValid: false, sanitized: '', error: 'Security alert: Newline characters detected in email field.' };
  }

  const trimmed = email.trim();
  // Standard RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (trimmed.length > 254 || !emailRegex.test(trimmed)) {
    return { isValid: false, sanitized: sanitizeString(trimmed, 254), error: 'Please enter a valid email address.' };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Detects if a hidden honeypot field was filled (typical of automated spam bots / scrapers).
 */
export function isHoneypotTriggered(honeypotValue?: string): boolean {
  if (!honeypotValue) return false;
  return honeypotValue.trim().length > 0;
}

/**
 * Deep-sanitizes an object and guards against Prototype Pollution attacks.
 */
export function sanitizeObject<T>(input: T, maxDepth: number = 4): T {
  if (input === null || typeof input !== 'object' || maxDepth <= 0) {
    if (typeof input === 'string') {
      return sanitizeString(input) as unknown as T;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item, maxDepth - 1)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(input as Record<string, any>)) {
    // Prototype pollution block
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn(`[Security Alert] Prototype pollution key "${key}" blocked and removed.`);
      continue;
    }

    const value = (input as Record<string, any>)[key];
    sanitized[key] = sanitizeObject(value, maxDepth - 1);
  }

  return sanitized as T;
}

/**
 * Client-side submission cooldown & flood prevention limiter.
 */
export class FormRateLimiter {
  private timestamps: number[] = [];
  private readonly maxSubmissions: number;
  private readonly windowMs: number;
  private readonly cooldownMs: number;
  private lastSubmissionTime: number = 0;

  constructor(options: { maxSubmissions?: number; windowMs?: number; cooldownMs?: number } = {}) {
    this.maxSubmissions = options.maxSubmissions ?? 5;
    this.windowMs = options.windowMs ?? 60000; // 1 minute
    this.cooldownMs = options.cooldownMs ?? 2000; // 2 seconds between clicks
  }

  public check(): { allowed: boolean; waitSeconds?: number; reason?: string } {
    const now = Date.now();

    // 1. Check instant double-click / rapid spam cooldown
    const elapsedSinceLast = now - this.lastSubmissionTime;
    if (this.lastSubmissionTime > 0 && elapsedSinceLast < this.cooldownMs) {
      const wait = Math.ceil((this.cooldownMs - elapsedSinceLast) / 1000);
      return {
        allowed: false,
        waitSeconds: wait,
        reason: `Please wait ${wait} second${wait > 1 ? 's' : ''} before submitting again.`
      };
    }

    // 2. Sliding window check
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxSubmissions) {
      const oldest = this.timestamps[0];
      const wait = Math.ceil((this.windowMs - (now - oldest)) / 1000);
      return {
        allowed: false,
        waitSeconds: wait,
        reason: `Rate limit reached. Too many requests. Please wait ${wait} seconds.`
      };
    }

    return { allowed: true };
  }

  public record(): void {
    const now = Date.now();
    this.lastSubmissionTime = now;
    this.timestamps.push(now);
  }
}

/**
 * Secure LocalStorage Wrapper with prototype pollution & corrupted data protection.
 */
export const secureStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      return sanitizeObject(parsed);
    } catch (e) {
      console.warn(`[Security] Failed to safely parse storage key "${key}":`, e);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      const cleanValue = sanitizeObject(value);
      localStorage.setItem(key, JSON.stringify(cleanValue));
      return true;
    } catch (e) {
      console.warn(`[Security] Failed to write storage key "${key}":`, e);
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Security] Failed to remove storage key "${key}":`, e);
    }
  }
};
