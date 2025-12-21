import { MobileLayout } from '@/components/MobileLayout';
import { ArrowLeft, Mail } from 'lucide-react';
import { useLocation } from 'wouter';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function Notifications() {
  const [, setLocation] = useLocation();
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <MobileLayout
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => setLocation('/settings')} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-neutral-900" />
          </button>
          <h1 className="font-bold text-sm leading-tight text-neutral-900 font-tech uppercase tracking-wide">Notifications</h1>
          <div className="w-10" />
        </div>
      }
    >
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-neutral-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide">Email Digests</h3>
                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-0.5">Weekly summaries</p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
        </div>
        
        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide text-center px-4 leading-relaxed">
          Manage how you receive updates about your vehicle dossiers and inspection reminders.
        </p>
      </div>
    </MobileLayout>
  );
}
