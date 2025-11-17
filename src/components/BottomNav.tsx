import { Home, Search, Calendar, MessageSquare, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Requests', icon: Search, path: '/requests' },
  { label: 'Bookings', icon: Calendar, path: '/bookings' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
