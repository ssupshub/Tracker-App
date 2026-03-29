// api.js
import { showToast } from './ui.js';

const API_BASE = '/api';

// Interceptor-like wrapper around fetch
async function apiFetch(url, options = {}, isAuthEndpoint = false) {
  const mergedOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, mergedOptions);
    const data = await response.json().catch(() => ({}));

    // Handle 401 Unauthorized globally — but NOT for login/register attempts
    if (response.status === 401 && !isAuthEndpoint) {
      showToast('Session expired. Please login again.', 'error');
      document.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error(data.message || 'Unauthorized');
    }

    if (!response.ok) {
      throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    showToast(error.message || 'Network error occurred', 'error');
    throw error;
  }
}

// Authentication
export async function login(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, true); // isAuthEndpoint = true
}

export async function register(username, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, true); // isAuthEndpoint = true
}

export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

// Subjects
export async function getSubjects() {
  return apiFetch('/subjects');
}

export async function createSubject(name) {
  return apiFetch('/subjects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteSubject(id) {
  return apiFetch(`/subjects/${id}`, { method: 'DELETE' });
}

export async function addTopic(subId, name) {
  return apiFetch(`/subjects/${subId}/topics`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function toggleTopic(subId, topicId) {
  return apiFetch(`/subjects/${subId}/topics/${topicId}`, { method: 'PATCH' });
}
