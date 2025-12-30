import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';

// When running as a native app, we need to use the full production URL
// When running in web browser, relative URLs work fine
const API_BASE_URL = Capacitor.isNativePlatform() 
  ? 'https://pre-purchase-pal-yuriyozaremba.replit.app' 
  : '';

export interface Vehicle {
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

export interface CreateVehicleInput {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price?: number;
  mileage?: number;
  color?: string;
  titleStatus?: string;
  image?: string;
  bodyType?: string;
  riskScore?: number;
  completeness?: number;
  status?: string;
  checklistResponses?: Record<string, any>;
  notes?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
}

async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE_URL}/api/vehicles`);
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
}

async function fetchVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  return response.json();
}

async function createVehicle(vehicle: CreateVehicleInput): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  if (!response.ok) throw new Error('Failed to create vehicle');
  return response.json();
}

async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
  return response.json();
}

async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete vehicle');
}

// React Query hooks
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Vehicle> }) =>
      updateVehicle(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vehicles', id] });
      
      // Snapshot previous value
      const previousVehicle = queryClient.getQueryData<Vehicle>(['vehicles', id]);
      
      // Optimistically update
      if (previousVehicle) {
        queryClient.setQueryData<Vehicle>(['vehicles', id], {
          ...previousVehicle,
          ...updates,
        });
      }
      
      return { previousVehicle };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVehicle) {
        queryClient.setQueryData(['vehicles', variables.id], context.previousVehicle);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
