import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageSquare, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: 'government' | 'messaging' | 'business';
  className?: string;
}

const ServiceCard = ({ service, className }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const serviceConfig = {
    government: {
      title: "Government Services",
      description: "RRA & Irembo help",
      icon: Building2,
      gradient: "from-primary to-accent",
      stats: [
        { label: "Total Requests", value: "12", icon: Building2 },
        { label: "Completed", value: "8", icon: Building2 },
        { label: "In Progress", value: "3", icon: Building2 },
        { label: "Pending", value: "1", icon: Building2 }
      ],
      recentItems: [
        { title: "Business License", status: "completed", date: "2024-01-15" },
        { title: "Tax Registration", status: "in_progress", date: "2024-01-20" },
        { title: "Work Permit", status: "pending", date: "2024-01-22" }
      ]
    },
    messaging: {
      title: "Messaging Services",
      description: "WhatsApp & Instagram automation",
      icon: MessageSquare,
      gradient: "from-secondary to-primary",
      stats: [
        { label: "Campaigns", value: "5", icon: MessageSquare },
        { label: "Contacts", value: "1.2K", icon: MessageSquare },
        { label: "Messages Sent", value: "8.5K", icon: MessageSquare },
        { label: "Open Rate", value: "75%", icon: MessageSquare }
      ],
      recentItems: [
        { title: "Product Launch Campaign", status: "sent", date: "2024-01-15" },
        { title: "Monthly Newsletter", status: "scheduled", date: "2024-01-25" },
        { title: "Follow-up Messages", status: "draft", date: "2024-01-20" }
      ]
    },
    business: {
      title: "Business Generator",
      description: "CRM & Lead management",
      icon: TrendingUp,
      gradient: "from-accent to-secondary",
      stats: [
        { label: "Total Leads", value: "45", icon: TrendingUp },
        { label: "Converted", value: "12", icon: TrendingUp },
        { label: "Pipeline Value", value: "$25K", icon: TrendingUp },
        { label: "Win Rate", value: "27%", icon: TrendingUp }
      ],
      recentItems: [
        { title: "Tech Startup Lead", status: "hot", date: "2024-01-20" },
        { title: "Local Restaurant", status: "warm", date: "2024-01-18" },
        { title: "E-commerce Store", status: "cold", date: "2024-01-15" }
      ]
    }
  };

  const config = serviceConfig[service];
  const Icon = config.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'sent':
      case 'hot':
        return 'default';
      case 'in_progress':
      case 'scheduled':
      case 'warm':
        return 'secondary';
      case 'pending':
      case 'draft':
      case 'cold':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 border-0 h-full bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden",
      isExpanded ? "col-span-full row-span-2" : "",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                {config.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {config.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded ? "rotate-90" : ""
            )} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {config.stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Activity</h4>
          {config.recentItems.slice(0, isExpanded ? config.recentItems.length : 2).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-muted/30 to-transparent rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.date}</div>
              </div>
              <Badge variant={getStatusColor(item.status)} className="text-xs">
                {item.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1">
                <Plus className="h-3 w-3 mr-1" />
                New {service === 'government' ? 'Request' : service === 'messaging' ? 'Campaign' : 'Lead'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New {service === 'government' ? 'Request' : service === 'messaging' ? 'Campaign' : 'Lead'}</DialogTitle>
                <DialogDescription>
                  Add a new {service} item to your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter title..." />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description..." />
                </div>
                <Button className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" className="px-4">
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;