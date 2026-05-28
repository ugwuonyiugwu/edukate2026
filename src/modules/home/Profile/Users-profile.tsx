'use client';

import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { MapPin, School, Trophy, ShieldCheck } from "lucide-react";

interface UserProfileViewProps {
  clerkId: string;
  viewerRole: string;
}

export function UserProfileView({ clerkId, viewerRole }: UserProfileViewProps) {
  const isAdminViewer = viewerRole === 'admin';
  
  const adminQuery = trpc.users.getByIdAdmin.useQuery({ clerkId }, { enabled: isAdminViewer });
  const publicQuery = trpc.users.getPublicProfile.useQuery({ clerkId }, { enabled: !isAdminViewer });

  const user = isAdminViewer ? adminQuery.data : publicQuery.data;

  // FIX: Early return if user is undefined or loading 
  // This prevents the {} type from leaking into the JSX
  if (!user || Object.keys(user).length === 0) {
    return <div className="p-20 text-center text-slate-400">Loading user profile...</div>;
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`;
  const isProfileAdmin = user.role === 'admin';

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className={`h-40 ${isProfileAdmin ? "bg-indigo-600" : "bg-slate-900"}`} />

      <div className="px-10 pb-10">
        <div className="relative -mt-16 mb-6">
          <UserAvatar 
            imageUrl={user.imageUrl} 
            name={fullName} 
            size={120} 
            className="border-[6px] border-white shadow-xl" 
          />
        </div>

        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          {fullName}
          {isProfileAdmin && <ShieldCheck className="w-7 h-7 text-indigo-600" />}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Use explicit fallbacks to ensure we pass strings, not unknown/objects */}
          <InfoItem icon={MapPin} label="State" value={String(user.state ?? "N/A")} />
          <InfoItem icon={School} label="School" value={String(user.school ?? "N/A")} />

          {isAdminViewer && 'points' in user && (
            <div className="md:col-span-2 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-indigo-500 uppercase">Points Balance</p>
                  <p className="text-3xl font-black text-indigo-900">{Number(user.points ?? 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component with strict typing
function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
      <Icon className="text-slate-400 w-5 h-5" />
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
        <p className="font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}