'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle, X, Trash2, Upload } from "lucide-react";
import { useUploadThing } from "@/app/utils/uploadthing";

export const DocumentMetadataForm = ({ initialData, onComplete, onClose }: any) => {
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || "");
  const [name, setName] = useState(initialData?.name || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialData?.videoUrl || "");
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(initialData?.thumbnailUrl || null);

  const { startUpload: startPdfUpload, isUploading: isPdfUploading } = useUploadThing("pdfUploader");
  const { startUpload: startThumbUpload, isUploading: isThumbUploading } = useUploadThing("thumbnailUploader");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const createDocument = trpc.documents.create.useMutation();
  const updateDocument = trpc.documents.update.useMutation();
  const isLoading = createDocument.isPending || updateDocument.isPending || isPdfUploading || isThumbUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl && !pdfFile) return toast.error("Please select a PDF file.");

    try {
      let finalFileUrl = fileUrl;
      let finalThumbUrl = currentThumbnail;

      if (pdfFile) {
        const res = await startPdfUpload([pdfFile]);
        if (res) finalFileUrl = res[0].ufsUrl;
      }
      if (thumbFile) {
        const res = await startThumbUpload([thumbFile]);
        if (res) finalThumbUrl = res[0].ufsUrl;
      }

      if (initialData) {
        await updateDocument.mutateAsync({ 
          id: initialData.id, name, subject, description, 
          videoUrl: currentVideoUrl, thumbnailUrl: finalThumbUrl 
        });
      } else {
        await createDocument.mutateAsync({ 
          name, subject, description, fileUrl: finalFileUrl, 
          videoUrl: currentVideoUrl || undefined, thumbnailUrl: finalThumbUrl || undefined 
        });
      }
      toast.success("Saved successfully!");
      onComplete();
    } catch (e: any) { 
      toast.error("Operation failed: " + e.message); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 md:p-8 rounded-sm border shadow-2xl relative w-full max-h-[90vh] overflow-y-auto space-y-6 text-sm text-gray-800">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800">
        <X size={20} />
      </button>

      <h2 className="text-xl font-black">Metadata</h2>

      {/* Responsive Grid: Stacks on mobile, splits on medium screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Input */}
        <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 text-gray-600 min-h-25">
          {!pdfFile && !fileUrl ? (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} />
              <span className="text-[10px] font-bold uppercase">Upload PDF</span>
              <input type="file" className="hidden" accept="application/pdf" onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])} />
            </label>
          ) : (
            <div className="text-emerald-600 font-bold flex items-center gap-2 text-xs">
              <CheckCircle size={16} /> PDF Selected
            </div>
          )}
        </div>
        
        {/* Thumbnail Input */}
        <div className="relative border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-25">
          {thumbFile || currentThumbnail ? (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <span className="text-[10px] font-bold text-center">Image Selected</span>
              <button type="button" onClick={() => { setThumbFile(null); setCurrentThumbnail(null); }} className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-sm"><Trash2 size={14} className="text-red-500"/></button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload size={24} />
              <span className="text-[10px] font-bold uppercase">Thumbnail</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setThumbFile(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Title" className="w-full p-3 border border-gray-200 rounded-xl placeholder:text-gray-400" />
        
        {/* Video and Subject inputs: Stack on mobile, split on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={currentVideoUrl} onChange={(e) => setCurrentVideoUrl(e.target.value)} placeholder="Video Link" className="p-3 border border-gray-200 rounded-xl placeholder:text-gray-400" />
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="p-3 border border-gray-200 rounded-xl placeholder:text-gray-400" />
        </div>
        
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none placeholder:text-gray-400" />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">
        {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Save Changes</>}
      </Button>
    </form>
  );
};