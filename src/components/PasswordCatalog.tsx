import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, ExternalLink, Lock, Shield, Pencil, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MasterPasswordModal from './MasterPasswordModal';
import { encryptPassword, decryptPassword, createPasswordVerificationHash, verifyMasterPassword } from '@/utils/encryption';
import { Alert, AlertDescription } from '@/components/ui/alert';

const passwordSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").max(100),
  websiteUrl: z.string().trim().max(500).optional(),
  username: z.string().trim().max(200).optional(),
  password: z.string().trim().min(1, "Password is required").max(500),
  notes: z.string().trim().max(1000).optional(),
});

const normalizeUrl = (url: string) => {
  if (!url) return '';
  if (url.match(/^https?:\/\//i)) return url;
  return `https://${url}`;
};

const accountSchema = z.object({
  accountType: z.string().trim().min(1, "Account type is required").max(100),
  accountName: z.string().trim().min(1, "Account name is required").max(100),
  institutionName: z.string().trim().min(1, "Institution name is required").max(100),
  accountNumber: z.string().trim().min(1, "Account number is required").max(100),
  routingNumber: z.string().trim().max(100).optional(),
  currentBalance: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface PasswordEntry {
  id: string;
  website_name: string;
  website_url: string;
  username: string | null;
  password: string;
  notes: string | null;
  created_at: string;
}

interface FinancialAccount {
  id: string;
  account_type: string;
  account_name: string;
  institution_name: string;
  account_number: string;
  routing_number: string | null;
  current_balance: number | null;
  notes: string | null;
  created_at: string;
}

export const MASTER_PASSWORD_HASH_KEY = 'assetsafe_master_password_hash';

interface PasswordCatalogProps {
  isUnlockedFromParent?: boolean;
  sessionMasterPasswordFromParent?: string | null;
}

const PasswordCatalog: React.FC<PasswordCatalogProps> = ({ 
  isUnlockedFromParent, 
  sessionMasterPasswordFromParent 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [masterPasswordModal, setMasterPasswordModal] = useState<{ isOpen: boolean; isSetup: boolean }>({
    isOpen: false,
    isSetup: false,
  });
  
  // Use parent state if provided, otherwise manage locally
  const [localSessionMasterPassword, setLocalSessionMasterPassword] = useState<string | null>(null);
  const [localIsUnlocked, setLocalIsUnlocked] = useState(false);
  
  const sessionMasterPassword = sessionMasterPasswordFromParent ?? localSessionMasterPassword;
  const isUnlocked = isUnlockedFromParent ?? localIsUnlocked;
  const isControlledByParent = isUnlockedFromParent !== undefined;
  
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ [key: string]: string }>({});
  const [decryptedAccountNumbers, setDecryptedAccountNumbers] = useState<{ [key: string]: string }>({});
  const [decryptedRoutingNumbers, setDecryptedRoutingNumbers] = useState<{ [key: string]: string }>({});
  const [decryptedAccountNotes, setDecryptedAccountNotes] = useState<{ [key: string]: string }>({});
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ websiteName: '', websiteUrl: '', username: '', password: '', notes: '' });
  
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    username: '',
    password: '',
    notes: '',
    accountTypeDisplay: '',
  });

  const [accountFormData, setAccountFormData] = useState({
    accountType: '',
    accountName: '',
    institutionName: '',
    accountNumber: '',
    routingNumber: '',
    currentBalance: '',
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

  // Fetch data when unlocked from parent
  useEffect(() => {
    if (isControlledByParent && isUnlocked && sessionMasterPassword) {
      fetchPasswords(sessionMasterPassword);
      fetchAccounts(sessionMasterPassword);
    }
  }, [isControlledByParent, isUnlocked, sessionMasterPassword]);

  const handleMasterPasswordSubmit = async (password: string) => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);

    if (masterPasswordModal.isSetup) {
      // Setup new master password
      const hash = await createPasswordVerificationHash(password);
      localStorage.setItem(MASTER_PASSWORD_HASH_KEY, hash);
      setLocalSessionMasterPassword(password);
      setLocalIsUnlocked(true);
      setMasterPasswordModal({ isOpen: false, isSetup: false });
      fetchPasswords(password);
      fetchAccounts(password);
      toast({
        title: "Master Password Set",
        description: "Your passwords will now be encrypted with client-side encryption.",
      });
    } else {
      // Verify password
      if (storedHash && await verifyMasterPassword(password, storedHash)) {
        setLocalSessionMasterPassword(password);
        setLocalIsUnlocked(true);
        setMasterPasswordModal({ isOpen: false, isSetup: false });
        fetchPasswords(password);
        fetchAccounts(password);
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

  const fetchAccounts = async (masterPassword: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_accounts' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts((data as any) || []);
      
      // Pre-decrypt all sensitive data for display
      const decryptedAcctNums: { [key: string]: string } = {};
      const decryptedRouting: { [key: string]: string } = {};
      const decryptedNotes: { [key: string]: string } = {};
      
      if (data) {
        for (const entry of data) {
          try {
            const entryAny = entry as any;
            decryptedAcctNums[entryAny.id] = await decryptPassword(entryAny.account_number, masterPassword);
            if (entryAny.routing_number) {
              decryptedRouting[entryAny.id] = await decryptPassword(entryAny.routing_number, masterPassword);
            }
            if (entryAny.notes) {
              decryptedNotes[entryAny.id] = await decryptPassword(entryAny.notes, masterPassword);
            }
          } catch (error) {
            console.error('Error decrypting account data:', error);
            decryptedAcctNums[(entry as any).id] = '[Decryption Error]';
          }
        }
      }
      setDecryptedAccountNumbers(decryptedAcctNums);
      setDecryptedRoutingNumbers(decryptedRouting);
      setDecryptedAccountNotes(decryptedNotes);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load financial accounts",
        variant: "destructive",
      });
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
          website_url: formData.websiteUrl || null,
          username: formData.username || null,
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
        username: '',
        accountTypeDisplay: '',
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

  const startEdit = (password: PasswordEntry) => {
    setEditingId(password.id);
    setEditData({
      websiteName: password.website_name,
      websiteUrl: password.website_url || '',
      username: password.username || '',
      password: decryptedPasswords[password.id] || '',
      notes: password.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ websiteName: '', websiteUrl: '', username: '', password: '', notes: '' });
  };

  const handleEditSave = async (id: string) => {
    if (!user || !sessionMasterPassword) return;
    if (!editData.websiteName.trim() || !editData.password.trim()) {
      toast({ title: "Validation Error", description: "Website name and password are required.", variant: "destructive" });
      return;
    }
    try {
      const encryptedPassword = await encryptPassword(editData.password, sessionMasterPassword);
      const { error } = await supabase
        .from('password_catalog')
        .update({
          website_name: editData.websiteName.trim(),
          website_url: editData.websiteUrl.trim() || null,
          username: editData.username.trim() || null,
          password: encryptedPassword,
          notes: editData.notes.trim() || null,
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Password updated successfully" });
      setEditingId(null);
      fetchPasswords(sessionMasterPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      toast({ title: "Error", description: "Failed to update password", variant: "destructive" });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sessionMasterPassword) return;

    try {
      accountSchema.parse(accountFormData);

      // Encrypt sensitive data on client-side before sending to database
      const encryptedAccountNumber = await encryptPassword(accountFormData.accountNumber, sessionMasterPassword);
      const encryptedRoutingNumber = accountFormData.routingNumber 
        ? await encryptPassword(accountFormData.routingNumber, sessionMasterPassword)
        : null;
      const encryptedNotes = accountFormData.notes 
        ? await encryptPassword(accountFormData.notes, sessionMasterPassword)
        : null;

      const { error } = await supabase
        .from('financial_accounts' as any)
        .insert({
          user_id: user.id,
          account_type: accountFormData.accountType,
          account_name: accountFormData.accountName,
          institution_name: accountFormData.institutionName,
          account_number: encryptedAccountNumber,
          routing_number: encryptedRoutingNumber,
          current_balance: accountFormData.currentBalance ? parseFloat(accountFormData.currentBalance) : null,
          notes: encryptedNotes,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial account encrypted and saved securely",
      });

      setAccountFormData({
        accountType: '',
        accountName: '',
        institutionName: '',
        accountNumber: '',
        routingNumber: '',
        currentBalance: '',
        notes: '',
      });

      if (sessionMasterPassword) {
        fetchAccounts(sessionMasterPassword);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error saving account:', error);
        toast({
          title: "Error",
          description: "Failed to save financial account",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_accounts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial account deleted successfully",
      });

      if (sessionMasterPassword) {
        fetchAccounts(sessionMasterPassword);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete financial account",
        variant: "destructive",
      });
    }
  };


  // If controlled by parent but not unlocked yet, show nothing (parent handles unlock UI)
  if (isControlledByParent && !isUnlocked) {
    return null;
  }

  // Standalone mode - show locked state
  if (!isControlledByParent && !isUnlocked) {
    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Digital Access (Locked)
            </CardTitle>
            <CardDescription>
              Your Digital Access vault is protected with end-to-end encryption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Digital Access Locked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your master password to access your encrypted digital accounts
              </p>
              <Button onClick={handleUnlockClick}>
                <Lock className="h-4 w-4 mr-2" />
                Unlock Digital Access
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

  // When controlled by parent, render content directly without extra card wrapper
  if (isControlledByParent) {
    return (
      <div className="space-y-6">
        {/* Section intro */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Store access details for everyday digital accounts. Best for websites, subscriptions, utilities, and personal services.
          </p>
          <p className="text-xs text-muted-foreground">
            For banks and investment accounts, we recommend documenting the institution and next steps in the Legacy Locker instead of storing passwords.{' '}
            <button
              type="button"
              className="text-primary underline underline-offset-2 hover:no-underline text-xs"
              onClick={() => {
                // Navigate to legacy locker — handled by parent context if needed
                const event = new CustomEvent('navigate-to-legacy-locker');
                window.dispatchEvent(event);
              }}
            >
              → Open Legacy Locker
            </button>
          </p>
        </div>
        {/* Add Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Digital Account
          </h4>
          {/* Account Type */}
          <div className="space-y-2">
            <Label>Account Type (Optional)</Label>
            <Select
              value={formData.accountTypeDisplay || ''}
              onValueChange={(val) => setFormData({ ...formData, accountTypeDisplay: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Website / Subscription (default)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website-subscription">Website / Subscription</SelectItem>
                <SelectItem value="subscriptions-streaming">Subscriptions & Streaming</SelectItem>
                <SelectItem value="utilities-home">Utilities & Home Services</SelectItem>
                <SelectItem value="personal-services">Personal Services & Memberships</SelectItem>
                <SelectItem value="other-digital">Other Digital Accounts</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              <Label htmlFor="websiteUrl">Website/URL (Optional)</Label>
              <Input
                id="websiteUrl"
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="e.g., facebook.com, gmail.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username / ID / Email (Optional)</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g., john@email.com, johndoe123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
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
            placeholder="Security questions, hints, or anything helpful"
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
            <Lock className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
          <p className="text-xs text-muted-foreground text-center">Designed for everyday digital access — not regulated financial systems.</p>
        </form>

        {/* Password List */}
        <div className="space-y-2">
          <h4 className="font-semibold">Saved Entries ({passwords.length})</h4>
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
                <div key={password.id} className="p-4 border rounded-lg bg-card space-y-2">
                  {editingId === password.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Website Name</Label>
                          <Input value={editData.websiteName} onChange={(e) => setEditData({ ...editData, websiteName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Website/URL (Optional)</Label>
                          <Input value={editData.websiteUrl} onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })} placeholder="e.g., gmail.com" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Username / ID / Email (Optional)</Label>
                        <Input value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} placeholder="e.g., john@email.com" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Password</Label>
                        <Input value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Notes (Optional)</Label>
                        <Input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditSave(password.id)}><Check className="h-4 w-4 mr-1" />Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4 mr-1" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{password.website_name}</h4>
                          {password.website_url && (
                            <a href={normalizeUrl(password.website_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(password)} className="text-muted-foreground hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Password</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete this password? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(password.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {password.username && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Username / ID / Email</Label>
                          <span className="text-sm block">{password.username}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Password</Label>
                        <span className="font-mono text-sm block">{decryptedPasswords[password.id] || 'Decrypting...'}</span>
                      </div>
                      {password.notes && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <p className="text-sm">{password.notes}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Added: {new Date(password.created_at).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Accounts Section */}
        <div className="space-y-4 mt-8 pt-6 border-t">
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Financial Accounts Reference
            </h4>
            <p className="text-sm text-muted-foreground mt-1">A secure reference to important financial accounts and where to find full details.</p>
          </div>
          
          <form onSubmit={handleAccountSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Financial Account
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Input
                  id="accountType"
                  value={accountFormData.accountType}
                  onChange={(e) => setAccountFormData({ ...accountFormData, accountType: e.target.value })}
                  placeholder="e.g., Checking, Savings, 401(k)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={accountFormData.accountName}
                  onChange={(e) => setAccountFormData({ ...accountFormData, accountName: e.target.value })}
                  placeholder="e.g., Primary Savings"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={accountFormData.institutionName}
                onChange={(e) => setAccountFormData({ ...accountFormData, institutionName: e.target.value })}
                placeholder="e.g., Chase, Fidelity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNotes">Notes (Optional)</Label>
              <Textarea
                id="accountNotes"
                value={accountFormData.notes}
                onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                placeholder="Instructions, contact details, or where to find full statements"
                rows={2}
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
              <Lock className="h-4 w-4 mr-2" />
              Save Account
            </Button>
          </form>

          {/* Saved Financial Accounts */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No financial accounts saved yet.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="p-4 border rounded-lg bg-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{account.account_name}</h4>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{account.account_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{account.institution_name}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Financial Account</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAccount(account.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {account.notes && decryptedAccountNotes[account.id] && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <p className="text-sm">{decryptedAccountNotes[account.id]}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Added: {new Date(account.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standalone mode with Card wrapper
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Password and Accounts Catalog (Unlocked) — Digital Access
          </CardTitle>
          <CardDescription>
              Store access details for everyday digital accounts. Best for websites, subscriptions, utilities, and personal services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section intro */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                For banks and investment accounts, we recommend documenting the institution and next steps in the Legacy Locker instead of storing passwords.
              </p>
            </div>
          {/* Add Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Digital Account
            </h3>
            {/* Account Type */}
            <div className="space-y-2">
              <Label>Account Type (Optional)</Label>
              <Select
                value={formData.accountTypeDisplay || ''}
                onValueChange={(val) => setFormData({ ...formData, accountTypeDisplay: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Website / Subscription (default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website-subscription">Website / Subscription</SelectItem>
                  <SelectItem value="subscriptions-streaming">Subscriptions & Streaming</SelectItem>
                  <SelectItem value="utilities-home">Utilities & Home Services</SelectItem>
                  <SelectItem value="personal-services">Personal Services & Memberships</SelectItem>
                  <SelectItem value="other-digital">Other Digital Accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteNameStandalone">Website Name</Label>
                <Input
                  id="websiteNameStandalone"
                  value={formData.websiteName}
                  onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                  placeholder="e.g., Gmail, Facebook"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrlStandalone">Website/URL (Optional)</Label>
                <Input
                  id="websiteUrlStandalone"
                  type="text"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="e.g., facebook.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usernameStandalone">Username / ID / Email (Optional)</Label>
              <Input
                id="usernameStandalone"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g., john@email.com, johndoe123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordStandalone">Password</Label>
              <Input
                id="passwordStandalone"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (will be encrypted)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notesStandalone">Notes (Optional)</Label>
              <Textarea
                id="notesStandalone"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Security questions, hints, or anything helpful"
                rows={2}
              />
            </div>
            <Button type="submit" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Encrypt & Save Entry
            </Button>
            <p className="text-xs text-muted-foreground text-center">Designed for everyday digital access — not regulated financial systems.</p>
          </form>

          {/* Password List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Saved Entries ({passwords.length})</h3>
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
                  <div key={password.id} className="p-4 border rounded-lg bg-card space-y-2">
                    {editingId === password.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Website Name</Label>
                            <Input value={editData.websiteName} onChange={(e) => setEditData({ ...editData, websiteName: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Website/URL (Optional)</Label>
                            <Input value={editData.websiteUrl} onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })} placeholder="e.g., gmail.com" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Username / ID / Email (Optional)</Label>
                          <Input value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} placeholder="e.g., john@email.com" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Password</Label>
                          <Input value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Notes (Optional)</Label>
                          <Input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditSave(password.id)}><Check className="h-4 w-4 mr-1" />Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4 mr-1" />Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{password.website_name}</h4>
                            {password.website_url && (
                              <a href={normalizeUrl(password.website_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startEdit(password)} className="text-muted-foreground hover:text-foreground">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Password</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(password.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        {password.username && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Username / ID / Email</Label>
                            <span className="text-sm">{password.username}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Password</Label>
                          <span className="font-mono text-sm">{decryptedPasswords[password.id] || 'Decrypting...'}</span>
                        </div>
                        {password.notes && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <p className="text-sm">{password.notes}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">Added: {new Date(password.created_at).toLocaleDateString()}</p>
                      </>
                    )}
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
