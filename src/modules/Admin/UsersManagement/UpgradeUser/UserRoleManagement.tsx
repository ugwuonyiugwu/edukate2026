'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const UserRoleManager = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<"user" | "facilitator" | "admin">("user");
  const [notify, setNotify] = useState(false);

  const { data: users } = trpc.userupgrade.getAllUsers.useQuery();
  const updateRole = trpc.userupgrade.updateUserRole.useMutation({
    onSuccess: () => toast.success("Account role updated successfully."),
    onError: (e) => toast.error("Error: " + e.message)
  });

  return (
    <div className="flex flex-col items-center mt-10 min-h-screen">      
      <h2 className="text-xl font-medium text-gray-900 mb-10">
          Upgrade / Downgrade User Account
      </h2>
      <div className="w-full max-w-md bg-white p-10 rounded-sm shadow-sm border border-gray-100">

        <div className="space-y-10">
          {/* User Selection */}
          <div className="relative pt-2">
            <Label className="absolute -top-1 left-3 z-10 bg-white px-1 text-[12px] font-bold text-gray-400 capitalize tracking-wide">
              User Username
            </Label>
            <Select onValueChange={(val) => setSelectedUser(users?.find(u => u.id === val))}>
              <SelectTrigger className="h-16 w-full rounded-sm border py-6 border-gray-200 px-4 font-bold text-gray-900 shadow-none focus:ring-0">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className="relative pt-2">
            <Label className="absolute -top-1 left-3 z-10 bg-white px-1 text-[12px] font-bold text-gray-400 capitalize tracking-wide">
              Account Role
            </Label>
            <Select value={role} onValueChange={(val: any) => setRole(val)}>
              <SelectTrigger className="h-16 w-full rounded-sm border py-6 border-gray-200 px-4 font-bold text-gray-900 shadow-none focus:ring-0">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="facilitator">Facilitator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between px-1 pt-2">
            <Label className="text-sm font-bold text-gray-700">Send Notification</Label>
            <Switch checked={notify} onCheckedChange={setNotify} />
          </div>

          {/* Proceed Button */}
          <Button 
            className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-sm font-bold text-white shadow-none transition-all active:scale-[0.98]"
            onClick={() => {
              if (selectedUser) {
                updateRole.mutate({ 
                  targetUserId: selectedUser.id, 
                  newRole: role,
                  notify: notify // Passed the toggle state here
                });
              }
            }}
            disabled={!selectedUser || updateRole.isPending}
          >
            {updateRole.isPending ? <Loader2 className="animate-spin" /> : "Proceed"}
          </Button>
        </div>
      </div>
    </div>
  );
};