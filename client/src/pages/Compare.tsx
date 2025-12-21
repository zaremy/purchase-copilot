import { MobileLayout } from '@/components/MobileLayout';
import { useVehicles } from '@/lib/api';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertTriangle, ShieldCheck, Gauge, Calendar, DollarSign, X, Copy, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Candidate, CHECKLIST_DATA } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Fixed list of comparison parameters
const COMPARISON_OPTIONS = [
  // Overview
  { id: 'price', label: 'Price', icon: DollarSign },
  { id: 'mileage', label: 'Mileage', icon: Gauge },
  { id: 'year', label: 'Year', icon: Calendar },
  { id: 'riskScore', label: 'Risk Score', icon: AlertTriangle },
  { id: 'completeness', label: 'Progress', icon: ShieldCheck },
  { id: 'titleStatus', label: 'Title Status', icon: AlertTriangle },
  
  // Specs
  { id: 'engine', label: 'Engine', icon: Circle },
  { id: 'transmission', label: 'Transmission', icon: Circle },
  { id: 'drivetrain', label: 'Drivetrain', icon: Circle },
  { id: 'color', label: 'Color', icon: Circle },
  
  // Checklist Sections
  { id: 'Exterior', label: 'Exterior', icon: CheckCircle2 },
  { id: 'Interior', label: 'Interior', icon: CheckCircle2 },
  { id: 'Mechanical', label: 'Mechanical', icon: CheckCircle2 },
  { id: 'Underbody', label: 'Underbody', icon: CheckCircle2 },
  { id: 'Test Drive', label: 'Test Drive', icon: CheckCircle2 },
];

const INITIAL_ROWS = ['price', 'mileage', 'year', 'riskScore', 'completeness'];

