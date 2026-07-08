import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getFavorites = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/users/favorites/list");
            setFavorites(response.data.favoritos || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener favoritos");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getFavorites();
        }, [getFavorites]),
    );

    const toggleFavorite = useCallback(async (id_restaurante) => {
        const response = await userClient.post("/users/favorites/toggle", { id_restaurante });
        return response.data;
    }, []);

    return { favorites, loading, error, getFavorites, toggleFavorite };
};
