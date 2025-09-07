/**
 * Client-side rate limiting utilities
 * Provides protection against brute force attacks and abuse
 */

interface RateLimitEntry {
  attempts: number;
  windowStart: number;
  blocked: boolean;
}

class RateLimiter {
  private static readonly PREFIX = 'ratelimit-';
  
  /**
   * Check if an action is rate limited
   */
  static isRateLimited(
    identifier: string, 
    action: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): boolean {
    const key = `${this.PREFIX}${action}-${identifier}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return false;
      
      const entry: RateLimitEntry = JSON.parse(stored);
      
      // Check if window has expired
      if (now - entry.windowStart > windowMs) {
        localStorage.removeItem(key);
        return false;
      }
      
      return entry.attempts >= maxAttempts;
    } catch {
      return false;
    }
  }
  
  /**
   * Record an attempt and return if action should be blocked
   */
  static recordAttempt(
    identifier: string, 
    action: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): { blocked: boolean; attemptsRemaining: number; resetTime: number } {
    const key = `${this.PREFIX}${action}-${identifier}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    try {
      const stored = localStorage.getItem(key);
      let entry: RateLimitEntry;
      
      if (stored) {
        entry = JSON.parse(stored);
        
        // Reset if window expired
        if (now - entry.windowStart > windowMs) {
          entry = { attempts: 0, windowStart: now, blocked: false };
        }
      } else {
        entry = { attempts: 0, windowStart: now, blocked: false };
      }
      
      entry.attempts++;
      entry.blocked = entry.attempts >= maxAttempts;
      
      localStorage.setItem(key, JSON.stringify(entry));
      
      const resetTime = entry.windowStart + windowMs;
      const attemptsRemaining = Math.max(0, maxAttempts - entry.attempts);
      
      return { 
        blocked: entry.blocked, 
        attemptsRemaining,
        resetTime 
      };
    } catch {
      return { blocked: false, attemptsRemaining: maxAttempts - 1, resetTime: now + windowMs };
    }
  }
  
  /**
   * Clear rate limit for a specific action
   */
  static clearRateLimit(identifier: string, action: string): void {
    const key = `${this.PREFIX}${action}-${identifier}`;
    localStorage.removeItem(key);
  }
  
  /**
   * Get remaining time until rate limit reset
   */
  static getResetTime(identifier: string, action: string, windowMinutes: number = 15): number | null {
    const key = `${this.PREFIX}${action}-${identifier}`;
    const windowMs = windowMinutes * 60 * 1000;
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const entry: RateLimitEntry = JSON.parse(stored);
      const resetTime = entry.windowStart + windowMs;
      
      return resetTime > Date.now() ? resetTime : null;
    } catch {
      return null;
    }
  }
}

export default RateLimiter;