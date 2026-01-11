import { MessageSquareText, Sparkles, X, Send, RefreshCw, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CopilotFabProps {
  hasNav?: boolean;
}

const HISTORY_ITEMS = [
  { id: 1, title: "2016 Accord Inspection", date: "Today, 10:42 AM", preview: "Check specifically for VCM vibration..." },
  { id: 2, title: "Miata vs BRZ Comparison", date: "Yesterday", preview: "The Miata offers better open-top driving experience while..." },
  { id: 3, title: "Salvage Title Risk Analysis", date: "Dec 12", preview: "Rebuilt titles can be insured but resale value is typically..." },
  { id: 4, title: "Negotiation Tactics", date: "Dec 10", preview: "Focus on the upcoming major service intervals to leverage..." },
];

// AI features temporarily hidden - will reactivate in future
const AI_FEATURES_ENABLED = false;

export function CopilotFab({ hasNav = true }: CopilotFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'history'>('chat');
  const [aiState, setAiState] = useState<'loading' | 'online' | 'error'>('loading');

  // Hide AI features when disabled
  if (!AI_FEATURES_ENABLED) {
    return null;
  }

  // Simulate AI connection sequence
  useEffect(() => {
    if (isOpen) {
      setAiState('loading');
      const timer = setTimeout(() => {
        setAiState('online');
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAiState('loading');
    }
  }, [isOpen]);

  const handleRetry = () => {
    setAiState('loading');
    setTimeout(() => {
      setAiState('online');
    }, 1500);
  };

  return (
    <>
      <div className={cn("absolute right-6 z-50", hasNav ? "bottom-24" : "bottom-6")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-neutral-900 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-center border border-neutral-800 hover:bg-neutral-800 transition-colors"
        >
          <Sparkles className="w-5 h-5" strokeWidth={2} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0 z-[100] flex justify-center items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150 || info.velocity.y > 500) {
                  setIsOpen(false);
                }
              }}
              className="relative w-full h-[96%] bg-white shadow-2xl flex flex-col rounded-t-[20px] overflow-hidden border-t border-neutral-800"
            >
              {/* DARK CONTROL SURFACE */}
              <div className="bg-neutral-950 pt-3 pb-6 shrink-0 relative">
                 {/* Drag Handle */}
                 <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-700 rounded-full" />
                 
                 {/* Top Stroke for affordance */}
                 <div className="absolute top-0 left-0 right-0 h-[1px] bg-neutral-800/25" />

                 {/* Masthead */}
                 <div className="px-6 pt-8 flex justify-between items-end">
                    <div>
                       <h1 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Copilot Intelligence</h1>
                       <div className="flex items-center gap-2 h-4">
                          {aiState === 'loading' && (
                             <>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Loading...</span>
                             </>
                          )}
                          {aiState === 'online' && (
                             <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Online</span>
                             </>
                          )}
                          {aiState === 'error' && (
                             <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Not Working</span>
                                  <button onClick={handleRetry} className="text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
                                     [Retry] <RefreshCw className="w-3 h-3" />
                                  </button>
                                </div>
                             </>
                          )}
                       </div>
                    </div>

                    {/* Mode Toggle (Right Aligned) */}
                    <div className="flex gap-1 bg-neutral-900 p-1 rounded-full">
                       <button 
                         onClick={() => setActiveMode('chat')}
                         className={cn(
                           "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                           activeMode === 'chat' ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-400"
                         )}
                       >
                         Chat
                       </button>
                       <button 
                         onClick={() => setActiveMode('history')}
                         className={cn(
                           "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                           activeMode === 'history' ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-400"
                         )}
                       >
                         History
                       </button>
                    </div>
                 </div>
              </div>

              {/* LIGHT CONTENT SURFACE */}
              <div className="flex-1 bg-[#F5F3F0] overflow-y-auto flex flex-col">
                 {activeMode === 'chat' ? (
                   /* Messages */
                   <div className="flex flex-col bg-white min-h-full">
                      {/* System Message */}
                      <div className="px-6 py-4 bg-white">
                         <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-mono text-neutral-400">10:42 AM</span>
                            <p className="text-sm text-neutral-900 leading-relaxed font-normal">
                               Ready to analyze. I can help you evaluate listings, compare vehicles, or guide your inspection process.
                            </p>
                         </div>
                      </div>

                      {/* User Message Example */}
                      <div className="px-6 py-4 bg-white">
                         <div className="bg-white border border-neutral-200 border-l-2 border-l-primary p-4 rounded-sm">
                             <div className="flex flex-col items-start gap-1">
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                   What should I look for on a 2016 Accord?
                                </p>
                             </div>
                         </div>
                      </div>
                      
                      {/* System Reply Example */}
                      <div className="px-6 py-4 bg-white">
                         <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-mono text-neutral-400">10:43 AM</span>
                            <div className="text-sm text-neutral-900 leading-relaxed font-normal">
                               <p className="mb-3">For the 9th gen Accord (2013-2017), check specifically for:</p>
                               <ul className="space-y-2">
                                  <li className="flex gap-2">
                                     <span className="text-primary">•</span> VCM vibration (on V6 models)
                                  </li>
                                  <li className="flex gap-2">
                                     <span className="text-primary">•</span> CVT transmission fluid history
                                  </li>
                                  <li className="flex gap-2">
                                     <span className="text-primary">•</span> Starter motor failure (common issue)
                                  </li>
                               </ul>
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   /* History List */
                   <div className="flex flex-col bg-white min-h-full divide-y divide-neutral-100">
                      {HISTORY_ITEMS.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer group">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors">{item.title}</h3>
                              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {item.date}
                              </span>
                           </div>
                           <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                              {item.preview}
                           </p>
                        </div>
                      ))}
                      
                      <div className="p-8 text-center">
                        <button className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-widest transition-colors">
                          View Older Conversations
                        </button>
                      </div>
                   </div>
                 )}
              </div>

              {/* Input Area - Only show in Chat Mode */}
              {activeMode === 'chat' && (
                <div className="bg-white px-6 py-4 border-t border-neutral-200 pb-safe shrink-0 z-10 relative">
                   <div className="flex items-center gap-4">
                      <input 
                        className="flex-1 bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none py-2"
                        placeholder="Ask about known issues, pricing, or inspection steps..."
                      />
                      <button className="text-primary hover:text-red-700 transition-colors p-2 -mr-2">
                         <Send className="w-5 h-5" strokeWidth={2} />
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
