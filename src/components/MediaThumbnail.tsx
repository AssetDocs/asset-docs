import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Camera,
  Play,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Loader2
} from 'lucide-react';

interface MediaThumbnailProps {
  filePath?: string;
  bucket?: string;
  fallbackUrl?: string;
  fileName?: string;
  fileType?: string;
  mediaType: 'photo' | 'video' | 'document';
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

const isImageFileType = (type?: string) => {
  const t = type?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(t || '');
};

const getDocumentIcon = (fileType?: string) => {
  const t = fileType?.toLowerCase();
  if (t === 'pdf') return FileText;
  if (isImageFileType(fileType)) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(t || '')) return FileSpreadsheet;
  return File;
};

const ICON_SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-12 w-12' };

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  filePath,
  bucket,
  fallbackUrl,
  fileName,
  fileType,
  mediaType,
  className = '',
  iconSize = 'md'
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const canShowPreview = mediaType === 'photo' || (mediaType === 'document' && isImageFileType(fileType));
  const iconCls = ICON_SIZES[iconSize];

  useEffect(() => {
    if (!canShowPreview || !filePath || !bucket) return;

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setHasError(true);
        } else {
          setSignedUrl(data.signedUrl);
        }
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [filePath, bucket, canShowPreview]);

  const previewUrl = signedUrl || (canShowPreview && !filePath ? fallbackUrl : null);

  // Image preview (photo or image-type document)
  if (canShowPreview && previewUrl && !hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center overflow-hidden ${className}`}>
        {isLoading ? (
          <Loader2 className={`${iconCls} text-muted-foreground animate-spin`} />
        ) : (
          <img
            src={previewUrl}
            alt={fileName || 'Preview'}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    );
  }

  // Loading state for images
  if (canShowPreview && isLoading) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Loader2 className={`${iconCls} text-muted-foreground animate-spin`} />
      </div>
    );
  }

  // Video placeholder
  if (mediaType === 'video') {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Play className={`${iconCls} text-muted-foreground`} />
      </div>
    );
  }

  // Document icon or photo fallback
  const Icon = mediaType === 'document' ? getDocumentIcon(fileType) : Camera;
  return (
    <div className={`bg-muted flex items-center justify-center ${className}`}>
      <Icon className={`${iconCls} text-muted-foreground`} />
    </div>
  );
};

export default MediaThumbnail;
