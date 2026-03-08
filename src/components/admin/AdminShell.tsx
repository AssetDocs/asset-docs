import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SecureStorage from '@/utils/secureStorage';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Building2, Code2, AlertTriangle, ArrowLeft, UserX } from 'lucide-react';

type Workspace = 'owner' | 'dev';

const AdminShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session } = useAuth();
  const { role, loading, hasOwnerAccess, hasDevAccess, canSwitchWorkspace } = useAdminRole();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [forceSignOutUserId, setForceSignOutUserId] = useState('');
  const [forceSignOutLoading, setForceSignOutLoading] = useState(false);

  // Determine current workspace from URL
  const currentWorkspace: Workspace = location.pathname.includes('/admin/owner') ? 'owner' : 'dev';

  useEffect(() => {
    const checkAccess = async () => {
      const adminAccess = await SecureStorage.getItem('admin_access');
      if (adminAccess === 'granted') {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }
      // Fallback: if the user already has an admin/owner role in the DB (confirmed by
      // Supabase auth), auto-grant access without requiring the password again.
      if (!loading && (hasOwnerAccess || hasDevAccess)) {
        await SecureStorage.setItem('admin_access', 'granted', 72);
        setHasAccess(true);
        setIsChecking(false);
        return;
      }
      setHasAccess(false);
      setIsChecking(false);
    };
    if (!loading) {
      checkAccess();
    }
  }, [loading, hasOwnerAccess, hasDevAccess]);

  // Redirect based on role when loading completes
  useEffect(() => {
    if (loading || isChecking || !hasAccess) return;

    if (!hasDevAccess && !hasOwnerAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (currentWorkspace === 'owner' && !hasOwnerAccess) {
      toast({
        title: "Access Restricted",
        description: "Access restricted to Owner workspace. Redirecting to Development workspace.",
        variant: "destructive",
      });
      navigate('/admin/dev');
      return;
    }

    if (location.pathname === '/admin') {
      if (hasOwnerAccess) {
        navigate('/admin/owner');
      } else {
        navigate('/admin/dev');
      }
    }
  }, [loading, isChecking, hasAccess, role, hasOwnerAccess, hasDevAccess, currentWorkspace, location.pathname, navigate, toast]);

  const handleLogout = () => {
    SecureStorage.removeItem('admin_access');
    setHasAccess(false);
    navigate('/');
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    if (workspace === 'owner' && !hasOwnerAccess) {
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access the Owner workspace.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/admin/${workspace}`);
  };

  const handleForceSignOut = async () => {
    if (!forceSignOutUserId.trim()) {
      toast({ title: "Error", description: "Please enter a user ID.", variant: "destructive" });
      return;
    }
    setForceSignOutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('force-signout', {
        body: { userId: forceSignOutUserId.trim() },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: data?.message || `All sessions revoked for user ${forceSignOutUserId.trim()}`,
      });
      setForceSignOutUserId('');
    } catch (err: any) {
      toast({
        title: "Force Sign-Out Failed",
        description: err?.message || 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setForceSignOutLoading(false);
    }
  };

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AdminPasswordGate onPasswordCorrect={() => setHasAccess(true)} />;
  }

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'owner': return 'bg-amber-500';
      case 'admin': return 'bg-red-500';
      case 'dev_lead': return 'bg-purple-500';
      case 'developer': return 'bg-blue-500';
      case 'qa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`${getRoleBadgeColor()} text-white`}>
                    {role?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <Badge variant="secondary">
                    {currentWorkspace === 'owner' ? (
                      <>
                        <Building2 className="w-3 h-3 mr-1" />
                        Owner Workspace
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3 h-3 mr-1" />
                        Development Workspace
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Force Sign-Out — Owner only */}
              {hasOwnerAccess && (
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 h-9 text-sm"
                    placeholder="User ID to force sign-out..."
                    value={forceSignOutUserId}
                    onChange={(e) => setForceSignOutUserId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleForceSignOut()}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleForceSignOut}
                    disabled={forceSignOutLoading}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    {forceSignOutLoading ? 'Revoking...' : 'Force Sign-Out'}
                  </Button>
                </div>
              )}

              {/* Workspace Switcher - Only for owners */}
              {canSwitchWorkspace && (
                <Select value={currentWorkspace} onValueChange={(v) => handleWorkspaceChange(v as Workspace)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Owner Workspace
                      </div>
                    </SelectItem>
                    <SelectItem value="dev">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Development Workspace
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dev Mode Banner */}
      {currentWorkspace === 'dev' && !hasOwnerAccess && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are viewing the <strong>Development Workspace</strong> — Owner settings are restricted.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminShell;
