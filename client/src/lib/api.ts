import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const response = await fetch('/api/vehicles');
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
}

async function fetchVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  return response.json();
}

async function createVehicle(vehicle: CreateVehicleInput): Promise<Vehicle> {
  const response = await fetch('/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  if (!response.ok) throw new Error('Failed to create vehicle');
  return response.json();
}

async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
  return response.json();
}

async function deleteVehicle(id: string): Promise<void> {
  const response = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
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
    onSuccess: (_, variables) => {
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
