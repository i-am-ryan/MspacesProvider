import { Bell, ChevronRight, TrendingUp, Star, DollarSign, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">Mspaces Pro</h1>
          <div className="flex items-center gap-3">
            <button className="relative">
              <Bell className="w-6 h-6 text-foreground" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <Avatar className="w-9 h-9 cursor-pointer" onClick={() => navigate('/profile')}>
              <AvatarFallback className="bg-primary text-white">JP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Availability Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Availability Status</h3>
              <p className="text-sm text-muted-foreground">You're currently accepting new jobs</p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Briefcase}
            label="Jobs Completed"
            value="47"
            trend={12}
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value="4.8"
          />
          <StatCard
            icon={DollarSign}
            label="This Month"
            value="R12,450"
            trend={8}
          />
          <StatCard
            icon={TrendingUp}
            label="Active Jobs"
            value="5"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate('/requests')}
            >
              <TrendingUp className="w-6 h-6" />
              <span>View Requests</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate('/bookings')}
            >
              <Briefcase className="w-6 h-6" />
              <span>My Bookings</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Kitchen Sink Repair</h3>
              <span className="text-xs text-success font-medium">Completed</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">John Smith • Yesterday</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary font-semibold">R850</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>5.0</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Gate Installation</h3>
              <span className="text-xs text-warning font-medium">In Progress</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Mary Johnson • Today</p>
            <div className="text-sm">
              <span className="text-primary font-semibold">R2,500</span>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
