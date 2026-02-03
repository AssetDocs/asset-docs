import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RotateCcw, Shield, User, CreditCard, Upload, Smartphone, Terminal } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  category: 'auth' | 'core' | 'billing' | 'mobile' | 'security';
  critical?: boolean;
}

const checklistItems: ChecklistItem[] = [
  // Authentication
  { id: 'login-email', label: 'Email login works', category: 'auth', critical: true },
  { id: 'login-google', label: 'Google OAuth works', category: 'auth' },
  { id: 'signup-flow', label: 'Signup flow completes', category: 'auth', critical: true },
  { id: 'password-reset', label: 'Password reset email sends', category: 'auth' },
  { id: '2fa-totp', label: '2FA setup/verification works', category: 'auth' },
  
  // Core Features
  { id: 'property-crud', label: 'Property CRUD operations', category: 'core', critical: true },
  { id: 'photo-upload', label: 'Photo upload and storage', category: 'core', critical: true },
  { id: 'video-upload', label: 'Video upload and playback', category: 'core' },
  { id: 'document-upload', label: 'Document upload and view', category: 'core' },
  { id: 'search-works', label: 'Search functionality', category: 'core' },
  { id: 'export-works', label: 'Data export generates', category: 'core' },
  
  // Billing
  { id: 'stripe-checkout', label: 'Stripe checkout completes', category: 'billing', critical: true },
  { id: 'subscription-sync', label: 'Subscription status syncs', category: 'billing', critical: true },
  { id: 'customer-portal', label: 'Customer portal accessible', category: 'billing' },
  { id: 'gift-purchase', label: 'Gift subscription flow', category: 'billing' },
  
  // Mobile
  { id: 'mobile-responsive', label: 'Mobile viewport renders correctly', category: 'mobile', critical: true },
  { id: 'touch-interactions', label: 'Touch interactions work', category: 'mobile' },
  { id: 'mobile-navigation', label: 'Mobile navigation works', category: 'mobile' },
  
  // Security
  { id: 'no-console-errors', label: 'No console errors', category: 'security', critical: true },
  { id: 'rls-active', label: 'RLS policies enforced', category: 'security', critical: true },
  { id: 'no-exposed-secrets', label: 'No exposed API keys', category: 'security', critical: true },
  { id: 'rate-limiting', label: 'Rate limiting active', category: 'security' },
];

const categoryConfig = {
  auth: { label: 'Authentication', icon: User, color: 'text-blue-500' },
  core: { label: 'Core Features', icon: Upload, color: 'text-green-500' },
  billing: { label: 'Billing', icon: CreditCard, color: 'text-amber-500' },
  mobile: { label: 'Mobile', icon: Smartphone, color: 'text-purple-500' },
  security: { label: 'Security', icon: Shield, color: 'text-red-500' },
};

export const TestingChecklistTab: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const resetChecklist = () => {
    setCheckedItems(new Set());
  };

  const totalItems = checklistItems.length;
  const checkedCount = checkedItems.size;
  const criticalItems = checklistItems.filter(item => item.critical);
  const criticalChecked = criticalItems.filter(item => checkedItems.has(item.id)).length;
  const allCriticalPassed = criticalChecked === criticalItems.length;

  const categories = ['auth', 'core', 'billing', 'mobile', 'security'] as const;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Pre-Launch Testing Checklist
          </CardTitle>
          <CardDescription>
            Before anything goes live, run this checklist. This is your flight safety check.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{checkedCount}/{totalItems}</span>
                <span className="text-muted-foreground">items checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={allCriticalPassed ? 'default' : 'destructive'}>
                  {criticalChecked}/{criticalItems.length} critical items
                </Badge>
                {allCriticalPassed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/20">
                    ✓ Ready to ship
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={resetChecklist}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(checkedCount / totalItems) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const config = categoryConfig[category];
          const Icon = config.icon;
          const items = checklistItems.filter(item => item.category === category);
          const categoryChecked = items.filter(item => checkedItems.has(item.id)).length;
          
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    {config.label}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {categoryChecked}/{items.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <Checkbox 
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <span className={`text-sm ${checkedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                        {item.label}
                      </span>
                      {item.critical && (
                        <Badge variant="destructive" className="text-xs py-0">
                          Critical
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Quick Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono bg-muted p-3 rounded-lg">
            <p className="text-muted-foreground"># Check for console errors</p>
            <p>Open DevTools → Console → Filter: Errors</p>
            <p className="text-muted-foreground mt-2"># Test RLS policies</p>
            <p>supabase db lint</p>
            <p className="text-muted-foreground mt-2"># Run Stripe test checkout</p>
            <p>Use card: 4242 4242 4242 4242</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        ⚠️ Checklist state resets on page reload. Complete all items in one session before deploying.
      </p>
    </div>
  );
};
