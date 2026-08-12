import { Manuscript, ManuscriptFormData, Category, Language, FilterState, ManuscriptStatus } from '../types';

const ADMIN_TOKEN_KEY = 'archivalia_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function fetchManuscripts(filters?: Partial<FilterState>, isAdmin: boolean = false): Promise<Manuscript[]> {
  const params = new URLSearchParams();
  if (isAdmin) params.append('isAdmin', 'true');

  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.language) params.append('language', filters.language);
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
    if (filters.yearTo) params.append('yearTo', filters.yearTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
  }

  const token = isAdmin ? getAdminToken() : null;
  const res = await fetch(`/api/manuscripts?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    if (isAdmin && (res.status === 401 || res.status === 403)) removeAdminToken();
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to fetch manuscripts');
  }
  return res.json();
}

export async function fetchManuscriptById(id: number): Promise<Manuscript> {
  const token = getAdminToken();
  const res = await fetch(`/api/manuscripts/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('Manuscript not found');
  return res.json();
}

export async function createManuscript(data: ManuscriptFormData): Promise<Manuscript> {
  const token = getAdminToken();
  const res = await fetch('/api/manuscripts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create manuscript');
  }
  return res.json();
}

export async function updateManuscript(id: number, data: Partial<ManuscriptFormData>): Promise<Manuscript> {
  const token = getAdminToken();
  const res = await fetch(`/api/manuscripts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update manuscript');
  }
  return res.json();
}

export async function updateManuscriptStatus(id: number, status: ManuscriptStatus): Promise<Manuscript> {
  const token = getAdminToken();
  const res = await fetch(`/api/manuscripts/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update manuscript status');
  }
  return res.json();
}

export async function deleteManuscript(id: number): Promise<void> {
  const token = getAdminToken();
  const res = await fetch(`/api/manuscripts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete manuscript');
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const token = getAdminToken();
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const token = getAdminToken();
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete category');
}

export async function fetchLanguages(): Promise<Language[]> {
  const res = await fetch('/api/languages');
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function createLanguage(name: string, code?: string): Promise<Language> {
  const token = getAdminToken();
  const res = await fetch('/api/languages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, code }),
  });
  if (!res.ok) throw new Error('Failed to create language');
  return res.json();
}

export async function deleteLanguage(id: string): Promise<void> {
  const token = getAdminToken();
  const res = await fetch(`/api/languages/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete language');
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  setAdminToken(data.token);
  return data;
}

export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } finally {
    removeAdminToken();
  }
}

export async function checkAdminAuth() {
  const token = getAdminToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) {
      removeAdminToken();
      return null;
    }
    if (!res.ok) throw new Error('Failed to validate administrator session');
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export function getManuscriptPdfUrl(id: number): string {
  return `/api/manuscripts/${id}/pdf`;
}

export function getManuscriptCoverUrl(id: number): string {
  return `/api/manuscripts/${id}/cover`;
}
