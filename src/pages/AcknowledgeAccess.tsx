import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AcknowledgeAccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [acknowledged, setAcknowledged] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>('the account owner');

  const lockerId = searchParams.get('lockerId');
  const delegateId = searchParams.get('delegateId');

  useEffect(() => {
    const fetchOwnerInfo = async () => {
      if (!lockerId) return;
      
      try {
        const { data: locker } = await supabase
          .from('legacy_locker')
          .select('user_id')
          .eq('id', lockerId)
          .single();

        if (locker) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', locker.user_id)
            .single();

          if (profile) {
            setOwnerName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'the account owner');
          }
        }
      } catch (err) {
        console.error('Error fetching owner info:', err);
      }
    };

    fetchOwnerInfo();
  }, [lockerId]);

  const handleAcknowledge = async () => {
    if (!user || !lockerId || !delegateId) {
      setError('Invalid access link. Please use the link from your email.');
      return;
    }

    if (user.id !== delegateId) {
      setError('You must be logged in with the account that was designated as the Recovery Delegate.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('acknowledge-delegate-access', {
        body: {
          legacyLockerId: lockerId,
          delegateUserId: delegateId
        }
      });

      if (fnError) throw fnError;

      setIsSuccess(true);
      toast({
        title: "Access Granted",
        description: data.message || "You now have full access to the Secure Vault.",
      });

      // Redirect to account page after 3 seconds
      setTimeout(() => {
        navigate('/account');
      }, 3000);

    } catch (err: any) {
      console.error('Error acknowledging access:', err);
      setError(err.message || 'Failed to process acknowledgment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!lockerId || !delegateId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Access Link</h2>
              <p className="text-muted-foreground">
                This link is invalid or has expired. Please use the link from your email.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please log in to your Asset Safe account to acknowledge your access as Recovery Delegate.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto border-green-500">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Access Granted</h2>
              <p className="text-muted-foreground mb-6">
                You now have full access to {ownerName}'s Secure Vault. 
                Redirecting you to the dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-2 border-yellow-400">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-yellow-600" />
              <div>
                <CardTitle className="text-2xl">Recovery Delegate Access</CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Acknowledge your responsibilities for {ownerName}'s account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> The grace period has expired and you have been granted access to this Secure Vault as the designated Recovery Delegate.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">By acknowledging access, you confirm that:</h3>
              
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You now have <strong>full access</strong> to {ownerName}'s Secure Vault (Password Catalog & Legacy Locker)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You are <strong>responsible</strong> for their account, including retrieving files, exporting reports, and account deletion if necessary</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You will handle this sensitive information with <strong>care and discretion</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You understand this access was granted due to your role as <strong>Recovery Delegate</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="acknowledge" className="text-sm cursor-pointer leading-relaxed">
                  <strong>I acknowledge</strong> that I now have full access to {ownerName}'s Secure Vault. 
                  I am responsible for their account — including retrieving files, exporting reports, and account deletion. 
                  I will handle this responsibility with care.
                </label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAcknowledge}
              disabled={!acknowledged || isProcessing}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  I Acknowledge — Grant Me Access
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AcknowledgeAccess;
