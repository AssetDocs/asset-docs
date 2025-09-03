/**
 * Secure storage utilities for sensitive data
 * Provides encrypted storage and session management
 */

interface SecureStorageItem {
  value: string;
  expiry?: number;
  encrypted?: boolean;
}

class SecureStorage {
  private static encrypt(text: string): string {
    // Simple base64 encoding for basic obfuscation
    // In production, use proper encryption
    return btoa(text);
  }

  private static decrypt(encodedText: string): string {
    try {
      return atob(encodedText);
    } catch {
      return '';
    }
  }

  static setItem(key: string, value: string, expiryHours?: number): void {
    const item: SecureStorageItem = {
      value: this.encrypt(value),
      encrypted: true,
      expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : undefined
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store item securely:', error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const item: SecureStorageItem = JSON.parse(stored);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.encrypted ? this.decrypt(item.value) : item.value;
    } catch (error) {
      console.warn('Failed to retrieve item securely:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item:', error);
    }
  }

  static clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const item: SecureStorageItem = JSON.parse(stored);
            if (item.expiry && Date.now() > item.expiry) {
              localStorage.removeItem(key);
            }
          } catch {
            // Ignore invalid JSON items
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired items:', error);
    }
  }

  static setTemporaryAccess(key: string, value: string): void {
    // Set access with 1 hour expiry for sensitive operations
    this.setItem(key, value, 1);
  }
}

export default SecureStorage;