/**
 * File validation utilities for enhanced security
 * Validates file content, not just extensions
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  mimeType?: string;
  realExtension?: string;
}

export interface FileValidationOptions {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  checkMagicBytes?: boolean;
}

class FileValidator {
  // Magic bytes for common file types
  private static readonly MAGIC_BYTES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]],
    'video/quicktime': [[0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74]],
  };

  private static readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  
  /**
   * Validate a file with comprehensive security checks
   */
  static async validateFile(file: File, options: FileValidationOptions = {}): Promise<FileValidationResult> {
    const errors: string[] = [];
    const maxSize = options.maxFileSize || this.DEFAULT_MAX_SIZE;
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`);
    }
    
    // Check for suspicious filenames
    if (this.hasSuspiciousFilename(file.name)) {
      errors.push('Filename contains suspicious characters or patterns');
    }
    
    // Validate file extension
    const extension = this.getFileExtension(file.name);
    if (options.allowedExtensions && !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
    
    // Check MIME type
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
      errors.push(`MIME type ${file.type} is not allowed`);
    }
    
    // Validate magic bytes if requested
    let realMimeType = file.type;
    if (options.checkMagicBytes !== false) {
      const magicValidation = await this.validateMagicBytes(file);
      if (!magicValidation.isValid) {
        errors.push('File content does not match declared file type');
      } else if (magicValidation.detectedMimeType) {
        realMimeType = magicValidation.detectedMimeType;
      }
    }
    
    // Additional security checks
    if (await this.containsSuspiciousContent(file)) {
      errors.push('File contains potentially malicious content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      mimeType: realMimeType,
      realExtension: this.getExtensionFromMimeType(realMimeType)
    };
  }
  
  /**
   * Validate file magic bytes against declared MIME type
   */
  private static async validateMagicBytes(file: File): Promise<{ isValid: boolean; detectedMimeType?: string }> {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check against known magic bytes
      for (const [mimeType, signatures] of Object.entries(this.MAGIC_BYTES)) {
        for (const signature of signatures) {
          if (this.matchesSignature(bytes, signature)) {
            return {
              isValid: mimeType === file.type,
              detectedMimeType: mimeType
            };
          }
        }
      }
      
      // If no magic bytes match, allow unknown types but flag mismatch
      return { isValid: true };
    } catch {
      return { isValid: false };
    }
  }
  
  /**
   * Check if bytes match a signature
   */
  private static matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) return false;
    }
    
    return true;
  }
  
  /**
   * Check for suspicious filename patterns
   */
  private static hasSuspiciousFilename(filename: string): boolean {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|dmg)$/i,
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved Windows names
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }
  
  /**
   * Check for suspicious content patterns
   */
  private static async containsSuspiciousContent(file: File): Promise<boolean> {
    try {
      // Only check text-based files to avoid false positives
      if (!file.type.startsWith('text/') && !file.type.includes('javascript') && !file.type.includes('html')) {
        return false;
      }
      
      const text = await file.text();
      const suspiciousPatterns = [
        /<script[^>]*>.*<\/script>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /<iframe[^>]*>/i,
        /<object[^>]*>/i,
        /<embed[^>]*>/i,
      ];
      
      return suspiciousPatterns.some(pattern => pattern.test(text));
    } catch {
      return false;
    }
  }
  
  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
  
  /**
   * Get typical extension from MIME type
   */
  private static getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'text/plain': 'txt',
      'application/json': 'json'
    };
    
    return mimeToExt[mimeType] || '';
  }
  
  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default FileValidator;