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
    if (password.length < 8) return setError("Password too short.");

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
        // This is the critical part for redirection
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Use window.location for a hard redirect if router.push fails
        window.location.href = "/dashboard"; 
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold mb-6">EduLink</motion.h1>
      
      <motion.div layout className="w-full max-w-85 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <AnimatePresence mode="wait">
          {!pendingVerification ? (
            <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
              <div className="flex justify-around mb-6 border-b text-sm font-bold">
                <Link href="/sign-in" className="pb-2 px-4 text-slate-300">Log in</Link>
                <button className="pb-2 px-4 text-blue-600 border-b-2 border-blue-600">Sign Up</button>
              </div>

              {error && <p className="mb-4 text-red-500 text-[10px] bg-red-50 p-2 rounded text-center italic">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 bg-slate-50 border rounded-xl text-sm"
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full p-2 bg-slate-50 border rounded-xl text-sm pr-9"
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
                  className="w-full p-2 bg-slate-50 border rounded-xl text-sm"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 rounded-xl font-bold text-sm">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign up"}
                </Button>
                <div id="clerk-captcha"></div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} className="text-center">
              <h2 className="text-lg font-bold mb-4">Verify Email</h2>
              <form onSubmit={onPressVerify}>
                <input
                  value={code}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full p-2 bg-slate-50 border rounded-xl text-center text-xl tracking-widest font-bold mb-4"
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <Button disabled={isLoading} type="submit" className="w-full py-5 bg-blue-600 rounded-xl font-bold">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Verify & Log In"}
                </Button>
              </form>
              {error && <p className="mt-2 text-red-500 text-xs italic">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignUpPage;