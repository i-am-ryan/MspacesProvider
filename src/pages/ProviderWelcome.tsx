import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, DollarSign, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ProviderWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="font-bold text-xl">Mspaces Pro</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/provider/signin')}
        >
          Sign In
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Grow Your Business
            <br />
            <span className="text-primary">Get More Clients</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Join South Africa's leading service marketplace and connect with customers who need your expertise
          </p>
          
          <Button 
            size="lg" 
            className="w-full max-w-sm h-12 text-lg"
            onClick={() => navigate('/provider/signup')}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-3">
            No credit card required • Set up in minutes
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <Card className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Earn More Money</h3>
              <p className="text-sm text-muted-foreground">
                Set your own rates and get paid quickly for every job you complete
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Flexible Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Work when you want. Accept jobs that fit your availability
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Build Your Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Get reviews and ratings that help you attract more customers
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Verified Customers</h3>
              <p className="text-sm text-muted-foreground">
                Work with real, verified customers in your area
              </p>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground">Active Providers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">10k+</p>
            <p className="text-sm text-muted-foreground">Jobs Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">4.8★</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="font-bold text-xl mb-4 text-center">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold">Sign Up & Get Verified</h3>
                <p className="text-sm text-muted-foreground">Create your profile and upload your credentials</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold">Browse Service Requests</h3>
                <p className="text-sm text-muted-foreground">See jobs in your area and send quotes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold">Complete Jobs & Get Paid</h3>
                <p className="text-sm text-muted-foreground">Do the work and receive payment directly</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            className="w-full h-12"
            onClick={() => navigate('/provider/signup')}
          >
            Start Earning Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Already have an account?{' '}
            <button 
              className="text-primary font-medium"
              onClick={() => navigate('/provider/signin')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderWelcome;