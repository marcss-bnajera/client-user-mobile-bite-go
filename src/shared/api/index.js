import userClient from "./userClient";

export const getProfile = (id) => userClient.get(`/users/${id}`);
export const updateProfile = (id, data) => userClient.put(`/users/${id}`, data);

export { default as authClient } from "./authClient";
export { default as userClient } from "./userClient";
