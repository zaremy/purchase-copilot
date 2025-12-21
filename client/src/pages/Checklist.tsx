import { MobileLayout } from '@/components/MobileLayout';
import { useVehicle, useUpdateVehicle } from '@/lib/api';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, Check, X, HelpCircle, Camera, Loader2 } from 'lucide-react';
import { CHECKLIST_DATA } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChecklistSection() {
  const [, params] = useRoute('/candidate/:id/checklist/:section');
  const [, setLocation] = useLocation();
  const { data: candidate, isLoading } = useVehicle(params?.id || '');
  const updateVehicleMutation = useUpdateVehicle();
  
  const section = decodeURIComponent(params?.section || '');
  
  const setChecklistResponse = (candidateId: string, itemId: string, response: any) => {
    if (!candidate) return;
    
    const newResponses = { ...candidate.checklistResponses, [itemId]: response };
    
    // Recalculate completeness and risk score
    const totalItems = 30;
    const answeredCount = Object.keys(newResponses).length;
    const completeness = Math.min(100, Math.round((answeredCount / totalItems) * 100));
    
    const fails = Object.values(newResponses).filter((r: any) => r.status === 'fail').length;
    const riskScore = Math.min(100, fails * 15);
    
    updateVehicleMutation.mutate({
      id: candidateId,
      updates: {
        checklistResponses: newResponses,
        completeness,
        riskScore,
      },
    });
  };
  
  if (isLoading) {
    return (
      <MobileLayout showNav={false} headerStyle="dark" header={<div />}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
        </div>
      </MobileLayout>
    );
  }
  
  if (!candidate) return null;

  const items = CHECKLIST_DATA.filter(i => i.section === section);

  return (
    <MobileLayout
      showNav={false}
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => setLocation(`/candidate/${candidate.id}?tab=checklist`)} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-sm leading-tight text-white font-tech uppercase tracking-wide">{section}</h1>
            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide mt-0.5">{items.length} items</p>
          </div>
          <div className="w-8" />
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {items.map((item) => {
          const response = candidate.checklistResponses[item.id];
          const status = response?.status;

          return (
            <div key={item.id} className="bg-white rounded-md p-4 border border-neutral-200 ios-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4">
                  <p className="font-medium text-sm text-neutral-900 leading-relaxed">{item.question}</p>
                  
                </div>
                
                {item.severity >= 8 && (
                   <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0">Critical</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setChecklistResponse(candidate.id, item.id, { itemId: item.id, status: 'pass' })}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-sm border transition-all active:scale-[0.98]",
                    status === 'pass' 
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm" 
                      : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                  )}
                >
                  <Check className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pass</span>
                </button>

                <button
                  onClick={() => setChecklistResponse(candidate.id, item.id, { itemId: item.id, status: 'fail' })}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-sm border transition-all active:scale-[0.98]",
                    status === 'fail' 
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                  )}
                >
                  <X className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Fail</span>
                </button>

                <button
                  onClick={() => setChecklistResponse(candidate.id, item.id, { itemId: item.id, status: 'unknown' })}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-sm border transition-all active:scale-[0.98]",
                    status === 'unknown' 
                      ? "bg-neutral-200 text-neutral-900 border-neutral-200 shadow-sm" 
                      : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                  )}
                >
                  <HelpCircle className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Unknown</span>
                </button>
              </div>

              <AnimatePresence>
                {status && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                       <input 
                         type="text" 
                         placeholder="ADD NOTES..." 
                         value={response?.notes || ''}
                         onChange={(e) => setChecklistResponse(candidate.id, item.id, { 
                           ...response, 
                           itemId: item.id, 
                           notes: e.target.value 
                         })}
                         className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-2 text-xs text-neutral-900 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-neutral-400 placeholder:text-[10px] placeholder:font-medium placeholder:uppercase"
                       />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        
        {/* Done Button */}
        <div className="px-4 py-6">
          <button
            onClick={() => {
              // Calculate completeness based on answered items
              const responses = candidate.checklistResponses || {};
              const totalItems = 30;
              const answeredCount = Object.keys(responses).length;
              const completeness = Math.min(100, Math.round((answeredCount / totalItems) * 100));
              
              // Calculate risk score based on failed items
              const fails = Object.values(responses).filter((r: any) => r.status === 'fail').length;
              const riskScore = Math.min(100, fails * 15);
              
              updateVehicleMutation.mutate({
                id: candidate.id,
                updates: { completeness, riskScore },
              });
              setLocation(`/candidate/${candidate.id}?tab=checklist`);
            }}
            className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
