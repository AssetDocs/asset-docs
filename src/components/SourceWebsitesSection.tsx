import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SourceWebsite {
  id: string;
  user_id: string;
  website_name: string;
  website_url: string;
  description: string;
  category?: string;
  created_at: string;
}

const SourceWebsitesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<SourceWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    website_name: '',
    website_url: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadWebsites();
    }
  }, [user]);

  const loadWebsites = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('source_websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error) {
      console.error('Error loading source websites:', error);
      toast({
        title: "Error loading websites",
        description: "Failed to load your source websites.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save source websites.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.website_name || !formData.website_url) {
      toast({
        title: "Missing information",
        description: "Please provide a website name and URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('source_websites')
        .insert({
          user_id: user.id,
          website_name: formData.website_name,
          website_url: formData.website_url,
          description: formData.description,
          category: formData.category || null
        });

      if (error) throw error;

      toast({
        title: "Website saved!",
        description: "Your source website has been added successfully.",
      });

      setFormData({
        website_name: '',
        website_url: '',
        description: '',
        category: ''
      });
      setShowAddForm(false);
      loadWebsites();
    } catch (error) {
      console.error('Error saving source website:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your source website.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source website?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('source_websites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Website deleted",
        description: "Source website has been removed.",
      });

      loadWebsites();
    } catch (error) {
      console.error('Error deleting source website:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the source website.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Globe className="h-6 w-6 mr-2 text-primary" />
                Source Websites
              </CardTitle>
              <CardDescription>
                Catalog websites where you can find important asset information
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? 'Cancel' : 'Add Website'}
            </Button>
          </div>
        </CardHeader>

        {showAddForm && (
          <CardContent className="border-t pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Website Name</label>
                <Input
                  value={formData.website_name}
                  onChange={(e) => setFormData({ ...formData, website_name: e.target.value })}
                  placeholder="e.g., Manufacturer's Product Page"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Website URL</label>
                <Input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com/product"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Appliances, Electronics, Furniture"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What information can be found on this website?"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Website'
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading websites...</p>
        </div>
      ) : websites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No source websites yet</h3>
            <p className="text-muted-foreground mb-4">
              Start cataloging websites where you can find asset information
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((website) => (
            <Card key={website.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{website.website_name}</h3>
                    {website.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {website.category}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(website.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {website.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {website.description}
                  </p>
                )}

                <a
                  href={website.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Website
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceWebsitesSection;