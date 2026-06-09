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
 * @deprecated Removed by Secure Vault hardening (item 3). The localStorage
 * SHA-256 passphrase verifier is no longer written. Unlock proof is now the
 * successful unwrap of the DB-stored wrapped vault key (see src/lib/vaultKey).
 * Kept as exports only to avoid breaking any unforeseen importer at build
 * time; do NOT introduce new callers.
 */
export async function createPasswordVerificationHash(_masterPassword: string): Promise<string> {
  throw new Error('createPasswordVerificationHash is removed — use src/lib/vaultKey unlockOrUpgradeVault instead');
}

/** @deprecated See createPasswordVerificationHash. */
export async function verifyMasterPassword(_masterPassword: string, _storedHash: string): Promise<boolean> {
  throw new Error('verifyMasterPassword is removed — use src/lib/vaultKey unlockOrUpgradeVault instead');
}
