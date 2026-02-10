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
  const [confirmPassword, setConfirmPassword] = useState(""); // Re-added state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(""); 
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isLoaded) return null;

  const validatePassword = (pass: string) => {
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasNumber && hasSpecial && pass.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || isLoading) return;
    
    setError("");

    if (!validatePassword(password)) {
      return setError("Password needs 8+ chars, a number, and a symbol.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true); // Deactivate button
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-black mb-6 tracking-tight"
      >
        EduLink
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-85 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!pendingVerification ? (
            <motion.div key="form" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="flex justify-around mb-6 border-b border-slate-100 text-sm font-bold">
                <Link href="/sign-in" className="pb-2 px-4 text-slate-300">Log in</Link>
                <button className="pb-2 px-4 text-blue-600 border-b-2 border-blue-600 -mb-1px">Sign Up</button>
              </div>

              {error && <p className="mb-4 text-red-500 text-[9px] bg-red-50 p-2 rounded text-center italic">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-bold uppercase tracking-wider ml-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm transition-all focus:bg-white"
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-bold uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm pr-9"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Real-time mini checklist */}
                  <div className="mt-1 flex gap-3 ml-1">
                    <p className={`flex items-center text-[8px] ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                       {password.length >= 8 ? <Check size={8} /> : <X size={8} />} 8+ chars
                    </p>
                    <p className={`flex items-center text-[8px] ${/\d/.test(password) && /[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                       {/\d/.test(password) && /[!@#$%^&*]/.test(password) ? <Check size={8} /> : <X size={8} />} Mixed
                    </p>
                  </div>
                </div>

                {/* Confirm Password - Re-added and compact */}
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block font-bold uppercase tracking-wider ml-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} // Prevents "multiple resending"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all mt-2"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign up"}
                </Button>
                <div id="clerk-captcha"></div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Verify Email</h2>
              <input
                value={code} maxLength={6}
                className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-center text-xl tracking-[0.4em] font-bold mb-4"
                onChange={(e) => setCode(e.target.value)}
              />
              <Button disabled={isLoading} className="w-full py-5 bg-blue-600 rounded-xl font-bold text-sm">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Verify Code"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignUpPage;