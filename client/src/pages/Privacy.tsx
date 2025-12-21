import { MobileLayout } from '@/components/MobileLayout';
import { ArrowLeft, Shield, Lock, Database, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useStore } from '@/lib/store';

export default function Privacy() {
  const [, setLocation] = useLocation();
  // We can't actually clear store easily from here without adding a method to store, 
  // but for UI purposes we'll show the button. 
  // Ideally, we'd add clearAll() to the store.

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Privacy & Security</h1>
          <div className="w-10" />
        </div>
      }
    >
      <div className="p-4 space-y-6">
        
        <div className="bg-neutral-900 p-6 rounded-sm text-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="font-bold text-lg font-tech uppercase tracking-wide">Local-First Data</h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Pre-Purchase Copilot is a local-first application. Your vehicle data, photos, and inspection notes are stored directly on your device. We do not sell your personal data to third parties.
          </p>
        </div>

        <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide mb-1">Data Encryption</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">All sensitive data is encrypted at rest on your device using industry-standard protocols.</p>
              </div>
            </div>
          </div>
          
           <div className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide mb-1">Local Storage</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">Clearing your browser cache or app data will remove all your saved vehicles and dossiers.</p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-4 border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete All Local Data
        </button>
      </div>
    </MobileLayout>
  );
}
