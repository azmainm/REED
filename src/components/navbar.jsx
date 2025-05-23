"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import SignInModal from "./sign-in-modal";
import { useRouter } from "next/navigation";
import reedLogo from "../assets/reed-logo.png";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const router = useRouter();

  // Close mobile menu when navigating
  const handleNavigation = () => {
    setIsMenuOpen(false);
  };

  // Navigate to dashboard if logged in
  const handleDashboardClick = () => {
    handleNavigation();
    router.push('/dashboard');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={reedLogo}
              alt="Reed Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold gradient-text">Reed</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={handleNavigation}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={handleNavigation}
            >
              Pricing
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            {/* Login Button or User Avatar */}
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={handleNavigation}
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            className="flex items-center justify-center rounded-md p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div 
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? "max-h-64 opacity-100" 
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="#features" 
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={handleNavigation}
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={handleNavigation}
              >
                Pricing
              </Link>
              
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={handleNavigation}
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSignInModalOpen(true);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-left"
                >
                  Login
                </button>
              )}
              
              <div className="flex items-center justify-between rounded-lg px-3 py-2">
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="ml-2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </>
  );
} 