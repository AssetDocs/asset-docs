import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  Lock, 
  Database, 
  CreditCard, 
  Globe, 
  Activity, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  whatToVerify: string;
  howToVerify: string;
  passCriteria: string;
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
  isLaunchGate: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const checklistData: ChecklistSection[] = [
  {
    id: 'identity-access',
    title: 'A) Identity & Access (Supabase Auth)',
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        id: 'mfa-admins',
        title: 'Verify MFA is enabled for admins',
        whatToVerify: 'Admin accounts require multi-factor authentication',
        howToVerify: 'Enable MFA in Supabase Auth settings; test login with an admin user',
        passCriteria: 'Admin login prompts for MFA successfully',
        priority: 'P0',
        owner: 'Security Lead',
        isLaunchGate: false
      },
      {
        id: 'password-policy',
        title: 'Confirm strong password policy',
        whatToVerify: 'Password requirements meet minimum strength standards',
        howToVerify: 'Review Supabase password rules (length + complexity)',
        passCriteria: 'Weak passwords are rejected',
        priority: 'P0',
        owner: 'Security Lead',
        isLaunchGate: false
      },
      {
        id: 'email-verification',
        title: 'Test email verification flow',
        whatToVerify: 'Users must verify email before accessing sensitive features',
        howToVerify: 'Sign up with a new email and confirm verification is enforced',
        passCriteria: 'Unverified users cannot fully access the platform',
        priority: 'P0',
        owner: 'QA Lead',
        isLaunchGate: false
      },
      {
        id: 'session-timeout',
        title: 'Check session timeout + logout behavior',
        whatToVerify: 'Sessions expire appropriately and do not remain open indefinitely',
        howToVerify: 'Login, remain inactive, confirm session ends',
        passCriteria: 'Auto logout or token expiration works correctly',
        priority: 'P1',
        owner: 'Security Lead',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'authorization',
    title: 'B) Authorization (Roles & RLS)',
    icon: <Lock className="w-5 h-5" />,
    items: [
      {
        id: 'rls-enabled',
        title: 'Verify RLS is enabled on all sensitive tables',
        whatToVerify: 'Every user/property table has RLS turned ON',
        howToVerify: 'Supabase → Database → Tables → Confirm RLS + policies exist',
        passCriteria: 'No table is left open or policy-free',
        priority: 'P0',
        owner: 'Backend Lead',
        isLaunchGate: true
      },
      {
        id: 'role-access',
        title: 'Test per-role access controls (Viewer/Contributor/Admin)',
        whatToVerify: 'Permissions match role level',
        howToVerify: 'Login as each role and attempt uploads/edits/deletes',
        passCriteria: 'Users only see and modify what they are allowed to',
        priority: 'P0',
        owner: 'QA Lead',
        isLaunchGate: false
      },
      {
        id: 'admin-logging',
        title: 'Confirm admin actions are logged',
        whatToVerify: 'Critical actions create audit records',
        howToVerify: 'Perform admin-level changes and check logging table/logs',
        passCriteria: 'All sensitive actions leave an audit trail',
        priority: 'P1',
        owner: 'Backend Lead',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'file-storage',
    title: 'C) File Storage Security (Supabase Storage)',
    icon: <Database className="w-5 h-5" />,
    items: [
      {
        id: 'private-buckets',
        title: 'Confirm all storage buckets are private',
        whatToVerify: 'No homeowner uploads are publicly accessible',
        howToVerify: 'Supabase Storage → Buckets → Ensure privacy = Private',
        passCriteria: 'Files cannot be accessed without authentication',
        priority: 'P0',
        owner: 'Backend Lead',
        isLaunchGate: true
      },
      {
        id: 'signed-urls',
        title: 'Test signed URL access + expiration',
        whatToVerify: 'Files are served only via signed URLs',
        howToVerify: 'Upload a file → Generate signed URL → Confirm expiration',
        passCriteria: 'URL stops working after expiry',
        priority: 'P0',
        owner: 'QA Lead',
        isLaunchGate: true
      },
      {
        id: 'user-deletion',
        title: 'Verify user deletion rights',
        whatToVerify: 'Users can delete their own content safely',
        howToVerify: 'Upload → Delete → Confirm removal',
        passCriteria: 'File is removed and no orphan access remains',
        priority: 'P1',
        owner: 'QA Lead',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'payments',
    title: 'D) Payments (Stripe)',
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        id: 'stripe-checkout',
        title: 'Confirm Stripe Checkout or Billing Portal is used',
        whatToVerify: 'Asset Safe never stores raw card data',
        howToVerify: 'Review payment flow implementation',
        passCriteria: 'Stripe handles all card entry and storage',
        priority: 'P0',
        owner: 'Backend Lead',
        isLaunchGate: true
      },
      {
        id: 'webhook-security',
        title: 'Verify webhook security',
        whatToVerify: 'Stripe webhooks are validated and secrets protected',
        howToVerify: 'Confirm webhook signing secret is stored server-side only',
        passCriteria: 'No webhook secrets appear in frontend code',
        priority: 'P0',
        owner: 'Security Lead',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'app-security',
    title: 'E) App Security Basics',
    icon: <Globe className="w-5 h-5" />,
    items: [
      {
        id: 'https-enforced',
        title: 'Ensure HTTPS is enforced everywhere',
        whatToVerify: 'No pages load over insecure HTTP',
        howToVerify: 'Visit site, confirm browser lock icon',
        passCriteria: 'HTTPS across all routes',
        priority: 'P0',
        owner: 'DevOps',
        isLaunchGate: true
      },
      {
        id: 'security-headers',
        title: 'Check security headers (CSP, HSTS, etc.)',
        whatToVerify: 'Browser protections are enabled',
        howToVerify: 'Use securityheaders.com or browser dev tools',
        passCriteria: 'Key headers appear correctly',
        priority: 'P1',
        owner: 'DevOps',
        isLaunchGate: false
      },
      {
        id: 'auth-required',
        title: 'Verify auth required on all sensitive pages',
        whatToVerify: 'No sensitive data exposed on public pages',
        howToVerify: 'Attempt to access dashboard routes without login',
        passCriteria: 'Redirected to login page',
        priority: 'P0',
        owner: 'QA Lead',
        isLaunchGate: true
      },
      {
        id: 'vulnerability-scan',
        title: 'Scan for basic vulnerabilities (OWASP ZAP plan)',
        whatToVerify: 'No obvious exposure before launch',
        howToVerify: 'Run OWASP ZAP baseline scan against staging URL',
        passCriteria: 'No critical issues reported',
        priority: 'P1',
        owner: 'Security Lead',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'F) Monitoring & Audit',
    icon: <Activity className="w-5 h-5" />,
    items: [
      {
        id: 'login-logs',
        title: 'Review login + activity logs',
        whatToVerify: 'Authentication + key events are traceable',
        howToVerify: 'Supabase logs → Confirm login history appears',
        passCriteria: 'Logins and errors are visible',
        priority: 'P1',
        owner: 'DevOps',
        isLaunchGate: false
      },
      {
        id: 'alerts-setup',
        title: 'Set up alerts for suspicious activity',
        whatToVerify: 'Failed login spikes or unusual behavior triggers alerts',
        howToVerify: 'Add monitoring (Supabase + uptime tool)',
        passCriteria: 'Alerts trigger during test failures',
        priority: 'P1',
        owner: 'DevOps',
        isLaunchGate: false
      },
      {
        id: 'backup-restore',
        title: 'Test backup + restore process',
        whatToVerify: 'You can recover data if something breaks',
        howToVerify: 'Run Supabase backup test or restore simulation',
        passCriteria: 'Recovery steps are documented and confirmed',
        priority: 'P1',
        owner: 'DevOps',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'privacy-legal',
    title: 'G) Privacy & Legal',
    icon: <FileText className="w-5 h-5" />,
    items: [
      {
        id: 'privacy-terms',
        title: 'Publish Privacy Policy + Terms of Service',
        whatToVerify: 'Required legal pages exist publicly',
        howToVerify: 'Review pages in footer + onboarding',
        passCriteria: 'Policies are accessible and match platform behavior',
        priority: 'P0',
        owner: 'Legal/Product',
        isLaunchGate: true
      },
      {
        id: 'data-deletion',
        title: 'Confirm user data deletion request process',
        whatToVerify: 'Users can request account/data deletion',
        howToVerify: 'Submit deletion request workflow test',
        passCriteria: 'Request can be fulfilled within a reasonable time',
        priority: 'P1',
        owner: 'Product',
        isLaunchGate: false
      }
    ]
  },
  {
    id: 'incident-readiness',
    title: 'H) Incident Readiness',
    icon: <AlertTriangle className="w-5 h-5" />,
    items: [
      {
        id: 'incident-plan',
        title: 'Incident response plan exists (1-page minimum)',
        whatToVerify: 'Team knows what to do if data is compromised',
        howToVerify: 'Document response steps internally',
        passCriteria: 'Plan is written and shared',
        priority: 'P0',
        owner: 'Security Lead',
        isLaunchGate: true
      },
      {
        id: 'breach-notification',
        title: 'Test breach notification workflow (mock scenario)',
        whatToVerify: 'You can respond quickly if needed',
        howToVerify: 'Run a tabletop exercise: "What if files leaked?"',
        passCriteria: 'Contacts + steps are clear',
        priority: 'P1',
        owner: 'Security Lead',
        isLaunchGate: false
      },
      {
        id: 'emergency-contacts',
        title: 'Emergency contact list confirmed',
        whatToVerify: 'Key personnel are reachable',
        howToVerify: 'Maintain internal escalation contacts',
        passCriteria: 'Up-to-date list exists',
        priority: 'P1',
        owner: 'Ops',
        isLaunchGate: false
      }
    ]
  }
];

const SecurityChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('security_checklist_state');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['identity-access']));

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
    localStorage.setItem('security_checklist_state', JSON.stringify([...newChecked]));
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const totalItems = checklistData.reduce((acc, section) => acc + section.items.length, 0);
  const checkedCount = checkedItems.size;
  const progress = Math.round((checkedCount / totalItems) * 100);

  const launchGateItems = checklistData.flatMap(section => 
    section.items.filter(item => item.isLaunchGate)
  );
  const launchGateComplete = launchGateItems.every(item => checkedItems.has(item.id));
  const launchGateProgress = Math.round(
    (launchGateItems.filter(item => checkedItems.has(item.id)).length / launchGateItems.length) * 100
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200';
      case 'P1': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'P2': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-2xl font-bold">{progress}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{checkedCount} of {totalItems} items complete</p>
          </CardContent>
        </Card>

        <Card className={cn(launchGateComplete ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {launchGateComplete ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Launch Gate Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={launchGateProgress} className="flex-1" />
              <span className="text-2xl font-bold">{launchGateProgress}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {launchGateItems.filter(item => checkedItems.has(item.id)).length} of {launchGateItems.length} required items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Launch?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              launchGateComplete ? "text-green-600" : "text-amber-600"
            )}>
              {launchGateComplete ? "✅ YES" : "⏳ NOT YET"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {launchGateComplete ? "All launch requirements met" : "Complete required items first"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Launch Gate Summary */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Launch Gate Requirements
          </CardTitle>
          <CardDescription>These items MUST be completed before going live</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {launchGateItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {checkedItems.has(item.id) ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={cn(
                  "text-sm",
                  checkedItems.has(item.id) && "line-through text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {checklistData.map(section => {
          const sectionChecked = section.items.filter(item => checkedItems.has(item.id)).length;
          const sectionTotal = section.items.length;
          const isExpanded = expandedSections.has(section.id);

          return (
            <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {section.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>{sectionChecked} of {sectionTotal} complete</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(sectionChecked / sectionTotal) * 100} className="w-24" />
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {section.items.map(item => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "p-4 rounded-lg border transition-colors",
                            checkedItems.has(item.id) ? "bg-green-50 border-green-200" : "bg-card border-border"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={item.id}
                              checked={checkedItems.has(item.id)}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label 
                                  htmlFor={item.id} 
                                  className={cn(
                                    "font-medium cursor-pointer",
                                    checkedItems.has(item.id) && "line-through text-muted-foreground"
                                  )}
                                >
                                  {item.title}
                                </label>
                                <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                  {item.priority}
                                </Badge>
                                {item.isLaunchGate && (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                    Launch Gate
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {item.owner}
                                </Badge>
                              </div>
                              <div className="text-sm space-y-1 text-muted-foreground">
                                <p><strong>What to verify:</strong> {item.whatToVerify}</p>
                                <p><strong>How to verify:</strong> {item.howToVerify}</p>
                                <p><strong>Pass criteria:</strong> {item.passCriteria}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityChecklist;
