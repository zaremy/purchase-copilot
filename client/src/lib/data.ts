export interface ChecklistItem {
  id: string;
  section: string;
  question: string;
  type: 'pass_fail' | 'text' | 'number' | 'rating';
  severity: number; // 1-10
  aiAdvisory?: string; // Vehicle-specific provenance note
}

export const CHECKLIST_DATA: ChecklistItem[] = [
  // Exterior
  { id: 'ext_1', section: 'Exterior', question: 'Body Panels Alignment', type: 'pass_fail', severity: 5, aiAdvisory: 'Check specifically for bumper misalignment on 2016-2018 models; common factory defect.' },
  { id: 'ext_2', section: 'Exterior', question: 'Paint Condition (Scratches/Dents)', type: 'rating', severity: 3 },
  { id: 'ext_3', section: 'Exterior', question: 'Rust Check (Wheel wells, Rocker panels)', type: 'pass_fail', severity: 8 },
  { id: 'ext_4', section: 'Exterior', question: 'Glass & Mirrors (Cracks/Chips)', type: 'pass_fail', severity: 4 },
  { id: 'ext_5', section: 'Exterior', question: 'Tires (Tread Depth & Even Wear)', type: 'pass_fail', severity: 7 },
  { id: 'ext_6', section: 'Exterior', question: 'Lights (Headlights, Brake, Turn)', type: 'pass_fail', severity: 9, aiAdvisory: 'LED strip failure common in headlight assembly for this generation.' },

  // Interior
  { id: 'int_1', section: 'Interior', question: 'Upholstery & Carpet Condition', type: 'rating', severity: 2 },
  { id: 'int_2', section: 'Interior', question: 'Dashboard Warning Lights (Check Engine, etc.)', type: 'pass_fail', severity: 10 },
  { id: 'int_3', section: 'Interior', question: 'AC / Heater Functionality', type: 'pass_fail', severity: 6, aiAdvisory: 'Condenser failure is a known issue; listen for hissing or lack of cold air.' },
  { id: 'int_4', section: 'Interior', question: 'Power Windows & Locks', type: 'pass_fail', severity: 4 },
  { id: 'int_5', section: 'Interior', question: 'Infotainment & Audio', type: 'pass_fail', severity: 3, aiAdvisory: 'Touchscreen ghost touches reported frequently at high mileage.' },
  { id: 'int_6', section: 'Interior', question: 'Odor (Smoke, Mold)', type: 'pass_fail', severity: 5 },

  // Mechanical
  { id: 'mech_1', section: 'Mechanical', question: 'Engine Oil (Level & Condition)', type: 'pass_fail', severity: 8 },
  { id: 'mech_2', section: 'Mechanical', question: 'Coolant (Level & Color)', type: 'pass_fail', severity: 8 },
  { id: 'mech_3', section: 'Mechanical', question: 'Brake Fluid Level', type: 'pass_fail', severity: 9 },
  { id: 'mech_4', section: 'Mechanical', question: 'Engine Noise (Knocking, Ticking)', type: 'pass_fail', severity: 9, aiAdvisory: 'VCM vibration can cause premature mount failure; check for excessive engine movement.' },
  { id: 'mech_5', section: 'Mechanical', question: 'Belts & Hoses Condition', type: 'pass_fail', severity: 6 },
  { id: 'mech_6', section: 'Mechanical', question: 'Battery Corrosion / Age', type: 'pass_fail', severity: 4 },

  // Underbody
  { id: 'und_1', section: 'Underbody', question: 'Fluid Leaks (Oil, Transmission, Coolant)', type: 'pass_fail', severity: 8, aiAdvisory: 'Rear main seal leaks reported on V6 models over 80k miles.' },
  { id: 'und_2', section: 'Underbody', question: 'Exhaust System Rust/Damage', type: 'pass_fail', severity: 6 },
  { id: 'und_3', section: 'Underbody', question: 'Suspension Components (Bushings, Control Arms)', type: 'pass_fail', severity: 7 },
  { id: 'und_4', section: 'Underbody', question: 'Frame / Unibody Damage Signs', type: 'pass_fail', severity: 10 },

  // Test Drive
  { id: 'td_1', section: 'Test Drive', question: 'Engine Start (Cold Start)', type: 'pass_fail', severity: 7, aiAdvisory: 'Listen for grinding noise; starter motor failure is common on this drivetrain.' },
  { id: 'td_2', section: 'Test Drive', question: 'Transmission Shifts (Smoothness)', type: 'pass_fail', severity: 8, aiAdvisory: 'CVT judder at low speeds indicates potential belt slippage.' },
  { id: 'td_3', section: 'Test Drive', question: 'Steering (Play, Pulling)', type: 'pass_fail', severity: 8 },
  { id: 'td_4', section: 'Test Drive', question: 'Braking (Noise, Vibration, Pulling)', type: 'pass_fail', severity: 9, aiAdvisory: 'Warped rotors common due to undersized OEM brakes.' },
  { id: 'td_5', section: 'Test Drive', question: 'Suspension Noise over Bumps', type: 'pass_fail', severity: 6 },
  { id: 'td_6', section: 'Test Drive', question: 'Highway Stability', type: 'pass_fail', severity: 7 },
];

