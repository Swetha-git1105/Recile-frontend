// ==========================================
// BRAINORA - CENTRAL API SERVICE
// ==========================================

// Backend URL
export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/+$/, '');
console.log('Brainora API URL:', API_URL);
const TOKEN_KEY = 'token';

// ==========================================
// JWT TOKEN MANAGEMENT
// ==========================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  if (!token) {
    throw new Error(
      'Login successful, but no JWT token was received.'
    );
  }

  // Avoid saving "Bearer " twice.
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

  localStorage.setItem(TOKEN_KEY, cleanToken);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

// Called when the backend rejects the token (expired or invalid).
// Clears the saved session and tells AuthContext to log the user out,
// which sends them back to the login page.
function handleUnauthorized() {
  logout();
  localStorage.removeItem('brainora_user');
  window.dispatchEvent(new Event('brainora:unauthorized'));
}

// ==========================================
// COMMON API REQUEST FUNCTION
// ==========================================

async function request(endpoint, options = {}) {
  const {
    auth = false,
    headers = {},
    body,
    ...fetchOptions
  } = options;

  const requestHeaders = { ...headers };

  // Attach JWT token for protected endpoints.
  if (auth) {
    const token = getToken();

    if (!token) {
      throw new Error(
        'Authentication token not found. Please log in again.'
      );
    }

    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Set JSON content type only for normal JSON requests.
  // Never set it manually for FormData.
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  let response;

  // Send API request.
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch (error) {
    console.error('API connection error:', error);
    console.error('Backend URL:', API_URL);
    console.error('API endpoint:', endpoint);

    throw new Error(
      `Cannot connect to Brainora backend at ${API_URL}. ` +
      'Check whether Spring Boot is running, the backend URL is correct, and CORS is configured.'
    );
  }

  // Read response.
  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  // Handle HTTP errors.
  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.message || data.error || data.detail
        : data;

    if (response.status === 401 && auth) {
      handleUnauthorized();
      throw new Error(
        'Session expired or invalid token. Please log out and log in again.'
      );
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to perform this action.'
      );
    }

    if (response.status === 413) {
      throw new Error(
        'The uploaded file is too large. Please choose a smaller file.'
      );
    }

    if (response.status === 422) {
      throw new Error(
        message ||
        'The uploaded resource is unreadable or does not meet quality requirements.'
      );
    }

    throw new Error(
      message || `Request failed (${response.status})`
    );
  }

  return data;
}

// ==========================================
// JWT EXTRACTION FROM LOGIN RESPONSE
// ==========================================

function extractToken(data) {
  return (
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.jwt ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.data?.jwt ||
    null
  );
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// Login
export async function login(credentials) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });

  const token = extractToken(data);

  if (!token) {
    console.error('Login response:', data);

    throw new Error(
      'Login response did not contain a JWT token. Check your backend login response.'
    );
  }

  saveToken(token);

  return data;
}

// Register
export async function register(userData) {
  return request('/api/auth/register', {
    method: 'POST',
    body: userData,
  });
}

// ==========================================
// STUDY RESOURCE APIs
// ==========================================

// Upload resource
export async function uploadResource(resource) {
  if (!resource || !resource.file) {
    throw new Error('Please select a file to upload.');
  }

  const formData = new FormData();

  formData.append('title', resource.title);
  formData.append('scope', resource.scope || 'SUBJECT');
  formData.append('department', resource.department);
  formData.append('type', resource.type);
  

  if (resource.semester) {
    formData.append('semester', resource.semester);
  }

  if (resource.subject) {
    formData.append('subject', resource.subject);
  }

  if (resource.description) {
    formData.append('description', resource.description);
  }

  formData.append('file', resource.file);

  return request('/api/resources/upload', {
    method: 'POST',
    body: formData,
    auth: true,
  });
}

// Get all resources
export function getResources() {
  return request('/api/resources', {
    method: 'GET',
    auth: true,
  });
}

// Get current user's uploads
export function getMyUploads() {
  return request('/api/resources/my-uploads', {
    method: 'GET',
    auth: true,
  });
}

// Get individual resource
export async function getMyCredits() {
  const data = await request('/api/credits/me', {
    method: 'GET',
    auth: true,
  });

  return Number(data?.totalCredits) || 0;
}

export function getResource(id) {
  return request(`/api/resources/${id}`, {
    method: 'GET',
    auth: true,
  });
}

// ==========================================
// RESOURCE PREVIEW AND DOWNLOAD
// ==========================================

// Get preview URL
export function getResourcePreviewUrl(id) {
  return `${API_URL}/api/resources/${id}/preview`;
}

// Get download URL
export function getResourceDownloadUrl(id) {
  return `${API_URL}/api/resources/${id}/download`;
}

// Preview or download resource as Blob.
// Use this when the endpoint requires JWT authentication.
export async function getResourceFileBlob(
  id,
  action = 'preview'
) {
  if (!['preview', 'download'].includes(action)) {
    throw new Error('Invalid resource action.');
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      'Please log in to access this resource.'
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/resources/${id}/${action}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Resource file connection error:', error);

    throw new Error(
      'Cannot connect to the Brainora backend. Please check whether the server is running.'
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Session expired. Please log in again.'
      );
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to access this resource.'
      );
    }

    throw new Error(
      `Unable to ${action} resource (${response.status}).`
    );
  }

  return response.blob();
}

// ==========================================
// DELETE RESOURCE
// ==========================================

export function deleteResource(id) {
  return request(`/api/resources/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}