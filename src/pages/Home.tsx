import { useEffect, useState } from 'react';
import { Bell, ChevronRight, TrendingUp, Star, DollarSign, Briefcase, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { BottomNav } from '@/components/BottomNav';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  getProviderProfile,
  getProviderDashboardStats,
  getProviderRecentActivity,
  toggleProviderAvailability,
  formatCurrency,
  formatDate,
  type ProviderStats,
  type RecentActivity,
  type ProviderProfile,
} from '@/lib/providerApi';

interface VerificationChecklist {
  verification_status: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [verificationChecklist, setVerificationChecklist] = useState<VerificationChecklist | null>(null);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isAccepting, setIsAccepting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfAdmin();
    }
  }, [user]);

  const checkIfAdmin = async () => {
    if (!user) return;

    setCheckingAdmin(true);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // If NO profile exists at all, redirect to signup/profile creation
      if (!profileData) {
        console.log('No profile found - redirecting to profile creation');
        toast({
          title: "Profile Setup Required",
          description: "Please complete your profile setup.",
        });
        navigate('/profile', { replace: true });
        return;
      }

      // Check if admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error checking admin status:', adminError);
      }

      if (adminData) {
        setIsAdmin(true);
        setCheckingAdmin(false);
        setLoading(false);
        setRedirecting(true);
        navigate('/admin', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Error in checkIfAdmin:', error);
    }
    
    setIsAdmin(false);
    setCheckingAdmin(false);
    loadProviderData();
  };

  const loadProviderData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const providerProfile = await getProviderProfile(user.id);
      
      // If no provider profile, redirect to profile creation
      if (!providerProfile) {
        console.log('No provider profile found - redirecting to profile');
        toast({
          title: "Complete Your Profile",
          description: "Please complete your provider profile to continue.",
        });
        navigate('/profile', { replace: true });
        return;
      }

      setProfile(providerProfile);
      setIsAccepting(providerProfile.is_accepting_jobs);

      const { data: checklistData, error: checklistError } = await supabase
        .from('provider_verification_checklist')
        .select('verification_status')
        .eq('provider_id', providerProfile.id)
        .maybeSingle();

      if (checklistError && checklistError.code !== 'PGRST116') {
        console.error('Error loading checklist:', checklistError);
      }

      if (checklistData) {
        setVerificationChecklist(checklistData);
      } else {
        setVerificationChecklist({
          verification_status: 'incomplete',
        });
      }

      const dashboardStats = await getProviderDashboardStats(providerProfile.id);
      setStats(dashboardStats);

      const activity = await getProviderRecentActivity(providerProfile.id, 2);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading provider data:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: "Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    if (!profile) return;

    setToggling(true);
    try {
      const result = await toggleProviderAvailability(profile.id, checked);
      
      if (result.success) {
        setIsAccepting(result.is_accepting_jobs);
        toast({
          title: result.is_accepting_jobs ? 'You\'re now accepting jobs' : 'You\'re not accepting jobs',
          description: result.message,
        });
      } else {
        setIsAccepting(false);
        toast({
          title: 'Cannot Enable',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your availability status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setToggling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in_progress':
        return 'text-warning';
      case 'confirmed':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'confirmed':
        return 'Confirmed';
      default:
        return status;
    }
  };

  if (redirecting) {
    return null;
  }

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {checkingAdmin ? 'Loading...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">Mspaces Pro</h1>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <button className="relative">
              <Bell className="w-6 h-6 text-foreground" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                {stats?.pending_requests || 0}
              </span>
            </button>
            <Avatar className="w-9 h-9 cursor-pointer" onClick={() => navigate('/profile')}>
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  {user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* APPROVED MESSAGE */}
        {profile?.admin_verified && verificationChecklist?.verification_status === 'approved' && (
          <Card className="p-4 bg-success/10 border-success">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-success mb-1">
                  🎉 You Have Been Verified!
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Congratulations! Your provider account has been approved by our admin team. You can now accept jobs and start earning.
                </p>
                <p className="text-xs text-muted-foreground">
                  Enable the "Availability Status" toggle below to start receiving job requests.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* REJECTED MESSAGE */}
        {!profile?.admin_verified && verificationChecklist?.verification_status === 'rejected' && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">
                  Application Rejected
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We're sorry to inform you that your provider application has been rejected by our admin team. Please update your profile and reapply.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  Update Profile & Reapply
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* PENDING VERIFICATION MESSAGE */}
        {!profile?.admin_verified && verificationChecklist?.verification_status === 'under_review' && (
          <Card className="p-4 bg-warning/10 border-warning">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-1">
                  Account Pending Verification
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your account is being reviewed by our team. You'll be able to accept jobs once verified.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="border-warning text-warning hover:bg-warning hover:text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* INCOMPLETE PROFILE MESSAGE */}
        {!profile?.admin_verified && verificationChecklist?.verification_status === 'incomplete' && (
          <Card className="p-4 bg-muted border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please complete your profile and upload required documents to start accepting jobs.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Availability Status</h3>
              <p className="text-sm text-muted-foreground">
                {isAccepting
                  ? "You're currently accepting new jobs"
                  : profile?.admin_verified
                  ? "You're not accepting new jobs"
                  : "Complete verification to accept jobs"}
              </p>
            </div>
            <Switch
              checked={isAccepting}
              onCheckedChange={handleToggleAvailability}
              disabled={toggling || !profile?.admin_verified}
            />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Briefcase}
            label="Jobs Completed"
            value={stats?.jobs_completed?.toString() || '0'}
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats?.average_rating?.toFixed(1) || '0.0'}
          />
          <StatCard
            icon={DollarSign}
            label="This Month"
            value={formatCurrency(stats?.monthly_earnings || 0)}
          />
          <StatCard
            icon={TrendingUp}
            label="Active Jobs"
            value={stats?.active_jobs?.toString() || '0'}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate('/requests')}
              disabled={!profile?.admin_verified}
            >
              <TrendingUp className="w-6 h-6" />
              <span>View Requests</span>
              {stats && stats.pending_requests > 0 && profile?.admin_verified && (
                <span className="text-xs text-primary font-semibold">
                  {stats.pending_requests} available
                </span>
              )}
            </Button>
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate('/bookings')}
              disabled={!profile?.admin_verified}
            >
              <Briefcase className="w-6 h-6" />
              <span>My Bookings</span>
              {stats && stats.active_jobs > 0 && profile?.admin_verified && (
                <span className="text-xs text-primary font-semibold">
                  {stats.active_jobs} active
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            {recentActivity.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Briefcase className="w-12 h-12 opacity-50" />
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">
                  {profile?.admin_verified
                    ? isAccepting
                      ? 'Accept your first job to see activity here'
                      : 'Turn on availability to start receiving job requests'
                    : 'Complete verification to start accepting jobs'}
                </p>
              </div>
            </Card>
          ) : (
            recentActivity.map((activity) => (
              <Card key={activity.booking_id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{activity.service_name}</h3>
                  <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.customer_name} • {activity.completed_at
                    ? formatDate(activity.completed_at)
                    : formatDate(activity.scheduled_date)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-primary font-semibold">
                    {formatCurrency(activity.total_amount)}
                  </span>
                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span>{activity.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;