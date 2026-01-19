import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Check, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileSheet({ isOpen, onClose }: EditProfileSheetProps) {
  const { userProfile, setUserProfile } = useStore();
  
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    zipCode: '',
  });

  useEffect(() => {
    if (isOpen && userProfile) {
      setForm({
        firstName: userProfile.firstName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        zipCode: userProfile.zipCode || '',
      });
    }
  }, [isOpen, userProfile]);

  const handleSubmit = () => {
    if (!form.firstName.trim()) return;
    
    setUserProfile({
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      zipCode: form.zipCode.trim(),
    });
    onClose();
  };

  const isFormValid = form.firstName.trim().length > 0;

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
                  <h1 className="text-lg font-bold text-white uppercase tracking-wide">Edit Profile</h1>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-neutral-800 transition-colors">
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#F5F3F0] overflow-y-auto px-6 py-8">
              <div className="space-y-0 divide-y divide-neutral-200 border-t border-neutral-200 bg-white rounded-sm">
                <div className="grid grid-cols-3 gap-4 py-4 px-4 items-baseline group focus-within:bg-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 flex items-center gap-2 transition-colors group-focus-within:text-neutral-900">
                    <User className="w-3 h-3" /> Name *
                  </span>
                  <input 
                    type="text" 
                    placeholder="First name" 
                    value={form.firstName}
                    onChange={(e) => setForm({...form, firstName: e.target.value})}
                    className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300" 
                    data-testid="input-edit-firstname"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 px-4 items-baseline group focus-within:bg-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 flex items-center gap-2 transition-colors group-focus-within:text-neutral-900">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <input 
                    type="email" 
                    placeholder="you@email.com" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300" 
                    data-testid="input-edit-email"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 px-4 items-baseline group focus-within:bg-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 flex items-center gap-2 transition-colors group-focus-within:text-neutral-900">
                    <Phone className="w-3 h-3" /> Phone
                  </span>
                  <input 
                    type="tel" 
                    placeholder="(555) 123-4567" 
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono" 
                    data-testid="input-edit-phone"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 px-4 items-baseline group focus-within:bg-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left col-span-1 flex items-center gap-2 transition-colors group-focus-within:text-neutral-900">
                    <MapPin className="w-3 h-3" /> Zip
                  </span>
                  <input 
                    type="text" 
                    placeholder="90210" 
                    value={form.zipCode}
                    onChange={(e) => setForm({...form, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                    maxLength={5}
                    className="col-span-2 bg-transparent text-sm font-medium text-neutral-900 focus:outline-none placeholder:text-neutral-300 font-mono" 
                    data-testid="input-edit-zip"
                  />
                </div>
              </div>
              
            </div>

            <div className="bg-white px-6 py-4 border-t border-neutral-200 pb-safe shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={cn(
                  "w-full font-bold text-xs uppercase tracking-widest py-4 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2",
                  isFormValid 
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99]" 
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
                data-testid="button-edit-submit"
              >
                Save Changes <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
