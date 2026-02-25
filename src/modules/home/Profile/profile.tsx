'use client';
import { trpc } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";
import Image from "next/image";

export const ProfileForm = () => {
  const utils = trpc.useUtils();
  // Using users.getMe as defined in the updated router
  const { data: user } = trpc.users.getOne.useQuery(); 
  
  const update = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.users.getOne.invalidate();
      alert("Profile updated!");
    }
  });

  const { register, handleSubmit } = useForm({
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      school: user?.school ?? "",
      gender: user?.gender ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
    }
  });

  return (
    /* Increased width to 2xl and added a background wrapper for visibility */
    <div className="min-h-screen bg-gray-100/50 py-10 px-4"> 
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-3xl border border-gray-100">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <Image
              src={"/profile-default.png"}
              alt="User Profile"
              width={112} // Matches w-28 (28 * 4)
              height={112} // Matches h-28
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" 
            />
            <button type="button" className="absolute bottom-0 right-0 bg-[#2b5a9e] p-2.5 rounded-full border-2 border-white text-white hover:bg-blue-700 transition-colors">
              <Camera size={20} />
            </button>
          </div>
          <h2 className="mt-5 font-bold text-2xl text-[#1a1a1a] uppercase tracking-wide">
            {user?.firstName ?? "User"} {user?.lastName ?? "Profile"}
          </h2>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit((data) => update.mutate(data))} className="space-y-6">
          <hr className="mb-8 border-gray-100" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">First Name:</label>
              <input {...register("firstName")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Last Name:</label>
              <input {...register("lastName")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Email: <span className="text-red-500">*</span></label>
            <input value={user?.email || ""} disabled className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Contact Number: <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              <div className="w-20 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
                +1
              </div>
              <input {...register("phoneNumber")} className="flex-1 border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">School:</label>
            <input {...register("school")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Gender:</label>
              <select {...register("gender")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">Date of Birth:</label>
              <input type="date" {...register("dateOfBirth")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button 
              type="submit" 
              disabled={update.isPending}
              className="flex-1 bg-[#1e4e8c] text-white font-bold py-4 rounded-xl hover:bg-[#163a69] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70"
            >
              {update.isPending ? "Saving Changes..." : "Save Profile"}
            </button>
            <button type="button" className="flex-1 bg-white text-gray-500 font-bold py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}