'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Search, Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

export const AdminNotificationView = () => {
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "selected">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: users = [], isLoading: isUsersLoading } = trpc.notifications.getUsers.useQuery();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((u: any) => {
      const name = (u.username || u.firstName || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery]);

  const sendMutation = trpc.notifications.send.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully sent notification to ${data.count} users!`);
      setMessage("");
      setSelectedUserIds([]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send notification.");
    },
  });

  const toggleUserSelection = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const removeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === "selected" && selectedUserIds.length === 0) {
      toast.warning("Please select at least one user.");
      return;
    }

    sendMutation.mutate({
      message,
      targetType,
      userIds: targetType === "selected" ? selectedUserIds : undefined,
    });
  };

  // Get display names for selected pills
  const selectedUsersData = useMemo(() => {
    return users.filter((u: any) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950 mb-6">Broadcast Notification</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2 block">
              Target Audience
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                  targetType === "all" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => setTargetType("selected")}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                  targetType === "selected" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                Selected Users
              </button>
            </div>
          </div>

          {targetType === "selected" && (
            <div className="space-y-3 relative" ref={dropdownRef}>
              <label className="text-xs font-black uppercase text-gray-400 tracking-wider block">
                Select Users ({selectedUserIds.length} chosen)
              </label>

              {/* Clickable Dropdown Trigger Box */}
              <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="min-h-12 p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between cursor-pointer hover:border-gray-300 transition-all"
              >
                <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2">
                  {selectedUsersData.length === 0 ? (
                    <span className="text-xs text-gray-400 font-medium">Click to select users...</span>
                  ) : (
                    selectedUsersData.map((u: any) => {
                      const name = u.username || u.firstName || u.name || "User";
                      return (
                        <span
                          key={u.id}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={(e) => removeUser(u.id, e)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Content Area */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden divide-y divide-gray-50">
                  <div className="p-3 bg-gray-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="pl-9 bg-white rounded-xl border-gray-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {isUsersLoading ? (
                      <div className="p-4 text-center">
                        <Loader2 className="animate-spin h-5 w-5 mx-auto text-blue-600" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No users found</div>
                    ) : (
                      filteredUsers.map((u: any) => {
                        const isSelected = selectedUserIds.includes(u.id);
                        const displayName = u.username || u.firstName || u.name || "Unnamed User";
                        return (
                          <div
                            key={u.id}
                            onClick={(e) => toggleUserSelection(u.id, e)}
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50/60" : "hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-800">{displayName}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </div>
                            <div
                              className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                                isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2 block">
              Message
            </label>
            <Input
              placeholder="Type your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="py-6 rounded-xl bg-gray-50 border-gray-200"
            />
          </div>

          <Button
            type="submit"
            disabled={sendMutation.isPending || !message || (targetType === "selected" && selectedUserIds.length === 0)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {sendMutation.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Notification</>}
          </Button>
        </form>
      </div>
    </div>
  );
};