import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSetup) {
      // Validation for setup
      if (password.length < 8) {
        setError('Master password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (!password) {
      setError('Please enter your master password');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process master password');
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
            {isSetup ? 'Setup Master Password' : 'Enter Master Password'}
          </DialogTitle>
          <DialogDescription>
            {isSetup ? (
              <>
                Create a strong master password to encrypt your passwords. 
                <strong className="block mt-2 text-destructive">⚠️ This password is NEVER stored on our servers and cannot be recovered if forgotten!</strong>
              </>
            ) : (
              'Enter your master password to access your encrypted passwords.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSetup && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Your master password encrypts all passwords on YOUR device before sending to our database. 
                We cannot help you recover it if lost!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="masterPassword">
              {isSetup ? 'Create Master Password' : 'Master Password'}
            </Label>
            <div className="relative">
              <Input
                id="masterPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetup ? 'Enter a strong master password' : 'Enter your master password'}
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
                Minimum 8 characters. Use a strong, unique password.
              </p>
            )}
          </div>

          {isSetup && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Master Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your master password"
                disabled={isLoading}
              />
            </div>
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
              {isLoading ? 'Processing...' : isSetup ? 'Setup & Encrypt' : 'Unlock'}
            </Button>
          </div>
        </form>

        {isSetup && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>💡 Tip:</strong> Store your master password in a secure location. Consider using a password manager 
              like 1Password or Bitwarden to store this master password.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MasterPasswordModal;
