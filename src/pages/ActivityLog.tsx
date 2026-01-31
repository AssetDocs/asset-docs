import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Filter, Upload, Users, Lock, Shield, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityLog } from '@/hooks/useActivityLog';
import ActivityLogList from '@/components/ActivityLogList';

const ActivityLog: React.FC = () => {
  const { logs, isLoading, refetch } = useActivityLog();
  const [activeTab, setActiveTab] = useState('all');

  const filteredLogs = activeTab === 'all' 
    ? logs 
    : logs.filter(log => log.action_category === activeTab);

  const categoryCounts = {
    all: logs.length,
    upload: logs.filter(l => l.action_category === 'upload').length,
    contributor: logs.filter(l => l.action_category === 'contributor').length,
    vault: logs.filter(l => l.action_category === 'vault').length,
    security: logs.filter(l => l.action_category === 'security').length,
    property: logs.filter(l => l.action_category === 'property').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/account">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
                <p className="text-muted-foreground text-sm">
                  Track all account activity at a glance
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Category Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter by Category
              </CardTitle>
              <CardDescription>
                View activity by type: uploads, contributor access, vault changes, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-1 mb-6">
                  <TabsTrigger value="all" className="text-xs px-2 py-2">
                    All
                    <span className="ml-1 text-muted-foreground">({categoryCounts.all})</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs px-2 py-2">
                    <Upload className="h-3 w-3 mr-1" />
                    Uploads
                    <span className="ml-1 text-muted-foreground">({categoryCounts.upload})</span>
                  </TabsTrigger>
                  <TabsTrigger value="contributor" className="text-xs px-2 py-2">
                    <Users className="h-3 w-3 mr-1" />
                    Contributors
                    <span className="ml-1 text-muted-foreground">({categoryCounts.contributor})</span>
                  </TabsTrigger>
                  <TabsTrigger value="vault" className="text-xs px-2 py-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Vault
                    <span className="ml-1 text-muted-foreground">({categoryCounts.vault})</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-xs px-2 py-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Security
                    <span className="ml-1 text-muted-foreground">({categoryCounts.security})</span>
                  </TabsTrigger>
                  <TabsTrigger value="property" className="text-xs px-2 py-2">
                    <Home className="h-3 w-3 mr-1" />
                    Properties
                    <span className="ml-1 text-muted-foreground">({categoryCounts.property})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <ActivityLogList logs={filteredLogs} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">About Activity Logs</p>
                  <p className="text-muted-foreground">
                    This log tracks actions by you and any trusted contacts (contributors) who have access to your account. 
                    All activity is time-stamped and organized for your security and peace of mind.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ActivityLog;
