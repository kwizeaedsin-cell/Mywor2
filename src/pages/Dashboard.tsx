import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageSquare, TrendingUp, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const services = [
    {
      id: 'government',
      title: 'Government Services',
      subtitle: 'RRA & Irembo help',
      icon: Building2,
      available: true,
      path: '/government'
    },
    {
      id: 'tax',
      title: 'Messaging Customers',
      subtitle: 'Customer communication hub',
      icon: TrendingUp,
      available: true,
      path: '/tax'
    },
    {
      id: 'messaging',
      title: 'Business Generator',
      subtitle: 'Growth & lead generation',
      icon: MessageSquare,
      available: true,
      path: '/messaging'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex flex-col">
      {/* Header */}
      <div className="text-center py-12 mb-8">
        {user && (
          <p className="text-lg text-muted-foreground mb-2">
            Welcome, <span className="text-primary font-medium">{user.email?.split('@')[0]}</span>
          </p>
        )}
      </div>

      {/* Service Cards */}
      <main className="flex-1 max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            
            return (
              <Card
                key={service.id}
                className={`relative h-48 cursor-pointer transition-all duration-300 hover:scale-105 border-0 overflow-hidden ${
                  service.available 
                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-elegant hover:from-primary/30 hover:to-primary/10' 
                    : 'bg-gradient-to-br from-muted/50 to-muted/20 opacity-60'
                }`}
                onClick={() => { 
                  if (service.available) {
                    window.location.href = service.path;
                  }
                }}
              >
                {/* Lock overlay for unavailable services */}
                {!service.available && (
                  <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Badge variant="secondary" className="text-xs">
                        Unlocks Later
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      service.available 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold text-lg mb-1 ${
                        service.available ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  {service.available && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary"
                    >
                      Access Service
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t px-6 py-8 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Government Portal</h3>
              <p className="text-sm text-muted-foreground">
                Streamlined access to government services, tax support, and official communications.
              </p>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Government Services</li>
                <li>Tax Support</li>
                <li>Message Center</li>
                <li>Document Processing</li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
                <li>Service Status</li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Accessibility</li>
                <li>Security</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            © 2024 Government Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;