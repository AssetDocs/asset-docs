import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FileType } from '@/services/StorageService';

interface UseSignedUrlOptions {
  expiresIn?: number; // seconds, default 1 hour
  enabled?: boolean;
}

interface SignedUrlResult {
  signedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get a signed URL for a private storage file
 * Automatically refreshes the URL before expiry
 */
export function useSignedUrl(
  bucket: FileType | string,
  path: string | null | undefined,
  options: UseSignedUrlOptions = {}
): SignedUrlResult {
  const { expiresIn = 3600, enabled = true } = options;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignedUrl = async () => {
    if (!path || !enabled) {
      setSignedUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (signError) {
        throw signError;
      }

      setSignedUrl(data.signedUrl);
    } catch (err) {
      console.error('Error getting signed URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to get signed URL');
      setSignedUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignedUrl();

    // Auto-refresh URL at 80% of expiry time
    if (enabled && path) {
      const refreshInterval = setInterval(() => {
        fetchSignedUrl();
      }, expiresIn * 800); // 80% of expiry in ms

      return () => clearInterval(refreshInterval);
    }
  }, [bucket, path, expiresIn, enabled]);

  return {
    signedUrl,
    isLoading,
    error,
    refresh: fetchSignedUrl,
  };
}

/**
 * Hook to get signed URLs for multiple files
 */
export function useSignedUrls(
  bucket: FileType | string,
  paths: (string | null | undefined)[],
  options: UseSignedUrlOptions = {}
): {
  signedUrls: Map<string, string>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { expiresIn = 3600, enabled = true } = options;
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validPaths = paths.filter((p): p is string => !!p);

  const fetchSignedUrls = async () => {
    if (validPaths.length === 0 || !enabled) {
      setSignedUrls(new Map());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrls(validPaths, expiresIn);

      if (signError) {
        throw signError;
      }

      const urlMap = new Map<string, string>();
      data?.forEach((item) => {
        if (item.signedUrl && item.path) {
          urlMap.set(item.path, item.signedUrl);
        }
      });

      setSignedUrls(urlMap);
    } catch (err) {
      console.error('Error getting signed URLs:', err);
      setError(err instanceof Error ? err.message : 'Failed to get signed URLs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignedUrls();

    // Auto-refresh URLs at 80% of expiry time
    if (enabled && validPaths.length > 0) {
      const refreshInterval = setInterval(() => {
        fetchSignedUrls();
      }, expiresIn * 800);

      return () => clearInterval(refreshInterval);
    }
  }, [bucket, JSON.stringify(validPaths), expiresIn, enabled]);

  return {
    signedUrls,
    isLoading,
    error,
    refresh: fetchSignedUrls,
  };
}

/**
 * Utility function to get a signed URL (non-hook version for use in services)
 */
export async function getSignedUrl(
  bucket: FileType | string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return null;
  }
}
