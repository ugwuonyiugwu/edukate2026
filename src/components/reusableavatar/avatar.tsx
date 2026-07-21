'use client';

import Image from "next/image";

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({ 
  imageUrl, 
  name, 
  size = 40, 
  className = "", 
  onClick 
}: UserAvatarProps) => {
  // FIX: Force name to be a string. If it's an object/{} or null, fallback to "User"
  const safeName = (typeof name === "string" && name.trim().length > 0) 
    ? name 
    : "User";

  // Generate initials (Max 2 characters to keep it clean)
  const initials = safeName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const fontSize = size / 2.5;

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm transition-all bg-slate-100 ${
        onClick ? "cursor-pointer active:scale-95 hover:opacity-90" : ""
      } ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        minWidth: `${size}px` 
      }}
    >
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={safeName} 
          fill 
          sizes={`${size}px`} 
          className="object-cover"
          priority={size > 100}
        />
      ) : (
        <Image 
          src="/profile-default.jpg"
          alt={safeName} 
          fill 
          sizes={`${size}px`} 
          className="object-cover"
          priority={size > 100} 
        />
      )}
      
      {/* Overlay for editable state */}
      {className.includes("editable") && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
           <span className="text-white text-[10px] font-bold tracking-widest">EDIT</span>
        </div>
      )}
    </div>
  );
};