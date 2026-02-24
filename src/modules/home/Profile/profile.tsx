"use client";

import { trpc } from "@/trpc/client";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";

export function ProfileForm() {
  const [user] = trpc.users.getOne.useSuspenseQuery();
  const utils = trpc.useUtils();

  const updateProfile = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.getOne.invalidate();
      alert("Profile updated!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfile.mutate({
      username: formData.get("username") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      state: formData.get("state") as string,
      gender: formData.get("gender") as string,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <div className="flex items-center space-x-4 mb-8">
        <Image 
            src={"/profile-default.png"}
            alt="User Profile"
            width={48}  // 48px
            height={48} // 48px
            className="rounded-full"
                  />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user.username || "User"}</h1>
          <p className="text-sm text-indigo-600 font-semibold">Points: {user.points}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Read-only)</label>
            <input type="text" disabled value={user.email} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input name="username" type="text" defaultValue={user.username ?? ""} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input name="phoneNumber" type="text" defaultValue={user.phoneNumber ?? ""} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input name="state" type="text" defaultValue={user.state ?? ""} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select name="gender" defaultValue={user.gender ?? ""} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button 
            type="submit" 
            disabled={updateProfile.isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {updateProfile.isPending ? "Saving..." : "Update Profile"}
          </button>
          
          <SignOutButton>
            <button className="text-red-600 hover:underline font-medium">Log Out</button>
          </SignOutButton>
        </div>
      </form>
    </div>
  );
}