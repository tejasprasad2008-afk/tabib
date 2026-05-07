const getBaseUrl = () => {
  const selected = localStorage.getItem('selectedClinicUrl');
  if (selected) {
    if (window.location.hostname === 'localhost' && (selected.includes('localhost') || selected.includes('127.0.0.1'))) {
      return '';
    }
    return selected;
  }
  return import.meta.env.VITE_API_URL || '';
};

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('tabib_token');
  const BASE = getBaseUrl();
  
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
