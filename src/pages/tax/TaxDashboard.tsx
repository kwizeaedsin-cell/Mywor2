import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const TaxDashboard = () => {
  const { user } = useAuth();

  const messagingServices = [
    {
      id: 'chat',
      title: 'Live Chat',
      subtitle: 'Real-time customer support',
      icon: Calculator,
      available: true,
      description: 'Connect with customers instantly'
    },
    {
      id: 'tickets',
      title: 'Support Tickets',
      subtitle: 'Manage customer issues',
      icon: TrendingUp,
      available: true,
      description: 'Track and resolve customer requests'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Customer updates & alerts',
      icon: FileText,
      available: true,
      description: 'Send targeted messages to customers'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-xl">Messaging Customers</h1>
              <p className="text-sm text-muted-foreground">
                Customer communication hub
              </p>
            </div>
          </div>
          {user && (
            <Badge variant="secondary">
              {user.email?.split('@')[0]}
            </Badge>
          )}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="text-center py-12 mb-8">
        <h2 className="text-3xl font-bold mb-4">Customer Messaging Portal</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with your customers through integrated messaging. Manage communications, support tickets, and customer relationships.
        </p>
      </div>

      {/* Service Cards */}
      <main className="flex-1 max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messagingServices.map((service) => {
            const Icon = service.icon;
            
            return (
              <Card
                key={service.id}
                className="relative h-64 cursor-pointer transition-all duration-300 hover:scale-105 border-0 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-elegant hover:from-primary/30 hover:to-primary/10"
              >
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-foreground">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    Access Service
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <h4 className="font-semibold text-2xl text-primary mb-2">0</h4>
            <p className="text-sm text-muted-foreground">Active Conversations</p>
          </Card>
          <Card className="p-6 text-center">
            <h4 className="font-semibold text-2xl text-primary mb-2">0</h4>
            <p className="text-sm text-muted-foreground">Messages Today</p>
          </Card>
          <Card className="p-6 text-center">
            <h4 className="font-semibold text-2xl text-primary mb-2">0</h4>
            <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TaxDashboard;