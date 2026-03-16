// src/api/api.js
// Toàn bộ API được gom vào đây để dễ quản lý

import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // backend đã triển khai

// 🟢 Auth APIs
export const login = (role, data) => axios.post(`${API_BASE}/auth/login/${role}`, data);
// role: "expert", "enterprise", "foundation"
// data: { email, password }

export const register = (role, data) => axios.post(`${API_BASE}/auth/register/${role}`, data);
// data: { name, email, password, ... }

// 🟢 Expert/Enterprise APIs
export const findExpert = (query) => axios.get(`${API_BASE}/expert/find`, { params: query });
// query: { name, skill }

export const contactExpert = (id) => axios.post(`${API_BASE}/expert/contact`, { id });
// id: expertId

// 🟢 Foundation APIs
export const createFoundation = (data) => axios.post(`${API_BASE}/foundation/create`, data);
// data: { name, description }

export const createFund = (data) => axios.post(`${API_BASE}/foundation/fund`, data);
// data: { fundName, amount }

export const grantToProject = (data) => axios.post(`${API_BASE}/foundation/grant`, data);
// data: { projectId, fundId }

// 🟢 Account Management APIs
export const updateUsername = (data) => axios.put(`${API_BASE}/account/username`, data);
export const updatePassword = (data) => axios.put(`${API_BASE}/account/password`, data);
export const deleteAccount = () => axios.delete(`${API_BASE}/account/delete`);
