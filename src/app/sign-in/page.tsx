"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Safety check to prevent "possibly undefined" error
  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");

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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white md:bg-slate-50 p-4 font-sans">
      
      
      <div className="w-full max-w-85 bg-white p-6 rounded-2xl md:shadow-md border-none md:border border-slate-100">
        
        {/* Tabs - Smaller padding and text */}
        <div className="flex justify-around mb-6 border-b border-slate-100 relative">
          <button className="pb-2 px-4 text-blue-600 font-bold text-sm border-b-2 border-blue-600 z-10 -mb-1px">
            Log in
          </button>
          <Link href="/sign-up" className="pb-2 px-4 text-slate-300 font-semibold text-sm hover:text-slate-400 transition-colors">
            Sign Up
          </Link>
        </div>

        {error && (
          <p className="mb-4 text-red-500 text-[10px] bg-red-50 p-2 rounded-lg border border-red-100 text-center italic font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 mb-1 block ml-1 font-bold tracking-wider">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-xs text-slate-900"
              placeholder="Email address"
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="text-[10px] text-slate-400 font-bold  tracking-wider">Password</label>
             
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-10 text-xs text-slate-900"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

           <Link href="/forgot-password" className="text-[11px] text-slate-400 italic hover:text-blue-600 font-medium float-right">
                forgot password?
              </Link>

          <Button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
            Log in
          </Button>

          {/* Clerk Security Requirement */}
          <div id="clerk-captcha"></div>
        </form>

        <div className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          New here? <Link href="/sign-up" className="text-blue-600 hover:underline ml-1">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;