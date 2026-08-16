const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const TOKEN_KEY = "ggss_access_token";
const USER_KEY = "ggss_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(accessToken, user) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function dashboardPathForRole(role) {
  const key = String(role || "").toLowerCase();
  if (key === "admin") return "/admin";
  if (key === "instructor") return "/instructor";
  return "/student";
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  const body = await parseJson(response);
  if (!response.ok) {
    clearSession();
    throw new Error(body?.message || "Session expired");
  }

  const token = body?.data?.accessToken;
  if (!token) {
    clearSession();
    throw new Error("Session expired");
  }

  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    headers = {},
    retry = true
  } = options;

  const finalHeaders = { ...headers };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body)
  });

  if (response.status === 401 && auth && retry) {
    await refreshAccessToken();
    return apiRequest(path, { ...options, retry: false });
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error?.message ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

/* ---------- Auth ---------- */
export async function loginRequest(identifier, password) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { username: identifier, password }
  });
  const { accessToken, user } = payload.data;
  setSession(accessToken, user);
  return { accessToken, user };
}

export async function registerRequest(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: data
  });
}

export async function logoutRequest() {
  try {
    await apiRequest("/auth/logout", { method: "POST", auth: false });
  } finally {
    clearSession();
  }
}

export async function fetchCurrentUser() {
  const payload = await apiRequest("/auth/me");
  const user = payload.data.user;
  setSession(getStoredToken(), user);
  return user;
}

/* ---------- Users (admin) ---------- */
export const usersApi = {
  list: () => apiRequest("/users"),
  get: (id) => apiRequest(`/users/${id}`),
  createStudent: (body) =>
    apiRequest("/users/students", { method: "POST", body }),
  createInstructor: (body) =>
    apiRequest("/users/instructors", { method: "POST", body }),
  createAdmin: (body) =>
    apiRequest("/users/admins", { method: "POST", body }),
  updateRole: (id, role) =>
    apiRequest(`/users/${id}/role`, { method: "PATCH", body: { role } }),
  updateStatus: (id, status) =>
    apiRequest(`/users/${id}/status`, {
      method: "PATCH",
      body: { status }
    }),
  remove: (id) => apiRequest(`/users/${id}`, { method: "DELETE" })
};

/* ---------- Curriculum ---------- */
export const curriculumApi = {
  grades: () => apiRequest("/curriculum/grades"),
  createGrade: (body) =>
    apiRequest("/curriculum/grades", { method: "POST", body }),
  classLevels: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/curriculum/class-levels${q ? `?${q}` : ""}`);
  },
  createClassLevel: (body) =>
    apiRequest("/curriculum/class-levels", { method: "POST", body }),
  subjects: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/curriculum/subjects${q ? `?${q}` : ""}`);
  },
  createSubject: (body) =>
    apiRequest("/curriculum/subjects", { method: "POST", body }),
  units: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/curriculum/units${q ? `?${q}` : ""}`);
  },
  createUnit: (body) =>
    apiRequest("/curriculum/units", { method: "POST", body })
};

/* ---------- Study materials ---------- */
export const materialsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/study-material${q ? `?${q}` : ""}`);
  },
  get: (id) => apiRequest(`/study-material/${id}`),
  create: (body) =>
    apiRequest("/study-material", { method: "POST", body }),
  update: (id, body) =>
    apiRequest(`/study-material/${id}`, { method: "PATCH", body }),
  publish: (id) =>
    apiRequest(`/study-material/${id}/publish`, { method: "POST" }),
  archive: (id) =>
    apiRequest(`/study-material/${id}/archive`, { method: "POST" }),
  remove: (id) =>
    apiRequest(`/study-material/${id}`, { method: "DELETE" })
};

