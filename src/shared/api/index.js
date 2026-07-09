import userClient from "./userClient";

export const getProfile = (id) => userClient.get(`/users/${id}`);
export const updateProfile = (id, data) => userClient.put(`/users/${id}`, data);

export const uploadProfilePhoto = (formData) =>
    userClient.put("/users/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteProfilePhoto = () => userClient.delete("/users/profile/photo");

export const syncUser = () => userClient.post("/users/sync");
export const getMe = () => userClient.get("/users/me");

export const getFavorites = () => userClient.get("/users/favorites/list");
export const toggleFavorite = (id_restaurante) =>
    userClient.post("/users/favorites/toggle", { id_restaurante });

export const getAddresses = () => userClient.get("/users/addresses/list");
export const addAddress = (data) => userClient.post("/users/addresses/add", data);
export const deleteAddress = (id) => userClient.delete(`/users/addresses/${id}`);

export const validateCoupon = (codigo, monto_total) =>
    userClient.post("/coupons/validate", { codigo, monto_total });

export const getNotifications = (params) => userClient.get("/notifications", { params });
export const getUnreadCount = () => userClient.get("/notifications/unread-count");
export const markNotificationAsRead = (id) => userClient.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => userClient.put("/notifications/read-all");

export { default as authClient } from "./authClient";
export { default as userClient } from "./userClient";
