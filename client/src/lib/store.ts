import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Candidate, ChecklistResponse, ChecklistPreset, INITIAL_PRESETS } from './data';

export interface UserProfile {
  firstName: string;
  email: string;
  phone: string;
  zipCode: string;
}

// Vehicle type for local storage
export interface LocalVehicle {
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
  riskScore: number;
  completeness: number;
  status: string;
  checklistResponses: Record<string, any>;
  notes: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateVehicleInput = Omit<LocalVehicle, 'id' | 'createdAt' | 'updatedAt'>;

interface AppState {
  candidates: Candidate[];
  presets: ChecklistPreset[];
  userProfile: UserProfile | null;
  onboardingComplete: boolean;
  // Vehicle state
  vehicles: LocalVehicle[];
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  setChecklistResponse: (candidateId: string, itemId: string, response: ChecklistResponse) => void;
  addPreset: (preset: ChecklistPreset) => void;
  updatePreset: (id: string, updates: Partial<ChecklistPreset>) => void;
  deletePreset: (id: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  // Vehicle CRUD
  addVehicle: (vehicle: CreateVehicleInput) => LocalVehicle;
  updateVehicle: (id: string, updates: Partial<LocalVehicle>) => void;
  deleteVehicle: (id: string) => void;
  setVehicleChecklistResponse: (vehicleId: string, itemId: string, response: ChecklistResponse) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      candidates: [],
      presets: INITIAL_PRESETS,
      userProfile: null,
      onboardingComplete: false,
      vehicles: [],
      addCandidate: (candidate) =>
        set((state) => ({ candidates: [candidate, ...state.candidates] })),
      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((c) => 
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCandidate: (id) =>
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
        })),
      setChecklistResponse: (candidateId, itemId, response) =>
        set((state) => ({
          candidates: state.candidates.map((c) => {
            if (c.id !== candidateId) return c;
            
            const newResponses = { ...c.checklistResponses, [itemId]: response };
            
            // Recalculate completeness
            const totalItems = 30; // Approximation of our checklist length
            const answeredCount = Object.keys(newResponses).length;
            const completeness = Math.min(100, Math.round((answeredCount / totalItems) * 100));
            
            // Simple risk score calc (mock)
            const fails = Object.values(newResponses).filter(r => r.status === 'fail').length;
            const riskScore = Math.min(100, fails * 15);

            return {
              ...c,
              checklistResponses: newResponses,
              completeness,
              riskScore
            };
          }),
        })),
      addPreset: (preset) =>
        set((state) => ({ presets: [...state.presets, preset] })),
      updatePreset: (id, updates) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),
      setUserProfile: (profile) =>
        set(() => ({ userProfile: profile })),
      completeOnboarding: () =>
        set(() => ({ onboardingComplete: true })),
      // Vehicle CRUD operations
      addVehicle: (vehicle) => {
        const newVehicle: LocalVehicle = {
          ...vehicle,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ vehicles: [newVehicle, ...state.vehicles] }));
        return newVehicle;
      },
      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
          ),
        })),
      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),
      setVehicleChecklistResponse: (vehicleId, itemId, response) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => {
            if (v.id !== vehicleId) return v;

            const newResponses = { ...v.checklistResponses, [itemId]: response };

            // Recalculate completeness
            const totalItems = 30;
            const answeredCount = Object.keys(newResponses).length;
            const completeness = Math.min(100, Math.round((answeredCount / totalItems) * 100));

            // Simple risk score calc
            const fails = Object.values(newResponses).filter((r: any) => r.status === 'fail').length;
            const riskScore = Math.min(100, fails * 15);

            return {
              ...v,
              checklistResponses: newResponses,
              completeness,
              riskScore,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
    }),
    {
      name: 'copilot-storage',
    }
  )
);
