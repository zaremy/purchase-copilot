import { Candidate } from '@/lib/data';
import { ChevronRight, AlertTriangle, CheckCircle2, Car, Truck, Bus, Bike, HelpCircle, CarFront } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

interface CandidateCardProps {
  candidate: Candidate;
}

const getBodyTypeIcon = (type: string) => {
  switch (type) {
    case 'truck': return Truck;
    case 'van': return Bus;
    case 'motorcycle': return Bike;
    case 'suv': return CarFront; // Using CarFront as placeholder for SUV
    case 'sedan':
    case 'coupe':
    case 'convertible':
    case 'wagon':
    case 'hatchback':
      return Car;
    default: return Car;
  }
};

export function CandidateCard({ candidate }: CandidateCardProps) {
  const Icon = getBodyTypeIcon(candidate.bodyType || 'sedan');

  return (
    <Link href={`/candidate/${candidate.id}`}>
      <div className="bg-white rounded-sm p-4 mb-3 border border-neutral-200 active:bg-neutral-50 transition-colors duration-200 cursor-pointer hover:border-primary/50 group">
        <div className="flex flex-col gap-4">
          
          {/* Top Row: Identity & Icon */}
          <div className="flex justify-between items-start">
             <div>
                <h3 className="font-bold text-lg leading-none text-neutral-900 uppercase tracking-tight font-tech mb-1">
                  {candidate.make} {candidate.model}
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {candidate.year} <span className="text-neutral-300 mx-1">|</span> {candidate.trim}
                </p>
             </div>
             
             {/* Icon (Subtle) */}
             <div className="text-neutral-300 group-hover:text-primary transition-colors">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
             </div>
          </div>
          
          {/* Bottom Row: Technical Data Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
             <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Price</span>
                <span className="text-sm font-medium text-neutral-900 tracking-tight font-tech">${candidate.price.toLocaleString()}</span>
             </div>
             
             <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Mileage</span>
                <span className="text-sm font-medium text-neutral-900 tracking-tight font-tech">{Math.round(candidate.mileage / 1000)}k</span>
             </div>

             <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Status</span>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   <span className="text-sm font-medium text-neutral-900 tracking-tight font-tech">{candidate.completeness}%</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
