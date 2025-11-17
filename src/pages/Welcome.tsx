import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-provider.jpg';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-primary/85" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <h1 className="text-5xl font-bold text-white mb-3">
          Mspaces Pro
        </h1>
        <p className="text-xl text-white/90 mb-12">
          Grow Your Service Business
        </p>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg h-14"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white/20 text-white border-white/40 hover:bg-white/30 font-semibold text-lg h-14"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </Button>
          <button
            className="text-white/80 hover:text-white text-sm underline mt-4"
            onClick={() => navigate('/home')}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
