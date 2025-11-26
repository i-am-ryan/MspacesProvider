import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

import marianImg from "@/assets/marian-florinel-condruz-C-oYJoIfgCs-unsplash.jpg";
import emmanuelImg from "@/assets/emmanuel-ikwuegbu-zWOgsj3j0wA-unsplash.jpg";
import jimmyImg from "@/assets/jimmy-nilsson-masth-o4V23A3NSXo-unsplash.jpg";
import calebImg from "@/assets/caleb-woods--Ifr1HGFeW8-unsplash.jpg";
import callumImg from "@/assets/callum-hill-f1UwaROA2UQ-unsplash.jpg";

const ProviderSignIn = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [marianImg, emmanuelImg, jimmyImg, calebImg, callumImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Images */}
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
            <h1 className="text-3xl lg:text-5xl font-bold mb-2 lg:mb-4">Welcome Back</h1>
            <p className="text-base lg:text-xl text-white/90">
              Sign in to continue growing your business
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 bg-background flex flex-col">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="ml-3 font-semibold text-lg">Provider Sign In</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md">
            <SignIn
              signUpUrl="/signup"
              redirectUrl="/home"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none w-full border-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border-input hover:bg-accent h-12 text-base",
                  socialButtonsIconButton: "border-input hover:bg-accent",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 normal-case",
                  footerActionLink: "text-primary hover:text-primary/80",
                  formFieldInput: "hidden", // Hide email/password inputs
                  formFieldLabel: "hidden", // Hide labels
                  dividerLine: "hidden", // Hide divider
                  dividerText: "hidden", // Hide "or" text
                  identityPreviewEditButton: "text-primary",
                  formFieldInputShowPasswordButton: "hidden",
                  formFieldRow: "hidden",
                  form: "hidden", // Hide the entire email/password form
                },
                variables: {
                  colorPrimary: "#5EBFB3",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignIn;