"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";
import { Search, MessageCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";

export const TeacherView = () => {
  const [teachers] = trpc.teacher.getAll.useSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return teachers;

    return teachers.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.subjects.toLowerCase().includes(query) ||
      t.topics.toLowerCase().includes(query)
    );
  }, [searchQuery, teachers]);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* SEARCH HEADER - Clean & Compact */}
      <div className="mb-6">

        <div className="my-5 text-center">
           <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">
              Instructor Directory
           </h1>
            <p>Explore our comprehensive directory of qualified educators across all academic and professional fields.</p>
        </div>
        
       
        <div className="relative w-90 mb-15 mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w- text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search instructors..."
            className="pl-10 h-12 rounded-full border-slate-200 shadow-sm focus:ring-blue-500/10 transition-all text-sm bg-"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TEACHERS LIST - Ticket UI Style */}
      <div className="space-y-3">
        {filteredTeachers.map((teacher) => (
          <Card 
            key={teacher.id} 
            className="relative flex flex-row items-center border border-slate-100 shadow-sm overflow-hidden h-16 sm:h-20 transition-all hover:border-blue-300 hover:shadow-md flex-nowrap bg-white"
          >
            
            {/* LEFT: Profile Symbol with Perforation (Matching Amount Section) */}
            <div className="flex items-center justify-center px-3 sm:px-6 h-full bg-slate-50/50 min-w-15 sm:min-w-25 border-r border-dashed border-slate-200 relative shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4 sm:w-5 " />
              </div>
              
              {/* Decorative Perforation Circles */}
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-100 rounded-full" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-100 rounded-full" />
            </div>

            {/* MIDDLE: Info (Ensures text wraps/truncates correctly) */}
            <div className="flex-1 px-3 sm:px-5 min-w-0 overflow-hidden">
              <h3 className="text-[12px] sm:text-[15px] font-bold text-slate-900 truncate uppercase tracking-tight">
                {teacher.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] sm:text-xs font-semibold text-blue-700 truncate">
                  {teacher.subjects}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <p className="hidden sm:block text-[10px] sm:text-xs text-slate-400 truncate italic">
                  {teacher.topics}
                </p>
              </div>
            </div>

            {/* RIGHT: Apply Button (Always visible on same line) */}
            <div className="px-2 sm:px-6 h-full flex items-center shrink-0">
              <Button 
                asChild
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-sm h-7 sm:h-9 px-3 sm:px-6 uppercase text-[9px] sm:text-[10px] tracking-widest shadow-sm border-none transition-transform active:scale-95"
              >
                <a 
                  href={`https://wa.me/${teacher.whatsappNumber}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <SiWhatsapp className="w-3 sm:w-4 h-4 fill-current" />
                  <span>massage</span>
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredTeachers.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-sm font-medium">
            No instructors found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <Button 
            variant="link" 
            onClick={() => setSearchQuery("")}
            className="text-blue-600 mt-2 font-bold uppercase text-[10px] tracking-widest"
          >
            Show All
          </Button>
        </div>
      )}
    </div>
  );
};