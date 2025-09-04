import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  UserCog,
  Eye,
  Calendar,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import RoleManager from '@/components/role/RoleManager';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialog, setAssignmentDialog] = useState({
    open: false,
    requestId: null,
    agentId: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRequests(),
      fetchAssignments(), 
      fetchAgents(),
      fetchNotifications()
    ]);
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('government_requests')
        .select(`
          *,
          government_services(name),
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('request_assignments')
        .select(`
          *,
          government_requests(description, service_id),
          profiles!agent_id(full_name, email)
        `)
        .order('assigned_at', { ascending: false });
        
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles(full_name, email)
        `)
        .eq('role', 'agent')
        .eq('is_active', true);
        
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAssignRequest = async () => {
    if (!assignmentDialog.requestId || !assignmentDialog.agentId) {
      toast({
        title: "Error",
        description: "Please select an agent",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('assign_request_to_agent', {
        request_uuid: assignmentDialog.requestId,
        admin_uuid: user.id,
        agent_uuid: assignmentDialog.agentId,
        assignment_notes: assignmentDialog.notes,
        assignment_priority: assignmentDialog.priority
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request assigned to agent successfully",
      });

      setAssignmentDialog({
        open: false,
        requestId: null,
        agentId: '',
        priority: 'medium',
        notes: ''
      });

      fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign request",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('government_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request status updated",
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'draft': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage government service requests and agent assignments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Manage Roles</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Role Manager</DialogTitle>
              </DialogHeader>
              <RoleManager onClose={() => {}} />
            </DialogContent>
          </Dialog>
          <Badge variant="outline" className="bg-blue-50">
            <UserCheck className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
          {notifications.length > 0 && (
            <Badge variant="destructive">
              <Bell className="h-3 w-3 mr-1" />
              {notifications.length} alerts
            </Badge>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending_admin_review').length}
            </div>
            <p className="text-xs text-muted-foreground">Need verification</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Agents</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Active agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Government Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No requests</h3>
                    <p className="text-muted-foreground">Client requests will appear here</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{request.government_services?.name || 'Unknown Service'}</h3>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          {request.priority && (
                            <Badge variant={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Client: {request.profiles?.full_name || 'Unknown'}</span>
                          <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                          {request.assigned_agent_id && (
                            <span>Assigned to agent</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={request.status} 
                          onValueChange={(value) => updateRequestStatus(request.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending_admin_review">Pending Review</SelectItem>
                            <SelectItem value="verified">Verified & Ready</SelectItem>
                            <SelectItem value="processing">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {!request.assigned_agent_id && (request.status === 'verified' || request.status === 'pending_admin_review') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setAssignmentDialog({
                              open: true,
                              requestId: request.id,
                              agentId: '',
                              priority: 'medium',
                              notes: ''
                            })}
                            disabled={request.status !== 'verified'}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            {request.status === 'verified' ? 'Assign Agent' : 'Verify First'}
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Agent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No assignments</h3>
                    <p className="text-muted-foreground">Agent assignments will appear here</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">
                              {assignment.government_requests?.description || 'Request'}
                            </h4>
                            <Badge variant={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            <Badge variant={getPriorityColor(assignment.priority)}>
                              {assignment.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Agent: {assignment.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(assignment.assigned_at).toLocaleString()}
                          </p>
                          {assignment.notes && (
                            <p className="text-xs text-muted-foreground">
                              Notes: {assignment.notes}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Monitor
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No agents</h3>
                    <p className="text-muted-foreground">Active agents will appear here</p>
                  </div>
                ) : (
                  agents.map((agent) => {
                    const agentAssignments = assignments.filter(a => a.agent_id === agent.user_id);
                    const activeAssignments = agentAssignments.filter(a => 
                      a.status === 'assigned' || a.status === 'in_progress'
                    );
                    
                    return (
                      <div key={agent.user_id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{agent.profiles?.full_name || 'Unknown Agent'}</h4>
                            <p className="text-sm text-muted-foreground">{agent.profiles?.email}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Active tasks: {activeAssignments.length}</span>
                              <span>Total assigned: {agentAssignments.length}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={activeAssignments.length > 5 ? 'destructive' : 'default'}>
                              {activeAssignments.length > 5 ? 'Busy' : 'Available'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View Tasks
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-muted-foreground">System alerts will appear here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Bell className="h-4 w-4 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          notification.type === 'error' ? 'destructive' :
                          notification.type === 'warning' ? 'secondary' : 'default'
                        }>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog.open} onOpenChange={(open) => 
        setAssignmentDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Request to Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent">Select Agent</Label>
              <Select 
                value={assignmentDialog.agentId} 
                onValueChange={(value) => setAssignmentDialog(prev => ({ ...prev, agentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.user_id} value={agent.user_id}>
                      {agent.profiles?.full_name || 'Unknown Agent'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={assignmentDialog.priority} 
                onValueChange={(value) => setAssignmentDialog(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Assignment Notes</Label>
              <Textarea
                placeholder="Instructions for the agent..."
                value={assignmentDialog.notes}
                onChange={(e) => setAssignmentDialog(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <Button onClick={handleAssignRequest} className="w-full">
              Assign to Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;