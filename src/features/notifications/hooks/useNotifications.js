import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const getNotifications = useCallback(async (p = 1, silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const response = await userClient.get("/notifications", { params: { page: p, limit: 20 } });
            setNotifications(response.data.notifications || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            if (!silent) setError(err.response?.data?.message || "Error al obtener notificaciones");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getNotifications(page);
        }, [getNotifications, page]),
    );

    const markAsRead = useCallback(async (id) => {
        await userClient.put(`/notifications/${id}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, leido: true } : n)));
    }, []);

    const markAllRead = useCallback(async () => {
        await userClient.put("/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
    }, []);

    return { notifications, loading, error, page, totalPages, setPage, getNotifications, markAsRead, markAllRead };
};
