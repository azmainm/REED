"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <div className="text-sm">
              {isSignUp ? (
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline"
                >
                  Already have an account?
                </button>
              ) : (
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline"
                >
                  Don't have an account?
                </button>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>
          
          <button 
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>
          
          <form className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              {isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 