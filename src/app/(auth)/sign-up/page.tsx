"use client";

import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner"; // Import from sonner
import Link from "next/link";

interface ClerkError {
  errors: Array<{
    message: string;
    code?: string;
  }>;
}

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirmPw, setShowConfirmPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const validatePassword = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasLetter && hasNumber && hasSpecial && pass.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (!validatePassword(password)) {
      return toast.error("Weak Password", {
        description: "Must include letters, numbers, and symbols (min 6 chars)."
      });
    }

    setIsLoading(true);
    try {
      const result = await signUp.create({ emailAddress: email, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created!", { description: "Welcome to EDUKATE2026." });
        router.push("/dashboard");
      }
      } catch (err) {
        const clerkError = err as ClerkError;
        
        toast.error("Registration Failed", {
        description: clerkError.errors?.[0]?.message || "Something went wrong",
      });
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50/50 px-4">
      {/* Added a subtle shadow and soft border for a premium feel */}
      <Card className="w-full max-w-110 border border-slate-200 shadow-[0_20px_50px_rgba(8,112,184,0.07)] rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-10">
          
          <div className="flex justify-center gap-12 mb-10 border-b border-slate-100">
            <Link href="/sign-in" className="pb-4 text-2xl font-bold text-slate-300 hover:text-slate-400 transition-all">
              Log in
            </Link>
            <button type="button" className="pb-4 text-2xl font-bold text-blue-600 border-b-4 border-blue-600">
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Your Email</Label>
              <Input 
                className="bg-slate-50/50 border-slate-200 h-12 rounded-xl focus:ring-2 focus:ring-blue-500/10"
                type="email" 
                placeholder="name@example.com"
                required 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Password</Label>
              <div className="relative">
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pr-12"
                  type={showPw ? "text" : "password"} 
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 font-medium text-sm ml-1">Confirm Password</Label>
              <div className="relative">
                <Input 
                  className="bg-slate-50/50 border-slate-200 h-12 rounded-xl pr-12"
                  type={showConfirmPw ? "text" : "password"} 
                  required 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-3 text-slate-400 hover:text-blue-600 transition-colors">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div id="clerk-captcha"/>
            <Button 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 mt-4 active:scale-95 transition-transform"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpPage;


