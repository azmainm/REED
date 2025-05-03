"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Home, LayoutDashboard, User, LogOut, Plus } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-context";
import Navbar from "@/components/navbar-auth";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { logOut } = useAuth();
  const pathname = usePathname();

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
              onClick={handleNavigation}
            >
              <Plus className="mr-2 h-5 w-5" />
              CREATE
            </Link>
            
            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                onClick={handleNavigation}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                onClick={handleNavigation}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={logOut}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
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
              onClick={handleNavigation}
            >
              <Plus className="mr-2 h-5 w-5" />
              CREATE
            </Link>
            
            {/* Menu Items */}
            <nav className="flex-1 space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                onClick={handleNavigation}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                onClick={handleNavigation}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              
              <button
                onClick={logOut}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:ml-64 pt-20 flex justify-center">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
} 