import { MobileLayout } from '@/components/MobileLayout';
import { useStore } from '@/lib/store';
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ChecklistPreset, CHECKLIST_DATA } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function EditPreset() {
  const [, params] = useRoute('/settings/presets/:id');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const presets = useStore((state) => state.presets);
  const addPreset = useStore((state) => state.addPreset);
  const updatePreset = useStore((state) => state.updatePreset);

  const isNew = params?.id === 'new';
  const existingPreset = presets.find(p => p.id === params?.id);

  const [name, setName] = useState(existingPreset?.name || '');
  const [description, setDescription] = useState(existingPreset?.description || '');
  const [selectedItems, setSelectedItems] = useState<string[]>(existingPreset?.items || []);

  // Group items by section
  const sections = Array.from(new Set(CHECKLIST_DATA.map(i => i.section)));

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a preset name", variant: "destructive" });
      return;
    }

    if (selectedItems.length === 0) {
      toast({ title: "Items required", description: "Select at least one checklist item", variant: "destructive" });
      return;
    }

    if (isNew) {
      const newPreset: ChecklistPreset = {
        id: Math.random().toString(36).substring(7),
        name,
        description,
        items: selectedItems,
      };
      addPreset(newPreset);
      toast({ title: "Preset Created", description: `${name} has been created.` });
    } else if (existingPreset) {
      updatePreset(existingPreset.id, {
        name,
        description,
        items: selectedItems,
      });
      toast({ title: "Preset Updated", description: `${name} has been updated.` });
    }

    setLocation('/settings/presets');
  };

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setSelectedItems(prev => [...prev, itemId]);
    }
  };

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <Link href="/settings/presets">
            <button className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </Link>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">{isNew ? 'New Preset' : 'Edit Preset'}</h1>
          <button 
            onClick={handleSave}
            className="p-2 -mr-2 rounded-full hover:bg-neutral-800 transition-colors text-white font-bold text-xs uppercase tracking-wider"
          >
            Save
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-6 bg-neutral-50 min-h-screen">
        <div className="space-y-4 bg-white p-5 rounded-md border border-neutral-200 shadow-sm">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Preset Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.G. SPORTS CAR INSPECTION"
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-neutral-300 placeholder:text-xs placeholder:font-medium placeholder:uppercase"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="BRIEF DESCRIPTION..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none h-24 placeholder:text-neutral-300 placeholder:text-xs placeholder:font-medium placeholder:uppercase"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h2 className="font-bold text-xs uppercase tracking-widest text-neutral-900">Checklist Items</h2>
             <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide">{selectedItems.length} selected</span>
          </div>

          {sections.map(section => (
            <div key={section} className="bg-white rounded-md border border-neutral-200 overflow-hidden shadow-sm">
               <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 font-bold text-xs text-neutral-800 uppercase tracking-wide">
                 {section}
               </div>
               <div>
                 {CHECKLIST_DATA.filter(i => i.section === section).map((item, idx) => {
                   const isSelected = selectedItems.includes(item.id);
                   return (
                     <div 
                       key={item.id}
                       onClick={() => toggleItem(item.id)}
                       className={cn(
                         "flex items-start gap-3 p-4 cursor-pointer transition-colors active:bg-neutral-50",
                         idx !== 0 && "border-t border-neutral-100",
                         isSelected ? "bg-primary/5" : "hover:bg-neutral-50"
                       )}
                     >
                        <div className={cn(
                          "w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isSelected ? "bg-primary border-primary text-white" : "border-neutral-300 bg-white"
                        )}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className={cn("text-sm leading-relaxed", isSelected ? "font-bold text-neutral-900" : "text-neutral-600 font-medium")}>
                            {item.question}
                          </p>
                          {item.severity >= 8 && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1 block">Critical</span>
                          )}
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
