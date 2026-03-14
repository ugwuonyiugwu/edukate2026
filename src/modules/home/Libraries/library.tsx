'use client';

import { trpc } from "@/trpc/client";
import { Loader2, BookOpen, Search, Download, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { UserAvatar } from "@/components/reusableavatar/avatar";

export default function DiscoveryPage() {
  // Fetching libraries (includes totalDownloads calculated in the procedure)
  const { data: libraries, isLoading } = trpc.documents.getAllLibraries.useQuery();
  const { data: user } = trpc.users.getOne.useQuery();
  const [search, setSearch] = useState("");

  const filteredLibs = libraries?.filter(lib => 
    lib.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#FAFAFA]">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Explore Libraries
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Browse through cumulative knowledge shared by the community.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by library name..." 
            className="pl-10 h-12 rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLibs?.map((lib) => (
          <Link key={lib.id} href={`/dashboard/library/${lib.id}`}>
            <div className="group bg-white rounded-[35px] p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              
              {/* Thumbnail Area */}
              <div className="relative h-48 w-full rounded-[28px] overflow-hidden bg-gray-100 mb-5">
                {lib.thumbnailUrl ? (
                  <Image 
                    src={lib.thumbnailUrl} 
                    alt={lib.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                    <BookOpen className="text-white/20" size={56} />
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex flex-col flex-grow px-1">
                <div className="flex flex-row gap-2">
                  <UserAvatar imageUrl={user?.imageUrl} size={28} className="ring-2 ring-white shadow-sm" />
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-4">
                    {lib.name}
                  </h3>
                </div>
                
                {/* Steady Stats Container */}
                <div className="grid grid-cols-2 gap-2 py-4 border-y border-gray-50 mb-auto">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{lib.documents?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Download size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{lib.totalDownloads || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Avatar & Arrow */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">                 
                  </div>
                 
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredLibs?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
          <Search size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold text-lg">No collections match your search.</p>
          <button 
            onClick={() => setSearch("")} 
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}