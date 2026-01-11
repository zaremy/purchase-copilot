import { MobileLayout } from '@/components/MobileLayout';
import { useLocalVehicle, useUpdateLocalVehicle } from '@/lib/localVehicles';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, Check, X, HelpCircle } from 'lucide-react';
import { CHECKLIST_DATA } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export default function ChecklistSection() {
  const [, params] = useRoute('/candidate/:id/checklist/:section');
  const [, setLocation] = useLocation();
  const id = params?.id || '';
  const candidate = useLocalVehicle(id);
  const updateVehicleMutation = useUpdateLocalVehicle();

  // Crash-proof update wrapper
  const commitUpdate = (payload: { id: string; updates: any }) => {
    try {
      if (typeof updateVehicleMutation === 'function') updateVehicleMutation(payload);
      else if (updateVehicleMutation?.mutate) updateVehicleMutation.mutate(payload);
      else throw new Error('useUpdateLocalVehicle returned unexpected shape');
    } catch (e) {
      console.error(e);
    }
  };
  
  const section = useMemo(() => decodeURIComponent(params?.section || ''), [params?.section]);
  const items = useMemo(() => CHECKLIST_DATA.filter(i => i.section === section), [section]);
  
  const setChecklistResponse = (candidateId: string, itemId: string, response: any) => {
    if (!candidate) return;
    
    const newResponses = { ...candidate.checklistResponses, [itemId]: response };
    
    // Recalculate completeness and risk score
    const totalItems = 30;
    const answeredCount = Object.keys(newResponses).length;
    const completeness = Math.min(100, Math.round((answeredCount / totalItems) * 100));
    
    const fails = Object.values(newResponses).filter((r: any) => r.status === 'fail').length;
    const riskScore = Math.min(100, fails * 15);
    
    commitUpdate({
      id: candidateId,
      updates: {
        checklistResponses: newResponses,
        completeness,
        riskScore,
      },
    });
  };
  
  if (!candidate) {
    return (
      <MobileLayout showNav={false} headerStyle="dark" header={<div />}>
        <div className="p-6">
          <p className="text-sm text-neutral-600">Vehicle not found.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showNav={false}
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-2 px-1">
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
              
              commitUpdate({
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
