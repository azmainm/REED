"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./auth-context";
import { useToast } from "./toast";

export default function SignInModal({ isOpen, onClose }) {
  const { signInWithGoogle, loading } = useAuth();
  const { showToast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithGoogle();
      
      if (result.success) {
        showToast(`Welcome ${result.user.displayName}!`, "success");
        onClose();
      } else {
        showToast("Sign-in failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      showToast("An error occurred during sign-in.", "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card/90 backdrop-blur-md rounded-lg border border-border shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1 hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Welcome to Reed</h2>
            <p className="text-muted-foreground">
              Sign in to continue your learning journey
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
              )}
              {isSigningIn ? "Signing in..." : "Continue with Google"}
            </button>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 