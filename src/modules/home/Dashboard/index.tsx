'use client';
import { trpc } from "@/trpc/client";
import { BookOpen, Trophy, GraduationCap, Loader2, Image as ImageIcon, BookOpenText, Layers, Gamepad2, PenTool } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/app/utils/uploadthing";
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
  
  // Data Fetching
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();

  // Library Creation States
  const [isLibDialogOpen, setIsLibDialogOpen] = useState(false);
  const [libName, setLibName] = useState("");
  const [libThumbnail, setLibThumbnail] = useState<string | null>(null);

  // Mutations
  const createLibMutation = trpc.documents.createLibrary.useMutation({
    onSuccess: () => {
      utils.documents.getLibrary.invalidate();
      setIsLibDialogOpen(false);
      router.push("/library");
    },
  });

  // Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      slidesToScroll: 1, // Changed to 1 to ensure smooth, single-slide navigation
      align: 'start'     // Aligns the active slide to the start of the container
    }, 
    [Autoplay({ delay: 5000 })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect); // Added reInit to handle responsive changes
    return () => { 
      emblaApi.off('select', onSelect); 
      emblaApi.off('reInit', onSelect); 
    };
  }, [emblaApi, onSelect]);

  // Intercept Library Link if no library exists
  const handleLibraryClick = (e: React.MouseEvent) => {
    if (!isLibLoading && library === null) {
      e.preventDefault();
      setIsLibDialogOpen(true);
    }
  };

  const handleCreateLibrary = () => {
    createLibMutation.mutate({
      name: libName,
      thumbnailUrl: libThumbnail ?? undefined,
    });
  };

  const recentItems = [
    { id: '1', title: 'Fundamentals of History', initial: 'H', color: 'text-blue-600' },
    { id: '2', title: 'New School Physics', initial: 'P', color: 'text-blue-800' },
    { id: '3', title: 'Chemical Analysis', initial: 'C', color: 'text-blue-900' },
  ];

  return (
    <div className="max-w-full mx-auto p-2 sm:p-4 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" suppressHydrationWarning> Welcome {user?.username || user?.firstName || 'User'}, </h1>
          <p className="text-gray-500 text-sm mt-1">The only way to do great work is to love what you do!</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-sm border border-blue-100 shadow-sm mb-5 text-right shrink-0">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-blue-700">{user?.points ?? 0}</span>
            <span className="text-xl">💎</span>
          </div>
        </div>
    </div>

    {/* Embla Carousel - Responsive Wrapper */}
    <div className="embla mb-10 group relative overflow-hidden w-full" ref={emblaRef}>
      <div className="embla__container flex">
        
        {/* Slide 1 */}
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-2">
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
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-2">
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
        <div className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-2">
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
     
     {/* Progress Section */}
<section className="mb-10">
  <h3 className="text-lg font-bold mb-4">Progress</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200">
      <div className="flex items-center gap-2 mb-4"><Trophy size={18} /><span className="font-semibold">Quizathon</span></div>
      <div className="flex items-end gap-3"><span className="text-3xl font-bold">10%</span></div>
    </div>

    <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-blue-700"><BookOpen size={18} /><span className="font-semibold">Courses</span></div>
      <div className="flex items-end gap-3"><span className="text-3xl font-bold text-blue-800">{user?.courseProgress ?? 0}</span></div>
    </div>

    <Link href="/library" onClick={handleLibraryClick}>
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-100 transition-all hover:border-blue-200 cursor-pointer active:scale-95">
        <div className="flex items-center justify-between mb-4 text-blue-600">
          <span className="font-semibold">My library</span>
          {isLibLoading && <Loader2 size={14} className="animate-spin" />}
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-blue-600">{library?.documents?.length || 0}</span>
          <p className="text-[10px] text-gray-400 leading-tight pb-1">{library ? `Welcome to ${library.name}` : "Click to initialize"}</p>
        </div>
      </div>
    </Link>
  </div>
</section>

{/* Dashboard Actions Section */}
<section className="mb-10">
  <h3 className="text-lg font-bold mb-4">Progress</h3>
  <div className="grid grid-cols-2 gap-4">
    
    <button onClick={() => router.push('/practice')} className="bg-white p-5 rounded-3xl border border-orange-200 shadow-sm hover:shadow-md transition-all active:scale-95 text-left">
      <div className="text-orange-500 mb-2"><PenTool size={24} /></div>
      <h3 className="font-bold text-gray-800">Quizathon</h3>
      <p className="text-xs text-gray-500">Join our monthly quizathon</p>
    </button>

    <button onClick={() => router.push('/battlefield')} className="bg-white p-5 rounded-3xl border border-blue-200 shadow-sm hover:shadow-md transition-all active:scale-95 text-left">
      <div className="text-blue-500 mb-2"><Gamepad2 size={24} /></div>
      <h3 className="font-bold text-gray-800">Battlefield</h3>
      <p className="text-xs text-gray-500">Challenge others and win points</p>
    </button>

    <button onClick={() => router.push('/study-pal')} className="bg-white p-5 rounded-3xl border border-blue-400 shadow-sm hover:shadow-md transition-all active:scale-95 text-left">
      <div className="text-blue-400 mb-2"><BookOpenText size={24} /></div>
      <h3 className="font-bold text-gray-800">Courses</h3>
      <p className="text-xs text-gray-500">Access our copyright free contents</p>
    </button>

    <button onClick={() => router.push('/flashcards')} className="bg-white p-5 rounded-3xl border border-sky-300 shadow-sm hover:shadow-md transition-all active:scale-95 text-left">
      <div className="text-sky-500 mb-2"><Layers size={24} /></div>
      <h3 className="font-bold text-gray-800">Flashcards</h3>
      <p className="text-xs text-gray-500">Review key concepts</p>
    </button>

  </div>
</section>

      {/* Recents & Updates */}
      <div className="grid grid-row-1 md:grid-row-2 gap-10">
        <section>
          <h3 className="text-lg font-bold mb-4">Recents</h3>
          <div className="bg-amber-600 border border-gray-100 rounded-2xl shadow-sm overflow-hidden w-full">
            {recentItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center p-4 gap-4 ${idx !== recentItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className={`text-xl font-black w-8 ${item.color}`}>{item.initial}</span>
                <div className="h-8 w-1px bg-gray-200" />
                <span className="font-medium text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- INITIALIZATION DIALOG --- */}
      <Dialog open={isLibDialogOpen} onOpenChange={setIsLibDialogOpen}>
        <DialogContent className="sm:max-w-106.25 rounded-[32px] p-8 border-none shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Setup Your Library</DialogTitle>
            <DialogDescription className="text-gray-500">
              Create a name and cover for your study vault to begin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Thumbnail Upload Box */}
            <div className="w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
              {libThumbnail ? (
                <>
                  <Image src={libThumbnail} alt="Cover" fill className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setLibThumbnail(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full text-[10px] px-2 hover:bg-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="text-gray-300" size={32} />
                  <UploadButton
                    endpoint="libraryThumbnailUploader"
                    onClientUploadComplete={(res) => setLibThumbnail(res[0].url)}
                    appearance={{
                      button: "bg-blue-600 text-xs font-bold rounded-full px-4 py-2 h-auto",
                      allowedContent: "hidden"
                    }}
                  />
                </div>
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
              disabled={!libName || createLibMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-blue-100"
            >
              {createLibMutation.isPending ? <Loader2 className="animate-spin" /> : "Create & Continue"}
            </Button>
            <Button variant="ghost" onClick={() => setIsLibDialogOpen(false)} className="text-gray-400 font-bold">
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}