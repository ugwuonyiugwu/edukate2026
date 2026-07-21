"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export const ScholarshipFeed = () => {
  const [scholarships] = trpc.scholarship.getAllAdmin.useSuspenseQuery();

  return (
    <div className="space-y-3 w-full mt-4 max-w-4xl mx-auto p-2">
      {/* 1. HEADER BANNER */}
      <div className="relative w-full overflow-hidden mb-6 rounded-sm shadow-sm border border-slate-200 
        aspect-3/1 sm:aspect-4/1 lg:aspect-7/2 min-h-30 sm:min-h-40 flex items-center">
        <Image
          src="/backgroud-images/scholarship-header.png" 
          fill
          alt="Scholarship Banner"           
          priority           
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover" 
        />
        
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/10 via-slate-950/60 to-transparent z-10" />

        {/* Text Content Overlay */}
        <div className="relative ml-80 z-20 px-6 sm:px-10 max-w-xl text-white">
           <h1 className="text-lg sm:text-4xl font-black tracking-tight">Scholarship Award 2026</h1>
          <p className="text-lg sm:text-2xl tracking-tight">
            Unlock Your Educational Future
          </p>
          <p className="text-[11px] sm:text-sm text-white mt-1 line-clamp-2">
            Explore verified funding opportunities, grants, and financial aid designed to support your academic journey.
          </p>
        </div>
      </div>

      {/* 2. SCHOLARSHIP CARDS */}
      {scholarships.map((s) => (
        <Link key={s.id} href={`/scholarship/${s.id}`} className="block group">
          <Card className="relative rounded-sm flex flex-row items-center border border-slate-100 shadow-sm overflow-hidden h-16 sm:h-20 transition-all group-hover:border-primary/40 group-hover:shadow-md cursor-pointer flex-nowrap">
            
            {/* MIDDLE: Info (Ensures text wraps/truncates correctly, taking up the left space now) */}
            <div className="flex-1 px-4 sm:px-6 min-w-0 overflow-hidden">
              <h3 className="text-[12px] sm:text-[15px] font-bold text-slate-900 truncate uppercase">
                {s.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                {s.description}
              </p>
            </div>

            {/* RIGHT: Apply Button (Always visible on same line) */}
            <div className="px-2 sm:px-6 h-full flex items-center shrink-0">
              <Button 
                asChild
                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-sm h-7 sm:h-9 px-3 sm:px-8 uppercase text-[9px] sm:text-[10px] tracking-widest shadow-sm border-none"
              >
                <span>Apply</span>
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};