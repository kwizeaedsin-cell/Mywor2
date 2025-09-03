import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserCog, User, AlertCircle, Home } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import ClientDashboard from './ClientDashboard';

const GovernmentDashboard = () => {
  const { user } = useAuth();
  const { userRole, loading, assignRole } = useUserRole();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Auto-assign client role if no role exists
  useEffect(() => {
    if (user && !loading && !userRole) {
      assignRole(user.id, 'client');
    }
  }, [user, userRole, loading, assignRole]);

  const handleRoleAssignment = async (role: 'client' | 'admin' | 'agent') => {
    if (!user) return;
    
    const result = await assignRole(user.id, role);
    if (result.success) {
      setShowRoleSelection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-primary">Government Services</h1>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show role selection for demo purposes (in production, roles would be assigned by admins)
  if (!userRole || showRoleSelection) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-primary">Government Services</h1>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="space-y-6">
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold text-primary">Government Services Platform</h1>
              <p className="text-muted-foreground mt-2">Secure and efficient government service management</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Select Your Role</CardTitle>
                  <p className="text-muted-foreground">
                    Choose your role in the government services platform
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center space-y-2"
                      onClick={() => handleRoleAssignment('client')}
                    >
                      <User className="h-8 w-8 text-blue-500" />
                      <div className="text-center">
                        <h3 className="font-medium">Client</h3>
                        <p className="text-sm text-muted-foreground">
                          Submit and track government service requests
                        </p>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center space-y-2"
                      onClick={() => handleRoleAssignment('admin')}
                    >
                      <UserCheck className="h-8 w-8 text-purple-500" />
                      <div className="text-center">
                        <h3 className="font-medium">Administrator</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage requests and assign tasks to agents
                        </p>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center space-y-2"
                      onClick={() => handleRoleAssignment('agent')}
                    >
                      <UserCog className="h-8 w-8 text-green-500" />
                      <div className="text-center">
                        <h3 className="font-medium">Field Agent</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete assigned government service tasks
                        </p>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Demo Mode</p>
                        <p>In production, user roles would be assigned by system administrators. You can switch roles anytime by clicking your role badge.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'client':
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">Government Services</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleSelection(true)}
            >
              Switch Role ({userRole})
            </Button>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default GovernmentDashboard;