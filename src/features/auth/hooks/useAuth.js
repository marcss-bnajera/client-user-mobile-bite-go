import { useState } from "react";
import authClient from "../../../shared/api/authClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const payload = {
                EmailOrUsername: (data.emailOrUsername || "").trim(),
                Password: data.password,
            };
            const response = await authClient.post("/login", payload);
            const { accessToken, refreshToken, userDetails, token, user } = response.data;

            const mappedAccessToken = accessToken || token;
            const mappedUser = userDetails || user;

            await login(mappedAccessToken, mappedUser, refreshToken);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al iniciar sesion");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append("Name", data.name);
            formData.append("Surname", data.surname);
            formData.append("Username", data.username);
            formData.append("Email", data.email);
            formData.append("Password", data.password);
            formData.append("Phone", data.phone);

            const response = await authClient.post("/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            try {
                const { default: userClient } = await import("../../../shared/api/userClient.js");
                await userClient.post("/users/sync", {
                    email: data.email,
                    nombre: `${data.name} ${data.surname}`.trim(),
                    username: data.username,
                    telefono: data.phone,
                });
            } catch {
                // MongoDB sync is best-effort
            }

            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al registrarse");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authClient.post("/forgot-password", { email });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al enviar el correo");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (token, newPassword) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authClient.post("/reset-password", { token, newPassword });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error al restablecer la contraseña");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async (email) => {
        try {
            const response = await authClient.post("/resend-verification", { email });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    return { handleLogin, handleRegister, handleForgotPassword, handleResetPassword, handleResendVerification, loading, error, logout };
};
