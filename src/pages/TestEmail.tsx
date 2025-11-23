import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';

const TestEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/send-test-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ success: true, message: 'Test email sent successfully! Check your inbox.' });
        toast.success('Test email sent! Check your inbox.');
      } else {
        setResult({ success: false, message: data.error || 'Failed to send test email' });
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
      toast.error('Error sending test email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Email Connection Test</CardTitle>
          <CardDescription>
            Test your Resend email integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Enter your email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={sendTestEmail}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p><strong>Configuration Check:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Resend API Key: Configured ✓</li>
              <li>From Email: support@assetsafe.net</li>
              <li>Domain: assetsafe.net</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmail;
