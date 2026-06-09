import type {
  IVehicle,
  LoginResponse,
  RegisterRequest,
  TcoCalculationRequest,
  TcoCalculationResponse,
  IUser,
  IAddressSuggestion,
  IFuelTariff,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: 'הבקשה נכשלה' }))) as { error: string };
    throw new Error(err.error);
  }

  return res.json() as Promise<T>;
}

export function login(identifier: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(data: RegisterRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchVehicles(make?: string, model?: string, token?: string): Promise<IVehicle[]> {
  const params = new URLSearchParams();
  if (make) params.set('make', make);
  if (model) params.set('model', model);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request<IVehicle[]>(`/vehicles${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function searchAddresses(q: string, city?: string): Promise<IAddressSuggestion[]> {
  const params = new URLSearchParams({ q });
  if (city) params.set('city', city);
  return request<IAddressSuggestion[]>(`/addresses/search?${params.toString()}`);
}

export function fetchFuelTariff(): Promise<IFuelTariff> {
  return request<IFuelTariff>('/fuel-tariff');
}

export function calculateTco(data: TcoCalculationRequest, token: string): Promise<TcoCalculationResponse> {
  return request<TcoCalculationResponse>('/calculations/tco', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export function fetchAdminUsers(token: string): Promise<IUser[]> {
  return request<IUser[]>('/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAdminUser(data: CreateUserRequest, token: string): Promise<IUser> {
  return request<IUser>('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export function updateAdminUser(userId: string, data: UpdateUserRequest, token: string): Promise<IUser> {
  return request<IUser>(`/admin/users/${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export function banUser(userId: string, token: string): Promise<IUser> {
  return request<IUser>(`/admin/users/${userId}/ban`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}
