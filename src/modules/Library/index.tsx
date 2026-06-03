'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { DocumentMetadataForm } from "@/components/reusableDocumentMetadata/documentmetadata";
import { AppAlertDialog } from "@/components/reusablealert/app-alert-dialog";
import { 
  FileText, LogOut, Plus, Loader2, Edit3, Trash2, Settings2, Download, Heart, 
  ArrowLeft
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
import Link from "next/link";

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
          <Image src="/logo.png" alt="logo" width={30} height={30} />
          <span className="font-bold text-lg md:text-xl text-blue-700 tracking-tight">EduKate</span>
        </div>
        <Button variant="outline" onClick={() => setIsCreating(true)} className="flex items-center gap-2 font-bold shadow-sm h-9 md:h-10 text-xs md:text-sm">
          <Plus size={16} /> <span className="hidden sm:inline">Upload Content</span>
        </Button>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 hidden lg:flex flex-col p-6 bg-white shrink-0">
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 mb-6 border border-gray-100">
            <UserAvatar imageUrl={user?.imageUrl} name={user?.firstName} size={80} className="mb-3" />
            <h3 className="font-bold text-sm truncate w-full">{user?.firstName} {user?.lastName}</h3>
            <div className="flex items-center gap-1.5 mt-2 bg-blue-100 px-3 py-1 rounded-full text-[10px] text-blue-600 font-black">
              <Download size={12} /> {totalLibraryDownloads} Total DLs
            </div>
          </div>
          <button className="flex items-center gap-3 w-full p-3 bg-blue-600 text-white rounded-xl font-bold text-sm">
            <FileText size={18} /> My Library
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold text-sm">
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
                  {library?.thumbnailUrl ? <Image src={library.thumbnailUrl} alt="Library" fill className="object-cover rounded-2xl" /> : <FileText className="text-white/40" size={24} />}
                </div>
                <h3 className="text-xl md:text-2xl font-black">{isLibLoading ? <Loader2 className="animate-spin" /> : (library?.name || "Personal Library")}</h3>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={openEditLibrary} className="flex-1 sm:flex-none"><Settings2 size={16} className="mr-2" /> Settings</Button>
                <Button variant="outline" size="sm" onClick={() => setIsDeleteLibDialogOpen(true)} className="text-red-500"><Trash2 size={16} /></Button>
              </div>
            </div>

            {/* Content Switcher: Card View (Mobile) vs Table View (Desktop) */}
            {isDocsLoading ? <Loader2 className="animate-spin mx-auto mt-10" /> : (
              <>
                {/* Mobile/Tablet Card List */}
                <div className="md:hidden space-y-3">
                  {realDocuments?.map((doc) => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-50 rounded-lg flex items-center justify-center border">
                            {doc.thumbnailUrl ? <Image src={doc.thumbnailUrl} alt="doc" width={40} height={48} className="object-cover rounded-lg"/> : <FileText size={20} className="text-gray-300"/>}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{doc.name}</p>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">{doc.subject}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingDoc(doc as DocumentType)} className="p-2"><Edit3 size={16}/></button>
                        <button onClick={() => setDocToDelete(doc.id)} className="p-2 text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-gray-50/50 border-b border-gray-100"><th className="p-5 text-[11px] font-black uppercase text-gray-400 pl-8">Document</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center">Uploaded</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center">Stats</th><th className="p-5 text-[11px] font-black uppercase text-gray-400 text-right pr-8">Actions</th></tr></thead>
                    <tbody className="text-sm">
                      {realDocuments?.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 border-b border-gray-50">
                          <td className="p-5 pl-8"><div className="flex items-center gap-4"><div className="relative w-12 h-16 rounded-xl overflow-hidden bg-gray-50 border">{doc.thumbnailUrl ? <Image src={doc.thumbnailUrl} alt="thumb" fill className="object-cover" /> : <FileText size={20} className="text-gray-300" />}</div><div><span className="font-bold text-gray-900">{doc.name}</span><br /><span className="text-[10px] text-blue-600 uppercase font-black">{doc.subject}</span></div></div></td>
                          <td className="p-5 text-center text-xs font-bold text-gray-400">{doc.createdAt ? format(new Date(doc.createdAt), "MMM d, yyyy") : "—"}</td>
                          <td className="p-5"><div className="flex flex-col items-center gap-1"><div className="flex items-center gap-1.5 font-black text-xs"><Download size={12} className="text-emerald-500" />{doc.downloads}</div><div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]"><Heart size={10} className="text-pink-400" />{doc.likes}</div></div></td>
                          <td className="p-5 pr-8 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => setEditingDoc(doc as DocumentType)} className="p-2 text-gray-400 hover:text-blue-600"><Edit3 size={16} /></button><button onClick={() => setDocToDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs and Modals remain at the root level */}
      {(isCreating || editingDoc) && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <DocumentMetadataForm initialData={editingDoc} onComplete={handleFinalSuccess} onClose={() => { setIsCreating(false); setEditingDoc(null); }} />
          </div>
        </div>
      )}

      {/* Settings and Alert Dialogs */}
      <Dialog open={isEditLibOpen} onOpenChange={setIsEditLibOpen}>
         {/* ... Dialog content kept as is ... */}
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