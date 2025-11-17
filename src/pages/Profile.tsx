import { Star, MapPin, Award, Settings, LogOut, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-6 pb-20">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Card - Overlapping Header */}
      <div className="px-4 -mt-16">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-primary text-white text-2xl">JP</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-1">John's Plumbing</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-warning text-warning" />
                <span className="font-semibold">4.8</span>
              </div>
              <span className="text-muted-foreground">• 47 reviews</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
            <Button variant="outline" className="mb-4">
              Edit Profile
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">47</p>
              <p className="text-xs text-muted-foreground">Jobs Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">2h</p>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">2y</p>
              <p className="text-xs text-muted-foreground">Member Since</p>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-4 mt-4">
          <h3 className="font-semibold mb-3">About</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Professional plumbing services with over 10 years of experience. 
            Specializing in residential and commercial plumbing, leak repairs, 
            and installation services.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Services: Sandton, Rosebank, Randburg (50km radius)</span>
          </div>
        </Card>

        {/* Services */}
        <Card className="p-4 mt-4">
          <h3 className="font-semibold mb-3">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Plumbing</Badge>
            <Badge variant="secondary">Leak Repairs</Badge>
            <Badge variant="secondary">Installations</Badge>
            <Badge variant="secondary">Emergency Services</Badge>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="space-y-2 mt-4">
          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">My Portfolio</span>
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Reviews</span>
            </div>
            <span className="text-sm text-muted-foreground">47</span>
          </Card>

          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-destructive/5 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Logout</span>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
