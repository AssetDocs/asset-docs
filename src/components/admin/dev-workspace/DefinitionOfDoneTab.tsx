import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Code, TestTube, FileText, Rocket, Bug, Users } from 'lucide-react';

interface DoDItem {
  label: string;
  description: string;
  icon: React.ElementType;
}

const definitionOfDone: DoDItem[] = [
  {
    label: 'Built',
    description: 'Feature is fully implemented according to requirements. All acceptance criteria met.',
    icon: Code,
  },
  {
    label: 'Tested',
    description: 'Manual testing completed. Edge cases handled. Mobile responsive verified.',
    icon: TestTube,
  },
  {
    label: 'Reviewed',
    description: 'Code reviewed by another team member or AI-assisted review completed.',
    icon: Users,
  },
  {
    label: 'Documented',
    description: 'README or relevant docs updated. Complex logic commented. API changes noted.',
    icon: FileText,
  },
  {
    label: 'No Open Bugs',
    description: 'All related bugs fixed or documented as known issues. No blockers remaining.',
    icon: Bug,
  },
  {
    label: 'Deployed',
    description: 'Successfully deployed to production. Verified working in live environment.',
    icon: Rocket,
  },
];

export const DefinitionOfDoneTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Definition of Done
          </CardTitle>
          <CardDescription>
            Every task must meet these standards before being marked complete. 
            This prevents half-finished work and ensures quality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {definitionOfDone.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{idx + 1}. {item.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Reference Checklist</CardTitle>
          <CardDescription>Copy this when completing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
            <p>## Definition of Done Checklist</p>
            <p>- [ ] Built: Feature complete, acceptance criteria met</p>
            <p>- [ ] Tested: Manual testing done, mobile verified</p>
            <p>- [ ] Reviewed: Code reviewed or AI-assisted check</p>
            <p>- [ ] Documented: Docs/comments updated</p>
            <p>- [ ] No Bugs: All related issues resolved</p>
            <p>- [ ] Deployed: Live and verified working</p>
          </div>
        </CardContent>
      </Card>

      {/* Feature-Specific DoD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature-Specific Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge>UI Features</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Responsive on mobile, tablet, and desktop</li>
                <li>Follows design system tokens (no hardcoded colors)</li>
                <li>Loading states implemented</li>
                <li>Error states handled gracefully</li>
                <li>Accessibility basics (keyboard nav, focus states)</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Database Features</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>RLS policies created and tested</li>
                <li>Indexes added for frequently queried columns</li>
                <li>Migration tested in dev before production</li>
                <li>Types regenerated after schema changes</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Edge Functions</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Error handling with proper status codes</li>
                <li>Secrets configured in Supabase dashboard</li>
                <li>CORS headers set appropriately</li>
                <li>Rate limiting considered</li>
                <li>Logs added for debugging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        ✨ A feature is "done" only when ALL criteria are met. No exceptions.
      </p>
    </div>
  );
};
