"use client";

import { Book } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoadingSpinner({ size = "medium", text = "Loading..." }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const sizes = {
    small: { icon: "h-6 w-6", container: "text-sm", spinnerSize: "h-10 w-10" },
    medium: { icon: "h-12 w-12", container: "text-base", spinnerSize: "h-16 w-16" },
    large: { icon: "h-16 w-16", container: "text-lg", spinnerSize: "h-24 w-24" }
  };

  const sizeClass = sizes[size] || sizes.medium;

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClass.container}`}>
        <div className={`${sizeClass.spinnerSize} rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin absolute`}></div>
    </div>
  );
} 