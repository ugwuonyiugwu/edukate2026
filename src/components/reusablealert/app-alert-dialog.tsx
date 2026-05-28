'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void; // ✅ Added optional confirm callback type
}

export function AppAlertDialog({
  isOpen,
  onOpenChange,
  title = "Notification",
  message,
  buttonText = "OK",
  onConfirm, // ✅ Destructured the callback function
}: AppAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-lg border border-slate-100 shadow-2xl bg-white gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <AlertDialogTitle className="text-xl font-bold text-slate-800">
            {title}
          </AlertDialogTitle>
        </div>
        
        <div className="px-6 py-4">
          <AlertDialogDescription className="text-slate-500 text-[15px] leading-relaxed">
            {message}
          </AlertDialogDescription>
        </div>
        
        <div className="px-6 py-6 flex justify-end gap-3">
          {/* If an onConfirm callback is present, we show a Cancel button 
            automatically to provide a safe exit out of the action.
          */}
          {onConfirm && (
            <AlertDialogCancel 
              onClick={() => onOpenChange(false)}
              className="px-5 py-2 rounded-md font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border-0 transition-colors h-auto text-sm"
            >
              Cancel
            </AlertDialogCancel>
          )}

          <AlertDialogAction 
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onOpenChange(false);
              }
            }}
            className="px-6 py-2 rounded-md font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm h-auto text-sm"
          >
            {buttonText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}