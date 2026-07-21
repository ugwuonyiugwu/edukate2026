// components/loading-spinner.tsx
import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex h-96 w-full items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        {/* Spiral Gradient Spinner */}
        <div 
          className="absolute h-20 w-20 animate-spin rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #2563eb 0deg, transparent 300deg)"
          }}
        />
        <div className="absolute h-16 w-16 rounded-full bg-background" />

        {/* Logo */}
        <Image 
          src="/logo.png" 
          alt="Loading" 
          width={40} 
          height={40} 
          priority 
          className="relative z-10"
        />
      </div>
    </div>
  );
}