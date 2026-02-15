import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLegalAgreements from '@/pages/AdminLegalAgreements';
import { useDevWorkspace, DevSupportStatus, DevReleaseStatus } from '@/hooks/useDevWorkspace';
import { AddTaskModal } from './dev-workspace/AddTaskModal';
import { AddBugModal } from './dev-workspace/AddBugModal';
import { AddBlockerModal } from './dev-workspace/AddBlockerModal';
import { AddDecisionModal } from './dev-workspace/AddDecisionModal';
import { AddMilestoneModal } from './dev-workspace/AddMilestoneModal';
import { AddNoteModal } from './dev-workspace/AddNoteModal';
import { AddReleaseModal } from './dev-workspace/AddReleaseModal';
import { AddSupportIssueModal } from './dev-workspace/AddSupportIssueModal';
import { TaskCard } from './dev-workspace/TaskCard';
import { BugCard } from './dev-workspace/BugCard';
import { RoadmapTab } from './dev-workspace/RoadmapTab';
import { TestingChecklistTab } from './dev-workspace/TestingChecklistTab';
import { DefinitionOfDoneTab } from './dev-workspace/DefinitionOfDoneTab';
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
  CheckCheck,
  Map,
  Rocket,
  ClipboardCheck,
  HeadphonesIcon,
  Tag,
  Scale
} from 'lucide-react';

const AdminDevWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const {
    loading,
    tasks,
    bugs,
    notes,
    blockers,
    decisions,
    milestones,
    releases,
    supportIssues,
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
    createRelease,
    updateRelease,
    deleteRelease,
    createSupportIssue,
    updateSupportIssue,
    deleteSupportIssue,
  } = useDevWorkspace();

  const openBlockers = blockers.filter(b => b.status === 'open');
  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const openSupportIssues = supportIssues.filter(s => s.status === 'new' || s.status === 'investigating' || s.status === 'in_progress');

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

  const releaseStatusColor = (status: DevReleaseStatus) => {
    switch (status) {
      case 'released': return 'bg-green-100 text-green-700 dark:bg-green-950/20';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20';
      case 'planned': return 'bg-muted';
      case 'rolled_back': return 'bg-red-100 text-red-700 dark:bg-red-950/20';
    }
  };

  const supportStatusColor = (status: DevSupportStatus) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'investigating': return 'default';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'wont_fix': return 'outline';
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="space-y-2">
          {/* Row 1: Planning & Execution */}
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full justify-start">
            <span className="text-xs text-muted-foreground px-2 py-1 hidden md:inline">Planning:</span>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Deadlines</span>
            </TabsTrigger>
            <TabsTrigger value="releases" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Releases</span>
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Decisions</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          {/* Row 2: Quality & Operations */}
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full justify-start">
            <span className="text-xs text-muted-foreground px-2 py-1 hidden md:inline">Quality:</span>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="bugs" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              <span className="hidden sm:inline">Bugs</span>
            </TabsTrigger>
            <TabsTrigger value="blockers" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Blockers</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HeadphonesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="dod" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">DoD</span>
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Infra 🔒</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Support Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{openSupportIssues.length}</div>
                <p className="text-sm text-muted-foreground">user-reported issues</p>
                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setActiveTab('support')}>
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

          {/* Recent Releases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Releases</CardTitle>
              <CardDescription>Latest deployments and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {releases.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No releases tracked yet</p>
              ) : (
                <div className="space-y-3">
                  {releases.slice(0, 3).map(release => (
                    <div key={release.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Rocket className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{release.version}</span>
                          <span className="text-muted-foreground ml-2">{release.title}</span>
                        </div>
                      </div>
                      <Badge className={releaseStatusColor(release.status)}>{release.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap">
          <RoadmapTab />
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

        {/* Releases Tab */}
        <TabsContent value="releases" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Releases / Changelog</CardTitle>
                <CardDescription>Track what shipped, what's in progress, and what's coming</CardDescription>
              </div>
              <Button onClick={() => setShowReleaseModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Release
              </Button>
            </CardHeader>
            <CardContent>
              {releases.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No releases tracked yet. Add your first release!</p>
              ) : (
                <div className="space-y-4">
                  {releases.map(release => (
                    <div key={release.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono">{release.version}</Badge>
                            <h4 className="font-semibold">{release.title}</h4>
                            <Badge className={releaseStatusColor(release.status)}>{release.status.replace('_', ' ')}</Badge>
                          </div>
                          {release.release_date && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(release.release_date), 'MMMM d, yyyy')}
                            </p>
                          )}
                          {release.description && (
                            <p className="text-sm text-muted-foreground mb-3">{release.description}</p>
                          )}
                          {release.key_changes && release.key_changes.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium mb-1">Key Changes:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {release.key_changes.map((change, idx) => (
                                  <li key={idx}>{change}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {release.known_issues && release.known_issues.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-amber-600 mb-1">Known Issues:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {release.known_issues.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={release.status} 
                            onValueChange={(v) => updateRelease(release.id, { status: v as DevReleaseStatus })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="released">Released</SelectItem>
                              <SelectItem value="rolled_back">Rolled Back</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => deleteRelease(release.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Checklist Tab */}
        <TabsContent value="testing">
          <TestingChecklistTab />
        </TabsContent>

        {/* Support Issues Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Support / Customer Issues</CardTitle>
                <CardDescription>User-reported issues, feature requests, and UX feedback</CardDescription>
              </div>
              <Button onClick={() => setShowSupportModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Issue
              </Button>
            </CardHeader>
            <CardContent>
              {supportIssues.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No support issues logged. Add customer feedback here!</p>
              ) : (
                <div className="space-y-4">
                  {supportIssues.map(issue => (
                    <div 
                      key={issue.id} 
                      className={`p-4 border rounded-lg ${
                        issue.status === 'resolved' ? 'bg-green-50/50 dark:bg-green-950/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{issue.title}</h4>
                            <Badge variant={supportStatusColor(issue.status)}>{issue.status.replace('_', ' ')}</Badge>
                            <Badge variant="outline">{issue.type.replace('_', ' ')}</Badge>
                            <Badge variant={issue.priority === 'critical' || issue.priority === 'high' ? 'destructive' : 'secondary'}>
                              {issue.priority}
                            </Badge>
                          </div>
                          {issue.reported_by && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Reported by: {issue.reported_by}
                            </p>
                          )}
                          {issue.description && (
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                          )}
                          {issue.resolution && (
                            <p className="text-sm text-green-600 mt-2">
                              Resolution: {issue.resolution}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(issue.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={issue.status} 
                            onValueChange={(v) => updateSupportIssue(issue.id, { status: v as DevSupportStatus })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="wont_fix">Won't Fix</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => deleteSupportIssue(issue.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Definition of Done Tab */}
        <TabsContent value="dod">
          <DefinitionOfDoneTab />
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

        {/* Infrastructure Tab - Locked for dev workspace */}
        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Server className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Infrastructure — Restricted</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                System infrastructure documentation is available in the Owner workspace only.
              </p>
            </CardContent>
          </Card>
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

        {/* Legal Agreements Tab */}
        <TabsContent value="legal">
          <AdminLegalAgreements />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddTaskModal open={showTaskModal} onOpenChange={setShowTaskModal} onSubmit={createTask} />
      <AddBugModal open={showBugModal} onOpenChange={setShowBugModal} onSubmit={createBug} />
      <AddBlockerModal open={showBlockerModal} onOpenChange={setShowBlockerModal} onSubmit={createBlocker} />
      <AddDecisionModal open={showDecisionModal} onOpenChange={setShowDecisionModal} onSubmit={createDecision} />
      <AddMilestoneModal open={showMilestoneModal} onOpenChange={setShowMilestoneModal} onSubmit={createMilestone} />
      <AddNoteModal open={showNoteModal} onOpenChange={setShowNoteModal} onSubmit={createNote} />
      <AddReleaseModal open={showReleaseModal} onOpenChange={setShowReleaseModal} onSubmit={createRelease} />
      <AddSupportIssueModal open={showSupportModal} onOpenChange={setShowSupportModal} onSubmit={createSupportIssue} />
    </>
  );
};

export default AdminDevWorkspace;