export interface Candidate {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  color?: string;
  titleStatus?: string;
  image?: string;
  bodyType: string;
  riskScore: number; // 0-100
  completeness: number; // 0-100
  status: string;
  checklistResponses: Record<string, ChecklistResponse>;
  notes: string;
  createdAt: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
}

export interface ChecklistResponse {
  itemId: string;
  status: 'pass' | 'fail' | 'unknown';
  note?: string;
  photo?: string;
}

export interface ChecklistPreset {
  id: string;
  name: string;
  description: string;
  items: string[]; // Array of ChecklistItem IDs
  isDefault?: boolean;
}

export const INITIAL_PRESETS: ChecklistPreset[] = [
  {
    id: 'default',
    name: 'Standard Inspection',
    description: 'The recommended 68-point inspection for most vehicles.',
    items: CHECKLIST_DATA.map(i => i.id),
    isDefault: true,
  },
  {
    id: 'quick',
    name: 'Quick Walkaround',
    description: 'Essential checks for a first viewing (15 mins).',
    items: CHECKLIST_DATA.filter(i => i.severity >= 8).map(i => i.id),
  }
];

// Initial Mock Data
export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: '1',
    vin: '1HGBH41JXMN109186',
    year: 2016,
    make: 'Honda',
    model: 'Accord',
    trim: 'EX-L',
    price: 14500,
    mileage: 82000,
    color: 'Black',
    titleStatus: 'Clean',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1000',
    bodyType: 'sedan',
    riskScore: 12,
    completeness: 45,
    status: 'active',
    checklistResponses: {},
    notes: 'Seller seems firm on price. Tires look new.',
    createdAt: new Date().toISOString(),
    engine: '2.4L I4',
    transmission: 'CVT',
    drivetrain: 'FWD',
  },
  {
    id: '2',
    vin: 'JM1NC25L840123456',
    year: 2018,
    make: 'Mazda',
    model: 'MX-5 Miata',
    trim: 'Club',
    price: 21000,
    mileage: 45000,
    color: 'Red',
    titleStatus: 'Clean',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000',
    bodyType: 'convertible',
    riskScore: 5,
    completeness: 10,
    status: 'active',
    checklistResponses: {},
    notes: 'Private party seller. Garage kept.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    engine: '2.0L I4',
    transmission: 'Manual',
    drivetrain: 'RWD',
  },
  {
    id: '3',
    vin: '1G1YY22U055111222',
    year: 2005,
    make: 'Chevrolet',
    model: 'Corvette',
    trim: 'Z51',
    price: 28000,
    mileage: 65000,
    color: 'Yellow',
    titleStatus: 'Rebuilt',
    bodyType: 'coupe',
    riskScore: 85,
    completeness: 80,
    status: 'archived',
    checklistResponses: {},
    notes: 'Walked away. Too many modifications.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    engine: '6.0L V8',
    transmission: 'Manual',
    drivetrain: 'RWD',
  }
];
