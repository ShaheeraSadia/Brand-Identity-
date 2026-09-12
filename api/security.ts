import { Request, Response, NextFunction } from "express";

// Control character & dangerous HTML regexes
const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|iframe|embed|object|base|link|meta|style|form|input|button|svg|math|applet|frameset)[^>]*>/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const JS_PROTOCOL_REGEX = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi;
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g;

// Sliding window IP rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();

// Clean up stale rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    if (now > record.resetAt) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Strips script tags, malicious handlers, and control characters from string values.
 */
export function sanitizeString(val: unknown, maxLength: number = 3000): string {
  if (val === null || val === undefined) return "";
  let str = String(val);

  str = str.replace(CONTROL_CHARS_REGEX, "");
  str = str.replace(DANGEROUS_TAGS_REGEX, "");
  str = str.replace(EVENT_HANDLER_REGEX, "");
  str = str.replace(JS_PROTOCOL_REGEX, "");
  str = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Deeply sanitizes an object against Prototype Pollution and XSS.
 */
export function sanitizePayload<T>(input: T, depth = 5): T {
  if (input === null || typeof input !== "object" || depth <= 0) {
    if (typeof input === "string") {
      return sanitizeString(input) as unknown as T;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizePayload(item, depth - 1)) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(input as Record<string, any>)) {
    // Block Prototype Pollution attempts
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      console.warn(`[Security Alert] Blocked suspicious prototype key "${key}"`);
      continue;
    }
    cleanObj[key] = sanitizePayload((input as Record<string, any>)[key], depth - 1);
  }

  return cleanObj as T;
}

/**
 * Express middleware for setting modern security HTTP headers.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Legacy XSS filter protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Frame protection
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Block unwanted browser device sensors
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

/**
 * Express middleware to trap automated spam bots filling hidden honeypot fields.
 */
export function honeypotTrapMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" && req.body) {
    const hpFields = ["_hp", "hp_website", "hp_username", "honeypot", "hp_token"];
    for (const field of hpFields) {
      if (req.body[field] && String(req.body[field]).trim().length > 0) {
        console.warn(`[Security Trap] Bot honeypot triggered on field "${field}" from IP ${req.ip || "unknown"}`);
        // Return 400 Bad Request to stop automated spam bot
        return res.status(400).json({
          error: "Automated submission detected and blocked by security filter."
        });
      }
    }
  }
  next();
}

/**
 * Server-side IP rate limiting middleware.
 * @param maxRequests Maximum requests allowed per window
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
 */
export function rateLimiterMiddleware(maxRequests = 45, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip static assets or health checks
    if (req.url === "/api/health" || req.url === "/health") {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const record = ipRateLimits.get(ip);

    if (!record || now > record.resetAt) {
      ipRateLimits.set(ip, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "Too many requests from this IP. Please slow down.",
        retryAfterSeconds: retryAfter
      });
    }

    record.count += 1;
    next();
  };
}

/**
 * Middleware that validates and sanitizes all incoming JSON request bodies.
 */
export function sanitizeRequestBodyMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    // Keep raw image base64 data intact if specified in special image fields, but sanitize text fields
    req.body = sanitizePayload(req.body);
  }
  next();
}

/**
 * Sanitizes and wraps user prompts before sending them to Gemini models
 * to mitigate prompt injection and system prompt leak attempts.
 */
export function sanitizePromptForAI(userPrompt: string): string {
  let clean = sanitizeString(userPrompt, 1500);

  // Neutralize common prompt jailbreaks
  clean = clean.replace(/ignore\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/gi, "[REDACTED COMMAND]");
  clean = clean.replace(/reveal\s+(your\s+)?(secret|api\s*key|system\s*instructions)/gi, "[REDACTED COMMAND]");
  clean = clean.replace(/<\|(?:im_start|im_end|endoftext)\|>/gi, "");

  return clean;
}
