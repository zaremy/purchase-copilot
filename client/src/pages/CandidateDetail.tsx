import { MobileLayout } from '@/components/MobileLayout';
import { useVehicle, useUpdateVehicle } from '@/lib/api';
import { useLocation, useRoute, useSearch } from 'wouter';
import { ArrowLeft, Share2, ShieldAlert, CheckCircle2, CircleDashed, ChevronRight, Car, Truck, Bus, Bike, CarFront, Gauge, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { CHECKLIST_DATA } from '@/lib/data';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { EditVehicleSheet } from '@/components/EditVehicleSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CandidateDetail() {
  const [, params] = useRoute('/candidate/:id');
  const [, setLocation] = useLocation();
  const { data: candidate, isLoading } = useVehicle(params?.id || '');
  const updateVehicleMutation = useUpdateVehicle();
  
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const initialTab = queryParams.get('tab') === 'checklist' ? 'checklist' : 'overview';

  const [activeTab, setActiveTab] = useState<'overview' | 'checklist'>(initialTab);
  const [isIssuesExpanded, setIsIssuesExpanded] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Sync tab state when URL query param changes
  useEffect(() => {
    const tabFromUrl = queryParams.get('tab') === 'checklist' ? 'checklist' : 'overview';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [search]);

  const updateCandidate = (id: string, updates: any) => {
    updateVehicleMutation.mutate({ id, updates });
  };

  if (isLoading) {
    return (
      <MobileLayout showNav={true} headerStyle="dark" header={<div />}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (!candidate) return null;

  const sections = Array.from(new Set(CHECKLIST_DATA.map(i => i.section)));
  const responses = candidate.checklistResponses || {};

  const getSectionStatus = (section: string) => {
    const items = CHECKLIST_DATA.filter(i => i.section === section);
    const completed = items.filter(i => responses[i.id]?.status).length;
    const fails = items.filter(i => responses[i.id]?.status === 'fail').length;
    
    if (fails > 0) return 'fail';
    if (completed === items.length) return 'complete';
    return 'pending';
  };

  const getBodyTypeIcon = (type: string) => {
    switch (type) {
      case 'truck': return Truck;
      case 'van': return Bus;
      case 'motorcycle': return Bike;
      case 'car':
      default: return Car;
    }
  };

  const HeroIcon = getBodyTypeIcon(candidate.bodyType || 'car');

  const bodyTypes = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'truck', label: 'Truck', icon: Truck },
    { id: 'van', label: 'Van', icon: Bus },
    { id: 'motorcycle', label: 'Motorcycle', icon: Bike },
  ];

  return (
    <MobileLayout
      showNav={true}
      headerStyle="dark"
      sheet={
        isEditSheetOpen ? (
          <EditVehicleSheet 
            isOpen={isEditSheetOpen} 
            onClose={() => setIsEditSheetOpen(false)} 
            vehicle={candidate}
          />
        ) : null
      }
      header={
        <div className="flex justify-between items-center py-2 px-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-900 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* TABS (Pill Style) in Masthead */}
          <div className="flex justify-center gap-1">
            {['Overview', 'Checklist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === tab.toLowerCase()
                    ? "bg-white text-neutral-900"
                    : "bg-transparent text-neutral-500 hover:text-neutral-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-2 rounded-full hover:bg-neutral-900 transition-colors">
                <HeroIcon className="w-5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Vehicle Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {bodyTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <DropdownMenuItem 
                    key={type.id}
                    onSelect={() => updateCandidate(candidate.id, { bodyType: type.id as any })}
                    className="cursor-pointer"
                  >
                    <TypeIcon className="w-4 h-4 mr-2" />
                    <span className={cn(
                      "flex-1",
                      candidate.bodyType === type.id && "font-bold text-primary"
                    )}>
                      {type.label}
                    </span>
                    {candidate.bodyType === type.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* DARK CONTROL SURFACE (Header + Focus Component) */}
      <div className="bg-neutral-950 pb-6 pt-2">
        {/* FOCUS COMPONENT */}
        <div className="min-h-[110px] flex items-center justify-center">
          {activeTab === 'overview' && (
            <div className="flex flex-col justify-center px-6 animate-in fade-in duration-300 w-full h-full">
               <h2 className="text-4xl font-bold text-white uppercase tracking-tight font-tech leading-none line-clamp-2">
                 {candidate.year} {candidate.make} {candidate.model}
               </h2>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="px-6 animate-in fade-in duration-300 w-full">
               <div className="grid grid-cols-2 gap-8 items-start">
                  {/* Progress Column */}
                  <div className="flex flex-col items-center text-center">
                     <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2">Progress</span>
                     <span className="text-5xl font-medium text-white tracking-tighter font-mono mb-4">{candidate.completeness}%</span>
                     
                     {/* Thin Rail */}
                     <div className="h-[3px] w-full max-w-[120px] bg-neutral-500 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${candidate.completeness}%` }} />
                     </div>
                  </div>

                  {/* Issues Column */}
                  <div className="flex flex-col items-center text-center">
                     <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2">Issues</span>
                     <span className="text-5xl font-medium text-white tracking-tighter font-mono mb-4">
                       {Object.values(responses).filter(r => r.status === 'fail').length}
                     </span>
                     
                     {/* Red Dots Rail */}
                     <div className="h-[3px] w-full max-w-[120px] flex items-center justify-center gap-1">
                       {Array.from({ length: Object.values(responses).filter(r => r.status === 'fail').length }).map((_, i) => (
                         <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                       ))}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* LIGHT CONTENT SURFACE */}
      <div className="bg-white min-h-[500px]">
        
        {/* OVERVIEW CONTENT */}
        {activeTab === 'overview' && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            {/* 1. Identity & Valuation (Left Aligned) - Only show if at least one value */}
            {(candidate.price > 0 || candidate.mileage > 0 || candidate.titleStatus) && (
              <div className="pt-8 pb-8 px-4 border-b border-neutral-200">
                <div className="grid grid-cols-3 gap-4 items-start">
                   {candidate.price > 0 && (
                     <div className="col-span-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Price</span>
                        <span className="text-2xl font-medium text-neutral-900 tracking-tight font-tech">${candidate.price.toLocaleString()}</span>
                     </div>
                   )}
                   
                   {candidate.mileage > 0 && (
                     <div className="col-span-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Mileage</span>
                        <span className="text-2xl font-medium text-neutral-900 tracking-tight font-tech">{Math.round(candidate.mileage/1000)}k</span>
                     </div>
                   )}

                   {candidate.titleStatus && (
                     <div className="col-span-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Title</span>
                        <span className="text-2xl font-medium text-neutral-900 tracking-tight font-tech">{candidate.titleStatus}</span>
                     </div>
                   )}
                </div>
              </div>
            )}

            <div className="px-4 space-y-8 pt-8 pb-20">
              {/* Specs */}
              <div>
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Specifications</h3>
                <div className="bg-neutral-50/50 border-t border-neutral-200 -mx-4">
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-200 items-baseline px-4">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide text-left col-span-1">Trim</span>
                    <span className="text-sm font-medium text-neutral-900 text-left col-span-2">{candidate.trim}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-200 items-baseline px-4">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide text-left col-span-1">Color</span>
                    <span className="text-sm font-medium text-neutral-900 text-left col-span-2">{candidate.color || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-200 items-baseline px-4">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide text-left col-span-1">Engine</span>
                    <span className="text-sm font-medium text-neutral-900 text-left col-span-2">{candidate.engine || '2.0L I4'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-200 items-baseline px-4">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide text-left col-span-1">Transmission</span>
                    <span className="text-sm font-medium text-neutral-900 text-left col-span-2">{candidate.transmission || 'Automatic'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-2 border-b border-neutral-200 items-baseline px-4">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide text-left col-span-1">Drive</span>
                    <span className="text-sm font-medium text-neutral-900 text-left col-span-2">{candidate.drivetrain || 'FWD'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                 <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seller Notes</h3>
                 <div className="bg-white py-4 border-y border-neutral-200 -mx-4 px-4">
                   <p className="text-sm text-neutral-700 leading-relaxed">{candidate.notes}</p>
                 </div>
              </div>
              
              <div className="px-2 space-y-3 pt-4">
                <button 
                  onClick={() => setIsEditSheetOpen(true)}
                  className="w-full py-4 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Edit Vehicle Details
                </button>
                
                <button 
                  onClick={() => {
                    const newStatus = candidate.status === 'archived' ? 'active' : 'archived';
                    updateCandidate(candidate.id, { status: newStatus });
                    setLocation('/');
                  }}
                  className={cn(
                    "w-full py-4 border bg-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2",
                    candidate.status === 'archived' 
                      ? "border-neutral-300 text-neutral-900 hover:bg-neutral-50" // Restore (Secondary)
                      : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" // Archive (Destructive-ish)
                  )}
                >
                  {candidate.status === 'archived' ? 'Un-archive Vehicle' : 'Archive Vehicle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHECKLIST CONTENT */}
        {activeTab === 'checklist' && (
          <div className="animate-in slide-in-from-bottom-2 duration-500 pb-20">

            {/* Issues Flagged Accordion */}
            {(() => {
              const failedItems = CHECKLIST_DATA.filter(item => responses[item.id]?.status === 'fail');
              if (failedItems.length === 0) return null;
              
              return (
                <div className="border-b border-neutral-200">
                  <button
                    onClick={() => setIsIssuesExpanded(!isIssuesExpanded)}
                    className="w-full flex items-center justify-between py-4 px-6 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm text-primary uppercase tracking-wide">
                        Issues Flagged ({failedItems.length})
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-primary transition-transform duration-200",
                      isIssuesExpanded && "rotate-180"
                    )} />
                  </button>
                  
                  {isIssuesExpanded && (
                    <div className="bg-white divide-y divide-neutral-100">
                      {failedItems.map((item) => {
                        const itemResponse = responses[item.id];
                        return (
                          <Link key={item.id} href={`/candidate/${candidate.id}/checklist/${item.section}`}>
                            <div className="flex items-center justify-between py-4 px-6 hover:bg-neutral-50 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-white shrink-0 self-start mt-1" />
                                <div>
                                  <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wide group-hover:text-primary transition-colors">
                                    {item.question}
                                  </h4>
                                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.section}</span>
                                  {itemResponse?.notes && (
                                    <p className="text-xs text-neutral-600 mt-1 normal-case tracking-normal">{itemResponse.notes}</p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors shrink-0" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Sections List - Clean & Flat */}
            <div className="bg-white border-b border-neutral-200 divide-y divide-neutral-100">
               {sections.map((section) => {
                  const status = getSectionStatus(section);
                  const itemCount = CHECKLIST_DATA.filter(i => i.section === section).length;
                  
                  return (
                    <Link key={section} href={`/candidate/${candidate.id}/checklist/${section}`}>
                      <div className="flex items-center justify-between py-5 px-6 hover:bg-neutral-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          {/* Status Indicator - Minimal */}
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full ring-2 ring-offset-2 ring-offset-white",
                            status === 'fail' && "bg-primary ring-primary/20",
                            status === 'complete' && "bg-neutral-900 ring-neutral-200",
                            status === 'pending' && "bg-neutral-200 ring-transparent"
                          )} />
                          
                          <div>
                            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide group-hover:text-primary transition-colors">{section}</h3>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{itemCount} items</span>
                           <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  )
               })}
            </div>
            
            {candidate.completeness > 50 && (
               <div className="p-6 flex justify-center">
                 <button className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors flex items-center gap-2">
                   Download Full Report
                 </button>
               </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
