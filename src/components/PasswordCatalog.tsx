import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Eye, EyeOff, Plus, ExternalLink, Lock, Shield } from 'lucide-react';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MasterPasswordModal from './MasterPasswordModal';
import { encryptPassword, decryptPassword, createPasswordVerificationHash, verifyMasterPassword } from '@/utils/encryption';
import { Alert, AlertDescription } from '@/components/ui/alert';

const passwordSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").max(100),
  websiteUrl: z.string().trim().url("Must be a valid URL").max(500),
  password: z.string().trim().min(1, "Password is required").max(500),
  notes: z.string().trim().max(1000).optional(),
});

interface PasswordEntry {
  id: string;
  website_name: string;
  website_url: string;
  password: string;
  notes: string | null;
  created_at: string;
}

const MASTER_PASSWORD_HASH_KEY = 'assetdocs_master_password_hash';

const PasswordCatalog: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [masterPasswordModal, setMasterPasswordModal] = useState<{ isOpen: boolean; isSetup: boolean }>({
    isOpen: false,
    isSetup: false,
  });
  const [sessionMasterPassword, setSessionMasterPassword] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    password: '',
    notes: '',
  });

  const handleUnlockClick = () => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);
    
    if (!storedHash) {
      // First time - need to setup master password
      setMasterPasswordModal({ isOpen: true, isSetup: true });
    } else {
      // Already setup - need to enter password
      setMasterPasswordModal({ isOpen: true, isSetup: false });
    }
  };

  const handleMasterPasswordSubmit = async (password: string) => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);

    if (masterPasswordModal.isSetup) {
      // Setup new master password
      const hash = await createPasswordVerificationHash(password);
      localStorage.setItem(MASTER_PASSWORD_HASH_KEY, hash);
      setSessionMasterPassword(password);
      setIsUnlocked(true);
      setMasterPasswordModal({ isOpen: false, isSetup: false });
      fetchPasswords(password);
      toast({
        title: "Master Password Set",
        description: "Your passwords will now be encrypted with client-side encryption.",
      });
    } else {
      // Verify password
      if (storedHash && await verifyMasterPassword(password, storedHash)) {
        setSessionMasterPassword(password);
        setIsUnlocked(true);
        setMasterPasswordModal({ isOpen: false, isSetup: false });
        fetchPasswords(password);
      } else {
        throw new Error('Incorrect master password');
      }
    }
  };

  const handleMasterPasswordCancel = () => {
    setMasterPasswordModal({ isOpen: false, isSetup: false });
    if (!isUnlocked) {
      toast({
        title: "Access Required",
        description: "You need to unlock your password and accounts catalog to continue.",
        variant: "destructive",
      });
    }
  };

  const fetchPasswords = async (masterPassword: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('password_catalog')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasswords(data || []);
      
      // Pre-decrypt all passwords for display
      const decrypted: { [key: string]: string } = {};
      if (data) {
        for (const entry of data) {
          try {
            decrypted[entry.id] = await decryptPassword(entry.password, masterPassword);
          } catch (error) {
            console.error('Error decrypting password:', error);
            decrypted[entry.id] = '[Decryption Error]';
          }
        }
      }
      setDecryptedPasswords(decrypted);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      toast({
        title: "Error",
        description: "Failed to load passwords",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sessionMasterPassword) return;

    try {
      passwordSchema.parse(formData);

      // Encrypt password on client-side before sending to database
      const encryptedPassword = await encryptPassword(formData.password, sessionMasterPassword);

      const { error } = await supabase
        .from('password_catalog')
        .insert({
          user_id: user.id,
          website_name: formData.websiteName,
          website_url: formData.websiteUrl,
          password: encryptedPassword,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password encrypted and saved securely",
      });

      setFormData({
        websiteName: '',
        websiteUrl: '',
        password: '',
        notes: '',
      });

      if (sessionMasterPassword) {
        fetchPasswords(sessionMasterPassword);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error saving password:', error);
        toast({
          title: "Error",
          description: "Failed to save password",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('password_catalog')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password deleted successfully",
      });

      if (sessionMasterPassword) {
        fetchPasswords(sessionMasterPassword);
      }
    } catch (error) {
      console.error('Error deleting password:', error);
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isUnlocked) {
    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password and Accounts Catalog (Locked)
            </CardTitle>
            <CardDescription>
              Your password and accounts catalog is protected with end-to-end encryption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Password and Accounts Catalog Locked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your master password to access your encrypted passwords
              </p>
              <Button onClick={handleUnlockClick}>
                <Lock className="h-4 w-4 mr-2" />
                Unlock Password and Accounts Catalog
              </Button>
            </div>
          </CardContent>
        </Card>
        <MasterPasswordModal
          isOpen={masterPasswordModal.isOpen}
          isSetup={masterPasswordModal.isSetup}
          onSubmit={handleMasterPasswordSubmit}
          onCancel={handleMasterPasswordCancel}
        />
      </>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Password and Accounts Catalog (Unlocked)
          </CardTitle>
          <CardDescription>
            Securely store and manage your website passwords with client-side encryption
          </CardDescription>
          <Alert className="mt-3">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>🔒 Maximum Security:</strong> Your passwords are encrypted on YOUR device before being sent to our database. 
              Your master password never leaves your device and we cannot decrypt your passwords - 
              this is as secure as dedicated password managers!
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteName">Website Name</Label>
                <Input
                  id="websiteName"
                  value={formData.websiteName}
                  onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                  placeholder="e.g., Gmail, Facebook"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (will be encrypted)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
            <Button type="submit" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Encrypt & Save Password
            </Button>
          </form>

          {/* Password List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Saved Passwords ({passwords.length})</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : passwords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No passwords saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {passwords.map((password) => (
                  <div
                    key={password.id}
                    className="p-4 border rounded-lg bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{password.website_name}</h4>
                        <a
                          href={password.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this password? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(password.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Password</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {!showPasswords[password.id] 
                            ? (decryptedPasswords[password.id] || 'Decrypting...')
                            : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(password.id)}
                        >
                          {!showPasswords[password.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {password.notes && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Notes</Label>
                        <p className="text-sm">{password.notes}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(password.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MasterPasswordModal
        isOpen={masterPasswordModal.isOpen}
        isSetup={masterPasswordModal.isSetup}
        onSubmit={handleMasterPasswordSubmit}
        onCancel={handleMasterPasswordCancel}
      />
    </>
  );
};

export default PasswordCatalog;
