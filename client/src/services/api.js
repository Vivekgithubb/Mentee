/**
 * Unified API Client for MEntee Full-Stack System
 * Uses server-managed HttpOnly cookies with `credentials: 'include'`.
 * No JWTs, passwords, or authentication secrets are stored in Local Storage.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const defaultFetchOptions = {
  credentials: 'include'
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
};

export const api = {
  // Authentication (Server-managed HttpOnly Cookies)
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },

    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },

    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        ...defaultFetchOptions,
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(res);
    },

    logout: async () => {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(res);
    }
  },

  // HOD Mentor Assignment Management
  hod: {
    getMentorAssignments: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/hod/mentor-assignments?${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getUnassignedStudents: async () => {
      const res = await fetch(`${API_BASE}/hod/unassigned-students`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getAvailableMentors: async () => {
      const res = await fetch(`${API_BASE}/hod/available-mentors`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    assignMentor: async (data) => {
      const res = await fetch(`${API_BASE}/hod/mentor-assignments`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    reassignMentor: async (id, data) => {
      const res = await fetch(`${API_BASE}/hod/mentor-assignments/${id}`, {
        ...defaultFetchOptions,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    getAnalytics: async () => {
      const res = await fetch(`${API_BASE}/hod/analytics`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  },

  // Academic Records (Semester-wise Marks & Audit History)
  academics: {
    getRecords: async (studentId = '') => {
      const query = studentId ? `?studentId=${studentId}` : '';
      const res = await fetch(`${API_BASE}/academics/records${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    saveRecord: async (data) => {
      const res = await fetch(`${API_BASE}/academics/records`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    deleteRecord: async (id) => {
      const res = await fetch(`${API_BASE}/academics/records/${id}`, {
        ...defaultFetchOptions,
        method: 'DELETE'
      });
      return handleResponse(res);
    },

    getHistory: async (id) => {
      const res = await fetch(`${API_BASE}/academics/records/${id}/history`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  },

  // Document Management & Strict Privacy Workflow
  documents: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/documents?${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    upload: async (formData) => {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        ...defaultFetchOptions,
        method: 'POST',
        body: formData
      });
      return handleResponse(res);
    },

    replace: async (id, formData) => {
      const res = await fetch(`${API_BASE}/documents/${id}/replace`, {
        ...defaultFetchOptions,
        method: 'PUT',
        body: formData
      });
      return handleResponse(res);
    },

    delete: async (id) => {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        ...defaultFetchOptions,
        method: 'DELETE'
      });
      return handleResponse(res);
    },

    getDownloadUrl: (id, preview = false) => `${API_BASE}/documents/${id}/download${preview ? '?preview=true' : ''}`,

    // Mentor Document Review Queue
    getMentorReviewQueue: async () => {
      const res = await fetch(`${API_BASE}/mentor/document-reviews`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    approve: async (id, comment = '') => {
      const res = await fetch(`${API_BASE}/documents/${id}/approve`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      return handleResponse(res);
    },

    reject: async (id, reason) => {
      const res = await fetch(`${API_BASE}/documents/${id}/reject`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      return handleResponse(res);
    }
  },

  // Mentor Document Requests Workflow
  documentRequests: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/document-requests?${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    create: async (data) => {
      const res = await fetch(`${API_BASE}/document-requests`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    // Upload a document in response to a specific mentor document request.
    // Reuses the existing /api/documents/upload endpoint, passing requestId as a field.
    uploadAgainstRequest: async (requestId, formData) => {
      const id = typeof requestId === 'object' && requestId?._id ? requestId._id : requestId;
      if (formData instanceof FormData) {
        if (!formData.has('documentRequestId')) {
          formData.append('documentRequestId', id);
        }
      }
      const res = await fetch(`${API_BASE}/documents/upload`, {
        ...defaultFetchOptions,
        method: 'POST',
        body: formData
      });
      return handleResponse(res);
    },

    // Mentor reviews a submitted document linked to a request.
    // Routes through direct review endpoint or the working Document Management approve/reject endpoints.
    review: async (requestId, { action, reason, comment } = {}) => {
      const id = typeof requestId === 'object' && requestId?._id ? requestId._id : requestId;

      // 1. Try direct document request review endpoint
      try {
        const directRes = await fetch(`${API_BASE}/document-requests/${id}/review`, {
          ...defaultFetchOptions,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reason, comment })
        });
        if (directRes.ok) {
          return handleResponse(directRes);
        }
      } catch (e) {
        // Fallback to resolving document ID and calling document endpoint
      }

      // 2. Fallback to resolving submittedDocument
      let docId = typeof requestId === 'object' ? (requestId?.submittedDocument?._id || requestId?.submittedDocument) : null;

      if (!docId) {
        // Fetch the request to resolve the submittedDocument ID
        const reqRes = await fetch(`${API_BASE}/document-requests`, {
          ...defaultFetchOptions
        });
        const reqData = await reqRes.json().catch(() => ({}));
        const allRequests = reqData.documentRequests || [];
        const targetReq = allRequests.find((r) => r._id === id);
        docId = targetReq?.submittedDocument?._id || targetReq?.submittedDocument;
      }

      if (!docId) {
        throw new Error('No submitted document found for this request. The student may not have uploaded a file yet.');
      }

      if (action === 'APPROVED') {
        const res = await fetch(`${API_BASE}/documents/${docId}/approve`, {
          ...defaultFetchOptions,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: comment || reason || 'Approved by mentor' })
        });
        return handleResponse(res);
      } else {
        if (!reason || !reason.trim()) {
          throw new Error('A rejection reason is required');
        }
        const res = await fetch(`${API_BASE}/documents/${docId}/reject`, {
          ...defaultFetchOptions,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        return handleResponse(res);
      }
    },

    approve: async (requestId, comment = '') => {
      return api.documentRequests.review(requestId, { action: 'APPROVED', comment });
    },

    reject: async (requestId, reason = '') => {
      return api.documentRequests.review(requestId, { action: 'REJECTED', reason });
    }
  },

  // Appointments & Mentoring Meetings Scheduling
  meetings: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/meetings`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getById: async (id) => {
      const res = await fetch(`${API_BASE}/meetings/${id}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    schedule: async (data) => {
      const res = await fetch(`${API_BASE}/meetings`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    create: async (data) => {
      const res = await fetch(`${API_BASE}/meetings`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/meetings/${id}`, {
        ...defaultFetchOptions,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    cancel: async (id) => {
      const res = await fetch(`${API_BASE}/meetings/${id}/cancel`, {
        ...defaultFetchOptions,
        method: 'POST'
      });
      return handleResponse(res);
    },

    complete: async (id, data) => {
      const res = await fetch(`${API_BASE}/meetings/${id}/complete`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  // Students & Profile
  students: {
    getDashboardSummary: async (studentId = '') => {
      const query = studentId ? `?studentId=${studentId}` : '';
      const res = await fetch(`${API_BASE}/students/dashboard-summary${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getMyProfile: async () => {
      const res = await fetch(`${API_BASE}/students/profile/me`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/students`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    getById: async (id) => {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  },

  // Mentor profiles (for HOD/Admin 360° view of a specific mentor) & assigned mentees
  mentors: {
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/mentors/${id}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },
    getMentees: async () => {
      const res = await fetch(`${API_BASE}/mentor/mentees`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  },

  mentor: {
    getMentees: async () => {
      const res = await fetch(`${API_BASE}/mentor/mentees`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  },

  // Academic Course Assignments
  assignments: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/assignments?${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    create: async (data) => {
      const res = await fetch(`${API_BASE}/assignments`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        ...defaultFetchOptions,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/notifications`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    markRead: async (id) => {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        ...defaultFetchOptions,
        method: 'PATCH'
      });
      return handleResponse(res);
    },

    markAllRead: async () => {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        ...defaultFetchOptions,
        method: 'POST'
      });
      return handleResponse(res);
    }
  },

  // Tasks
  tasks: {
    create: async (data) => {
      const res = await fetch(`${API_BASE}/tasks`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        ...defaultFetchOptions,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  // Projects & Certifications & Notes
  projects: {
    create: async (data) => {
      const res = await fetch(`${API_BASE}/projects`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    delete: async (id) => {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        ...defaultFetchOptions,
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  certifications: {
    create: async (data) => {
      const res = await fetch(`${API_BASE}/certifications`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  notes: {
    create: async (data) => {
      const res = await fetch(`${API_BASE}/mentor-notes`, {
        ...defaultFetchOptions,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  // Admin & Users
  users: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/users?${query}`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    delete: async (id) => {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        ...defaultFetchOptions,
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // Mentor-specific endpoints (for fetching assigned mentees, etc.)
  mentor: {
    // Returns the mentor's currently assigned mentees as StudentProfile objects
    // (populated with user, same shape as api.students.getAll for MENTOR role).
    getMentees: async () => {
      const res = await fetch(`${API_BASE}/students`, {
        ...defaultFetchOptions
      });
      const data = await handleResponse(res);
      // Normalize: return { success, mentees } alongside the raw students array
      return { ...data, mentees: data.students || [] };
    }
  },

  analytics: {
    getAdmin: async () => {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    },

    // HOD department analytics
    getHOD: async () => {
      const res = await fetch(`${API_BASE}/hod/analytics`, {
        ...defaultFetchOptions
      });
      return handleResponse(res);
    }
  }
};
