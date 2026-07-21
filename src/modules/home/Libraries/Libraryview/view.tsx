'use client';

import { useState } from "react"; // 1. Added useState
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Loader2, ArrowLeft, FileText, Download as DownloadIcon, ArrowRightIcon, Search, ChevronRight } from "lucide-react"; // 2. Added Search icon
import Link from "next/link";
import Image from "next/image";
import { DocumentDetailView } from "../Materialview/view";
import { LoadingSpinner } from "../../ui/components/Logospinal";

interface LibraryDetailsViewProps {
  libraryId: number;
}

export const LibraryDetailsView = ({ libraryId }: LibraryDetailsViewProps) => {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const utils = trpc.useUtils();
  
  const [searchTerm, setSearchTerm] = useState(""); // 3. Added search state

  const { data: library, isLoading } = trpc.documents.getLibraryById.useQuery({ id: libraryId });
  const downloadMutation = trpc.documents.incrementDownloads.useMutation();

  if (docId) {
    return <DocumentDetailView documentId={Number(docId)} libraryId={libraryId} />;
  }

  if (isLoading) return (
    <div>
      <LoadingSpinner/>
    </div>
  );

  if (!library || !library.documents) return <div className="p-10 text-center font-bold">No resources found.</div>;

  // --- UPDATED: FILTER AND GROUPING LOGIC ---
  type DocumentType = typeof library.documents[number];
  
  // Filter docs based on search term (name or subject)
  const filteredDocs = library.documents.filter((doc) => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedBySubject = filteredDocs.reduce((acc: Record<string, DocumentType[]>, doc) => {
    const subjectRaw = doc.subject?.trim() || "General Resources";
    const subject = subjectRaw.charAt(0).toUpperCase() + subjectRaw.slice(1).toLowerCase();
    
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(doc);
    return acc;
  }, {});

  const handleDownload = (e: React.MouseEvent, doc: DocumentType) => {
    e.preventDefault();
    e.stopPropagation();
    downloadMutation.mutate({ id: doc.id }, {
      onSuccess: () => utils.documents.getLibraryById.invalidate({ id: libraryId })
    });
    window.open(doc.fileUrl, '_blank');
  };

  return (
    <div className="px-6 pt-6 md:px-10 max-w-7xl mx-auto min-h-screen bg-zinc-50">
      <Link href="/libraries" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 font-bold text-sm">
        <ArrowLeft size={16} /> Back to Exploration
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h1 className="text-2xl font-bold text-blue-950 tracking-tight">{library.name}</h1>
        
        {/* 4. Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search topic or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-20">
        {Object.entries(groupedBySubject).length > 0 ? (
          Object.entries(groupedBySubject).map(([subject, docs]) => (
            <section key={subject} className="relative">
              <div className="flex items-center justify-between mb-8 group">
                <h2 className="text-lg font-bold text-blue-950 tracking-tight capitalize">
                  {subject}
                </h2>
                <div className="flex-1 mx-6 h-1 bg-gray-200/60" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  {docs.length} {docs.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {docs.map((doc) => (
                  <div key={doc.id} className="group bg-white border border-gray-100/50 shadow-sm p-2 hover:shadow-xl transition-all duration-500">
                    <Link href={`/libraries/${libraryId}?docId=${doc.id}`} scroll={false}>
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100 mb-5 shadow-inner">
                        {doc.thumbnailUrl ? (
                          <Image src={doc.thumbnailUrl} alt={doc.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FileText className="text-gray-300" size={48} /></div>
                        )}
                        <div className="absolute bottom-1.5 H-6 rounded-full bg-amber-50 right-2"><ChevronRight className="text-blue-800" size={24}/></div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-[16px] mb-6 px-1 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </h3>
                    </Link>

                    <button 
                      onClick={(e) => handleDownload(e, doc)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 hover:bg-black hover:text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all mb-3 shadow-sm active:scale-95"
                    >
                      <DownloadIcon size={14} /> Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-bold">No results found for "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};