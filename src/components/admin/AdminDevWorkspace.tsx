import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import SystemInfrastructure from './SystemInfrastructure';
import SystemArchitectureFlowcharts from './SystemArchitectureFlowcharts';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  AlertTriangle, 
  Bug,
  Server,
  FileText,
  ClipboardList,
  StickyNote,
  Plus,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';

// Placeholder data - in production this would come from a database
const mockTasks = [
  { id: 1, title: 'Fix RLS policy for storage_usage', status: 'in_progress', priority: 'high', assignee: 'Dev Lead' },
  { id: 2, title: 'Implement passkey authentication', status: 'todo', priority: 'medium', assignee: 'Developer' },
  { id: 3, title: 'Add email verification flow', status: 'done', priority: 'high', assignee: 'QA' },
];

const mockBlockers = [
  { id: 1, title: 'Need pricing decision for gift subscriptions', type: 'owner_question', createdAt: '2025-02-01' },
  { id: 2, title: 'Waiting on Stripe webhook secret update', type: 'dependency', createdAt: '2025-01-30' },
];

const mockDecisions = [
  { id: 1, decision: 'Use TOTP-based 2FA instead of SMS', date: '2025-01-15', approvedBy: 'Owner', reason: 'Cost savings and better security' },
  { id: 2, decision: 'External Supabase over Lovable Cloud', date: '2025-01-10', approvedBy: 'Owner', reason: 'More control over schema and debugging' },
];

const AdminDevWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 md:grid-cols-9 gap-2 h-auto p-1">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <ListTodo className="w-4 h-4" />
          Tasks
        </TabsTrigger>
        <TabsTrigger value="deadlines" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Deadlines
        </TabsTrigger>
        <TabsTrigger value="blockers" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Blockers
        </TabsTrigger>
        <TabsTrigger value="bugs" className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Bugs/QA
        </TabsTrigger>
        <TabsTrigger value="infrastructure" className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          Infra
        </TabsTrigger>
        <TabsTrigger value="docs" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Docs
        </TabsTrigger>
        <TabsTrigger value="decisions" className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Decisions
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          Notes
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sprint Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete admin workspace restructuring with role-based access control
              </p>
              <div className="mt-4">
                <Badge variant="secondary">Sprint 12</Badge>
                <span className="text-sm text-muted-foreground ml-2">Ends Feb 14, 2025</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Priorities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge className="bg-red-500">High</Badge>
                  <span className="text-sm">RLS policy fixes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-amber-500">Medium</Badge>
                  <span className="text-sm">Passkey auth</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Blockers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{mockBlockers.length}</div>
              <p className="text-sm text-muted-foreground">items need attention</p>
              <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setActiveTab('blockers')}>
                View all →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Task View */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTasks.filter(t => t.status === 'in_progress').map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{task.assignee}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tasks Tab */}
      <TabsContent value="tasks" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Task Board</CardTitle>
              <CardDescription>Manage development tasks</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* To Do Column */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Circle className="w-4 h-4" /> To Do
                </h3>
                {mockTasks.filter(t => t.status === 'todo').map(task => (
                  <Card key={task.id} className="p-3">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* In Progress Column */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> In Progress
                </h3>
                {mockTasks.filter(t => t.status === 'in_progress').map(task => (
                  <Card key={task.id} className="p-3 border-blue-200 bg-blue-50/50">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Done Column */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Done
                </h3>
                {mockTasks.filter(t => t.status === 'done').map(task => (
                  <Card key={task.id} className="p-3 border-green-200 bg-green-50/50">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Deadlines Tab */}
      <TabsContent value="deadlines" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Milestone Calendar</CardTitle>
            <CardDescription>Sprint dates and release schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div>
                  <h4 className="font-semibold">Sprint 12 End</h4>
                  <p className="text-sm text-muted-foreground">Admin workspace restructuring</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Feb 14, 2025</p>
                  <Badge variant="outline">12 days left</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">v2.0 Release</h4>
                  <p className="text-sm text-muted-foreground">Major feature release</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Mar 1, 2025</p>
                  <Badge variant="outline">27 days left</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Blockers Tab */}
      <TabsContent value="blockers" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Blockers & Owner Questions</CardTitle>
              <CardDescription>Items that need resolution</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Blocker
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBlockers.map(blocker => (
                <div key={blocker.id} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">{blocker.title}</p>
                      <p className="text-sm text-muted-foreground">Created: {blocker.createdAt}</p>
                    </div>
                  </div>
                  <Badge variant={blocker.type === 'owner_question' ? 'default' : 'secondary'}>
                    {blocker.type === 'owner_question' ? 'Owner Question' : 'Dependency'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bugs/QA Tab */}
      <TabsContent value="bugs" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bug Tracker</CardTitle>
              <CardDescription>Track and manage bugs</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No active bugs reported. Great job! 🎉
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Infrastructure Tab */}
      <TabsContent value="infrastructure" className="space-y-6">
        <SystemInfrastructure />
        <SystemArchitectureFlowcharts />
      </TabsContent>

      {/* Docs Tab */}
      <TabsContent value="docs" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Setup</CardTitle>
              <CardDescription>How to run locally</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# Clone and install
git clone <repo-url>
npm install

# Run locally
npm run dev

# Environment setup
Copy .env.example to .env
Add required keys`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Guide</CardTitle>
              <CardDescription>How to deploy changes</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Push changes to main branch</li>
                <li>Lovable auto-deploys preview</li>
                <li>Test in preview environment</li>
                <li>Click "Publish" in Lovable UI</li>
                <li>Verify in production</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Edge function reference</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              See the supabase/functions directory for edge function implementations.
              Each function has inline documentation.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Decisions Tab */}
      <TabsContent value="decisions" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Decision Log</CardTitle>
              <CardDescription>Technical decisions and rationale</CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Decision
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDecisions.map(decision => (
                <div key={decision.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{decision.decision}</h4>
                    <Badge variant="outline">{decision.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{decision.reason}</p>
                  <p className="text-xs text-muted-foreground">Approved by: {decision.approvedBy}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notes Tab */}
      <TabsContent value="notes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Notes</CardTitle>
            <CardDescription>Meeting notes and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Add a note</label>
              <Textarea placeholder="Write your note here..." className="mt-2" />
              <Button className="mt-2">Save Note</Button>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Recent Notes</h4>
              <p className="text-muted-foreground text-sm">No notes yet. Add your first note above.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminDevWorkspace;
