import { MobileLayout } from '@/components/MobileLayout';
import { CandidateCard } from '@/components/CandidateCard';
import { useVehicles } from '@/lib/api';
import { Plus, ScanLine, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AddVehicleSheet } from '@/components/AddVehicleSheet';

export default function Home() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const archivedCandidates = vehicles.filter(c => c.status === 'archived');
  const activeCandidates = vehicles.filter(c => c.status !== 'archived');

  return (
    <MobileLayout
      headerStyle="dark"
      sheet={
        <AddVehicleSheet 
          isOpen={isAddSheetOpen} 
          onClose={() => setIsAddSheetOpen(false)} 
        />
      }
      header={
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-3 pl-1">
             <h1 className="text-lg tracking-tight text-white uppercase">
               <span className="font-bold">Pre-Purchase</span><span className="font-normal">Pal</span>
             </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddSheetOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-red-700 transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      }
    >
      {/* DARK CONTROL SURFACE (Stats / Focus Area) */}
      <div className="bg-neutral-950 pb-8 pt-2 px-4">
         <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center text-center p-4">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2">Completed</span>
               <span className="text-4xl font-medium text-white tracking-tighter font-mono">{vehicles.filter(c => c.completeness === 100 && c.status === 'active').length}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center p-4 border-l border-neutral-900">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2">In Progress</span>
               <span className={cn(
                 "text-4xl font-medium tracking-tighter font-mono",
                 vehicles.filter(c => c.completeness < 100 && c.status === 'active').length > 0 
                   ? "text-primary" 
                   : "text-neutral-500"
               )}>
                 {vehicles.filter(c => c.completeness < 100 && c.status === 'active').length}
               </span>
            </div>
         </div>
      </div>

      {/* LIGHT CONTENT SURFACE */}
      <div className="bg-[#F0EDE8] min-h-[500px] pt-6 px-4">
        <div>
          <div className="flex justify-between items-end mb-4 border-b border-neutral-300/50 pb-2">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Your Garage</h3>
          </div>
          
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
            ) : (
            <div className="space-y-4">
              {activeCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <CandidateCard candidate={candidate} />
                </motion.div>
              ))}
            </div>
            )}
          
          {!isLoading && activeCandidates.length === 0 && (
             <div className="text-center py-12">
                <ScanLine className="w-12 h-12 mx-auto mb-4 text-neutral-400" strokeWidth={1} />
                <p className="text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto mb-6">
                  Pre-Purchase Pal is here to ensure you purchase with confidence. Let's get started on your first automotive Pre-Purchase checklist.
                </p>
                <button 
                  onClick={() => setIsAddSheetOpen(true)}
                  className="px-6 py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-sm shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  Add Vehicle
                </button>
             </div>
          )}

          {/* Archived Section */}
          {archivedCandidates.length > 0 && (
            <div className="mt-8 pt-4 border-t border-neutral-300/50">
              <button 
                onClick={() => setIsArchivedOpen(!isArchivedOpen)}
                className="w-full flex items-center justify-between group mb-4"
              >
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-hover:text-neutral-700 transition-colors">
                  Archived ({archivedCandidates.length})
                </h3>
                <ChevronDown className={cn(
                  "w-4 h-4 text-neutral-400 transition-transform duration-200",
                  isArchivedOpen && "rotate-180"
                )} />
              </button>
              
              <AnimatePresence>
                {isArchivedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pb-8">
                      {archivedCandidates.map((candidate) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                        >
                           <CandidateCard candidate={candidate} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
