
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Save, Loader2, ExternalLink, ChevronDown, ShieldAlert, AlertTriangle, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPreferences {
  email_notifications: boolean;
  security_alerts: boolean;
  marketing_communications: boolean;
  billing_notifications: boolean;
  property_updates: boolean;
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const AlertIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'security':
      return <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />;
    case 'billing':
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
  }
};

const alertBorderColor = (type: string) => {
  switch (type) {
    case 'security': return 'border-l-destructive';
    case 'billing': return 'border-l-amber-500';
    default: return 'border-l-blue-500';
  }
};

const NotificationsTab: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    security_alerts: true,
    marketing_communications: false,
    billing_notifications: true,
    property_updates: true,
  });
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);

  // Load alerts from user_notifications
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setAlerts(data as AlertItem[]);
        const hasUnread = data.some((a: any) => !a.is_read);
        setAlertsOpen(hasUnread);
      }
    };
    loadAlerts();
  }, [user?.id]);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading notification preferences:', error);
          throw error;
        }

        if (data) {
          const loadedPrefs = {
            email_notifications: data.email_notifications,
            security_alerts: data.security_alerts,
            marketing_communications: data.marketing_communications,
            billing_notifications: data.billing_notifications,
            property_updates: data.property_updates,
          };
          setPreferences(loadedPrefs);
          setOriginalPreferences(loadedPrefs);
        } else {
          const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id });
          
          if (insertError) {
            console.error('Error creating default preferences:', insertError);
          }
          setOriginalPreferences(preferences);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Check for changes
  useEffect(() => {
    if (originalPreferences) {
      const changed = 
        preferences.email_notifications !== originalPreferences.email_notifications ||
        preferences.security_alerts !== originalPreferences.security_alerts ||
        preferences.marketing_communications !== originalPreferences.marketing_communications ||
        preferences.billing_notifications !== originalPreferences.billing_notifications ||
        preferences.property_updates !== originalPreferences.property_updates;
      setHasChanges(changed);
    }
  }, [preferences, originalPreferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_notifications: preferences.email_notifications,
          security_alerts: preferences.security_alerts,
          marketing_communications: preferences.marketing_communications,
          billing_notifications: preferences.billing_notifications,
          property_updates: preferences.property_updates,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Sync marketing preference with ActiveCampaign
      if (originalPreferences?.marketing_communications !== preferences.marketing_communications) {
        try {
          const { error: acError } = await supabase.functions.invoke('sync-activecampaign', {
            body: {
              marketingEnabled: preferences.marketing_communications,
            },
          });
          
          if (acError) {
            console.error('ActiveCampaign sync warning:', acError);
          } else {
            console.log('ActiveCampaign sync successful');
          }
        } catch (acError) {
          console.error('ActiveCampaign sync error:', acError);
        }
      }

      setOriginalPreferences(preferences);
      setHasChanges(false);
      
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collapsible Security Alerts Panel */}
      <Card>
        <Collapsible open={alertsOpen} onOpenChange={setAlertsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Security Alerts</CardTitle>
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {alerts.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${alertsOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>Recent security events for your account</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No security alerts — you're all clear!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border border-l-4 ${alertBorderColor(alert.type)} bg-card`}
                    >
                      <AlertIcon type={alert.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          <span className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified about updates and activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive updates about your account via email</p>
                <span className="text-xs text-muted-foreground/70 mt-1 inline-block">Managed by Lovable</span>
              </div>
              <Switch 
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
              />
            </div>
            
            {/* Security Alerts */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-medium">Security Alerts</h3>
                <p className="text-sm text-muted-foreground">Get notified about login attempts and security changes</p>
                <span className="text-xs text-muted-foreground/70 mt-1 inline-block">Managed by Lovable</span>
              </div>
              <Switch 
                checked={preferences.security_alerts}
                onCheckedChange={() => handleToggle('security_alerts')}
              />
            </div>
            
            {/* Marketing Communications */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-medium">Marketing Communications</h3>
                <p className="text-sm text-muted-foreground">Receive newsletters and product updates</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground/70">Synced with ActiveCampaign</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </div>
              <Switch 
                checked={preferences.marketing_communications}
                onCheckedChange={() => handleToggle('marketing_communications')}
              />
            </div>
            
            {/* Billing Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-medium">Billing Notifications</h3>
                <p className="text-sm text-muted-foreground">Get notified about billing and payment issues</p>
                <span className="text-xs text-muted-foreground/70 mt-1 inline-block">Managed by Lovable</span>
              </div>
              <Switch 
                checked={preferences.billing_notifications}
                onCheckedChange={() => handleToggle('billing_notifications')}
              />
            </div>
            
            {/* Property Updates */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-medium">Property Updates</h3>
                <p className="text-sm text-muted-foreground">Get notified when you add, edit, or delete properties</p>
                <span className="text-xs text-muted-foreground/70 mt-1 inline-block">Managed by Lovable</span>
              </div>
              <Switch 
                checked={preferences.property_updates}
                onCheckedChange={() => handleToggle('property_updates')}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSavePreferences} 
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
