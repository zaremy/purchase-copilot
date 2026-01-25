import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type OnboardingStep = 'loader' | 'setup';

export function Onboarding() {
  const { setUserProfile, completeOnboarding } = useStore();
  const [step, setStep] = useState<OnboardingStep>('loader');
  const [progress, setProgress] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    zipCode: '',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setStep('setup');
            setTimeout(() => setIsSheetOpen(true), 300);
          }, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (!form.firstName.trim()) return;
    
    setUserProfile({
      firstName: form.firstName.trim(),
      fullName: form.firstName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      zipCode: form.zipCode.trim(),
    });
    completeOnboarding();
  };

  const isFormValid = form.firstName.trim().length > 0;

  return (
    <div className="min-h-[100dvh] bg-neutral-950 flex justify-center items-center">
      <div className="w-full max-w-md bg-neutral-950 h-[100dvh] relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'loader' && (
            <motion.div
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-8"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl font-bold text-neutral-400 text-center mb-2 tracking-tight"
              >
                Welcome to
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl text-white text-center mb-12 tracking-tight"
              >
                <span className="font-bold">Pre-Purchase</span><span className="font-normal">Pal</span>.
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </motion.div>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col relative"
            >
              <div className="flex-1 bg-neutral-950" />
              
              <AnimatePresence>
                {isSheetOpen && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="absolute bottom-0 left-0 right-0 h-[85%] bg-white shadow-2xl flex flex-col rounded-t-[20px] overflow-hidden border-t border-neutral-800"
                  >
                    <div className="bg-neutral-950 pt-3 pb-6 shrink-0 relative">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-700 rounded-full" />
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-neutral-800/25" />
                      
                      <div className="px-6 pt-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Setup Your Profile</h1>
                        <p className="text-sm text-neutral-400">Just a few details to get started</p>
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
                            data-testid="input-onboarding-firstname"
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
                            data-testid="input-onboarding-email"
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
                            data-testid="input-onboarding-phone"
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
                            data-testid="input-onboarding-zip"
                          />
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed px-1">
                        Your zip code helps provide location-based context like local pricing and environmental factors.
                      </p>
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
                        data-testid="button-onboarding-submit"
                      >
                        Get Started <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
