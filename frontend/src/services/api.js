const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('libshare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
  },

  // Schools
  schools: {
    getAll: () => request('/schools'),
  },

  // Resources
  resources: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, v);
        }
      });
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request(`/resources${queryStr}`);
    },
    getDetail: (id) => request(`/resources/${id}`),
    create: (data) => request('/resources', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/resources/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getMyBookings: () => request('/bookings/my-bookings'),
  },

  // School Portal Operations
  school: {
    getRequests: (schoolId, statusFilter = 'all') =>
      request(`/school/${schoolId}/requests${statusFilter !== 'all' ? `?status_filter=${statusFilter}` : ''}`),
    decideRequest: (schoolId, itemId, action, rejectionReason = '') =>
      request(`/school/${schoolId}/requests/${itemId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ action, rejection_reason: rejectionReason }),
      }),
    getVerifications: (schoolId, statusFilter = 'all') =>
      request(`/school/${schoolId}/students/verification?status_filter=${statusFilter}`),
    updateVerification: (schoolId, studentId, verificationStatus, verificationNotes = '') =>
      request(`/school/${schoolId}/students/${studentId}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          verification_status: verificationStatus,
          verification_notes: verificationNotes,
        }),
      }),
    getConditionReports: (schoolId) => request(`/school/${schoolId}/condition-reports`),
    getRestrictions: (schoolId) => request(`/school/${schoolId}/restrictions`),
    createRestriction: (schoolId, data) =>
      request(`/school/${schoolId}/restrictions`, { method: 'POST', body: JSON.stringify(data) }),
    deleteRestriction: (schoolId, ruleId) =>
      request(`/school/${schoolId}/restrictions/${ruleId}`, { method: 'DELETE' }),
  },

  // QR Handover & Return
  qr: {
    verifyHandover: (qrToken, conditionRating, preConditionNotes = '') =>
      request('/qr/verify-and-handover', {
        method: 'POST',
        body: JSON.stringify({
          qr_token: qrToken,
          condition_rating: conditionRating,
          pre_condition_notes: preConditionNotes,
        }),
      }),
    verifyReturn: (qrToken, conditionRating, damageNotes = '', missingParts = '', staffRemarks = '') =>
      request('/qr/verify-and-return', {
        method: 'POST',
        body: JSON.stringify({
          qr_token: qrToken,
          condition_rating: conditionRating,
          damage_notes: damageNotes,
          missing_parts: missingParts,
          staff_remarks: staffRemarks,
        }),
      }),
  },

  // AI & Analytics
  ai: {
    getRecommendations: (resourceId = null, query = null, limit = 4) => {
      const q = new URLSearchParams();
      if (resourceId) q.append('resource_id', resourceId);
      if (query) q.append('query', query);
      q.append('limit', limit);
      return request(`/ai/recommendations?${q.toString()}`);
    },
    getDemandInsights: (schoolId = null) =>
      request(`/ai/demand-insights${schoolId ? `?school_id=${schoolId}` : ''}`),
  },

  analytics: {
    getSchool: (schoolId) => request(`/analytics/school/${schoolId}`),
    getPlatform: () => request('/analytics/platform'),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  },
};
