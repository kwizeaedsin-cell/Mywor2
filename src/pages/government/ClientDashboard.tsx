import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  Bell,
  User,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    service_id: '',
    description: '',
    priority: 'medium',
    documents: [],
    id_number: '',
    id_document: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRequests(),
      fetchServices(),
      fetchDocuments(),
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
          government_services(name, base_cost)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to submit request: ' + (error.message || error.details || 'Unknown error'));
        return;
      }
      setRequests(data || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('government_services')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select(`
          *,
          government_requests(description)
        `)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchStatusHistory = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('request_status_history')
        .select('*')
        .eq('request_id', requestId)
        .order('changed_at', { ascending: false });
        
      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error) {
      console.error('Error fetching status history:', error);
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

  const handleSubmitRequest = async () => {
    if (!newRequest.service_id || !newRequest.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let serviceId: number | null = null;
      let serviceName: string | null = null;
      if (!isNaN(Number(newRequest.service_id))) {
        serviceId = Number(newRequest.service_id);
      } else {
        serviceName = newRequest.service_id;
      }
      const { data, error } = await supabase
        .from('government_requests')
        .insert({
          client_id: user.id,
          service_id: serviceId,
          service_name: serviceName,
          description: newRequest.description,
          priority: newRequest.priority,
          status: 'pending_admin_review',
          documents: newRequest.documents.length > 0 ? newRequest.documents : null,
          id_number: newRequest.id_number || null,
          id_document: newRequest.id_document || null
        })
        .select()
        .single();

      if (error) throw error;

      // Create status history entry
      await supabase
        .from('request_status_history')
        .insert({
          request_id: data.id,
          new_status: 'pending_admin_review',
          changed_by: user.id,
          change_reason: 'Initial request submission - awaiting admin verification'
        });

      // Notify admins of new request
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .eq('is_active', true);
      
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await supabase.rpc('create_notification', {
            target_user_id: admin.user_id,
            notification_title: 'New Service Request',
            notification_message: `New government service request submitted for verification`,
            notification_type: 'info',
            request_id: data.id
          });
        }
      }

      toast.success('Your request has been submitted successfully');

      setNewRequest({
        service_id: '',
        description: '',
        priority: 'medium',
        documents: [],
        id_number: '',
        id_document: ''
      });

      fetchRequests();
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedDocs: string[] = [];
    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
      } else {
        uploadedDocs.push(filePath);
        toast.success(`${file.name} uploaded successfully`);
      }
    }
    setNewRequest({ ...newRequest, documents: uploadedDocs });
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'verified': return 'secondary';
      case 'pending_admin_review': return 'outline';
      case 'rejected': return 'destructive';
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
      case 'processing': return Clock;
      case 'pending': return AlertCircle;
      case 'draft': return FileText;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Client Portal</h1>
        <p className="text-muted-foreground">Submit and track your government service requests</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Government Services</h2>
          <p className="text-muted-foreground">Submit and track your government service requests</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            <User className="h-3 w-3 mr-1" />
            Client
          </Badge>
          {notifications.length > 0 && (
            <Badge variant="destructive">
              <Bell className="h-3 w-3 mr-1" />
              {notifications.length}
            </Badge>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit New Government Service Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service">Service Type *</Label>
                  <Select value={newRequest.service_id} onValueChange={(value) => setNewRequest({...newRequest, service_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <>
                          <div className="p-2 text-sm text-muted-foreground">No services found in database. Using fallback options:</div>
                          <SelectItem value="irembo">Irembo</SelectItem>
                          <SelectItem value="rra">RRA (tax declarations)</SelectItem>
                          <SelectItem value="iecms">IECMS</SelectItem>
                          <SelectItem value="rdb">RDB</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      ) : (
                        services.map((service: any) => (
                          <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="id_field">ID Number *</Label>
                  <Input
                    id="id_field"
                    placeholder="Enter your ID number"
                    className="mb-2"
                    value={newRequest.id_number || ''}
                    onChange={e => setNewRequest({ ...newRequest, id_number: e.target.value })}
                  />
                  <div className="text-center text-sm text-muted-foreground mb-2">Or</div>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="cursor-pointer"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const file = files[0];
                      const filePath = `${user.id}/id_${Date.now()}_${file.name}`;
                      const { error } = await supabase.storage.from('documents').upload(filePath, file);
                      if (error) {
                        toast.error(`Failed to upload ID document`);
                      } else {
                        setNewRequest({ ...newRequest, id_document: filePath });
                        toast.success(`ID document uploaded successfully`);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload ID document (PDF, JPG, PNG, DOC, DOCX)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your request..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="documents">Supporting Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload any relevant documents (PDF, DOC, DOCX, JPG, PNG)
                  </p>
                </div>

                {/* WhatsApp Contact Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-blue-800">
                    <MessageCircle className="h-4 w-4" />
                    <p>
                      <strong>Kubindi bisobanuro</strong> wahamaga cyangwa ukatwandikira kuri WhatsApp{" "}
                      <a 
                        href="https://wa.me/250783969329" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold text-green-600 hover:underline"
                      >
                        +250783969329
                      </a>
                    </p>
                  </div>
                </div>
                
                <Button onClick={handleSubmitRequest} className="w-full" disabled={!newRequest.service_id}>
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending_admin_review' || r.status === 'verified').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting admin review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Your Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No requests yet</h3>
                    <p className="text-muted-foreground">Click "New Request" to submit your first government service request</p>
                  </div>
                ) : (
                  requests.map((request) => {
                    const StatusIcon = getStatusIcon(request.status);
                    
                    return (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <h3 className="font-medium">{request.government_services?.name || 'Government Service'}</h3>
                              <Badge variant={getStatusColor(request.status)}>
                                {request.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={getPriorityColor(request.priority)}>
                                {request.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                              {request.final_fee && (
                                <span className="font-medium text-green-600">Fee: ${request.final_fee}</span>
                              )}
                              {request.estimated_completion_days && (
                                <span>Est. completion: {request.estimated_completion_days} days</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fetchStatusHistory(request.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Track Status
                            </Button>
                          </div>
                        </div>
                        
                        {/* Status History */}
                        {statusHistory.length > 0 && statusHistory[0]?.request_id === request.id && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="text-sm font-medium mb-2">Status History</h4>
                            <div className="space-y-1">
                              {statusHistory.slice(0, 3).map((history) => (
                                <div key={history.id} className="text-xs text-muted-foreground">
                                  <span className="font-medium">{history.new_status}</span> - {new Date(history.changed_at).toLocaleString()}
                                  {history.change_reason && <span> ({history.change_reason})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No documents uploaded</h3>
                    <p className="text-muted-foreground">Documents will appear here when you submit requests with attachments</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.government_requests?.description || 'Related to request'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No new notifications</h3>
                    <p className="text-muted-foreground">Updates about your requests will appear here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            notification.type === 'error' ? 'destructive' :
                            notification.type === 'warning' ? 'secondary' : 'default'
                          }>
                            {notification.type}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
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
    </div>
  );
};

export default ClientDashboard;