/* ---------- Exams ---------- */
export const examsApi = {
  listInstructor: () => apiRequest("/exams"),
  get: (id) => apiRequest(`/exams/${id}`),
  create: (body) => apiRequest("/exams", { method: "POST", body }),
  update: (id, body) =>
    apiRequest(`/exams/${id}`, { method: "PATCH", body }),
  remove: (id) => apiRequest(`/exams/${id}`, { method: "DELETE" }),
  publish: (id, message) =>
    apiRequest(`/exams/${id}/publish`, {
      method: "POST",
      body: message ? { message } : {}
    }),
  approve: (id, message) =>
    apiRequest(`/exams/${id}/approve`, {
      method: "POST",
      body: message ? { message } : {}
    }),
  reject: (id, message) =>
    apiRequest(`/exams/${id}/reject`, {
      method: "POST",
      body: message ? { message } : {}
    }),
  approvalQueue: () => apiRequest("/exams/approval-queue"),
  schedule: (id, body) =>
    apiRequest(`/exams/${id}/schedule`, { method: "PATCH", body }),
  lockSchedule: (id) =>
    apiRequest(`/exams/${id}/lock`, { method: "POST" }),
  release: (id) => apiRequest(`/exams/${id}/release`, { method: "POST" }),
  revoke: (id) => apiRequest(`/exams/${id}/revoke`, { method: "POST" }),
  publishResults: (id) =>
    apiRequest(`/exams/${id}/publish-results`, { method: "POST" }),

  questions: (examId) => apiRequest(`/exams/${examId}/questions`),
  addQuestion: (examId, body) =>
    apiRequest(`/exams/${examId}/questions`, { method: "POST", body }),
  updateQuestion: (examId, questionId, body) =>
    apiRequest(`/exams/${examId}/questions/${questionId}`, {
      method: "PATCH",
      body
    }),
  deleteQuestion: (examId, questionId) =>
    apiRequest(`/exams/${examId}/questions/${questionId}`, {
      method: "DELETE"
    }),

  studentAvailable: () => apiRequest("/exams/student/available"),
  studentUpcoming: () => apiRequest("/exams/student/upcoming"),
  studentPast: () => apiRequest("/exams/student/past"),
  studentList: () => apiRequest("/student/exams"),
  studentExam: (id) => apiRequest(`/student/exams/${id}`),
  studentQuestions: (id) => apiRequest(`/student/exams/${id}/questions`),
  canAttempt: (id) => apiRequest(`/student/exams/${id}/can-attempt`),

  startAttempt: (id) =>
    apiRequest(`/exams/${id}/attempts/start`, { method: "POST" }),
  getAttempt: (id) => apiRequest(`/exams/${id}/attempts`),
  saveAnswers: (id, answers) =>
    apiRequest(`/exams/${id}/attempts`, {
      method: "PATCH",
      body: { answers }
    }),
  submitAttempt: (id) =>
    apiRequest(`/exams/${id}/attempts/submit`, { method: "POST" })
};

/* ---------- Classes ---------- */
export const classesApi = {
  roster: (classLevelId) =>
    apiRequest(`/classes/${classLevelId}/roster`),
  instructors: (classLevelId) =>
    apiRequest(`/classes/${classLevelId}/instructors`),
  summary: (classLevelId) =>
    apiRequest(`/classes/${classLevelId}/summary`),
  instructorClasses: (instructorId) =>
    apiRequest(`/classes/instructor/${instructorId}/classes`),
  assignInstructor: (instructorId, body) =>
    apiRequest(`/classes/instructor/${instructorId}/classes`, {
      method: "POST",
      body
    }),
  revokeAssignment: (assignmentId) =>
    apiRequest(`/classes/assignment/${assignmentId}`, {
      method: "DELETE"
    }),
  enrollStudent: (studentId, body) =>
    apiRequest(`/classes/student/${studentId}/enroll`, {
      method: "POST",
      body
    }),
  removeStudent: (studentId) =>
    apiRequest(`/classes/student/${studentId}/class`, {
      method: "DELETE"
    })
};

/* ---------- Attendance ---------- */
export const attendanceApi = {
  mark: (body) =>
    apiRequest("/attendance/mark", { method: "POST", body }),
  bulk: (body) =>
    apiRequest("/attendance/bulk", { method: "POST", body }),
  student: (studentId) =>
    apiRequest(`/attendance/student/${studentId}`),
  studentStats: (studentId) =>
    apiRequest(`/attendance/student/${studentId}/stats`),
  classDay: (classLevelId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(
      `/attendance/class/${classLevelId}${q ? `?${q}` : ""}`
    );
  },
  sheet: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/attendance/sheet${q ? `?${q}` : ""}`);
  },
  report: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/attendance/report${q ? `?${q}` : ""}`);
  }
};

/* ---------- Notifications ---------- */
export const notificationsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${q ? `?${q}` : ""}`);
  },
  unreadCount: () => apiRequest("/notifications/unread/count"),
  markRead: (id) =>
    apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiRequest("/notifications/mark-all-read", { method: "PATCH" }),
  broadcast: (body) =>
    apiRequest("/notifications/broadcast", { method: "POST", body }),
  create: (body) =>
    apiRequest("/notifications", { method: "POST", body })
};

export function unwrapList(payload, keys = []) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  return [];
}
