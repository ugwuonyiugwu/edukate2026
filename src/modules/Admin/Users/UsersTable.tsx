'use client';
import { trpc } from "@/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check } from "lucide-react";
import { useState } from "react";

export const UserTable = () => {
  const utils = trpc.useUtils();
  const { data: allUsers } = trpc.admin.getUsers.useQuery();

  const deleteMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });

  const updatePointsMutation = trpc.admin.updateUserPoints.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });

  const [pointsInput, setPointsInput] = useState<Record<string, number>>({});

  return (
    <div className="mt-8 px-4 md:px-8">
      <h2 className="text-2xl font-bold mb-6">User Directory</h2>
      <div className="border-0 md:border rounded-md bg-white overflow-x-auto no-scrollbar">
        {/* Increased min-width to accommodate all columns */}
        <Table className="min-w-250">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>School</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium whitespace-nowrap">{user.username || "N/A"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="whitespace-nowrap">{user.phoneNumber || "N/A"}</TableCell>
                <TableCell>{user.school || "N/A"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{user.role}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input 
                      className="w-16"
                      type="number"
                      defaultValue={user.points}
                      onChange={(e) => setPointsInput({...pointsInput, [user.id]: parseInt(e.target.value)})}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updatePointsMutation.mutate({ userId: user.id, points: pointsInput[user.id] || user.points })}
                    >
                      <Check size={16} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate({ userId: user.id })}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};