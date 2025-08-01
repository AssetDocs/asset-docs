
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShareButton from '@/components/ShareButton';

import { Video, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AccountHeader: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccountNumber = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_number')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.account_number) {
          setAccountNumber(profile.account_number);
        }
      }
    };

    fetchAccountNumber();
  }, []);

  const copyAccountNumber = async () => {
    if (accountNumber) {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({
        title: "Account number copied",
        description: "Your account number has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Account Dashboard</h1>
          <p className="text-gray-600">Manage your properties and asset documentation</p>
          {accountNumber && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-sm font-medium border-brand-blue text-brand-blue px-3 py-1">
                Account #: {accountNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAccountNumber}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-500" />
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="border-green-500 text-green-500 w-full sm:w-auto">
            <Link to="/video-help">
              <Video className="h-4 w-4 mr-2" />
              Video Help
            </Link>
          </Button>
          <ShareButton className="bg-brand-blue hover:bg-brand-lightBlue w-full sm:w-auto" />
        </div>
      </div>

    </>
  );
};

export default AccountHeader;
