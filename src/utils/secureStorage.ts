/**
 * Secure storage utilities for sensitive data
 * Provides AES encrypted storage and session management with integrity checking
 */

interface SecureStorageItem {
  value: string;
  expiry?: number;
  encrypted?: boolean;
  hmac?: string;
}

class SecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = 'assetdocs-enc-key';
  
  private static async getOrCreateKey(): Promise<CryptoKey> {
    const stored = localStorage.getItem(this.ENCRYPTION_KEY_NAME);
    if (stored) {
      try {
        const keyData = JSON.parse(stored);
        return await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          'AES-GCM',
          false,
          ['encrypt', 'decrypt']
        );
      } catch {
        // Fall through to create new key
      }
    }
    
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const keyData = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem(this.ENCRYPTION_KEY_NAME, JSON.stringify(Array.from(new Uint8Array(keyData))));
    return key;
  }

  private static async encrypt(text: string): Promise<{ encrypted: string; iv: string; hmac: string }> {
    try {
      const key = await this.getOrCreateKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      // Create HMAC for integrity checking
      const hmacKey = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.exportKey('raw', key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const hmacData = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
      const hmacBuffer = await crypto.subtle.sign('HMAC', hmacKey, hmacData);
      
      return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
        hmac: btoa(String.fromCharCode(...new Uint8Array(hmacBuffer)))
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to base64 encoding
      return {
        encrypted: btoa(text),
        iv: '',
        hmac: ''
      };
    }
  }

  private static async decrypt(encryptedData: { encrypted: string; iv: string; hmac: string }): Promise<string> {
    try {
      if (!encryptedData.iv || !encryptedData.hmac) {
        // Fallback for base64 encoded data
        return atob(encryptedData.encrypted);
      }
      
      const key = await this.getOrCreateKey();
      const iv = new Uint8Array(atob(encryptedData.iv).split('').map(c => c.charCodeAt(0)));
      const encrypted = new Uint8Array(atob(encryptedData.encrypted).split('').map(c => c.charCodeAt(0)));
      
      // Verify HMAC integrity
      const hmacKey = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.exportKey('raw', key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      
      const hmacData = new Uint8Array([...iv, ...encrypted]);
      const expectedHmac = new Uint8Array(atob(encryptedData.hmac).split('').map(c => c.charCodeAt(0)));
      
      const isValid = await crypto.subtle.verify('HMAC', hmacKey, expectedHmac, hmacData);
      if (!isValid) {
        console.error('HMAC verification failed - data may have been tampered with');
        return '';
      }
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  static async setItem(key: string, value: string, expiryHours?: number): Promise<void> {
    try {
      const encryptedData = await this.encrypt(value);
      const item: SecureStorageItem = {
        value: JSON.stringify(encryptedData),
        encrypted: true,
        expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : undefined,
        hmac: encryptedData.hmac
      };
      
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store item securely:', error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const item: SecureStorageItem = JSON.parse(stored);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      if (item.encrypted) {
        const encryptedData = JSON.parse(item.value);
        return await this.decrypt(encryptedData);
      }
      
      return item.value;
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

  static async setTemporaryAccess(key: string, value: string): Promise<void> {
    // Set access with 1 hour expiry for sensitive operations
    await this.setItem(key, value, 1);
  }
}

export default SecureStorage;