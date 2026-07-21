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
  onConfirm?: () => void;
}

export function AppAlertDialog({
  isOpen,
  onOpenChange,
  title = "Notification",
  message,
  buttonText = "OK",
  onConfirm,
}: AppAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-md rounded-lg border border-slate-100 shadow-2xl bg-white gap-0 p-0 overflow-hidden">
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
        
        {/* Responsive buttons:
           flex-col-reverse on mobile (small screens) stacks buttons.
           flex-row on md+ screens aligns them side-by-side.
        */}
        <div className="px-6 py-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          {onConfirm && (
            <AlertDialogCancel 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-md font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border-0 transition-colors h-auto text-sm"
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-md font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm h-auto text-sm"
          >
            {buttonText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}