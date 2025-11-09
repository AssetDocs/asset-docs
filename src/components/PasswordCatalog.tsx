import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Eye, EyeOff, Trash2, Plus, ExternalLink, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';

const passwordSchema = z.object({
  website_name: z.string().trim().min(1, "Website name is required").max(100),
  website_url: z.string().trim().url("Must be a valid URL").max(500),
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

const PasswordCatalog: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    website_name: '',
    website_url: '',
    password: '',
    notes: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('password_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
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
    
    try {
      const validatedData = passwordSchema.parse(formData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('password_catalog')
        .insert([{
          user_id: user.id,
          website_name: validatedData.website_name,
          website_url: validatedData.website_url,
          password: validatedData.password,
          notes: validatedData.notes || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password saved successfully",
      });

      setFormData({ website_name: '', website_url: '', password: '', notes: '' });
      setShowForm(false);
      fetchEntries();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save password",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) return;

    try {
      const { error } = await supabase
        .from('password_catalog')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password deleted",
      });
      fetchEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-6 w-6 mr-2 text-brand-blue" />
          Password Catalog
        </CardTitle>
        <CardDescription>
          Store and manage your website passwords securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Note:</strong> While passwords are encrypted at rest in our database, 
            we recommend using a dedicated password manager for maximum security.
          </AlertDescription>
        </Alert>

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 bg-brand-blue hover:bg-brand-lightBlue"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Password
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="website_name">Website Name</Label>
              <Input
                id="website_name"
                placeholder="e.g., Gmail, Facebook"
                value={formData.website_name}
                onChange={(e) => setFormData({ ...formData, website_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-brand-blue hover:bg-brand-lightBlue">
                Save Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ website_name: '', website_url: '', password: '', notes: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No passwords saved yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{entry.website_name}</h3>
                    <a
                      href={entry.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue hover:text-brand-lightBlue"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {visiblePasswords.has(entry.id) ? entry.password : '••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(entry.id)}
                    >
                      {visiblePasswords.has(entry.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordCatalog;
