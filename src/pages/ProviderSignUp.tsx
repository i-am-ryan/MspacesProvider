import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import marianImg from "@/assets/marian-florinel-condruz-C-oYJoIfgCs-unsplash.jpg";
import emmanuelImg from "@/assets/emmanuel-ikwuegbu-zWOgsj3j0wA-unsplash.jpg";
import jimmyImg from "@/assets/jimmy-nilsson-masth-o4V23A3NSXo-unsplash.jpg";
import calebImg from "@/assets/caleb-woods--Ifr1HGFeW8-unsplash.jpg";
import callumImg from "@/assets/callum-hill-f1UwaROA2UQ-unsplash.jpg";

const ProviderSignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user } = useUser();
  const hasAttemptedCreation = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [marianImg, emmanuelImg, jimmyImg, calebImg, callumImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const createProviderProfile = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        return;
      }

      if (hasAttemptedCreation.current) {
        return;
      }

      hasAttemptedCreation.current = true;
      setIsCreating(true);

      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id, user_type')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingProfile) {
          if (existingProfile.user_type === 'customer') {
            toast({
              title: "Account Error",
              description: "This email is registered as a customer. Please use a different email.",
              variant: "destructive",
            });
            setIsCreating(false);
            hasAttemptedCreation.current = false;
            return;
          }
          
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('profile_id', existingProfile.id)
            .maybeSingle();

          if (adminData) {
            navigate('/admin', { replace: true });
            return;
          }
          
          navigate('/home', { replace: true });
          return;
        }

        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || user.firstName || '',
            phone_number: user.primaryPhoneNumber?.phoneNumber || null,
            user_type: 'provider',
          })
          .select()
          .single();

        if (profileError) throw profileError;

        const { data: adminCheck } = await supabase
          .from('admin_users')
          .select('id')
          .eq('profile_id', newProfile.id)
          .maybeSingle();

        if (adminCheck) {
          toast({
            title: "Welcome Admin! 🎉",
            description: "Your admin account is ready.",
          });
          
          setTimeout(() => navigate('/admin', { replace: true }), 1000);
          return;
        }

        const { data: providerProfile, error: providerError } = await supabase
          .from('provider_profiles')
          .insert({
            profile_id: newProfile.id,
            is_verified: false,
            is_available: false,
            admin_verified: false,
            is_accepting_jobs: false,
            verification_level: 0,
            service_radius_km: 25,
            average_rating: 0,
            total_reviews: 0,
            total_jobs_completed: 0,
          })
          .select()
          .single();

        if (providerError) throw providerError;

        await supabase
          .from('provider_verification_checklist')
          .insert({ provider_id: providerProfile.id });

        toast({
          title: "Welcome to Mspaces Pro! 🎉",
          description: "Your provider account has been created successfully.",
        });

        setTimeout(() => navigate('/home', { replace: true }), 1000);

      } catch (error: any) {
        console.error("Profile creation error:", error);
        toast({
          title: "Setup Error",
          description: error.message || "Failed to complete profile setup.",
          variant: "destructive",
        });
        setIsCreating(false);
        hasAttemptedCreation.current = false;
      }
    };

    createProviderProfile();
  }, [isLoaded, isSignedIn, user, navigate, toast]);

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base lg:text-lg font-medium">Setting up your account...</p>
          <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={img} 
              alt="Service provider" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/60" />
          </div>
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 lg:p-12 z-10">
          <div className="text-center text-white">
            <h1 className="text-3xl lg:text-5xl font-bold mb-2 lg:mb-4">Join Mspaces Pro</h1>
            <p className="text-base lg:text-xl text-white/90">
              Grow your business with South Africa's trusted service platform
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-background">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="ml-3 font-semibold text-lg">Sign Up</span>
        </div>

        <div className="p-4 lg:p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-73px)]">
          <div className="w-full">
            <SignUp
              signInUrl="/signin"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none w-full border-0 p-0",
                  footer: "hidden",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-white transition-colors",
                  socialButtonsBlockButton: "border-primary/20 hover:bg-primary/5 transition-colors",
                  formFieldInput: "border-primary/20 focus:border-primary focus:ring-primary",
                  footerActionLink: "text-primary hover:text-primary/80 transition-colors",
                  headerTitle: "text-xl lg:text-2xl",
                  headerSubtitle: "text-sm lg:text-base",
                  formFieldLabel: "text-sm",
                },
                variables: {
                  colorPrimary: "#5EBFB3",
                  fontSize: "14px",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignUp;