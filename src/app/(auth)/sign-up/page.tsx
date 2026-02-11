"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [fullName, setFullName] = useState(""); // New State
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState(""); 
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isLoaded) return null;

  const validatePassword = (pass: string) => {
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasNumber && hasSpecial && isLongEnough;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setError("");

    if (!validatePassword(password)) {
      return setError("Password does not meet requirements.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      // Added firstName and lastName split logic for Clerk
      const nameParts = fullName.split(" ");
      await signUp.create({ 
        emailAddress, 
        password,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") 
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Check your details and try again.");
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isLoaded || !signUp) return;

  try {
    const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

    if (completeSignUp.status === "complete") {
      // This MUST be awaited. It tells Clerk: "The user is valid, create them now."
      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/");
      router.refresh(); 
    }
  } catch (err: any) {
    // If you see "Already Verified", it means a ghost session exists. 
    // Just force a redirect to home to see if the session sticks.
    if (err.errors?.[0]?.code === "signup_already_verified") {
      router.push("/");
      return;
    }
    setError(err.errors?.[0]?.longMessage || "Invalid code.");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-white md:bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-90 bg-white p-6 rounded-2xl md:shadow-sm border-none md:border border-slate-100">
        
        {!pendingVerification && (
          <div className="flex justify-around mb-6 border-b border-slate-100">
            <Link href="/sign-in" className="pb-2 px-4 text-slate-400 font-semibold text-sm">
              Log in
            </Link>
            <button className="pb-2 px-4 text-blue-700 font-bold text-sm border-b-2 border-blue-700">
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <p className="mb-4 text-red-500 text-[10px] bg-red-50 p-2 rounded border border-red-100 text-center italic font-medium">
            {error}
          </p>
        )}

        {!pendingVerification ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name Input */}
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block ml-1 font-semibold">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block ml-1 font-semibold">Your Email</label>
              <input
                type="email"
                className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block ml-1 font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              <div className="mt-1.5 space-y-0.5 ml-1">
                <p className={`flex items-center text-[9px] ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                   {password.length >= 8 ? <Check size={8} className="mr-1" /> : <X size={8} className="mr-1" />} 8+ characters
                </p>
                <p className={`flex items-center text-[9px] ${/\d/.test(password) && /[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                   {/\d/.test(password) && /[!@#$%^&*]/.test(password) ? <Check size={8} className="mr-1" /> : <X size={8} className="mr-1" />} Number & Symbol
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block ml-1 font-semibold">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md shadow-blue-100 mt-2 transition-all">
              Sign up
            </Button>
            
            <div id="clerk-captcha"></div>
          </form>
        ) : (
          <form onSubmit={onPressVerify} className="space-y-4 text-center">
            <h2 className="text-lg font-bold text-slate-800">Verify Email</h2>
            <p className="text-xs text-slate-500 italic">Enter code sent to {emailAddress}</p>
            <input
              value={code}
              placeholder="000000"
              className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-center text-xl tracking-[0.5em] font-bold outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md transition-all">
              Verify Code
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;