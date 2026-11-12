import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized/token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  },
  register: async (username, password) => {
    const res = await api.post("/auth/register", { username, password });
    return res.data;
  },
};

export const employeeAPI = {
  getAll: async () => {
    const res = await api.get("/employees");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/employee/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/employee", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/employee/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/employee/${id}`);
    return res.data;
  },
};

export default api;