export default function Compare() {
  const { data: candidates = [], isLoading } = useVehicles();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRows, setActiveRows] = useState<string[]>(INITIAL_ROWS);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 2) { // Limit to 2 vehicles
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));

  const getRowValue = (candidate: Candidate, rowId: string) => {
    // Handle standard fields
    if (['price', 'mileage', 'year', 'riskScore', 'completeness', 'titleStatus', 'engine', 'transmission', 'drivetrain', 'color'].includes(rowId)) {
      const val = candidate[rowId as keyof Candidate];
      
      if (rowId === 'price') return `$${val?.toLocaleString()}`;
      if (rowId === 'mileage') return `${Math.round((val as number)/1000)}k`;
      if (rowId === 'completeness') return `${val}%`;
      if (rowId === 'riskScore') {
        const score = val as number;
        const label = score < 20 ? "Low" : score < 50 ? "Med" : "High";
        const colorClass = score < 20 ? "bg-green-100 text-green-700" : score < 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
        return (
          <div className={cn("px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide inline-block", colorClass)}>
            {label}
          </div>
        );
      }
      return val as string | number;
    }

    // Handle Checklist Sections
    const sectionItems = CHECKLIST_DATA.filter(i => i.section === rowId);
    const responses = candidate.checklistResponses || {};
    const completed = sectionItems.filter(i => responses[i.id]?.status).length;
    const fails = sectionItems.filter(i => responses[i.id]?.status === 'fail').length;
    
    if (fails > 0) return <span className="text-primary font-bold">{fails} Issues</span>;
    if (completed === sectionItems.length) return <span className="text-neutral-900">Complete</span>;
    return <span className="text-neutral-400">{Math.round((completed/sectionItems.length)*100)}%</span>;
  };
  
  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
           <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Compare</h1>
           <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
             {selectedIds.length} Selected
           </span>
        </div>
      }
    >
      <div className="p-4 space-y-6">
        
        {/* Selection Area */}
        {selectedIds.length < 2 && (
          <div className="bg-neutral-900 text-white p-4 rounded-sm shadow-sm mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-1">Select Vehicles</h3>
                <p className="text-xs text-neutral-400">Select 2 vehicles from your garage to compare them side-by-side.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Your Garage</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 bg-neutral-100 rounded-sm border border-dashed border-neutral-300">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">No vehicles in garage</p>
            </div>
          ) : (
            candidates.map(candidate => {
              const isSelected = selectedIds.includes(candidate.id);
              return (
                <div 
                  key={candidate.id}
                  onClick={() => toggleSelection(candidate.id)}
                  className={cn(
                    "bg-white border p-4 rounded-sm flex justify-between items-center cursor-pointer transition-all active:scale-[0.99]",
                    isSelected ? "border-primary shadow-sm ring-1 ring-primary/10" : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 font-tech uppercase tracking-wide">
                      {candidate.year} {candidate.make}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mt-0.5">
                      {candidate.model} {candidate.trim}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary text-white" : "bg-neutral-100 text-neutral-300"
                  )}>
                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Comparison Table */}
        {selectedCandidates.length >= 2 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-4 border-b border-neutral-200 pb-2">
               <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Comparison</h2>
               <button 
                 onClick={() => setSelectedIds([])}
                 className="text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1 hover:text-primary/80"
               >
                 <X className="w-3 h-3" /> Clear
               </button>
            </div>
            
            <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
              <div className="grid grid-cols-[100px_1fr_1fr] divide-x divide-neutral-100">
                {/* Header Row */}
                <div className="p-3 bg-neutral-50 border-b border-neutral-200"></div>
                {selectedCandidates.map((c, i) => (
                  <div key={c.id} className="p-3 bg-neutral-50 border-b border-neutral-200 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 block mb-1">Vehicle {i + 1}</span>
                    <span className="font-bold text-xs text-neutral-900 font-tech uppercase block leading-tight">
                      {c.make}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium uppercase">
                      {c.model}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Rows */}
              {activeRows.map((rowId, index) => {
                const option = COMPARISON_OPTIONS.find(o => o.id === rowId) || COMPARISON_OPTIONS[0];
                const Icon = option.icon;

                return (
                  <div key={index} className="grid grid-cols-[100px_1fr_1fr] divide-x divide-neutral-100 border-b border-neutral-100">
                     <div className="p-0 flex items-stretch">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex-1 flex items-center gap-2 p-3 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-colors outline-none group">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wide truncate flex-1 text-left">{option.label}</span>
                            <ChevronDown className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 max-h-[300px] overflow-y-auto">
                            {COMPARISON_OPTIONS.map((opt) => (
                              <DropdownMenuItem 
                                key={opt.id}
                                onSelect={() => {
                                  const newRows = [...activeRows];
                                  newRows[index] = opt.id;
                                  setActiveRows(newRows);
                                }}
                                className="text-xs font-medium uppercase tracking-wide cursor-pointer"
                              >
                                <span className={cn("flex-1", opt.id === rowId && "text-primary font-bold")}>{opt.label}</span>
                                {opt.id === rowId && <Check className="w-3 h-3 text-primary" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                     {selectedCandidates.map(c => (
                       <div key={c.id} className="p-3 text-center flex items-center justify-center">
                         <span className="font-medium text-sm text-neutral-900 font-tech">
                           {getRowValue(c, rowId)}
                         </span>
                       </div>
                     ))}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-4 pb-8">
               <button 
                 onClick={() => {
                   const c1 = selectedCandidates[0];
                   const c2 = selectedCandidates[1];
                   
                   let markdown = `| Attribute | ${c1.year} ${c1.make} ${c1.model} | ${c2.year} ${c2.make} ${c2.model} |\n`;
                   markdown += `|-----------|${'-'.repeat(20)}|${'-'.repeat(20)}|\n`;
                   
                   activeRows.forEach(rowId => {
                     const option = COMPARISON_OPTIONS.find(o => o.id === rowId);
                     const label = option?.label || rowId;
                     
                     const getValue = (c: Candidate) => {
                       if (rowId === 'price') return `$${c.price?.toLocaleString()}`;
                       if (rowId === 'mileage') return `${Math.round(c.mileage/1000)}k miles`;
                       if (rowId === 'year') return c.year;
                       if (rowId === 'riskScore') {
                         const score = c.riskScore;
                         return score < 20 ? "Low" : score < 50 ? "Medium" : "High";
                       }
                       if (rowId === 'completeness') return `${c.completeness}%`;
                       if (['titleStatus', 'engine', 'transmission', 'drivetrain', 'color'].includes(rowId)) {
                         return c[rowId as keyof Candidate] || '-';
                       }
                       const sectionItems = CHECKLIST_DATA.filter(i => i.section === rowId);
                       if (sectionItems.length > 0) {
                         const responses = c.checklistResponses || {};
                         const completed = sectionItems.filter(i => responses[i.id]?.status).length;
                         const fails = sectionItems.filter(i => responses[i.id]?.status === 'fail').length;
                         if (fails > 0) return `${fails} Issues`;
                         if (completed === sectionItems.length) return 'Complete';
                         return `${Math.round((completed/sectionItems.length)*100)}%`;
                       }
                       return '-';
                     };
                     
                     markdown += `| ${label} | ${getValue(c1)} | ${getValue(c2)} |\n`;
                   });
                   
                   navigator.clipboard.writeText(markdown);
                 }}
                 className="w-full py-4 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
               >
                 <Copy className="w-4 h-4" />
                 Copy Data
               </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
