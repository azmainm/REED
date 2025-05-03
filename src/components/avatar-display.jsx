"use client";

import { useState, useEffect } from "react";
import boyAvatar from "@/assets/avatars/boy.png";
import girlAvatar from "@/assets/avatars/girl.png";
import manAvatar from "@/assets/avatars/man.png";
import womanAvatar from "@/assets/avatars/woman.png";

const avatarMap = {
  boy: boyAvatar,
  girl: girlAvatar,
  man: manAvatar,
  woman: womanAvatar
};

export default function AvatarDisplay({ avatarId, size = "medium", className = "" }) {
  const [avatarSrc, setAvatarSrc] = useState(null);

  useEffect(() => {
    if (avatarId && avatarMap[avatarId]) {
      setAvatarSrc(avatarMap[avatarId].src);
    }
  }, [avatarId]);

  if (!avatarId || !avatarSrc) {
    return null;
  }

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
    'extra-large': "w-48 h-48 md:w-64 md:h-64"
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`${sizeClass} ${className}`}>
      <img
        src={avatarSrc}
        alt={`${avatarId} avatar`}
        className="w-full h-full object-contain"
      />
    </div>
  );
} 