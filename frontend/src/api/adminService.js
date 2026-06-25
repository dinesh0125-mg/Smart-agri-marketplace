import api from "./axios";

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers = async (page = 0, size = 20) => {
  const res = await api.get("/admin/users", { params: { page, size } });
  return res.data;
};

export const blockUser = async (userId) => {
  const res = await api.patch(`/admin/users/${userId}/block`);
  return res.data;
};

export const activateUser = async (userId) => {
  const res = await api.patch(`/admin/users/${userId}/activate`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

// ── Farmers ──────────────────────────────────────────────────────────────────
export const getFarmers = async (page = 0, size = 20) => {
  const res = await api.get("/admin/farmers", { params: { page, size } });
  return res.data;
};

export const getPendingFarmers = async () => {
  const res = await api.get("/admin/farmers/pending");
  return res.data;
};

export const approveFarmer = async (farmerId) => {
  const res = await api.patch(`/admin/farmers/${farmerId}/approve`);
  return res.data;
};

export const rejectFarmer = async (farmerId) => {
  const res = await api.patch(`/admin/farmers/${farmerId}/reject`);
  return res.data;
};

// ── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = async (page = 0, size = 20) => {
  const res = await api.get("/admin/orders", { params: { page, size } });
  return res.data;
};

export const getOrder = async (orderId) => {
  const res = await api.get(`/admin/orders/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const res = await api.patch(`/admin/orders/${orderId}/status`, { orderStatus });
  return res.data;
};

// ── Products (admin) ─────────────────────────────────────────────────────────
export const getAdminProducts = async (page = 0, size = 20) => {
  const res = await api.get("/admin/products", { params: { page, size } });
  return res.data;
};

export const deleteAdminProduct = async (productId) => {
  const res = await api.delete(`/admin/products/${productId}`);
  return res.data;
};

// ── Market Prices ────────────────────────────────────────────────────────────
export const getMarketPrices = async () => {
  const res = await api.get("/market-prices");
  return res.data;
};

export const createMarketPrice = async (data) => {
  const res = await api.post("/market-prices", data);
  return res.data;
};

export const updateMarketPrice = async (id, data) => {
  const res = await api.put(`/market-prices/${id}`, data);
  return res.data;
};

export const deleteMarketPrice = async (id) => {
  const res = await api.delete(`/market-prices/${id}`);
  return res.data;
};

// ── Contact Messages ─────────────────────────────────────────────────────────
export const getContactMessages = async () => {
  const res = await api.get("/admin/contact-messages");
  return res.data;
};
