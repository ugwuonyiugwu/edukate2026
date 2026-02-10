"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(""); 
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || isLoading) return;
    
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    
    setIsLoading(true);
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Sign up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || isLoading) return;
    
    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      
      if (completeSignUp.status === "complete") {
        // This 'setActive' call is essential to prevent the 422 error
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Use window.location for a hard redirect to ensure the session is picked up
        window.location.assign("/dashboard"); 
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-black mb-6 tracking-tight">
        EduLink
      </motion.h1>
      
      <motion.div layout className="w-full max-w-85 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <AnimatePresence mode="wait">
          {!pendingVerification ? (
            <motion.div key="form" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="flex justify-around mb-6 border-b border-slate-100 text-sm font-bold">
                <Link href="/sign-in" className="pb-2 px-4 text-slate-300">Log in</Link>
                <button className="pb-2 px-4 text-blue-600 border-b-2 border-blue-600 -mb-1px">Sign Up</button>
              </div>

              {error && <p className="mb-4 text-red-500 text-[10px] bg-red-50 p-2 rounded text-center italic">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm pr-9"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-sm"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign up"}
                </Button>
                <div id="clerk-captcha"></div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Verify Email</h2>
              <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-wider">Check your inbox for the code</p>
              
              <form onSubmit={onPressVerify} className="space-y-4">
                <input
                  value={code}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-center text-xl tracking-[0.4em] font-bold"
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <Button disabled={isLoading} type="submit" className="w-full py-5 bg-blue-600 rounded-xl font-bold text-sm">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Verify Code"}
                </Button>
              </form>
              {error && <p className="mt-4 text-red-500 text-xs italic">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignUpPage;