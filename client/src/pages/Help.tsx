import { MobileLayout } from '@/components/MobileLayout';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Help() {
  const [, setLocation] = useLocation();

  const faqs = [
    { q: "How do I add a new vehicle?", a: "Tap the '+' button on the home screen and enter the vehicle details." },
    { q: "Is my data backed up?", a: "Currently, data is stored locally on your device. Cloud backup is coming in v2.0." },
  ];

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Help & Support</h1>
          <div className="w-10" />
        </div>
      }
    >
      <div className="p-4 space-y-6">
        <div>
           <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">FAQ</h2>
           <div className="space-y-2">
             {faqs.map((faq, i) => (
               <div key={i} className="bg-white p-4 rounded-sm border border-neutral-200">
                 <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wide mb-2">{faq.q}</h3>
                 <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </MobileLayout>
  );
}
