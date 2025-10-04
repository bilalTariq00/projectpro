// Mobile API utility functions
// This ensures all mobile API calls use absolute URLs to connect to the backend server

// Use relative API base so Vercel rewrites proxy to Railway (see vercel.json)
const MOBILE_API_BASE_URL = '';


// Global fetch interceptor to catch ALL API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args);
};

export const mobileApiCall = async (method: string, endpoint: string, data?: any) => {
  // Handle different endpoint types
  // Normalize to ensure a leading slash
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let mobileEndpoint: string;
  if (normalized.startsWith('/api/mobile')) {
    // Already a mobile endpoint
    mobileEndpoint = normalized;
  } else if (normalized.startsWith('/api/reports')) {
    // Reports endpoints go directly to /api/reports
    mobileEndpoint = normalized;
  } else {
    // Other endpoints get /api/mobile prefix
    mobileEndpoint = `/api/mobile${normalized}`;
  }
  const fullUrl = `${MOBILE_API_BASE_URL}${mobileEndpoint}`;
  
  // Get stored mobile session ID for mobile app
  const mobileSessionId = localStorage.getItem('mobileSessionId');
  
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(mobileSessionId && { 'x-mobile-session-id': mobileSessionId })
    },
    credentials: 'include',
    cache: 'no-store',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(fullUrl, options);
  
  // Extract and store mobile session ID from response
  if (response.ok && method === 'POST' && (endpoint === '/login' || endpoint === '/api/mobile/login')) {
    try {
      const responseData = await response.clone().json();
      
      if (responseData.mobileSessionId) {
        localStorage.setItem('mobileSessionId', responseData.mobileSessionId);
      }
    } catch (e) {
      console.error('Could not parse response for session ID:', e);
    }
  }
  
  return response;
};

// Convenience functions for common HTTP methods
export const mobileGet = (endpoint: string) => mobileApiCall('GET', endpoint);
export const mobilePost = (endpoint: string, data?: any) => mobileApiCall('POST', endpoint, data);
export const mobilePut = (endpoint: string, data?: any) => mobileApiCall('PUT', endpoint, data);
export const mobileDelete = (endpoint: string) => mobileApiCall('DELETE', endpoint);
export const mobilePatch = (endpoint: string, data?: any) => mobileApiCall('PATCH', endpoint, data); 