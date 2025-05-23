"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Home, LayoutDashboard, User, LogOut, Plus, Trophy, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-context";
import AvatarSelectionModal from "@/components/avatar-selection-modal";
import Navbar from "@/components/navbar-auth";
import { wakeUpBackend } from '@/lib/api-service';
import { withAuth } from '@/components/withAuth';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { theme } = useTheme();
  const { user, logOut, updateAvatarId } = useAuth();
  const pathname = usePathname();

  // Check if user needs to select an avatar
  useEffect(() => {
    if (user && user.email && (user.avatar_id === null || user.hasSelectedAvatar === false)) {
      setShowAvatarModal(true);
    }
  }, [user]);

  const toggleSidebar = (value) => {
    // Always toggle sidebar regardless of screen size
    if (typeof value === 'boolean') {
      setIsSidebarOpen(value);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Check if the current path matches a navigation item
  const isActive = (path) => {
    if (path === '/dashboard' && (pathname === '/dashboard' || pathname === '/dashboard/')) {
      return true;
    }
    if (path === '/' && pathname === '/') {
      return true;
    }
    if (path !== '/' && path !== '/dashboard' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Close sidebar when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when navigating on mobile
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle avatar selection
  const handleAvatarModalClose = (selectedAvatarId) => {
    setShowAvatarModal(false);
    
    // If user has selected an avatar, update the user context
    if (selectedAvatarId) {
    }
  };

  // Handle the Create button click
  const handleCreateClick = () => {
    // Wake up the backend before navigating to the create page
    wakeUpBackend().catch(error => {
      console.error('Failed to wake up backend:', error);
    });
    
    // Continue with navigation
    handleNavigation();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className={`fixed inset-y-0 left-0 z-20 mt-16 w-64 flex-col border-r border-border bg-background transition-all duration-300 ease-in-out md:flex ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-1 flex-col p-4">
            {/* Create Button */}
            <Link
              href="/dashboard/create"
              className="mb-6 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 text-sm font-medium text-white shadow-md hover:opacity-90 transition-colors"
              onClick={handleCreateClick}
            >
              <Plus className="mr-2 h-5 w-5" />
              CREATE
            </Link>
            
            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              <Link
                href="/"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/leaderboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/leaderboard') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Leaderboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <Link
                href="/dashboard/feedback"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/feedback') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Feedback
              </Link>
              {/* <button
                onClick={logOut}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button> */}
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden" 
            onClick={() => toggleSidebar(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-20 mt-16 w-64 flex-col border-r border-border bg-background transition-all duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-1 flex-col p-4">
            {/* Create Button */}
            <Link
              href="/dashboard/create"
              className="mb-6 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 text-sm font-medium text-white shadow-md hover:opacity-90 transition-colors"
              onClick={handleCreateClick}
            >
              <Plus className="mr-2 h-5 w-5" />
              CREATE
            </Link>
            
            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              <Link
                href="/"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/leaderboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/leaderboard') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Leaderboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <Link
                href="/dashboard/feedback"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/feedback') ? 'bg-primary/10 text-primary' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                onClick={handleNavigation}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Feedback
              </Link>
              
              {/* <button
                onClick={logOut}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button> */}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:ml-64 pt-20 flex justify-center">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Avatar Selection Modal for First-time Users */}
      {showAvatarModal && user && (
        <AvatarSelectionModal
          isOpen={showAvatarModal}
          onClose={handleAvatarModalClose}
          currentAvatarId={user.avatar_id}
          isFirstTime={true}
        />
      )}
    </div>
  );
}

// Wrap the layout with the auth protection
export default withAuth(DashboardLayout); 