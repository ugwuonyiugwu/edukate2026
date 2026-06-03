'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { DocumentMetadataForm } from "@/components/reusableDocumentMetadata/documentmetadata";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";
import { 
  FileText, LogOut, Plus, Loader2, Edit3, Trash2, Settings2, Download, Heart 
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/app/utils/uploadthing";
import { toast } from "sonner";

export interface DocumentType {
  id: number;
  clerkId: string;
  name: string;
  subject: string;
  description: string;
  fileUrl: string;
  videoUrl?: string | null;
  thumbnailUrl: string | null;
  downloads: number; 
  likes: number;
  createdAt: Date | string | null;
}

export const LibraryPage = () => {
  const utils = trpc.useUtils();
  const router = useRouter();
  
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();
  const { data: realDocuments, isLoading: isDocsLoading } = trpc.documents.getMyDocuments.useQuery();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  
  const [isEditLibOpen, setIsEditLibOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumb, setEditThumb] = useState<string | null>(null);

  // New deletion states
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [isDeleteLibDialogOpen, setIsDeleteLibDialogOpen] = useState(false);

  const totalLibraryDownloads = realDocuments?.reduce((acc, doc) => acc + (doc.downloads || 0), 0) || 0;

  const updateLibMutation = trpc.documents.updateLibrary.useMutation({
    onSuccess: () => {
      toast.success("Library updated successfully!");
      utils.documents.getLibrary.invalidate();
      setIsEditLibOpen(false);
    },
    onError: (err) => { toast.error(`Update failed: ${err.message}`); }
  });

  const deleteLibMutation = trpc.documents.deleteLibrary.useMutation({
    onSuccess: () => {
      toast.success("Library deleted permanently.");
      router.push("/dashboard");
    },
    onError: () => { toast.error("Failed to delete library."); }
  });

  const deleteDocMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document removed.");
      utils.documents.getMyDocuments.invalidate();
      setDocToDelete(null);
    },
    onError: (err) => { toast.error(err.message); },
  });

  const handleFinalSuccess = () => {
    setIsCreating(false);
    setEditingDoc(null);
    utils.documents.getMyDocuments.invalidate();
  };

  const openEditLibrary = () => {
    setEditName(library?.name || "Personal Library");
    setEditThumb(library?.thumbnailUrl || null);
    setIsEditLibOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={35} height={35} />
          <span className="font-bold text-xl text-blue-700 tracking-tight">EduKate</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" onClick={() => setIsCreating(true)} className="text-blue px-3 md:px-4 h-9 md:h-10 flex items-center gap-2 font-bold transition-all shadow-md text-[10px] md:text-sm">
            <Plus size={16} /> <span className="hidden md:inline">Upload Content</span>
          </Button>
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden relative">
        <aside className="w-64 border-r border-gray-200 hidden lg:flex flex-col p-6 bg-white shrink-0">
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 mb-6 border border-gray-100">
            <UserAvatar imageUrl={user?.imageUrl} name={user?.firstName} size={96} className="mb-3 ring-2 ring-white shadow-md" />
            <h3 className="font-bold text-gray-900 text-sm truncate w-full">{user?.firstName} {user?.lastName}</h3>
            <div className="flex items-center gap-1.5 mt-2 bg-blue-100 px-3 py-1 rounded-full">
              <Download size={12} className="text-blue-600" />
              <span className="text-[10px] text-blue-600 font-black">{totalLibraryDownloads} Total DLs</span>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            <button className="flex items-center gap-3 w-full p-3 bg-blue-600 text-white rounded-xl font-bold text-sm">
              <FileText size={18} /> My Library
            </button>
          </nav>
          <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm mt-auto">
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-sm border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                  {library?.thumbnailUrl ? <Image src={library.thumbnailUrl} alt="Library" fill sizes="64px" className="object-cover" /> : <FileText className="text-white/40" size={32} />}
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">{isLibLoading ? <Loader2 className="animate-spin" /> : (library?.name || "Personal Library")}</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{realDocuments?.length || 0} Documents curated</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={openEditLibrary} className="rounded-xl border-gray-200 text-gray-600 font-bold h-11 px-4"><Settings2 size={16} className="mr-2" /> Settings</Button>
                <Button variant="outline" size="sm" onClick={() => setIsDeleteLibDialogOpen(true)} className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold h-11"><Trash2 size={16} /></Button>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50/50 border-b border-gray-100"><th className="p-5 text-[11px] font-black uppercase text-gray-400 pl-8 tracking-wider">Document</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center tracking-wider">Uploaded</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center tracking-wider">Stats</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-right pr-8 tracking-wider">Actions</th></tr></thead>
                <tbody className="text-sm">
                  {isDocsLoading ? <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr> : realDocuments?.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-gray-50/80 border-b border-gray-50 last:border-0">
                      <td className="p-5 pl-8"><div className="flex items-center gap-4"><div className="relative w-12 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">{doc.thumbnailUrl ? <Image src={doc.thumbnailUrl} alt="thumb" fill className="object-cover" /> : <FileText size={20} className="text-gray-300" />}</div><div><span className="font-bold text-gray-900">{doc.name}</span><br /><span className="text-[10px] text-blue-600 uppercase font-black">{doc.subject}</span></div></div></td>
                      <td className="p-5 text-center text-xs font-bold text-gray-400">{doc.createdAt ? format(new Date(doc.createdAt), "MMM d, yyyy") : "—"}</td>
                      <td className="p-5"><div className="flex flex-col items-center gap-1"><div className="flex items-center gap-1.5 text-gray-700 font-black"><Download size={14} className="text-emerald-500" />{doc.downloads}</div><div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]"><Heart size={12} className="text-pink-400" />{doc.likes}</div></div></td>
                      <td className="p-5 pr-8 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => setEditingDoc(doc as DocumentType)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button><button onClick={() => setDocToDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {(isCreating || editingDoc) && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <DocumentMetadataForm initialData={editingDoc} onComplete={handleFinalSuccess} onClose={() => { setIsCreating(false); setEditingDoc(null); }} />
          </div>
        </div>
      )}

      <Dialog open={isEditLibOpen} onOpenChange={setIsEditLibOpen}>
        <DialogContent className="z-110 sm:max-w-106.25 rounded-[40px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Library Settings</DialogTitle>
            <DialogDescription className="font-medium text-gray-500">Customize how your collection appears to others.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Cover Image</label>
              <div className="w-full h-44 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden relative group transition-all hover:border-blue-200">
                {editThumb ? (
                  <>
                    <Image src={editThumb} alt="Preview" fill className="object-cover" />
                    <button onClick={() => setEditThumb(null)} className="absolute inset-0 bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-sm">Change Image</button>
                  </>
                ) : (
                  <UploadButton
                    endpoint="libraryThumbnailUploader"
                    onClientUploadComplete={(res) => setEditThumb(res[0].url)}
                    className="ut-button:bg-blue-600 ut-label:text-blue-600"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Library Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Physics 101 Notes" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold focus:ring-blue-600" />
            </div>
          </div>
          <Button 
            disabled={updateLibMutation.isPending} 
            onClick={() => updateLibMutation.mutate({ name: editName, thumbnailUrl: editThumb ?? undefined })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            {updateLibMutation.isPending ? <Loader2 className="animate-spin" /> : "Update Library"}
          </Button>
        </DialogContent>
      </Dialog>

      <AppAlertDialog
        isOpen={isDeleteLibDialogOpen}
        onOpenChange={setIsDeleteLibDialogOpen}
        title="Delete Library"
        message="Warning: This will delete your library and all associated documents permanently. This action cannot be undone."
        buttonText="Delete Library"
        onConfirm={() => deleteLibMutation.mutate()}
      />

      <AppAlertDialog
        isOpen={!!docToDelete}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        buttonText="Delete Document"
        onConfirm={() => docToDelete && deleteDocMutation.mutate({ id: docToDelete })}
      />
    </div>
  );
};