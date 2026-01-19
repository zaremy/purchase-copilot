import { ArrowLeft, Loader2, Sparkles, ScanLine, Search, X, Camera, Keyboard, Binary, RefreshCw, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { useCreateLocalVehicle } from '@/lib/localVehicles';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Dropdown options
const TITLE_OPTIONS = ['Clean', 'Rebuilt', 'Salvage', 'Other'];
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual'];
const DRIVE_OPTIONS = ['FWD', 'RWD', 'AWD', '4WD'];

interface AddVehicleSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

// AI features temporarily hidden - will reactivate in future
const AI_FEATURES_ENABLED = false;

type AddMode = 'copilot' | 'vin' | 'manual';

export function AddVehicleSheet({ isOpen, onClose }: AddVehicleSheetProps) {
  const createVehicle = useCreateLocalVehicle();
  const { toast } = useToast();
  
  const [activeMode, setActiveMode] = useState<AddMode>('manual');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [aiState, setAiState] = useState<'loading' | 'online' | 'error'>('loading');
  
  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    price: '',
    mileage: '',
    color: '',
    titleStatus: '',
    engine: '',
    transmission: '',
    drivetrain: '',
    notes: '',
  });

  // Error blink state for validation feedback
  const [blinkingFields, setBlinkingFields] = useState<Set<string>>(new Set());
  const [notesFocused, setNotesFocused] = useState(false);

  // Validation for manual form
  const isManualFormValid = manualForm.year.length === 4 && manualForm.make.trim() && manualForm.model.trim();

  const triggerBlink = (field: string) => {
    setBlinkingFields(prev => new Set(prev).add(field));
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= 6) { // 3 blinks = 6 toggles
        clearInterval(interval);
        setBlinkingFields(prev => {
          const next = new Set(prev);
          next.delete(field);
          return next;
        });
      }
    }, 150);
  };

  // Validation handlers
  const handleYearChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    // Must start with 1 or 2 if there's a first digit
    if (digits.length > 0 && digits[0] !== '1' && digits[0] !== '2') {
      triggerBlink('year');
      return;
    }
    if (digits.length > 4) {
      triggerBlink('year');
      return;
    }
    setManualForm({...manualForm, year: digits});
  };

  const handlePriceChange = (value: string) => {
    // Only allow digits
    if (/[^0-9]/.test(value)) {
      triggerBlink('price');
      const digits = value.replace(/\D/g, '');
      setManualForm({...manualForm, price: digits});
      return;
    }
    setManualForm({...manualForm, price: value});
  };

  const handleMileageChange = (value: string) => {
    // Only allow digits
    if (/[^0-9]/.test(value)) {
      triggerBlink('mileage');
      const digits = value.replace(/\D/g, '');
      setManualForm({...manualForm, mileage: digits});
      return;
    }
    setManualForm({...manualForm, mileage: value});
  };

  const handleNotesChange = (value: string) => {
    if (value.length > 500) {
      triggerBlink('notes');
      return;
    }
    setManualForm({...manualForm, notes: value});
  };

  // Simulate AI connection sequence when sheet opens
  useEffect(() => {
    if (isOpen) {
      setAiState('loading');
      const timer = setTimeout(() => {
        // Randomly simulate error for demonstration purposes (10% chance) 
        // or strictly follow happy path. User asked for "if it fails automatically revert".
        // To demonstrate this, let's just make it succeed for now, but I'll add the logic.
        // For testing the revert behavior, you can manually set this to 'error'.
        setAiState('online');
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAiState('loading');
      setActiveMode('manual'); // Reset mode on close
      setManualForm({
        year: '',
        make: '',
        model: '',
        trim: '',
        price: '',
        mileage: '',
        color: '',
        titleStatus: '',
        engine: '',
        transmission: '',
        drivetrain: '',
        notes: '',
      });
    }
  }, [isOpen]);

  // Watch for AI error state to revert to vin
  useEffect(() => {
    if (aiState === 'error' && activeMode === 'copilot') {
      const timer = setTimeout(() => {
        setActiveMode('vin');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [aiState, activeMode]);

  const handleRetry = () => {
    setAiState('loading');
    setTimeout(() => {
      setAiState('online');
    }, 1500);
  };

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
    
    // Simulate API delay for VIN decoding
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock VIN decode - in real implementation, this would call a VIN decoding API
    const vehicleData = {
      vin: vin.toUpperCase(),
      year: 2021,
      make: 'Toyota',
      model: 'RAV4',
      trim: 'XLE',
      price: 0,
      mileage: 0,
      bodyType: 'suv',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000',
      riskScore: 0,
      completeness: 0,
      status: 'active',
      checklistResponses: {},
      notes: '',
    };

    try {
      await createVehicle.mutateAsync(vehicleData);
      setLoading(false);
      toast({
        title: "Vehicle Added",
        description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} added to your reports.`,
      });
      setVin('');
      onClose();
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = async () => {
    if (!manualForm.year || !manualForm.make || !manualForm.model) {
      toast({
        title: "Missing Information",
        description: "Please fill in Year, Make, and Model.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const vehicleData = {
      vin: `MANUAL-${Date.now()}`,  // Placeholder VIN for manual entries
      year: parseInt(manualForm.year),
      make: manualForm.make,
      model: manualForm.model,
      trim: manualForm.trim || undefined,
      price: manualForm.price ? parseInt(manualForm.price.replace(/[^0-9]/g, '')) : 0,
      mileage: manualForm.mileage ? parseInt(manualForm.mileage.replace(/[^0-9]/g, '')) : 0,
      color: manualForm.color || undefined,
      titleStatus: manualForm.titleStatus || undefined,
      engine: manualForm.engine || undefined,
      transmission: manualForm.transmission || undefined,
      drivetrain: manualForm.drivetrain || undefined,
      notes: manualForm.notes || '',
      bodyType: 'other',
      riskScore: 0,
      completeness: 0,
      status: 'active',
      checklistResponses: {},
    };

    try {
      await createVehicle.mutateAsync(vehicleData);
      toast({
        title: "Vehicle Added",
        description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} added to your reports.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeMode) {
      case 'copilot':
        return (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 p-6 pb-0 min-h-0">
              <textarea 
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Paste listing URL or describe the car..."
                maxLength={2400}
                className="w-full h-full bg-transparent border-0 rounded-none p-0 text-base text-neutral-900 focus:outline-none placeholder:text-neutral-400 placeholder:text-lg font-sans leading-relaxed resize-none"
              />
            </div>
            
            <div className="px-6 pb-safe pt-4 bg-gradient-to-t from-[#F5F3F0] via-[#F5F3F0] to-transparent shrink-0 z-10">
              <div className="flex justify-end mb-2">
                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{copilotInput.length} / 2400</span>
              </div>
              <button 
                disabled={aiState !== 'online'}
                className="w-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-lg hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {aiState === 'loading' ? 'Initializing Copilot...' : 'Process with Copilot'}
              </button>
            </div>
          </div>
        );

      case 'vin':
        return (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="space-y-6">
            <div className="relative group pt-4">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Vehicle Identification Number</label>
              <input 
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="ENTER 17-DIGIT VIN"
                className="w-full text-base text-neutral-900 font-mono uppercase tracking-widest py-2 border-b border-neutral-300 bg-transparent focus:outline-none focus:border-neutral-900 placeholder:text-neutral-300"
                maxLength={17}
              />
            </div>
            <button 
              onClick={handleDecode}
              disabled={loading || vin.length < 11}
              className="w-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "DECODE VIN"}
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <span className="relative bg-[#F5F3F0] px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                or
              </span>
            </div>

            <button className="w-full bg-white border border-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm hover:bg-neutral-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
              <ScanLine className="w-4 h-4" />
              Scan VIN Barcode
            </button>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="px-6 py-8">
            <div className="space-y-0 divide-y divide-neutral-200 border-t border-neutral-200">
             {/* Core Identity */}
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900",
                  blinkingFields.has('year') ? "text-red-500" : "text-neutral-400"
                )}>Year *</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="2020"
                  value={manualForm.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  maxLength={4}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono"
                  data-testid="input-manual-year"
                />
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Make *</span>
                <input
                  type="text"
                  placeholder="Toyota"
                  value={manualForm.make}
                  onChange={(e) => setManualForm({...manualForm, make: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  data-testid="input-manual-make"
                />
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Model *</span>
                <input
                  type="text"
                  placeholder="Camry"
                  value={manualForm.model}
                  onChange={(e) => setManualForm({...manualForm, model: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  data-testid="input-manual-model"
                />
             </div>

             {/* Valuation */}
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900",
                  blinkingFields.has('price') ? "text-red-500" : "text-neutral-400"
                )}>Price</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manualForm.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono"
                  data-testid="input-manual-price"
                />
             </div>

             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900",
                  blinkingFields.has('mileage') ? "text-red-500" : "text-neutral-400"
                )}>Mileage</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manualForm.mileage}
                  onChange={(e) => handleMileageChange(e.target.value)}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono"
                  data-testid="input-manual-mileage"
                />
             </div>

             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Title</span>
                <select
                  value={manualForm.titleStatus}
                  onChange={(e) => setManualForm({...manualForm, titleStatus: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none appearance-none cursor-pointer"
                  data-testid="select-manual-title"
                >
                  <option value="" className="text-neutral-300">Select...</option>
                  {TITLE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
             </div>

             {/* Specs */}
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Trim</span>
                <input
                  type="text"
                  placeholder="e.g. XLE"
                  value={manualForm.trim}
                  onChange={(e) => setManualForm({...manualForm, trim: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  data-testid="input-manual-trim"
                />
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Color</span>
                <input
                  type="text"
                  placeholder="e.g. Silver"
                  value={manualForm.color}
                  onChange={(e) => setManualForm({...manualForm, color: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  data-testid="input-manual-color"
                />
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Engine</span>
                <input
                  type="text"
                  placeholder="e.g. 2.0L I4"
                  value={manualForm.engine}
                  onChange={(e) => setManualForm({...manualForm, engine: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                  data-testid="input-manual-engine"
                />
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Transmission</span>
                <select
                  value={manualForm.transmission}
                  onChange={(e) => setManualForm({...manualForm, transmission: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none appearance-none cursor-pointer"
                  data-testid="select-manual-transmission"
                >
                  <option value="">Select...</option>
                  {TRANSMISSION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
             </div>
             <div className="grid grid-cols-3 gap-4 py-4 items-baseline group focus-within:bg-neutral-50/50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 transition-colors group-focus-within:text-neutral-900">Drive</span>
                <select
                  value={manualForm.drivetrain}
                  onChange={(e) => setManualForm({...manualForm, drivetrain: e.target.value})}
                  className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none appearance-none cursor-pointer"
                  data-testid="select-manual-drivetrain"
                >
                  <option value="">Select...</option>
                  {DRIVE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
             </div>

             {/* Seller Notes */}
             <div className="grid grid-cols-3 gap-4 py-4 items-start group focus-within:bg-neutral-50/50">
                <div className="col-span-1 pt-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest text-left block transition-colors group-focus-within:text-neutral-900",
                    blinkingFields.has('notes') ? "text-red-500" : "text-neutral-400"
                  )}>Seller Notes</span>
                  {notesFocused && (
                    <span className="text-[9px] text-neutral-400 font-medium">{manualForm.notes.length}/500</span>
                  )}
                </div>
                <textarea
                  placeholder="Paste listing description or add notes..."
                  value={manualForm.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  onFocus={() => setNotesFocused(true)}
                  onBlur={() => setNotesFocused(false)}
                  className="col-span-2 w-full bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 min-h-[100px] resize-none font-sans"
                  data-testid="input-manual-notes"
                />
             </div>
            </div>
          </div>
        );
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                onClose();
              }
            }}
            className="absolute left-0 right-0 bottom-0 bg-white shadow-2xl flex flex-col rounded-t-[20px] overflow-hidden border-t border-neutral-800"
            style={{ top: 'calc(env(safe-area-inset-top) + 20px)' }}
          >
            {/* DARK CONTROL SURFACE */}
            <div className="bg-neutral-950 pt-6 pb-0 shrink-0 relative touch-pan-y">
               {/* Drag Handle - larger hit zone */}
               <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center">
                 <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
               </div>

               {/* Top Stroke for affordance */}
               <div className="absolute top-0 left-0 right-0 h-[1px] bg-neutral-800/25" />

               {/* Masthead */}
               <div className="px-6 pt-10 pb-6 flex justify-between items-end">
                  <div>
                     <h1 className="text-lg font-bold text-white uppercase tracking-wide">Add New Vehicle</h1>
                     {/* AI status hidden - will reactivate in future */}
                     {AI_FEATURES_ENABLED && (
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
                     )}
                  </div>

                  {/* Mode Switcher Pills - hidden when AI features disabled */}
                  {AI_FEATURES_ENABLED && (
                    <div className="flex gap-1 bg-neutral-900 p-1 rounded-full">
                      {(['copilot', 'vin', 'manual'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setActiveMode(mode)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                            activeMode === mode 
                              ? "bg-neutral-700 text-white" 
                              : "text-neutral-500 hover:text-neutral-400"
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {/* LIGHT CONTENT SURFACE - single scroll container */}
            <div className="flex-1 bg-[#F5F3F0] min-h-0 overflow-y-auto sheetScroll">
               {renderContent()}
            </div>

            {/* Sticky Footer for Manual Mode */}
            {activeMode === 'manual' && (
              <div className="bg-white px-6 py-4 border-t border-neutral-200 sheetFooter shrink-0">
                <button
                  onClick={handleManualSubmit}
                  disabled={!isManualFormValid || loading}
                  className={cn(
                    "w-full font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2",
                    isManualFormValid && !loading
                      ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99]"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  )}
                  data-testid="button-manual-submit"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Vehicle"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}