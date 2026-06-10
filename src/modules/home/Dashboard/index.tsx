'use client';
import { trpc } from "@/trpc/client";
import { Loader2, Image as ImageIcon, BookOpenText, Layers, Gamepad2, PenTool, TrophyIcon } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/app/utils/uploadthing";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface CarouselFrameProps {
  children?: React.ReactNode;
  className?: string;
}

const CarouselFrame = ({ children, className = "" }: CarouselFrameProps) => (
  <div className={`embla__slide flex-[0_0_100%] min-w-0 h-20 rounded-xs p-6 ${className}`}>
    <div className="w-full h-20 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

export const DashboardView = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { startUpload } = useUploadThing("libraryThumbnailUploader");
  
  // Data Fetching: user is prefetched, library is fetched on client
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();
  const { data: settings, isLoading } = trpc.settings.getAnnouncement.useQuery();
  
  // Library Creation States
  const [isLibDialogOpen, setIsLibDialogOpen] = useState(false);
  const [libName, setLibName] = useState("");
  const [isUploading, setIsUploading] = useState(false); 
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const shouldShowAlert = searchParams.get("showAlert") === "true";
    
    if (shouldShowAlert && settings?.popupImageUrl) {
      setIsAlertOpen(true);
    }
  }, [searchParams, settings]);

  // Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, slidesToScroll: 1, align: 'start' }, 
    [Autoplay({ delay: 5000 })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { 
      emblaApi.off('select', onSelect); 
      emblaApi.off('reInit', onSelect); 
    };
  }, [emblaApi, onSelect]);

  // Mutations
  const createLibMutation = trpc.documents.createLibrary.useMutation({
    onSuccess: () => {
      utils.documents.getLibrary.invalidate();
      setIsLibDialogOpen(false);
      setIsUploading(false);
      router.push("/library");
    },
    onError: () => {
      setIsUploading(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateLibrary = async () => {
    setIsUploading(true);
    try {
      let finalUrl: string | null = null;
      if (pendingFile) {
        const res = await startUpload([pendingFile]);
        if (res?.[0]) finalUrl = res[0].url; 
      }
      createLibMutation.mutate({ name: libName, thumbnailUrl: finalUrl });
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleLibraryClick = (e: React.MouseEvent) => {
    if (isLibLoading) return; // Prevent clicking while fetching
    if (library) {
      router.push(`/library`);
    } else {
      e.preventDefault();
      setIsLibDialogOpen(true);
    }
  };

  const recentItems = [
    { id: '1', title: 'Fundamentals of History', initial: 'H', color: 'text-blue-600' },
    { id: '2', title: 'New School Physics', initial: 'P', color: 'text-blue-800' },
    { id: '3', title: 'Chemical Analysis', initial: 'C', color: 'text-blue-900' },
  ];

  return (
    <div className="max-w-full mx-auto px-2 my-4 sm:px-4 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2 gap-4">
        <div>
          <h1 className="text-xl ml-5 capitalize md:text-2xl font-bold text-gray-900" suppressHydrationWarning> Welcome {user?.username || user?.firstName || 'User'} </h1>
        </div>
        <div className="bg-blue-50 p-1 rounded-sm border border-blue-100 shadow-sm mb-5 text-right shrink-0">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-blue-700">{user?.points ?? 0}</span>
            <span className="text-xl">💎</span>
          </div>
        </div>
    </div>

    {/* Embla Carousel - Responsive Wrapper */}
    <div className="embla mb-6 group relative overflow-hidden w-full" ref={emblaRef}>
      <div className="embla__container flex">
        
        {/* Slide 1 */}
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 ">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-purple-100">
            <Image src="/backgroud-images/carousel1.png" alt="Slide 1" fill className="object-cover opacity-80" />
            <div className="relative z-10 p-6 text-white flex flex-col justify-between h-full">
              <h3 className="text-xl font-bold">Bridging the Gap</h3>
              <Link href="/about">
                <button className="mt-3 bg-white text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full w-fit hover:bg-purple-50 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </CarouselFrame>
        </div>

        {/* Slide 2 */}
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 ">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-blue-100">
            <Image src="/backgroud-images/carousel2.png" alt="Slide 2" fill className="object-cover opacity-80" />
            <div className="relative z-10 p-6 text-white flex flex-col justify-between h-full">
              <h3 className="text-xl font-bold">Equal Opportunity</h3>
              <Link href="/about">
                <button className="mt-3 bg-white text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full w-fit hover:bg-blue-50 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </CarouselFrame>
        </div>

        {/* Slide 3 */}
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-emerald-100">
            <Image src="/backgroud-images/image3.png" alt="Slide 3" fill className="object-cover opacity-80" />
            <div className="relative z-10 p-6 text-white flex flex-col justify-between h-full">
              <h3 className="text-xl font-bold">Quality Education</h3>
              <Link href="/about">
                <button className="mt-3 bg-white text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full w-fit hover:bg-emerald-50 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>
          </CarouselFrame>
        </div>
        
      </div>
    </div>
     
    {settings?.announcementText && (
  <div className="w-full mb-5 border-b border-blue-100 bg-blue-50">
    {/* We use 'max-w-[100vw]' and 'w-full' to force the container 
      to never exceed the viewport width.
    */}
    <div className="relative w-full max-w-[100vw] overflow-hidden py-3">
      {/* We use 'max-w-full' here to ensure the inner div 
        respects the parent's boundaries.
      */}
      <div className="whitespace-nowrap animate-marquee animation-duration:[25s] md:animation-duration:[20s] max-w-full">
        <span className="inline-block px-4 text-sm font-bold tracking-wide text-orange-500 md:text-base">
          {settings.announcementText}
        </span>
      </div>
    </div>
  </div>
)}

    {/* Dashboard Actions Section */}
    <section className="mb-10">
      <h3 className="text-lg font-bold ml-5 mb-4">Quick Action</h3>
      <div className="grid grid-cols-2 gap-4 px-2">
        
        <button onClick={() => router.push('/quizathon')} className="bg-white p-5 rounded-sm lg:pb-8 border relative flex flex-col items-center border-orange-200 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-orange-500 mx-auto mb-2"><TrophyIcon size={24} /></div>
          <h3 className="font-bold text-gray-800">Quizathon</h3>
          <p className="text-xs text-gray-500">Join our monthly quizathon</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium">10%</span>
        </button>

        <button onClick={() => router.push('/quizgrid')} className="bg-white p-5 rounded-sm border relative flex flex-col items-center border-blue-200 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-blue-500 mb-2"><Gamepad2 size={24} /></div>
          <h3 className="font-bold text-gray-800">Battlefield</h3>
          <p className="text-xs text-gray-500">Challenge others and win points</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium">10%</span>
        </button>

        <button onClick={() => router.push('/classes')} className="bg-white p-5 rounded-sm border relative flex flex-col items-center border-blue-400 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-blue-400 mb-2"><BookOpenText size={24} /></div>
          <h3 className="font-bold text-gray-800">Courses</h3>
          <p className="text-xs text-gray-500">Access our copyright free contents</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium p-1 px-2">{user?.courseProgress ?? 0}</span>
        </button>

        <button onClick={handleLibraryClick} className="bg-white p-5 rounded-sm border relative flex flex-col items-center border-sky-300 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-sky-500 mb-2"><Layers size={24} /></div>
          <h3 className="font-bold text-gray-800">My Library</h3>
          <p className="text-xs text-gray-500">Review key concepts</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium p-1 px-2">{library?.documents?.length || 0}</span>
        </button>

      </div>
    </section>

      {/* Recents & Updates */}
      
        <section>
          <h3 className="text-lg font-bold mb-4">Recents</h3>
          <div className="bg-[#e5e7eb] border border-gray-100 rounded-sm shadow-sm overflow-hidden w-full">
            {recentItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center p-4 gap-4 ${idx !== recentItems.length - 1 ? 'border-2 border-gray-50' : ''}`}>
                <span className={`text-xl font-black w-8 ${item.color}`}>{item.initial}</span>
                <div className="h-8 w-1px bg-gray-200" />
                <span className="font-medium text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </section>

      <div className="h-40 w-60 border-2 border-b-blue-800 mt-7">

      </div>

     {/* --- INITIALIZATION DIALOG --- */}
    <Dialog open={isLibDialogOpen} onOpenChange={setIsLibDialogOpen}>
      <DialogContent className="sm:max-w-106.25 rounded-sm p-8 border-none shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Setup Your Library</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a name and cover for your study vault to begin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Thumbnail Upload Box */}
          <div className="w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
            {previewUrl ? (
              <>
                <Image 
                  src={previewUrl} 
                  alt="Cover" 
                  fill 
                  className="w-full h-full object-cover" 
                />
                <button 
                  type="button"
                  onClick={() => { 
                    setPendingFile(null); 
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null); 
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full text-[10px] px-2 hover:bg-red-500 transition-colors"
                >
                  Remove
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <ImageIcon className="text-gray-300" size={32} />
                <span className="text-xs font-bold text-gray-400">Select Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            )}
          </div>

          {/* Library Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Library Name</label>
            <Input 
              placeholder="e.g. My Science Library" 
              value={libName}
              onChange={(e) => setLibName(e.target.value)}
              className="rounded-xl border-gray-100 bg-gray-50 py-6 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleCreateLibrary}
            disabled={!libName || createLibMutation.isPending || isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-blue-100"
          >
            {(createLibMutation.isPending || isUploading) ? (
              <Loader2 className="animate-spin" /> 
            ) : (
              "Create & Continue"
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setIsLibDialogOpen(false)} 
            className="text-gray-400 font-bold"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>


    <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="hidden">
          <DialogTitle>Announcement</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square md:aspect-video">
          {settings?.popupImageUrl && (
            <Image 
              src={settings.popupImageUrl} 
              alt="Announcement" 
              fill 
              className="object-cover" 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
   </div>    
  );
}