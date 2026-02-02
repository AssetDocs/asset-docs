import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SystemInfrastructure from './SystemInfrastructure';
import SystemArchitectureFlowcharts from './SystemArchitectureFlowcharts';
import { useDevWorkspace } from '@/hooks/useDevWorkspace';
import { AddTaskModal } from './dev-workspace/AddTaskModal';
import { AddBugModal } from './dev-workspace/AddBugModal';
import { AddBlockerModal } from './dev-workspace/AddBlockerModal';
import { AddDecisionModal } from './dev-workspace/AddDecisionModal';
import { AddMilestoneModal } from './dev-workspace/AddMilestoneModal';
import { AddNoteModal } from './dev-workspace/AddNoteModal';
import { TaskCard } from './dev-workspace/TaskCard';
import { BugCard } from './dev-workspace/BugCard';
import { format, differenceInDays } from 'date-fns';
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
  Clock,
  Trash2,
  CheckCheck
} from 'lucide-react';

const AdminDevWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const {
    loading,
    tasks,
    bugs,
    notes,
    blockers,
    decisions,
    milestones,
    createTask,
    updateTask,
    deleteTask,
    createBug,
    updateBug,
    deleteBug,
    createNote,
    deleteNote,
    createBlocker,
    resolveBlocker,
    deleteBlocker,
    createDecision,
    deleteDecision,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  } = useDevWorkspace();

  const openBlockers = blockers.filter(b => b.status === 'open');
  const activeTasks = tasks.filter(t => t.status === 'in_progress');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <>
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
                <CardTitle className="text-lg">Tasks Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To Do</span>
                    <span className="font-semibold">{tasks.filter(t => t.status === 'todo').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-blue-500">{activeTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Done</span>
                    <span className="font-semibold text-green-500">{tasks.filter(t => t.status === 'done').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Open Bugs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {bugs.filter(b => b.status === 'open' || b.status === 'investigating').length}
                </div>
                <p className="text-sm text-muted-foreground">bugs to address</p>
                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setActiveTab('bugs')}>
                  View all →
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Blockers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{openBlockers.length}</div>
                <p className="text-sm text-muted-foreground">items need attention</p>
                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setActiveTab('blockers')}>
                  View all →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>Tasks currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks in progress</p>
              ) : (
                <div className="space-y-3">
                  {activeTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{task.title}</span>
                      </div>
                      <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Circle className="w-4 h-4" /> To Do ({tasks.filter(t => t.status === 'todo').length})
                  </h3>
                  {tasks.filter(t => t.status === 'todo').map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={(id, status) => updateTask(id, { status })}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>

                {/* In Progress Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> In Progress ({tasks.filter(t => t.status === 'in_progress').length})
                  </h3>
                  {tasks.filter(t => t.status === 'in_progress').map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={(id, status) => updateTask(id, { status })}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>

                {/* Done Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Done ({tasks.filter(t => t.status === 'done').length})
                  </h3>
                  {tasks.filter(t => t.status === 'done').map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={(id, status) => updateTask(id, { status })}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestones & Deadlines</CardTitle>
                <CardDescription>Sprint dates and release schedule</CardDescription>
              </div>
              <Button onClick={() => setShowMilestoneModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No milestones set. Add your first milestone!</p>
              ) : (
                <div className="space-y-4">
                  {milestones.map(milestone => {
                    const daysLeft = milestone.due_date ? differenceInDays(new Date(milestone.due_date), new Date()) : null;
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                    
                    return (
                      <div 
                        key={milestone.id} 
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isOverdue ? 'bg-red-50 border-red-200 dark:bg-red-950/20' :
                          isUrgent ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            {milestone.due_date && (
                              <>
                                <p className="font-semibold">{format(new Date(milestone.due_date), 'MMM d, yyyy')}</p>
                                <Badge variant={isOverdue ? 'destructive' : 'outline'}>
                                  {isOverdue ? `${Math.abs(daysLeft!)} days overdue` : `${daysLeft} days left`}
                                </Badge>
                              </>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteMilestone(milestone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <Button onClick={() => setShowBlockerModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Blocker
              </Button>
            </CardHeader>
            <CardContent>
              {blockers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No blockers. Great progress! 🎉</p>
              ) : (
                <div className="space-y-4">
                  {blockers.map(blocker => (
                    <div 
                      key={blocker.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        blocker.status === 'open' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' : 
                        'border-green-200 bg-green-50/50 dark:bg-green-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${blocker.status === 'open' ? 'text-red-500' : 'text-green-500'}`} />
                        <div>
                          <p className="font-medium">{blocker.title}</p>
                          {blocker.description && (
                            <p className="text-sm text-muted-foreground">{blocker.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Created: {format(new Date(blocker.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={blocker.type === 'owner_question' ? 'default' : 'secondary'}>
                          {blocker.type.replace('_', ' ')}
                        </Badge>
                        {blocker.status === 'open' ? (
                          <Button variant="outline" size="sm" onClick={() => resolveBlocker(blocker.id)}>
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        ) : (
                          <Badge variant="outline" className="bg-green-100">Resolved</Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteBlocker(blocker.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <Button onClick={() => setShowBugModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </CardHeader>
            <CardContent>
              {bugs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active bugs reported. Great job! 🎉
                </p>
              ) : (
                <div className="space-y-4">
                  {bugs.map(bug => (
                    <BugCard
                      key={bug.id}
                      bug={bug}
                      onUpdateStatus={(id, status) => updateBug(id, { status })}
                      onDelete={deleteBug}
                    />
                  ))}
                </div>
              )}
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
              <Button onClick={() => setShowDecisionModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Decision
              </Button>
            </CardHeader>
            <CardContent>
              {decisions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No decisions recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {decisions.map(decision => (
                    <div key={decision.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{decision.decision}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {format(new Date(decision.created_at), 'MMM d, yyyy')}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => deleteDecision(decision.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {decision.rationale && (
                        <p className="text-sm text-muted-foreground">{decision.rationale}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Notes</CardTitle>
                <CardDescription>Meeting notes and updates</CardDescription>
              </div>
              <Button onClick={() => setShowNoteModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notes yet. Add your first note!</p>
              ) : (
                <div className="space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddTaskModal open={showTaskModal} onOpenChange={setShowTaskModal} onSubmit={createTask} />
      <AddBugModal open={showBugModal} onOpenChange={setShowBugModal} onSubmit={createBug} />
      <AddBlockerModal open={showBlockerModal} onOpenChange={setShowBlockerModal} onSubmit={createBlocker} />
      <AddDecisionModal open={showDecisionModal} onOpenChange={setShowDecisionModal} onSubmit={createDecision} />
      <AddMilestoneModal open={showMilestoneModal} onOpenChange={setShowMilestoneModal} onSubmit={createMilestone} />
      <AddNoteModal open={showNoteModal} onOpenChange={setShowNoteModal} onSubmit={createNote} />
    </>
  );
};

export default AdminDevWorkspace;
