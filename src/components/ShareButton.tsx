
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = '' 
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = "https://www.getassetsafe.com/";
    const shareText = "Check out Asset Safe - the best way to document and protect your property and assets!";

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Asset Safe',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share. Please copy the link manually.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button 
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      <Share className="h-4 w-4 mr-2" />
      Share Asset Safe
    </Button>
  );
};

export default ShareButton;
