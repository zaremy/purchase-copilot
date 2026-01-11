import { useStore, LocalVehicle, CreateVehicleInput } from './store';

// Hook to get all vehicles
export function useLocalVehicles() {
  return useStore((state) => state.vehicles);
}

// Hook to get a single vehicle by ID
export function useLocalVehicle(id: string) {
  return useStore((state) => state.vehicles.find((v) => v.id === id));
}

// Hook for creating vehicles (mimics React Query mutation interface)
export function useCreateLocalVehicle() {
  const addVehicle = useStore((state) => state.addVehicle);

  return {
    mutateAsync: async (vehicle: CreateVehicleInput): Promise<LocalVehicle> => {
      return addVehicle(vehicle);
    },
    isPending: false,
  };
}

// Hook for updating vehicles
export function useUpdateLocalVehicle() {
  const updateVehicle = useStore((state) => state.updateVehicle);

  return {
    mutate: (
      params: { id: string; updates: Partial<LocalVehicle> },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => {
      try {
        updateVehicle(params.id, params.updates);
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error as Error);
      }
    },
    mutateAsync: async (params: { id: string; updates: Partial<LocalVehicle> }) => {
      updateVehicle(params.id, params.updates);
    },
    isPending: false,
  };
}

// Hook for deleting vehicles
export function useDeleteLocalVehicle() {
  const deleteVehicle = useStore((state) => state.deleteVehicle);

  return {
    mutateAsync: async (id: string) => {
      deleteVehicle(id);
    },
    isPending: false,
  };
}

// Hook for checklist responses
export function useSetVehicleChecklistResponse() {
  const setVehicleChecklistResponse = useStore((state) => state.setVehicleChecklistResponse);

  return {
    mutate: (vehicleId: string, itemId: string, response: any) => {
      setVehicleChecklistResponse(vehicleId, itemId, response);
    },
  };
}
