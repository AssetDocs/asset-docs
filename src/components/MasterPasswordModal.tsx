import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface MasterPasswordModalProps {
  isOpen: boolean;
  isSetup: boolean; // true for first-time setup, false for unlock
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

const MasterPasswordModal: React.FC<MasterPasswordModalProps> = ({
  isOpen,
  isSetup,
  onSubmit,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSetup) {
      if (password.length < 8) {
        setError('Vault passphrase must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passphrases do not match');
        return;
      }
      if (!acknowledgedRisk) {
        setError('Please acknowledge that Asset Safe cannot recover this passphrase');
        return;
      }
    }

    if (!password) {
      setError('Please enter your Secure Vault passphrase');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
      setConfirmPassword('');
      setAcknowledgedRisk(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process passphrase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isSetup ? 'Create your Secure Vault passphrase' : 'Unlock your Secure Vault'}
          </DialogTitle>
          <DialogDescription>
            {isSetup
              ? 'This passphrase adds an extra layer of protection for your most sensitive information. Asset Safe cannot view or recover it.'
              : 'Enter your Secure Vault passphrase to unlock Legacy Locker and Digital Access.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSetup && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Important:</strong> If you forget this passphrase, your encrypted vault data
                cannot be recovered — not by you, not by Asset Safe. Store it somewhere safe.
              </AlertDescription>
            </Alert>
          )}

          {isSetup && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Your passphrase encrypts vault data on YOUR device before it is sent to our database.
                It is never transmitted to or stored by Asset Safe. MFA still protects your account
                login — this is an additional layer just for the Secure Vault.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="masterPassword">
              {isSetup ? 'Create Vault Passphrase' : 'Vault Passphrase'}
            </Label>
            <div className="relative">
              <Input
                id="masterPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetup ? 'Enter a strong passphrase' : 'Enter your vault passphrase'}
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {isSetup && (
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. Use something memorable to you but hard for others to guess.
              </p>
            )}
          </div>

          {isSetup && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Vault Passphrase</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your vault passphrase"
                disabled={isLoading}
              />
            </div>
          )}

          {isSetup && (
            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedRisk}
                onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                className="mt-1"
                disabled={isLoading}
              />
              <span>
                I understand that Asset Safe cannot recover my encrypted vault data if I forget this
                passphrase.
              </span>
            </label>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isSetup ? 'Create & Encrypt Vault' : 'Unlock Vault'}
            </Button>
          </div>
        </form>

        {isSetup && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>💡 Tip:</strong> Store your vault passphrase in a trusted password manager
              (1Password, Bitwarden, etc.) so you never lose access to your encrypted vault.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MasterPasswordModal;
