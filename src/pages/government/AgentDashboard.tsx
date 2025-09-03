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
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload, 
  Camera,
  UserCog,
  Users,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [completionProofs, setCompletionProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [proofDialog, setProofDialog] = useState({
    open: false,
    assignmentId: null,
    proofType: 'note',
    description: '',
    file: null
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchCompletionProofs();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('request_assignments')
        .select(`
          *,
          government_requests!inner(
            id,
            description,
            service_id,
            priority,
            estimated_completion_days,
            government_services(name)
          )
        `)
        .eq('agent_id', user.id)
        .order('assigned_at', { ascending: false });
        
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletionProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('task_completion_proofs')
        .select(`
          *,
          request_assignments!inner(
            government_requests(description)
          )
        `)
        .eq('agent_id', user.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      setCompletionProofs(data || []);
    } catch (error) {
      console.error('Error fetching completion proofs:', error);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('request_assignments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });

      fetchAssignments();

      // Create notification for admin and update main request status
      if (newStatus === 'completed') {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
          // Update the main government request status
          await supabase
            .from('government_requests')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', assignment.request_id);

          // Create status history
          await supabase
            .from('request_status_history')
            .insert({
              request_id: assignment.request_id,
              old_status: 'processing',
              new_status: 'completed',
              changed_by: user.id,
              change_reason: 'Task completed by field agent'
            });

          // Notify admin
          await supabase.rpc('create_notification', {
            target_user_id: assignment.admin_id,
            notification_title: 'Task Completed',
            notification_message: 'Field agent has completed the assigned task and marked it as done',
            notification_type: 'success',
            request_id: assignment.request_id
          });

          // Notify client
          const { data: requestData } = await supabase
            .from('government_requests')
            .select('client_id')
            .eq('id', assignment.request_id)
            .single();

          if (requestData) {
            await supabase.rpc('create_notification', {
              target_user_id: requestData.client_id,
              notification_title: 'Service Completed',
              notification_message: 'Your government service request has been completed',
              notification_type: 'success',
              request_id: assignment.request_id
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const submitCompletionProof = async () => {
    if (!proofDialog.assignmentId) return;

    try {
      const { error } = await supabase
        .from('task_completion_proofs')
        .insert({
          assignment_id: proofDialog.assignmentId,
          agent_id: user.id,
          proof_type: proofDialog.proofType,
          description: proofDialog.description,
          file_path: proofDialog.file ? 'placeholder-path' : null // TODO: Implement file upload
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Completion proof submitted successfully",
      });

      setProofDialog({
        open: false,
        assignmentId: null,
        proofType: 'note',
        description: '',
        file: null
      });

      fetchCompletionProofs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit completion proof",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'assigned': return 'outline';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'assigned': return AlertCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  const activeAssignments = assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Complete assigned government service tasks</p>
        </div>
        
        <Badge variant="outline" className="bg-green-50">
          <UserCog className="h-3 w-3 mr-1" />
          Field Agent
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAssignments.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proofs Submitted</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionProofs.length}</div>
            <p className="text-xs text-muted-foreground">Documentation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="proofs">Completion Proofs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Current Task Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No active tasks</h3>
                    <p className="text-muted-foreground">New assignments will appear here</p>
                  </div>
                ) : (
                  activeAssignments.map((assignment) => {
                    const StatusIcon = getStatusIcon(assignment.status);
                    
                    return (
                      <div key={assignment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <h3 className="font-medium">
                                {assignment.government_requests.government_services?.name || 'Service Request'}
                              </h3>
                              <Badge variant={getStatusColor(assignment.status)}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={getPriorityColor(assignment.priority)}>
                                {assignment.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {assignment.government_requests.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                              {assignment.due_date && (
                                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                              )}
                              {assignment.government_requests.estimated_completion_days && (
                                <span>Est. {assignment.government_requests.estimated_completion_days} days</span>
                              )}
                            </div>
                            {assignment.notes && (
                              <p className="text-xs text-muted-foreground">
                                Instructions: {assignment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={assignment.status} 
                              onValueChange={(value) => updateAssignmentStatus(assignment.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setProofDialog({
                                open: true,
                                assignmentId: assignment.id,
                                proofType: 'note',
                                description: '',
                                file: null
                              })}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Add Proof
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
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No completed tasks</h3>
                    <p className="text-muted-foreground">Finished tasks will appear here</p>
                  </div>
                ) : (
                  completedAssignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <h3 className="font-medium">
                              {assignment.government_requests.government_services?.name || 'Service Request'}
                            </h3>
                            <Badge variant="default">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.government_requests.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Completed: {new Date(assignment.updated_at).toLocaleDateString()}</span>
                            <span>Duration: {Math.ceil((new Date(assignment.updated_at).getTime() - new Date(assignment.assigned_at).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="proofs">
          <Card>
            <CardHeader>
              <CardTitle>Completion Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionProofs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No proofs submitted</h3>
                    <p className="text-muted-foreground">Task completion documentation will appear here</p>
                  </div>
                ) : (
                  completionProofs.map((proof) => (
                    <div key={proof.id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {proof.proof_type === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
                          {proof.proof_type === 'photo' && <Camera className="h-4 w-4 text-green-500" />}
                          {proof.proof_type === 'note' && <FileText className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium capitalize">{proof.proof_type} Proof</h4>
                            <Badge variant="outline">{proof.proof_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {proof.request_assignments?.government_requests?.description || 'Task'}
                          </p>
                          {proof.description && (
                            <p className="text-sm mt-1">{proof.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(proof.uploaded_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion Proof Dialog */}
      <Dialog open={proofDialog.open} onOpenChange={(open) => 
        setProofDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Completion Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proofType">Proof Type</Label>
              <Select 
                value={proofDialog.proofType} 
                onValueChange={(value) => setProofDialog(prev => ({ ...prev, proofType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Written Note</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="photo">Photo Evidence</SelectItem>
                  <SelectItem value="signature">Digital Signature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Describe the completion proof..."
                value={proofDialog.description}
                onChange={(e) => setProofDialog(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            {proofDialog.proofType !== 'note' && (
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input
                  type="file"
                  accept={
                    proofDialog.proofType === 'photo' ? 'image/*' :
                    proofDialog.proofType === 'document' ? '.pdf,.doc,.docx' : '*/*'
                  }
                  onChange={(e) => setProofDialog(prev => ({ 
                    ...prev, 
                    file: e.target.files?.[0] || null 
                  }))}
                />
              </div>
            )}
            
            <Button onClick={submitCompletionProof} className="w-full">
              Submit Proof
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;