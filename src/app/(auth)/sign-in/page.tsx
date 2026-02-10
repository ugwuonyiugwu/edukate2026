"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion"; // Ensure you've run 'npm install framer-motion'

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for button deactivation
  const router = useRouter();

  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || isLoading) return; // Prevent clicking while loading
    
    setError("");
    setIsLoading(true); // Deactivate the button immediately

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid email or password.");
    } finally {
      setIsLoading(false); // Re-enable if login fails
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      {/* Header Transition */}
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-black mb-6 tracking-tight"
      >
        EduLink
      </motion.h1>
      
      {/* Card Transition */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-85 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        {/* Compact Tabs */}
        <div className="flex justify-around mb-6 border-b border-slate-100 relative">
          <button className="pb-2 px-4 text-blue-600 font-bold text-sm border-b-2 border-blue-600 z-10 -mb-1px">
            Log in
          </button>
          <Link href="/sign-up" className="pb-2 px-4 text-slate-300 font-semibold text-sm hover:text-slate-400 transition-colors">
            Sign Up
          </Link>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 text-red-500 text-[10px] bg-red-50 p-2 rounded-lg border border-red-100 text-center italic font-medium"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Email</label>
            <input
              type="email"
              disabled={isLoading}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-sm text-slate-900 disabled:opacity-70"
              placeholder="Email address"
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-slate-400 italic hover:text-blue-600 font-medium">
                forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 transition-all pr-10 text-sm text-slate-900 disabled:opacity-70"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Animated Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading} // Prevents multiple resending
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Log in"
            )}
          </Button>

          <div id="clerk-captcha"></div>
        </form>

        <div className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          New here? <Link href="/sign-up" className="text-blue-600 hover:underline ml-1">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;