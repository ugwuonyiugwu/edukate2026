"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Eye, EyeOff, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";


interface ClerkError {
  errors: Array<{
    message: string;
    code?: string;
  }>;
}

const ForgotPasswordPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCodeSent, setIsCodeSent] = React.useState(false);

  // Timer States
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isLoaded || countdown > 0) return;

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsCodeSent(true);
      setCountdown(60);
      toast.success("Code sent successfully!");
    } catch (err) {
        const clerkError = err as ClerkError;
        
        toast.error("Error", {
        description: clerkError.errors?.[0]?.message || "Account not found",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password Updated!");
        router.push("/dashboard");
      }
    } catch (err) {
        const clerkError = err as ClerkError;
        
        toast.error("Registration Failed", {
        description: clerkError.errors?.[0]?.message || "Something went wrong",
      });
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/40 px-4">
      {/* Responsive width for larger screens */}
      <Card className="w-full max-w-100 md:max-w-112.5 lg:max-w-100 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden transition-all duration-500">
        <CardContent className="p-8 md:p-12">
          
          <Link href="/sign-in" className="inline-flex items-center text-slate-400 hover:text-blue-600 text-sm font-medium mb-8 transition-all group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Login
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {isCodeSent ? "Verify Email" : "Reset Password"}
            </h2>
            <div className="flex items-center gap-2 mt-3">
               {isCodeSent && <CheckCircle2 size={16} className="text-green-500" />}
               <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                {isCodeSent 
                  ? `Enter the code sent to ${email.split('@')[0]}***@***.com` 
                  : "Enter your email to receive a password reset code."}
              </p>
            </div>
          </div>

          {!isCodeSent ? (
            // STEP 1: Email Input only
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-xs ml-1 uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                  <Input 
                    className="bg-slate-50 border-slate-200 h-14 rounded-2xl pl-12 text-lg focus:ring-2 focus:ring-blue-500/10 transition-all"
                    type="email" 
                    placeholder="name@example.com"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <Button disabled={isLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            // STEP 2: Code and New Password (Email input is removed)
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <Label className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Verification Code</Label>
                  <button 
                    type="button" 
                    disabled={countdown > 0 || isLoading}
                    onClick={() => handleRequestCode()}
                    className="text-xs font-bold text-blue-600 disabled:text-slate-400 flex items-center gap-1 hover:underline transition-all"
                  >
                    <RotateCcw size={12} className={isLoading ? "animate-spin" : ""} />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                  </button>
                </div>
                <Input 
                  className="bg-slate-50 border-slate-200 h-16 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-blue-500 transition-all shadow-inner"
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  required 
                  onChange={(e) => setCode(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-xs ml-1 uppercase tracking-widest">New Password</Label>
                <div className="relative">
                  <Input 
                    className="bg-slate-50 border-slate-200 h-14 rounded-2xl pr-12 text-lg"
                    type={showPw ? "text" : "password"} 
                    placeholder="Min. 6 characters"
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button disabled={isLoading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
                {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;