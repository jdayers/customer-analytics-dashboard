import { z } from 'zod';

// Zod schema for URL validation
export const urlSchema = z.string()
  .min(1, { message: "Please enter a URL" })
  .refine(
    (url) => {
      // Add protocol if missing
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;

      try {
        const parsed = new URL(urlWithProtocol);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid URL (e.g., example.com or https://example.com)" }
  );

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

export function validateUrl(url: string): ValidationResult {
  // Trim whitespace
  const trimmed = url.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Please enter a URL"
    };
  }

  // Validate with Zod schema
  const result = urlSchema.safeParse(trimmed);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues[0].message
    };
  }

  // Normalize URL (add https:// if missing)
  const normalized = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;

  return {
    isValid: true,
    normalized
  };
}
