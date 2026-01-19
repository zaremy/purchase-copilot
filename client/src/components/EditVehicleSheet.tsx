import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateLocalVehicle } from '@/lib/localVehicles';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  price: number;
  mileage: number;
  color?: string | null;
  titleStatus?: string | null;
  engine?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  notes?: string | null;
}

interface EditVehicleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export function EditVehicleSheet({ isOpen, onClose, vehicle }: EditVehicleSheetProps) {
  const updateVehicle = useUpdateLocalVehicle();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    vin: '',
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

  useEffect(() => {
    if (vehicle && isOpen) {
      setForm({
        vin: vehicle.vin || '',
        year: String(vehicle.year),
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim || '',
        price: vehicle.price ? String(vehicle.price) : '',
        mileage: vehicle.mileage ? String(vehicle.mileage) : '',
        color: vehicle.color || '',
        titleStatus: vehicle.titleStatus || '',
        engine: vehicle.engine || '',
        transmission: vehicle.transmission || '',
        drivetrain: vehicle.drivetrain || '',
        notes: vehicle.notes || '',
      });
    }
  }, [vehicle, isOpen]);

  const handleSubmit = () => {
    if (!vehicle) return;
    if (!form.year || !form.make || !form.model) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Year, Make, and Model.",
        variant: "destructive"
      });
      return;
    }

    updateVehicle.mutate({
      id: vehicle.id,
      updates: {
        vin: form.vin || undefined,
        year: parseInt(form.year),
        make: form.make,
        model: form.model,
        trim: form.trim || undefined,
        price: form.price ? parseInt(form.price) : 0,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        color: form.color || undefined,
        titleStatus: form.titleStatus || undefined,
        engine: form.engine || undefined,
        transmission: form.transmission || undefined,
        drivetrain: form.drivetrain || undefined,
        notes: form.notes || '',
      },
    }, {
      onSuccess: () => {
        toast({
          title: "Vehicle updated",
          description: "Your changes have been saved."
        });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update vehicle.",
          variant: "destructive"
        });
      }
    });
  };

  const isFormValid = form.year && form.make && form.model;

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
              <div className="bg-neutral-950 pt-6 pb-0 shrink-0 relative touch-pan-y">
                {/* Drag Handle - larger hit zone */}
                <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-neutral-800/25" />

                <div className="px-6 pt-10 pb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-lg font-bold text-white uppercase tracking-wide">Edit Vehicle</h1>
                  </div>
                  <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-neutral-800 transition-colors">
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-[#F5F3F0] overflow-y-auto sheetScroll px-6 py-6">
                <div className="space-y-0 divide-y divide-neutral-200 border-t border-neutral-200 bg-white rounded-sm">
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Year *</span>
                    <input 
                      type="text"
                      value={form.year}
                      onChange={(e) => setForm({...form, year: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                      placeholder="2024"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                      data-testid="input-edit-year"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Make *</span>
                    <input 
                      type="text"
                      value={form.make}
                      onChange={(e) => setForm({...form, make: e.target.value})}
                      placeholder="Toyota"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                      data-testid="input-edit-make"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Model *</span>
                    <input 
                      type="text"
                      value={form.model}
                      onChange={(e) => setForm({...form, model: e.target.value})}
                      placeholder="Camry"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                      data-testid="input-edit-model"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Trim</span>
                    <input 
                      type="text"
                      value={form.trim}
                      onChange={(e) => setForm({...form, trim: e.target.value})}
                      placeholder="SE"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Price</span>
                    <input 
                      type="text"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value.replace(/\D/g, '')})}
                      placeholder="25000"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Mileage</span>
                    <input 
                      type="text"
                      value={form.mileage}
                      onChange={(e) => setForm({...form, mileage: e.target.value.replace(/\D/g, '')})}
                      placeholder="45000"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Color</span>
                    <input 
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({...form, color: e.target.value})}
                      placeholder="Silver"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Title</span>
                    <input 
                      type="text"
                      value={form.titleStatus}
                      onChange={(e) => setForm({...form, titleStatus: e.target.value})}
                      placeholder="Clean"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Engine</span>
                    <input 
                      type="text"
                      value={form.engine}
                      onChange={(e) => setForm({...form, engine: e.target.value})}
                      placeholder="2.5L I4"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Trans</span>
                    <input 
                      type="text"
                      value={form.transmission}
                      onChange={(e) => setForm({...form, transmission: e.target.value})}
                      placeholder="Automatic"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 px-4 items-baseline group focus-within:bg-neutral-50/50">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-neutral-900">Drive</span>
                    <input 
                      type="text"
                      value={form.drivetrain}
                      onChange={(e) => setForm({...form, drivetrain: e.target.value})}
                      placeholder="FWD"
                      className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-sm border border-neutral-200 group focus-within:border-neutral-300">
                  <div className="px-4 py-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-neutral-900">Notes</span>
                    <textarea 
                      value={form.notes}
                      onChange={(e) => setForm({...form, notes: e.target.value})}
                      placeholder="Add notes about this vehicle..."
                      rows={3}
                      className="w-full bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white px-6 py-4 border-t border-neutral-200 sheetFooter shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || updateVehicle.isPending}
                  className={cn(
                    "w-full font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm transition-all",
                    isFormValid && !updateVehicle.isPending
                      ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99]"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  )}
                  data-testid="button-save-vehicle"
                >
                  {updateVehicle.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
