import { MobileLayout } from '@/components/MobileLayout';
import { useStore } from '@/lib/store';
import { useLocation } from 'wouter';
import { ArrowLeft, Loader2, Sparkles, ScanLine, Search } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Candidate } from '@/lib/data';
import { motion } from 'framer-motion';

export default function AddCandidate() {
  const [, setLocation] = useLocation();
  const addCandidate = useStore((state) => state.addCandidate);
  const { toast } = useToast();
  
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');

  const handleDecode = async () => {
    if (vin.length < 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock decoded data
    const newCandidate: Candidate = {
      id: Math.random().toString(36).substring(7),
      vin: vin.toUpperCase(),
      year: 2021,
      make: 'Toyota',
      model: 'RAV4',
      trim: 'XLE',
      bodyType: 'SUV',
      price: 0,
      mileage: 0,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000',
      riskScore: 0,
      completeness: 0,
      status: 'active',
      checklistResponses: {},
      notes: '',
      createdAt: new Date().toISOString(),
    };

    addCandidate(newCandidate);
    setLoading(false);
    toast({
      title: "Vehicle Found",
      description: "2021 Toyota RAV4 added to your candidates.",
    });
    setLocation('/');
  };

  return (
    <MobileLayout
      showNav={false}
      showFab={false}
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-sm leading-tight text-neutral-900 font-tech uppercase tracking-wide">Add Vehicle</h1>
          </div>
          <div className="w-8" />
        </div>
      }
    >
      <div className="p-6 space-y-8 bg-neutral-50 min-h-screen">
        
        {/* Primary Input: Copilot */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center text-white">
               <Sparkles className="w-3 h-3" />
             </div>
             <h2 className="text-base font-bold tracking-wide uppercase text-neutral-900">Ask Copilot to Add</h2>
           </div>
           
           <div className="bg-white border border-neutral-200 shadow-lg shadow-black/5 rounded-md p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-50 rounded-bl-full -mr-6 -mt-6" />
             
             <p className="text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wide">
               Paste a listing URL, description, or ask me to find a car.
             </p>
             
             <textarea 
               value={copilotInput}
               onChange={(e) => setCopilotInput(e.target.value)}
               placeholder="E.g. 'I'm looking at a 2018 Honda Civic on Craigslist...'"
               className="w-full bg-neutral-50 rounded-sm p-3 text-sm border border-neutral-100 focus:ring-1 focus:ring-primary focus:border-primary min-h-[100px] resize-none mb-4 placeholder:text-neutral-400 placeholder:text-xs"
             />
             
             <button 
               className="w-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
             >
               <Sparkles className="w-4 h-4" />
               Process with Copilot
             </button>
           </div>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-neutral-50 px-2 text-neutral-400">Or Manual Entry</span>
          </div>
        </div>

        {/* Secondary Input: VIN/Scan */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-neutral-200 bg-white hover:border-primary/50 hover:bg-neutral-50 transition-all shadow-sm">
              <ScanLine className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-700">Scan Barcode</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-neutral-200 bg-white hover:border-primary/50 hover:bg-neutral-50 transition-all shadow-sm">
              <Search className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-700">Search Model</span>
            </button>
          </div>

          <div>
            <div className="relative group">
              <input 
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="ENTER VIN MANUALLY"
                className="w-full text-sm font-mono uppercase tracking-wider p-4 pr-24 rounded-md border border-neutral-200 bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-neutral-300"
                maxLength={17}
              />
              <button 
                onClick={handleDecode}
                disabled={loading || vin.length < 11}
                className="absolute right-2 top-2 bottom-2 px-4 bg-neutral-900 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-black transition-colors"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "DECODE"}
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </MobileLayout>
  );
}
