'use client';
import { useEffect } from "react";
import { trpc } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { LoadingSpinner } from "../ui/components/Logospinal";

export const NotificationPage = () => {
  const utils = trpc.useUtils();
  const { data: notes, isLoading } = trpc.notifications.getMyNotifications.useQuery();
  
  // Mutation to mark notifications as read
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      // Invalidate both the list and the navbar badge
      utils.notifications.getMyNotifications.invalidate();
      utils.notifications.hasUnread.invalidate();
    }
  });

  // Automatically mark as read when the page loads if there are unread items
  useEffect(() => {
    if (notes?.some(n => !n.isRead)) {
      markAsRead.mutate();
    }
  }, [notes, markAsRead]);

  if (isLoading) return (
    <LoadingSpinner/>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Notifications</h1>
        </div>

        <div className="space-y-3 md:space-y-4">
          {!notes || notes.length === 0 ? (
            <div className="rounded-sm border border-gray-100 bg-white p-8 md:p-12 text-center shadow-sm">
              <Bell className="mx-auto mb-4 h-10 w-10 md:h-12 md:w-12 text-gray-300" />
              <p className="font-bold text-gray-500">No new notifications</p>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id} 
                className={`group relative flex items-start gap-3 md:gap-4 rounded-sm border bg-white p-4 md:p-6 shadow-sm transition-all ${!note.isRead ? 'border-green-100 bg-green-50/30' : 'border-gray-100'}`}
              >
                <div className={`mt-0.5 md:mt-1 flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full ${!note.isRead ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle2 className={`h-5 w-5 md:h-6 md:w-6 ${!note.isRead ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm md:text-base text-gray-900 wrap-break-words">{note.message}</p>
                  <p className="mt-0.5 text-[10px] md:text-xs font-medium text-gray-400">
                    {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                  </p>
                </div>

                {!note.isRead && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 h-2 w-2 rounded-full bg-green-500" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};