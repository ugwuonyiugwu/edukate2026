"use client";

import { trpc } from "@/trpc/client";
import { Loader2, Image as ImageIcon, BookOpenText, Layers, Gamepad2, PenTool, TrophyIcon } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/app/utils/uploadthing";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CarouselFrameProps {
  children?: React.ReactNode;
  className?: string;
}

const CarouselFrame = ({ children, className = "" }: CarouselFrameProps) => (
  <div className={`embla__slide flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] min-w-0 h-20 rounded-xs ${className}`}>
    <div className="w-full h-20 flex flex-col justify-center p-6">
      {children}
    </div>
  </div>
);

const COLORS = ['#2563eb', '#f97316', '#00C7B1']; // Blue for courses, Orange for score, Teal for time-weighting

export const DashboardView = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { startUpload } = useUploadThing("libraryThumbnailUploader");
  
  // Data Fetching
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();
  const { data: settings, isLoading } = trpc.settings.getAnnouncement.useQuery();
  const { data: allClasses = [], isLoading: isClassesLoading } = trpc.classes.getAll.useQuery({ level: "all" });
  const { data: enrolledIds = [], isLoading: isEnrollmentsLoading } = trpc.classes.getEnrolledClassIds.useQuery();

  // Dynamic Recent Items Logic
  const recentItems = useMemo(() => {
    if (isClassesLoading || isEnrollmentsLoading) return [];
    const matched = allClasses.filter((c) => 
      enrolledIds.includes(c.id) || enrolledIds.includes(String(c.id))
    );
    return matched.slice(-5);
  }, [allClasses, enrolledIds, isClassesLoading, isEnrollmentsLoading]);

  // Performance calculation referenced to active days, course progress, and total score
  const performanceData = useMemo(() => {
    if (!user) return [{ name: "Courses Taken", value: 0 }, { name: "Total Score", value: 0 }, { name: "Active Days", value: 1 }];
    
    const now = new Date().getTime();
    const created = new Date(user.createdAt || Date.now()).getTime();
    const activeDays = Math.max(1, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
    
    const courseProgress = user.courseProgress ?? 0;
    const totalScore = (user as any).totalScore ?? 0;

    // Weight distributions for the visual chart breakdown
    return [
      { name: "Courses Taken", value: courseProgress },
      { name: "Total Score", value: totalScore }, 
      { name: "Active Days", value: activeDays },
    ];
  }, [user]);
  
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
    { loop: true, slidesToScroll: 1, align: 'start', skipSnaps: false }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })]
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
    if (isLibLoading) return;
    if (library) {
      router.push(`/library`);
    } else {
      e.preventDefault();
      setIsLibDialogOpen(true);
    }
  };

  return (
    <div className="max-w-full mx-auto px-2 my-4 sm:px-4 bg-zinc-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2 gap-4">
        <div>
          <h1 className="text-xl ml-5 capitalize md:text-2xl font-bold text-blue-950" suppressHydrationWarning> Welcome {user?.username || user?.firstName || 'User'} </h1>
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
      <div className="embla__container flex gap-2">
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] min-w-0">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-purple-100 rounded-xl">
            <Image src="/backgroud-images/carousel1.png" alt="Slide 1" fill className="object-cover opacity-80" />
          </CarouselFrame>
        </div>
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] min-w-0">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-blue-100 rounded-xl">
            <Image src="/backgroud-images/carousel2.png" alt="Slide 2" fill className="object-cover opacity-80" />
          </CarouselFrame>
        </div>
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] min-w-0">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-blue-100 rounded-xl">
            <Image src="/backgroud-images/carousel2.png" alt="Slide 2" fill className="object-cover opacity-80" />
          </CarouselFrame>
        </div>
        <div className="mr-2 embla__slide flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] min-w-0">
          <CarouselFrame className="relative overflow-hidden shadow-lg h-30 md:h-30 shadow-emerald-100 rounded-xl">
            <Image src="/backgroud-images/image3.png" alt="Slide 3" fill className="object-cover opacity-80" />
          </CarouselFrame>
        </div>
      </div>
    </div>
      
    {/* Announcement Banner */}
    <div className="w-full mb-5 border-b border-blue-100 bg-blue-100 h-12 flex items-center overflow-hidden">
      {settings?.announcementText ? (
        <div className="relative w-full max-w-[100vw] overflow-hidden py-3">
          <div className="whitespace-nowrap animate-marquee animation-duration:[25s] md:animation-duration:[20s] max-w-full">
            <span className="inline-block px-4 text-sm font-bold tracking-wide text-orange-500 md:text-base">
              {settings.announcementText}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 text-xs font-medium text-blue-400/80 animate-pulse select-none"></div>
      )}
    </div>

    {/* Dashboard Actions Section */}
    <section className="mb-10">
      <h3 className="text-lg font-bold ml-5 mb-4">Quick Action</h3>
      <div className="grid grid-cols-2 gap-1 px-2">
        <button onClick={() => router.push('/quizathon')} className="bg-zinc-50 p-5 rounded-sm lg:pb-8 border relative flex flex-col items-center border-orange-200 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-orange-500 mx-auto mb-2"><TrophyIcon size={24} /></div>
          <h3 className="font-bold uppercase text-blue-950 text-sm ">Quizathon</h3>
          <p className="text-xs font-bold text-blue-950">Join our monthly quizathon and win a huge price</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium">10%</span>
        </button>

        <button onClick={() => router.push('/quizgrid')} className="bg-zinc-50 p-5 rounded-sm border relative flex flex-col items-center border-blue-200 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-orange-500 mx-auto mb-2"><Gamepad2 size={24} /></div>
          <h3 className="font-bold uppercase text-gray-800">Quizgrid</h3>
          <p className="text-xs font-bold text-blue-950">Challenge others and win a price</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium">10%</span>
        </button>

        <button onClick={() => router.push('/classes')} className="bg-zinc-50 p-5 rounded-sm lg:pb-8 border relative flex flex-col items-center border-blue-400 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-blue-400 mx-auto mb-2"><BookOpenText size={24} /></div>
          <h3 className="font-bold uppercase text-gray-800">Courses</h3>
          <p className="text-xs font-bold text-blue-950">Access our copyright free contents</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium p-1 px-2">{user?.courseProgress ?? 0}</span>
        </button>

        <button onClick={handleLibraryClick} className="bg-zinc-50 p-5 rounded-sm border relative flex flex-col items-center border-sky-300 shadow-sm hover:shadow-md transition-all active:scale-95">
          <div className="text-sky-500 mx-auto mb-2"><Layers size={24} /></div>
          <h3 className="font-bold uppercase text-gray-800">My Library</h3>
          <p className="text-xs font-bold text-blue-950">Create a library and share your copyright free contents</p>
          <span className="absolute top-2 right-2 text-blue-700 font-medium p-1 px-2">{library?.documents?.length || 0}</span>
        </button>
      </div>
    </section>

      <section>
        <h3 className="text-lg font-bold ml-5 mb-4">Recents</h3>
        <div className="bg-blue-100 border border-gray-100 rounded-sm shadow-sm overflow-hidden w-full">
          {recentItems.length > 0 ? (
            recentItems.map((item, idx) => (
              <Link 
                key={item.id} 
                href={`/classes/${item.id}`}
                className={`flex items-center p-4 gap-4 hover:bg-gray-200 transition-colors ${idx !== recentItems.length - 1 ? 'border-2 border-gray-50' : ''}`}
              >
                <span className="text-xl font-black w-8 text-blue-700">
                  {item.title.charAt(0).toUpperCase()}
                </span>
                <div className="h-8 w-px bg-gray-200" />
                <span className="font-medium text-gray-700">{item.title}</span>
              </Link>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              {(isClassesLoading || isEnrollmentsLoading) ? "Loading classes..." : "No recent classes found."}
            </div>
          )}
        </div>
      </section>

      {/* Graphical Performance Representation via Pie/Donut Chart */}
      <section className="mt-8 ml-4">
        <h3 className="text-lg font-bold mb-2">Performance & Time Matrix</h3>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm h-64 w-full max-w-sm flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-[10px] font-bold text-gray-500 mt-2.5">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Courses</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Score</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00C7B1]"></span> Days</span>
          </div>
        </div>
      </section>

     {/* --- INITIALIZATION DIALOG --- */}
    <Dialog open={isLibDialogOpen} onOpenChange={setIsLibDialogOpen}>
      <DialogContent className="sm:max-w-106.5 rounded-sm p-8 border-none shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Setup Your Library</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a name and cover for your study vault to begin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
            {previewUrl ? (
              <>
                <Image src={previewUrl} alt="Cover" fill className="w-full h-full object-cover" />
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
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

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
            {(createLibMutation.isPending || isUploading) ? <Loader2 className="animate-spin" /> : "Create & Continue"}
          </Button>
          <Button variant="ghost" onClick={() => setIsLibDialogOpen(false)} className="text-gray-400 font-bold">
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
            <Image src={settings.popupImageUrl} alt="Announcement" fill className="object-cover" />
          )}
        </div>
      </DialogContent>
    </Dialog>
   </div>    
  );
};