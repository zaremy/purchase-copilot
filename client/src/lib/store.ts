import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Candidate, ChecklistResponse, ChecklistPreset, INITIAL_PRESETS } from './data';

export interface UserProfile {
  firstName: string;
  email: string;
  phone: string;
  zipCode: string;
}

interface AppState {
  candidates: Candidate[];
  presets: ChecklistPreset[];
  userProfile: UserProfile | null;
  onboardingComplete: boolean;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  setChecklistResponse: (candidateId: string, itemId: string, response: ChecklistResponse) => void;
  addPreset: (preset: ChecklistPreset) => void;
  updatePreset: (id: string, updates: Partial<ChecklistPreset>) => void;
  deletePreset: (id: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      candidates: [],
      presets: INITIAL_PRESETS,
      userProfile: null,
      onboardingComplete: false,
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
    }),
    {
      name: 'copilot-storage',
    }
  )
);
