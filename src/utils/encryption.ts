/**
 * Client-side encryption utilities using Web Crypto API
 * Passwords are encrypted on the device before being sent to the database
 * The master password NEVER leaves the user's device
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derives an encryption key from the master password using PBKDF2
 */
async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
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
 * Encrypts a password using AES-GCM
 * Returns: base64(salt:iv:encryptedData)
 */
export async function encryptPassword(password: string, masterPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Derive encryption key from master password
  const key = await deriveKey(masterPassword, salt);
  
  // Encrypt the password
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(password)
  );
  
  // Combine salt, IV, and encrypted data
  const encryptedArray = new Uint8Array(encryptedData);
  const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(encryptedArray, salt.length + iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a password using AES-GCM
 * Input: base64(salt:iv:encryptedData)
 */
export async function decryptPassword(encryptedPassword: string, masterPassword: string): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive the same encryption key
    const key = await deriveKey(masterPassword, salt);
    
    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error('Decryption failed - incorrect master password');
  }
}

/**
 * Creates a verification hash of the master password
 * This is stored in localStorage to verify the master password on subsequent logins
 */
export async function createPasswordVerificationHash(masterPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(masterPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies if the provided master password matches the stored hash
 */
export async function verifyMasterPassword(masterPassword: string, storedHash: string): Promise<boolean> {
  const hash = await createPasswordVerificationHash(masterPassword);
  return hash === storedHash;
}
