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
      <h1 className="text-xl font-bold text-black mb-4 tracking-tight">EduLink</h1>
      
      {/* Reduced max-width from 340px to 300px */}
      <div className="w-full max-w-75 bg-white p-5 rounded-xl md:shadow-sm border-none md:border border-slate-100">
        
        <div className="flex justify-around mb-4 border-b border-slate-100 relative">
          <button className="pb-1.5 px-3 text-blue-600 font-bold text-xs border-b-2 border-blue-600 z-10 -mb-1px">
            Log in
          </button>
          <Link href="/sign-up" className="pb-1.5 px-3 text-slate-300 font-semibold text-xs hover:text-slate-400 transition-colors">
            Sign Up
          </Link>
        </div>

        {error && (
          <p className="mb-3 text-red-500 text-[9px] bg-red-50 p-1.5 rounded-md border border-red-100 text-center italic font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[9px] text-slate-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Email</label>
            <input
              type="email"
              className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-xs text-slate-900"
              placeholder="Email address"
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-slate-400 italic hover:text-blue-600 font-medium">
                forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all pr-8 text-xs text-slate-900"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Reduced py-5 to py-3 and text-sm to text-xs */}
          <Button type="submit" className="w-full py-3 h-auto bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-[0.98]">
            Log in
          </Button>

          <div id="clerk-captcha"></div>
        </form>

        <div className="mt-6 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          New here? <Link href="/sign-up" className="text-blue-600 hover:underline ml-1">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;