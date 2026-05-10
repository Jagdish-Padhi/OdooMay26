import { Link } from 'react-router-dom';
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-(--app-color-border) bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 logo-brand mb-6 group">
              <img src="/logo.png" alt="TravLoop" className="h-12 w-12 object-contain transition-transform group-hover:scale-110" />
              <div className="flex items-baseline gap-0.5">
                <span className="text-(--app-color-text) text-xl font-black uppercase tracking-tight">Trave</span>
                <span className="logo-shield text-xl font-black uppercase tracking-tight text-(--app-color-accent)">Loop</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-(--app-color-text-muted) mb-6 max-w-xs">
              The world's first collaborative travel planner designed for modern explorers. 
              Plan, budget, and discover with precision.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-(--app-color-text) mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Itinerary Planner</Link></li>
              <li><Link to="/" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Budget Tracker</Link></li>
              <li><Link to="/" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Travel Communities</Link></li>
              <li><Link to="/" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Mobile App</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-(--app-color-text) mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Press Kit</a></li>
              <li><a href="#" className="text-sm text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-(--app-color-text) mb-6">Support</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-(--app-color-text-muted)">
                <Mail size={16} className="text-(--app-color-accent)" />
                support@traveloop.com
              </li>
              <li className="flex items-center gap-3 text-sm text-(--app-color-text-muted)">
                <Phone size={16} className="text-(--app-color-accent)" />
                +1 (555) 000-0000
              </li>
              <li className="flex items-start gap-3 text-sm text-(--app-color-text-muted)">
                <MapPin size={16} className="text-(--app-color-accent) mt-1" />
                123 Explorer Way,<br />San Francisco, CA 94103
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-(--app-color-border)/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-(--app-color-text-muted)">
            © 2026 Traveloop Inc. All rights reserved. Built for modern explorers.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-(--app-color-text-muted) hover:text-(--app-color-text) transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-(--app-color-text-muted) hover:text-(--app-color-text) transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-(--app-color-text-muted) hover:text-(--app-color-text) transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
