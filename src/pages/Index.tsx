import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, TrendingUp, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  const services = [
    {
      title: "Government Services",
      description: "Streamline your government requests and document management with intelligent automation",
      icon: Building2,
      path: "/government",
      features: ["Smart Request Forms", "Document Upload & Verification", "Real-time Status Tracking", "Admin Review Workflows"],
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Messaging Services", 
      description: "Automate your WhatsApp and Instagram communications with AI-powered templates",
      icon: MessageSquare,
      path: "/messaging",
      features: ["Contact List Management", "AI Message Templates", "Scheduled Messaging", "Delivery Analytics"],
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Business Generator",
      description: "Manage leads and grow your business with advanced CRM and pipeline tools",
      icon: TrendingUp,
      path: "/business",
      features: ["Lead Scoring & Management", "Activity Timeline Tracking", "Sales Pipeline", "Performance Analytics"],
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "All services unlocked from day one - no waiting periods or trial limitations"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with data isolation and comprehensive access controls"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Intelligent automation and AI assistance across all platform features"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle Button - always visible top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
        <div className="relative py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              All Services Available Now
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Ihundo</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              Your comprehensive platform for government services, messaging automation, and business growth. 
              Transform your operations with intelligent tools designed for modern businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-10 py-4 shadow-elegant hover:shadow-glow transition-all duration-300">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="text-lg px-10 py-4 shadow-elegant hover:shadow-glow transition-all duration-300">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 hover:bg-primary/5 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powerful Services for Every Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access all three comprehensive services from day one. No limitations, no waiting periods, 
              just complete functionality at your fingertips.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={service.path}>
                      <Button className="w-full group-hover:shadow-lg transition-all duration-300 h-12">
                        Explore Service
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using Ihundo to streamline their operations 
            and accelerate their growth.
          </p>
          {!user && (
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12 py-4 shadow-elegant hover:shadow-glow transition-all duration-300">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
