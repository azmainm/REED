/**
 * Authentication-aware Navigation Bar Component
 * 
 * Displays a responsive navigation bar with authentication-related functionality,
 * including user profile dropdown menu and theme toggle.
 * 
 * @component
 */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import AvatarDisplay from "./avatar-display";

/**
 * NavbarAuth component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.toggleSidebar - Function to toggle sidebar visibility on mobile
 * @returns {JSX.Element} Rendered component
 */
export default function NavbarAuth({ toggleSidebar }) {
  const { theme, setTheme } = useTheme();
  const { user, logOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Handles navigation actions, closing menus and sidebar as needed
   */
  const handleNavigation = () => {
    // Close any open menus when navigating
    setIsDropdownOpen(false);
    if (toggleSidebar) {
      // If on mobile, also close the sidebar
      toggleSidebar(false);
    }
  };

  /**
   * Determine what to display in the profile button based on available user data
   * @returns {JSX.Element} The appropriate profile image element
   */
  const renderProfileImage = () => {
    if (user?.profilePicture && !imageError) {
      // Display profile picture if available and not errored
      return (
        <img 
          src={user.profilePicture} 
          alt={user.name || "User"} 
          className="h-8 w-8 rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    } else if (user?.avatar_id) {
      // Display avatar if available
      return (
        <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10">
          <AvatarDisplay avatarId={user.avatar_id} size="small" />
        </div>
      );
    } else if (user?.name) {
      // Display user initials if name is available
      const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();
      return (
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{initials}</span>
        </div>
      );
    } else {
      // Fallback to user icon
      return (
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      );
    }
  };

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profilePicture]);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6">
        {/* Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSidebar()}
            className="md:hidden flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={handleNavigation}>
            <span className="text-xl font-bold gradient-text">Reed</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
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
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {renderProfileImage()}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg">
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={handleNavigation}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  
                  <div className="h-px bg-border my-1" />
                  <button
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 