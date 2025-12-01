/**
 * Recovery encryption utilities for Legacy Locker dual-key encryption
 * Supports encryption for both user and recovery delegate
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Generates a random encryption key for the vault
 */
export async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to a base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const exportedKeyBuffer = new Uint8Array(exported);
  return btoa(String.fromCharCode(...exportedKeyBuffer));
}

/**
 * Imports a base64 string back to a CryptoKey
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives an encryption key from a master password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts the vault key with a master password
 * Returns: base64(salt:iv:encryptedKey)
 */
export async function encryptVaultKeyWithPassword(
  vaultKey: CryptoKey,
  masterPassword: string
): Promise<string> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Derive encryption key from master password
  const passwordKey = await deriveKeyFromPassword(masterPassword, salt);
  
  // Export vault key to encrypt it
  const vaultKeyData = await crypto.subtle.exportKey('raw', vaultKey);
  
  // Encrypt the vault key
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    passwordKey,
    vaultKeyData
  );
  
  // Combine salt, IV, and encrypted key
  const encryptedArray = new Uint8Array(encryptedKey);
  const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(encryptedArray, salt.length + iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts the vault key using a master password
 * Input: base64(salt:iv:encryptedKey)
 */
export async function decryptVaultKeyWithPassword(
  encryptedVaultKey: string,
  masterPassword: string
): Promise<CryptoKey> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedVaultKey), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted key
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedKey = combined.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive the same encryption key from password
    const passwordKey = await deriveKeyFromPassword(masterPassword, salt);
    
    // Decrypt the vault key
    const decryptedKeyData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      passwordKey,
      encryptedKey
    );
    
    // Import the decrypted key
    return crypto.subtle.importKey(
      'raw',
      decryptedKeyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new Error('Decryption failed - incorrect master password');
  }
}

/**
 * Encrypts data using the vault key
 */
export async function encryptWithVaultKey(data: string, vaultKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    vaultKey,
    encoder.encode(data)
  );
  
  // Combine IV and encrypted data
  const encryptedArray = new Uint8Array(encryptedData);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using the vault key
 */
export async function decryptWithVaultKey(encryptedData: string, vaultKey: CryptoKey): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      vaultKey,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Decryption failed');
  }
}
