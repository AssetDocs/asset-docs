import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, ExternalLink, Lock, Shield } from 'lucide-react';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MasterPasswordModal from './MasterPasswordModal';
import { encryptPassword, decryptPassword, createPasswordVerificationHash, verifyMasterPassword } from '@/utils/encryption';
import { Alert, AlertDescription } from '@/components/ui/alert';

const passwordSchema = z.object({
  websiteName: z.string().trim().min(1, "Website name is required").max(100),
  websiteUrl: z.string().trim().min(1, "Website/URL is required").max(500),
  password: z.string().trim().min(1, "Password is required").max(500),
  notes: z.string().trim().max(1000).optional(),
});

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

export const MASTER_PASSWORD_HASH_KEY = 'assetdocs_master_password_hash';

const PasswordCatalog: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [masterPasswordModal, setMasterPasswordModal] = useState<{ isOpen: boolean; isSetup: boolean }>({
    isOpen: false,
    isSetup: false,
  });
  const [sessionMasterPassword, setSessionMasterPassword] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ [key: string]: string }>({});
  const [decryptedAccountNumbers, setDecryptedAccountNumbers] = useState<{ [key: string]: string }>({});
  const [decryptedRoutingNumbers, setDecryptedRoutingNumbers] = useState<{ [key: string]: string }>({});
  const [decryptedAccountNotes, setDecryptedAccountNotes] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteUrl: '',
    password: '',
    notes: '',
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
      fetchAccounts(password);
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
                Enter your master password to access your encrypted passwords and Account Summary
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
                <Label htmlFor="websiteUrl">Website/URL</Label>
                <Input
                  id="websiteUrl"
                  type="text"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="e.g., facebook, google mail, bankofamerica.com"
                  required
                />
              </div>
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
                      <span className="font-mono text-sm">
                        {decryptedPasswords[password.id] || 'Decrypting...'}
                      </span>
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

          {/* Financial Accounts Section */}
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Financial Accounts
            </h3>
            
            {/* Add Financial Account Form */}
            <form onSubmit={handleAccountSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Financial Account
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Input
                    id="accountType"
                    value={accountFormData.accountType}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountType: e.target.value })}
                    placeholder="e.g., Checking, Savings, 401(k), CD, Stocks"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={accountFormData.accountName}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountName: e.target.value })}
                    placeholder="e.g., Primary Savings, Retirement Fund"
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
                  placeholder="e.g., Chase, Fidelity, Vanguard"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={accountFormData.accountNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    placeholder="Enter account number (will be encrypted)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                  <Input
                    id="routingNumber"
                    type="text"
                    value={accountFormData.routingNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, routingNumber: e.target.value })}
                    placeholder="Enter routing number (will be encrypted)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current Balance (Optional)</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  step="0.01"
                  value={accountFormData.currentBalance}
                  onChange={(e) => setAccountFormData({ ...accountFormData, currentBalance: e.target.value })}
                  placeholder="e.g., 10000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNotes">Notes (Optional)</Label>
                <Textarea
                  id="accountNotes"
                  value={accountFormData.notes}
                  onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                  placeholder="Any additional notes (will be encrypted)..."
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Encrypt & Save Account
              </Button>
            </form>

            {/* Saved Financial Accounts List */}
            {loading ? (
              <p className="text-center text-muted-foreground">Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No financial accounts saved yet. Add your first account above.
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 border rounded-lg bg-card space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{account.account_name}</h4>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {account.account_type}
                          </span>
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
                            <AlertDialogDescription>
                              Are you sure you want to delete this financial account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAccount(account.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Account Number</Label>
                        <code className="text-sm font-mono">
                          {decryptedAccountNumbers[account.id] || 'Loading...'}
                        </code>
                      </div>
                      {account.routing_number && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Routing Number</Label>
                          <code className="text-sm font-mono">
                            {decryptedRoutingNumbers[account.id] || 'Loading...'}
                          </code>
                        </div>
                      )}
                    </div>
                    {account.current_balance !== null && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Current Balance</Label>
                        <p className="text-sm font-semibold">
                          ${account.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {account.notes && decryptedAccountNotes[account.id] && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Notes</Label>
                        <p className="text-sm">{decryptedAccountNotes[account.id]}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(account.created_at).toLocaleDateString()}
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
