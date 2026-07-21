'use client';
import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/app/utils/uploadthing";
import { toast } from "sonner";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";
import { Trash2, UploadCloud, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Ensure you have this shadcn component

export const AnnouncementManager = () => {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAnnouncement.useQuery();
  
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setText(settings.announcementText || "");
      setImageUrl(settings.popupImageUrl || "");
    }
  }, [settings]);

  const updateMutation = trpc.settings.updateAnnouncement.useMutation({
    onSuccess: () => {
      utils.settings.getAnnouncement.invalidate();
      toast.success("Settings saved successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center p-10"><LoadingSpinner/></div>;

  return (
    <Card className="w-full max-w-4xl mt-6 mx-auto shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl">Site Configuration</CardTitle>
        <CardDescription>Manage your global site alerts and login popups.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="announcement" className="font-semibold text-slate-700">Marquee Announcement</Label>
          <Textarea 
            id="announcement"
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter sliding announcement text..."
            className="min-h-30 border-slate-300"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <Label className="font-semibold text-slate-700">Login Popup Image</Label>
            
            {/* The entire box is now the drop zone via the UploadButton container */}
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 min-h-60 transition-colors hover:border-blue-400">
              {isUploading ? (
                <div className="w-full space-y-2">
                  <p className="text-sm text-center font-medium">Uploading... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              ) : imageUrl ? (
                <div className="relative group w-full animate-in fade-in zoom-in duration-300">
                  <img src={imageUrl} alt="Popup" className="w-full h-48 object-cover rounded-lg shadow-md" />
                  <Button 
                    variant="destructive" size="icon" className="absolute top-2 right-2"
                    onClick={(e) => { e.stopPropagation(); setImageUrl(""); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
                  <p className="text-xs text-slate-400 mt-1">Maximum size: 4 MB</p>
                </div>
              )}
              
              {/* Overlay the actual UploadButton to cover the whole box */}
              {!isUploading && (
                <UploadButton
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  endpoint="imageUploader"
                  onUploadBegin={() => { setIsUploading(true); setUploadProgress(0); }}
                  onUploadProgress={(p) => setUploadProgress(p)}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    if (res?.[0]?.url) setImageUrl(res[0].url);
                    toast.success("Upload complete!");
                  }}
                  onUploadError={(err) => { setIsUploading(false); toast.error(err.message); }}
                />
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Instructions
            </h4>
            <ul className="text-sm text-slate-600 list-disc pl-4 space-y-2">
              <li>Click anywhere inside the dashed box to select your image.</li>
              <li>Ensure images are under 4MB to avoid upload errors.</li>
              <li>Click "Save Changes" to sync your updates.</li>
            </ul>
          </div>
        </div>

        <Button size="lg" onClick={() => updateMutation.mutate({ text, imageUrl })} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};