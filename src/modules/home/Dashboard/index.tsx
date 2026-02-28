'use client';
import { trpc } from "@/trpc/client";
import { BookOpen, Trophy, GraduationCap, ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

interface CarouselFrameProps {
  children: React.ReactNode;
  className?: string;
}

// Frame component to keep slides clean
const CarouselFrame = ({ children, className = "" }: CarouselFrameProps) => (
  <div className={`embla__slide flex-[0_0_100%] min-w-0 h-40 rounded-3xl p-6 ${className}`}>
    <div className="w-full h-full flex flex-col justify-center">
      {children}
    </div>
  </div>
);

export function DashboardView() {
  const { data: user } = trpc.users.getOne.useQuery();

  // 1. Initialize Embla with Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update dots when slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

 useEffect(() => {
  if (!emblaApi) return;

  onSelect();
  emblaApi.on('select', onSelect);
  return () => {
    emblaApi.off('select', onSelect);
  };
}, [emblaApi, onSelect]);

  const recentItems = [
    { id: '1', title: 'Fundamentals of History', initial: 'H', color: 'text-blue-600' },
    { id: '2', title: 'New School Physics', initial: 'P', color: 'text-blue-800' },
    { id: '3', title: 'Chemical Analysis', initial: 'C', color: 'text-blue-900' },
  ];

  // Total slides for dots
  const slideCount = 3;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome {user?.username || user?.firstName || 'User'},</h1>
          <p className="text-gray-500 text-sm mt-1">The only way to do great work is to love what you do!</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-2xl border border-blue-100 shadow-sm mb-5 text-right shrink-0">
          <p className="text-[10px] font-bold uppercase text-gray-500">User Point Balance</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-blue-700">{user?.points ?? 0}</span>
            <span className="text-xl ">💎</span>
          </div>
        </div>
      </div>

      {/* 2. Embla Carousel replaces the Purple Div */}
      <div className="embla mb-10 group relative" ref={emblaRef}>
        <div className="embla__container flex">
          
          {/* Frame 1 - Quiz Focus */}
          <CarouselFrame className="bg-purple-600 shadow-lg mx-36 md:h-60 shadow-purple-100">
            <div className="flex items-center gap-4 text-white">
              <Trophy size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">New Quizathon Live!</h3>
                <p className="text-sm opacity-90">Test your skills in Advanced Web Security today.</p>
                <button className="mt-3 bg-white text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full">Join Now</button>
              </div>
            </div>
          </CarouselFrame>

          {/* Frame 2 - Course Progress */}
          <CarouselFrame className="bg-linear-to-r from-blue-600 mx-36 md:h-60 to-blue-500 shadow-lg shadow-blue-100">
            <div className="flex items-center gap-4 text-white">
              <BookOpen size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">Pick Up Where You Left Off</h3>
                <p className="text-sm opacity-90">Continue Intro to Quantum Computing. Only 3 modules left!</p>
                <button className="mt-3 bg-white text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full">Continue Reading</button>
              </div>
            </div>
          </CarouselFrame>

          {/* Frame 3 - Scholarship Update */}
          <CarouselFrame className="bg-emerald-600 shadow-lg md:h-60 shadow-emerald-100">
            <div className="flex items-center gap-4 text-white">
              <GraduationCap size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">Scholarship Update</h3>
                <p className="text-sm opacity-90">Merit-based scholarships are now open. Apply before June 30th.</p>
                <button className="mt-3 bg-white text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full">View Requirements</button>
              </div>
            </div>
          </CarouselFrame>

        </div>

        {/* 3. Navigation Controls (Dots and Arrows - optional) */}
        <div className="absolute bottom-[-16] left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full border border-white/50 transition-all ${
                index === selectedIndex ? 'bg-black w-6' : 'bg-neutral-700 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <section className="mb-10">
        <h3 className="text-lg font-bold mb-4">Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quizathon Card */}
          <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} />
              <span className="font-semibold">Quizathon</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">10%</span>
              <p className="text-[10px] opacity-80 leading-tight pb-1">You&#39;ve completed 2 opened quizzes</p>
            </div>
          </div>

          {/* Courses Card */}
          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-700">
              <BookOpen size={18} />
              <span className="font-semibold">Courses</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-blue-800">15%</span>
              <p className="text-[10px] text-gray-500 leading-tight pb-1">You&#39;ve read 15 books</p>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-100">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <span className="font-semibold">Streak</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-blue-600">23</span>
              <p className="text-[10px] text-gray-400 leading-tight pb-1">Your longest streak is 64 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Recents List */}
        <section>
          <h3 className="text-lg font-bold mb-4">Recents</h3>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {recentItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center p-4 gap-4 ${idx !== recentItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className={`text-xl font-black w-8 ${item.color}`}>{item.initial}</span>
                <div className="h-8 w-1px bg-gray-200" />
                <span className="font-medium text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Scholarship & Ads */}
        <div className="grid grid-cols-2 gap-4">
          <section>
            <h3 className="text-lg font-bold mb-4">Scholarship Updates</h3>
            <div className="bg-blue-50/50 rounded-2xl h-32 border border-dashed border-blue-200" />
          </section>
          <section>
            <h3 className="text-lg font-bold mb-4">Ads</h3>
            <div className="bg-gray-50 rounded-2xl h-32 border border-dashed border-gray-200" />
          </section>
        </div>
      </div>
    </div>
  );
}