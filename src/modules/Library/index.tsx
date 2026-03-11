'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { UploadSheet } from "@/components/reusableupload/upoadsheet";
import { DocumentMetadataForm } from "@/components/reusableDocumentMetadata/documentmetadata";
import { 
  FileText, LogOut, Plus, ArrowLeft, 
  Loader2, Edit3, Trash2
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface DocumentType {
  id: number;
  clerkId: string;
  name: string;
  subject: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  createdAt: Date | string | null;
}

export const LibraryPage = () => {
  const utils = trpc.useUtils();
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: realDocuments, isLoading: isDocsLoading } = trpc.documents.getMyDocuments.useQuery();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);

  const handleUploadComplete = (url: string) => {
    setUploadedFileUrl(url);
    setIsSheetOpen(false);
  };

  const handleFinalSuccess = () => {
    setUploadedFileUrl(null);
    setEditingDoc(null);
    utils.documents.getMyDocuments.invalidate();
  };

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => utils.documents.getMyDocuments.invalidate(),
    onError: (err) => alert(err.message),
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <Image src="/logo.png" alt="logo" width={35} height={35} />
          </div>
          <span className="font-bold text-xl text-blue-700 tracking-tight">
            EduKate
          </span>
        </div>
        
        {(!uploadedFileUrl && !editingDoc) && (
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(true)}
              className="text-blue px-3 md:px-4 h-9 md:h-10 flex items-center gap-2 font-bold transition-all shadow-md text-[10px] md:text-sm"
            >
              <Plus size={16} /> <span className="hidden md:inline">Upload</span>
            </Button>

          </div>
        )}
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        {(!uploadedFileUrl && !editingDoc) && (
          <aside className="w-64 border-r border-gray-200 hidden lg:flex flex-col p-6 bg-white shrink-0">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 mb-6 border border-gray-100">
              <UserAvatar imageUrl={user?.imageUrl} name={user?.firstName} size={96} className="mb-3 ring-2 ring-white shadow-md" />
              <h3 className="font-bold text-gray-900 text-sm truncate w-full">{user?.firstName} {user?.lastName}</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Admin</p>
            </div>
            <nav className="space-y-1 flex-1">
              <button className="flex items-center gap-3 w-full p-3 bg-blue-600 text-white rounded-xl font-bold text-sm">
                <FileText size={18} /> My Content
              </button>
            </nav>
            <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm mt-auto">
              <LogOut size={18} /> Log Out
            </button>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {(uploadedFileUrl || editingDoc) ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => { setUploadedFileUrl(null); setEditingDoc(null); }} 
                  className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-xs md:text-sm"
                >
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <DocumentMetadataForm 
                  fileUrl={uploadedFileUrl || editingDoc?.fileUrl || ""} 
                  initialData={editingDoc} 
                  onComplete={handleFinalSuccess} 
                />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Content Library</h1>
                  <p className="text-xs md:text-base text-gray-500 font-medium">Manage your educational assets.</p>
                </div>

                <div className="bg-white border border-gray-200 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100 whitespace-nowrap">
                          <th className="sticky left-0 z-20 bg-gray-50 p-4 md:p-5 text-[10px] md:text-[11px] font-black uppercase text-gray-400 pl-4 md:pl-8">Document</th>
                          <th className="p-4 md:p-5 text-[10px] md:text-[11px] font-black uppercase text-gray-400 text-center">Date</th>
                          <th className="p-4 md:p-5 text-[10px] md:text-[11px] font-black uppercase text-gray-400 text-center">DLs</th>
                          <th className="p-4 md:p-5 text-[10px] md:text-[11px] font-black uppercase text-gray-400 text-center">Likes</th>
                          <th className="sticky right-0 z-20 bg-gray-50 p-4 md:p-5 text-[10px] md:text-[11px] font-black uppercase text-gray-400 text-right pr-4 md:pr-8">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs md:text-sm">
                        {isDocsLoading ? (
                          <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : (
                          realDocuments?.map((doc, index) => (
                            <tr key={doc.id} className={`group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'} hover:bg-blue-50/40 border-b border-gray-50`}>
                              <td className="sticky left-0 z-10 bg-inherit p-4 md:p-5 pl-4 md:pl-8 min-w-45">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-8 h-10 md:w-11 md:h-14 rounded overflow-hidden border shrink-0 bg-gray-100">
                                    {doc.thumbnailUrl && <Image src={doc.thumbnailUrl} alt="thumb" fill className="object-cover" />}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 text-xs md:text-sm truncate w-32 md:w-48">{doc.name}</span>
                                    <span className="text-[9px] text-blue-600 uppercase font-black">{doc.subject}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center text-xs font-bold text-gray-500 whitespace-nowrap min-w-24">
                                {doc.createdAt ? format(new Date(doc.createdAt), "MMM d") : "—"}
                              </td>
                              <td className="p-4 text-center font-black text-gray-900 min-w-16">{doc.views}</td>
                              <td className="p-4 text-center font-black text-pink-500 min-w-16">{doc.likes}</td>
                              <td className="sticky right-0 z-10 bg-inherit p-4 pr-4 md:pr-8 text-right min-w-20">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setEditingDoc(doc as DocumentType)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-all">
                                    <Edit3 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => confirm("Delete this document?") && deleteMutation.mutate({ id: doc.id })} 
                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-all disabled:opacity-30"
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <UploadSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} onUploadComplete={handleUploadComplete} />
    </div>
  );
};