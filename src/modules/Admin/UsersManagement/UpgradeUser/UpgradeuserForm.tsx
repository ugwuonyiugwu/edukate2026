'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const UserUpgradeForm = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"user" | "facilitator" | "admin">("user");
  const [notify, setNotify] = useState(false);

  // Trigger search only when we have a username
  const { data: foundUser, refetch } = trpc.userupgrade.findUserByUsername.useQuery(
    { username }, 
    { enabled: false } // Manual trigger
  );

  const updateRole = trpc.userupgrade.updateUserRole.useMutation({
    onSuccess: () => toast.success("Role updated successfully"),
  });

  return (
    <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
      <h2 className="text-2xl font-black text-gray-900 mb-1">Upgrade / Downgrade</h2>
      <p className="text-gray-500 text-sm mb-8">User Account Management</p>

      <div className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Username</Label>
          <div className="flex gap-2">
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="h-12 rounded-xl bg-gray-50 border-none font-bold" 
            />
            <Button onClick={() => refetch()} variant="secondary">Scan</Button>
          </div>
        </div>

        {/* These fields only show if user is found */}
        {foundUser && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Role</Label>
              <Select value={foundUser.role ?? "user"} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-sm font-bold text-gray-700">Email Notification</Label>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>

            <Button 
              className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold"
              onClick={() => updateRole.mutate({ targetUserId: foundUser.id, newRole: role })}
            >
              Proceed
            </Button>
          </>
        )}
      </div>
    </div>
  );
};