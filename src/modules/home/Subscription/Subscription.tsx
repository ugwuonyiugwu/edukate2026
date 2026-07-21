"use client";

import React, { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { trpc } from "@/trpc/client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, ShieldCheck, Zap, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/components/Logospinal';

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000];

export function SubscriptionCheckoutCard() {
  const [amount, setAmount] = useState<number>(2000);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [showSuccessBloom, setShowSuccessBloom] = useState<boolean>(false);
  const [addedPointsResult, setAddedPointsResult] = useState<number>(0);
  const utils = trpc.useUtils();

  const { data: user, isLoading: isUserLoading } = trpc.users.getOne.useQuery();

  const verifyMutation = trpc.subscription.verifyAndFulfill.useMutation({
    onSuccess: (data) => {
      setAddedPointsResult(data.addedPoints);
      setShowSuccessBloom(true); // Trigger flower bloom success animation overlay
      toast.success("Subscription successful!", {
        description: `Successfully added ${data.addedPoints} Pts to your account.`,
      });
      utils.users.getOne.invalidate();
    },
    onError: (err) => {
      toast.error("Payment Error", {
        description: err.message,
      });
    }
  });

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
    tx_ref: `sub-${Date.now()}`,
    amount: amount,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd,banktransfer",
    customer: {
      email: user?.email || "user@example.com",
      phone_number: user?.phoneNumber || "08000000000",
      name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || "Valued User",
    },
    customizations: {
      title: "EduKate Points Top-Up",
      description: `Top up balance with ₦${amount.toLocaleString()}`,
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-icon.jpg",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const startSubscription = () => {
    const currentPoints = user?.points ?? 0;
    
    // Enforce 5,000 maximum point ceiling per user balance client-side
    if (currentPoints + amount > 5000) {
      toast.error("Point Limit Exceeded", {
        description: `You currently have ${currentPoints} Pts. Adding ₦${amount.toLocaleString()} would exceed the maximum limit of 5,000 points.`,
      });
      return;
    }

    if (amount < 1000 || amount > 5000) {
      toast.error("Invalid Amount", {
        description: "Subscription amount must be between ₦1,000 and ₦5,000.",
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) {
      toast.error("Configuration Error", {
        description: "Public key is not defined.",
      });
      return;
    }

    handleFlutterPayment({
      callback: (response) => {
        closePaymentModal();
        if (response.transaction_id || response.status === "successful") {
          verifyMutation.mutate({ 
            transactionId: String(response.transaction_id || response.tx_ref),
            amount: amount 
          });
        } else {
          setIsAlertOpen(true);
        }
      },
      onClose: () => {
        setIsAlertOpen(true);
      },
    });
  };

  if (isUserLoading) {
    return (
      <div>
        <LoadingSpinner/>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white border-slate-200/80 shadow-lg rounded-sm overflow-hidden relative transition-all">
        {/* Flower Bloom Success Overlay Animation */}
        {showSuccessBloom && (
          <div className="absolute inset-0 bg-white/95 z-30 flex flex-col  items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center  justify-center mb-4">
              <div className="absolute w-24 h-24 bg-pink-100 rounded-full animate-ping opacity-75" />
              <div className="w-20 h-20 bg-linear-to-tr from-pink-500 to-rose-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-4xl">🌸</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Successfully Bloomed!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-55">
              +{addedPointsResult}  <span className="text-xl ">💎</span> successfully added to your vault.
            </p>
            <Button
              onClick={() => setShowSuccessBloom(false)}
              className="mt-6 bg-[#5D5FEF] hover:bg-indigo-700 text-white font-extrabold text-xs h-10 px-6 rounded-xl shadow-md cursor-pointer"
            >
              Continue Learning
            </Button>
          </div>
        )}

        <div className="absolute top-0 right-0 bg-linear-to-l from-[#5D5FEF] to-indigo-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm flex items-center gap-1.5 z-10 pointer-events-none">
          <Sparkles size={12} />
          Custom Top-Up
        </div>
        
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 relative">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50/80 rounded-sm text-[#5D5FEF] shadow-inner shrink-0">
              <Wallet size={28} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Choose Top-Up Value</h2>
              <p className="text-xs text-slate-400 mt-0.5">Top-up points instantly using secure gateway (Max limit: 5,000 Pts)</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Select Amount</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2.5 px-3 rounded-sm border text-xs sm:text-sm font-black transition-all ${
                    amount === val 
                      ? 'border-[#5D5FEF] bg-indigo-50/60 text-[#5D5FEF] shadow-sm ring-1 ring-[#5D5FEF]/20' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Or Enter Custom Amount (NGN)</label>
            <Input 
              type="number" 
              min={1000} 
              max={5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-12 text-base sm:text-lg font-black rounded-xl border-slate-200 focus-visible:ring-[#5D5FEF]"
            />
            <p className="text-[11px] text-slate-400 font-medium">Allowed range: ₦1,000 - ₦5,000 (Current balance: {user?.points ?? 0} Pts)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Payable</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">₦{amount.toLocaleString()}</div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">You Receive</span>
              <div className="text-xl sm:text-2xl font-black text-[#5D5FEF]">{amount}  <span className="text-2xl ">💎</span></div>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 pt-1">
            <li className="flex items-center gap-2.5 font-medium">
              <Zap size={16} className="text-amber-500 shrink-0" /> Instant point value allocation upon transaction success
            </li>
            <li className="flex items-center gap-2.5 font-medium">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" /> Balance capped safely at a maximum limit of 5,000 points
            </li>
          </ul>

          <Button 
            onClick={startSubscription}
            disabled={verifyMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold h-12 rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 z-20 relative cursor-pointer"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing Securely...
              </>
            ) : (
              `Pay ₦${amount.toLocaleString()}`
            )}
          </Button>
        </div>
      </Card>
    </>
  );
}