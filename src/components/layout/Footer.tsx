import { Building2, MessageSquare, TrendingUp, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-card to-card/80 border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ihundo
            </h3>
            <p className="text-sm text-muted-foreground">
              Your comprehensive platform for government services, messaging automation, and business growth in Rwanda.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Building2 className="h-4 w-4" />
                <span>Government Services</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <MessageSquare className="h-4 w-4" />
                <span>Messaging Services</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <TrendingUp className="h-4 w-4" />
                <span>Business Generator</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="hover:text-primary transition-colors cursor-pointer">Help Center</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Documentation</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Contact Us</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Status</div>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="hover:text-primary transition-colors cursor-pointer">About</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Privacy</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Terms</div>
              <div className="hover:text-primary transition-colors cursor-pointer">Careers</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 Ihundo. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>in Rwanda</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;