import { MobileLayout } from '@/components/MobileLayout';
import { useStore } from '@/lib/store';
import { Link } from 'wouter';
import { FileText, Archive, ChevronRight, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Library() {
  const candidates = useStore((state) => state.candidates);
  
  const archivedCandidates = candidates.filter(c => c.status === 'archived');
  const purchasedCandidates = candidates.filter(c => c.status === 'purchased');
  // For "Reports", we'll consider any candidate with > 50% completeness as having a "ready" report for this MVP view
  const dossierCandidates = candidates.filter(c => c.completeness > 50);

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
           <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Reports</h1>
        </div>
      }
    >
      <div className="p-4 space-y-8 bg-[#F0EDE8] min-h-screen">
        
        {/* Reports Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-neutral-500" />
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Vehicle Reports</h2>
          </div>
          
          <div className="space-y-3">
            {dossierCandidates.length > 0 ? (
              dossierCandidates.map(candidate => (
                <div key={candidate.id} className="bg-white border border-neutral-200 rounded-sm p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 font-tech uppercase tracking-wide">
                        {candidate.year} {candidate.make}
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-0.5">
                        {candidate.model} {candidate.trim}
                      </p>
                    </div>
                    <Link href={`/candidate/${candidate.id}`}>
                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-1 rounded-sm uppercase tracking-wide hover:bg-neutral-200 cursor-pointer transition-colors">
                        {candidate.completeness}% Ready
                      </span>
                    </Link>
                  </div>
                  
                  <button className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Export PDF Report
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-neutral-100 rounded-sm border border-dashed border-neutral-300">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">No reports available</p>
                <p className="text-[10px] text-neutral-400 mt-1">Complete inspections to generate reports</p>
              </div>
            )}
          </div>
        </div>

        {/* Archived Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Archive className="w-4 h-4 text-neutral-500" />
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Archived Vehicles</h2>
          </div>

          <div className="space-y-3">
            {archivedCandidates.length > 0 ? (
              archivedCandidates.map(candidate => (
                <Link key={candidate.id} href={`/candidate/${candidate.id}`}>
                  <div className="bg-white border border-neutral-200 rounded-sm p-4 flex justify-between items-center group hover:border-neutral-300 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-sm flex items-center justify-center">
                        <Archive className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 font-tech uppercase tracking-wide group-hover:text-primary transition-colors">
                          {candidate.year} {candidate.make}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-0.5">
                          <span>{candidate.model}</span>
                          <span className="w-0.5 h-0.5 bg-neutral-300 rounded-full" />
                          <span className="flex items-center gap-1">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(candidate.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 bg-neutral-100 rounded-sm border border-dashed border-neutral-300">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">No archived vehicles</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}
