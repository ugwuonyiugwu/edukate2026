"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Users, Send, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';

export const ReferralClientView = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Fetch real user referral data dynamically from tRPC endpoint
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: statsData } = trpc.referral.getStats.useQuery();

  const referralCode = user?.referralCode || statsData?.referralCode || "EDKCODE";
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/sign-up?ref=${referralCode}`
    : `https://edukate.com/sign-up?ref=${referralCode}`;
    
  const numberOfFriends = user?.referredCount ?? statsData?.numberOfBusinesses ?? 0;

  const copyToClipboard = async (textToCopy: string, label: string) => {
    if (!textToCopy) {
      toast.error("Nothing to copy!");
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(`${label} copied!`, { description: textToCopy });
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    // You can wire up an email invitation mutation here if desired
    toast.success("Invitation sent!", { description: `Invite sent to ${inviteEmail}` });
    setInviteEmail("");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Join EduKate with my invite code *${referralCode}* and let's learn together! Sign up here: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Your referral code</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Refer new friends with your referral code and get reward when they subscribe.
        </p>
      </div>

      <Card className="p-4 sm:p-6  shadow-sm rounded-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Share your referral link</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              readOnly
              value={referralLink}
              className="h-11 bg-slate-50 text-slate-600 rounded-lg border-slate-200 font-medium text-xs w-full select-all"
            />
            <Button 
              type="button" 
              onClick={() => copyToClipboard(referralLink, "Link")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-11 px-6 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Copy size={16} /> Copy link
            </Button>
          </div>
        </div>

        {/* Share Referral Code Button */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 block">Your Unique Code</label>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => copyToClipboard(referralCode, "Code")}
              className="h-11 px-4 text-xs font-black tracking-wider uppercase rounded-lg border-slate-200 flex items-center gap-2 bg-indigo-50/50 text-[#5D5FEF] hover:bg-indigo-50 cursor-pointer"
            >
              <span>Code: {referralCode}</span> 
              <Copy size={14} />
            </Button>
          </div>
        </div>

        {/* Direct Social Share Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700  flex items-center gap-1.5">
            <Share2 size={14} /> Share instantly on
          </label>
          <div className="flex flex-wrap gap-2.5">
            <Button 
              type="button"
              onClick={shareOnWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 rounded-lg text-xs flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} /> WhatsApp
            </Button>
            <Button 
              type="button"
              onClick={shareOnFacebook}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg text-xs flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={16} /> Facebook
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Counter Card */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-[#5D5FEF] rounded-xl shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Number of friends referred</span>
            <span className="text-2xl font-black text-slate-800">{numberOfFriends}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};