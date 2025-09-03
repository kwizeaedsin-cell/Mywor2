import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Inbox, Send, Archive, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const MessagingDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const businessCategories = [
    {
      id: 'leads',
      title: 'Lead Generation',
      icon: Inbox,
      count: 0,
      description: 'Generate and track new business leads'
    },
    {
      id: 'campaigns',
      title: 'Marketing Campaigns',
      icon: Send,
      count: 0,
      description: 'Create and manage marketing campaigns'
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      icon: Archive,
      count: 0,
      description: 'Track performance and ROI metrics'
    }
  ];

  const recentMessages = [
    {
      id: 1,
      sender: 'RRA Tax Office',
      subject: 'Welcome to Government Portal',
      preview: 'Welcome to the government services messaging center...',
      time: '2 hours ago',
      isRead: false
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
              <h1 className="font-semibold text-xl">Business Generator</h1>
              <p className="text-sm text-muted-foreground">
                Growth & lead generation
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
        <h2 className="text-3xl font-bold mb-4">Business Growth Hub</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate leads, track prospects, and grow your business with integrated tools and analytics.
        </p>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 pb-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Message Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {businessCategories.map((category) => {
            const Icon = category.icon;
            
            return (
              <Card
                key={category.id}
                className="relative h-48 cursor-pointer transition-all duration-300 hover:scale-105 border-0 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-elegant hover:from-primary/30 hover:to-primary/10"
              >
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      {category.count > 0 && (
                        <Badge variant="default" className="bg-primary/20 text-primary">
                          {category.count}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-foreground">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    Open {category.title}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start generating leads and campaigns to see activity here</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MessagingDashboard;