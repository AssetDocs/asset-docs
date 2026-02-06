import React, { useState, useEffect } from 'react';
import { Shield, Upload, FolderCheck, Lock, Users, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectionMetrics {
  totalUploads: number;
  categoriesCompleted: number;
  vaultEnabled: boolean;
  trustedUsersAdded: number;
  receiptsStored: number;
}

interface ProtectionScoreProps {
  defaultOpen?: boolean;
}

const ProtectionScore: React.FC<ProtectionScoreProps> = ({ defaultOpen = false }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProtectionMetrics>({
    totalUploads: 0,
    categoriesCompleted: 0,
    vaultEnabled: false,
    trustedUsersAdded: 0,
    receiptsStored: 0,
  });
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!user) return;

    // Only show loading on initial fetch
    if (metrics.totalUploads === 0 && metrics.categoriesCompleted === 0) {
      setIsLoading(true);
    }
    
    try {
      // Fetch upload count (photos + videos + documents)
      const [photosRes, videosRes, docsRes] = await Promise.all([
        supabase.from('property_files').select('id', { count: 'exact' }).eq('user_id', user.id).eq('file_type', 'photo'),
        supabase.from('property_files').select('id', { count: 'exact' }).eq('user_id', user.id).eq('file_type', 'video'),
        supabase.from('property_files').select('id', { count: 'exact' }).eq('user_id', user.id).eq('file_type', 'document'),
      ]);
      const totalUploads = (photosRes.count || 0) + (videosRes.count || 0) + (docsRes.count || 0);

      // Fetch items by category to determine categories completed
      const { data: items } = await supabase
        .from('items')
        .select('category')
        .eq('user_id', user.id);
      const uniqueCategories = new Set((items || []).map(i => i.category).filter(Boolean));
      const categoriesCompleted = uniqueCategories.size;

      // Check if vault is enabled (has TOTP)
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const vaultEnabled = (factors?.totp || []).some(f => f.status === 'verified');

      // Count contributors (trusted users)
      const { count: contributorCount } = await supabase
        .from('contributors')
        .select('id', { count: 'exact' })
        .eq('account_owner_id', user.id)
        .eq('status', 'accepted');

      // Count receipts
      const { count: receiptCount } = await supabase
        .from('receipts')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      setMetrics({
        totalUploads,
        categoriesCompleted,
        vaultEnabled,
        trustedUsersAdded: contributorCount || 0,
        receiptsStored: receiptCount || 0,
      });
    } catch (error) {
      console.error('Error fetching protection metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [user]);

  // Subscribe to real-time changes for auto-refresh
  useEffect(() => {
    if (!user) return;

    // Subscribe to property_files changes
    const filesChannel = supabase
      .channel('protection-score-files')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_files', filter: `user_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    // Subscribe to items changes
    const itemsChannel = supabase
      .channel('protection-score-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    // Subscribe to contributors changes
    const contributorsChannel = supabase
      .channel('protection-score-contributors')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contributors', filter: `account_owner_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    // Subscribe to receipts changes
    const receiptsChannel = supabase
      .channel('protection-score-receipts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'receipts', filter: `user_id=eq.${user.id}` },
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(filesChannel);
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(contributorsChannel);
      supabase.removeChannel(receiptsChannel);
    };
  }, [user]);

  // Calculate protection score (0-100)
  const calculateScore = () => {
    let score = 0;
    const maxScore = 100;

    // Uploads: up to 30 points (1 point per 10 uploads, max at 300)
    score += Math.min(30, Math.floor(metrics.totalUploads / 10));

    // Categories completed: up to 20 points (4 points per category, max 5 categories)
    score += Math.min(20, metrics.categoriesCompleted * 4);

    // Vault enabled: 20 points
    if (metrics.vaultEnabled) score += 20;

    // Trusted users: up to 15 points (5 points per user, max 3)
    score += Math.min(15, metrics.trustedUsersAdded * 5);

    // Receipts: up to 15 points (3 points per 5 receipts, max at 25)
    score += Math.min(15, Math.floor(metrics.receiptsStored / 5) * 3);

    return Math.min(maxScore, score);
  };

  const score = calculateScore();

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const scoreItems = [
    {
      label: 'File Uploads',
      value: metrics.totalUploads,
      target: 300,
      icon: Upload,
      points: Math.min(30, Math.floor(metrics.totalUploads / 10)),
      maxPoints: 30,
      hint: '+1 point per 10 uploads',
    },
    {
      label: 'Categories Documented',
      value: metrics.categoriesCompleted,
      target: 5,
      icon: FolderCheck,
      points: Math.min(20, metrics.categoriesCompleted * 4),
      maxPoints: 20,
      hint: '+4 points per category',
    },
    {
      label: 'Secure Vault (MFA)',
      value: metrics.vaultEnabled ? 1 : 0,
      target: 1,
      icon: Lock,
      points: metrics.vaultEnabled ? 20 : 0,
      maxPoints: 20,
      hint: '+20 points when enabled',
    },
    {
      label: 'Trusted Users Added',
      value: metrics.trustedUsersAdded,
      target: 3,
      icon: Users,
      points: Math.min(15, metrics.trustedUsersAdded * 5),
      maxPoints: 15,
      hint: '+5 points per contact',
    },
    {
      label: 'Receipts Stored',
      value: metrics.receiptsStored,
      target: 25,
      icon: Receipt,
      points: Math.min(15, Math.floor(metrics.receiptsStored / 5) * 3),
      maxPoints: 15,
      hint: '+3 points per 5 receipts',
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-2" />
        <div className="h-2 bg-muted rounded w-full" />
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Protection Score</span>
                  <span className={cn("text-xl font-bold", getScoreColor())}>{score}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {score >= 80 ? 'Excellent protection!' : score >= 50 ? 'Good progress!' : 'Keep documenting!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 hidden sm:block">
                <Progress 
                  value={score} 
                  className="h-2"
                />
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-primary/10">
            <p className="text-xs text-muted-foreground mb-3">
              Earn points by documenting your assets. Higher scores mean better protection!
            </p>
            <div className="space-y-3">
              {scoreItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full",
                    item.points === item.maxPoints ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        item.points === item.maxPoints ? "text-green-600" : "text-muted-foreground"
                      )}>
                        +{item.points}/{item.maxPoints} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Progress 
                        value={(item.points / item.maxPoints) * 100} 
                        className="h-1 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.hint}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ProtectionScore;
