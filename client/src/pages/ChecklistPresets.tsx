import { MobileLayout } from '@/components/MobileLayout';
import { useStore } from '@/lib/store';
import { ArrowLeft, Check, Plus, Trash2, Edit2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ChecklistPresets() {
  const [, setLocation] = useLocation();
  const presets = useStore((state) => state.presets);
  const deletePreset = useStore((state) => state.deletePreset);
  const updatePreset = useStore((state) => state.updatePreset);

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <Link href="/settings">
            <button className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </Link>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Checklist Presets</h1>
          <Link href="/settings/presets/new">
            <button className="p-2 -mr-2 rounded-full hover:bg-neutral-800 transition-colors text-white">
              <Plus className="w-6 h-6" />
            </button>
          </Link>
        </div>
      }
    >
      <div className="p-4 space-y-4 bg-neutral-50 min-h-screen">
        {presets.map((preset) => (
          <div 
            key={preset.id}
            className="bg-white rounded-md border border-neutral-200 p-5 shadow-sm hover:border-primary/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide group-hover:text-primary transition-colors">{preset.name}</h3>
                  {preset.isDefault && (
                    <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">Default</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1 font-medium">{preset.description}</p>
                <p className="text-[10px] text-neutral-400 mt-3 font-bold uppercase tracking-wider">{preset.items.length} items</p>
              </div>
              
              <div className="flex gap-2">
                 <Link href={`/settings/presets/${preset.id}`}>
                    <button className="p-2 hover:bg-neutral-100 rounded-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                 </Link>
                 {!preset.isDefault && (
                   <button 
                     onClick={() => deletePreset(preset.id)}
                     className="p-2 hover:bg-red-50 rounded-sm text-neutral-400 hover:text-red-600 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
              </div>
            </div>

            {!preset.isDefault && (
               <button 
                 onClick={() => {
                    // Reset others
                    presets.forEach(p => {
                       if (p.id !== preset.id && p.isDefault) {
                          updatePreset(p.id, { isDefault: undefined });
                       }
                    });
                    updatePreset(preset.id, { isDefault: true });
                 }}
                 className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 rounded-sm hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors"
               >
                 Set as Default
               </button>
            )}
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
