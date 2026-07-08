import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchTimer = useRef(null);
    const searchAbort = useRef(null);

    const getRestaurants = useCallback(async ({ categoria } = {}) => {
        try {
            setLoading(true);
            setError(null);
            const params = { limit: 100 };
            if (categoria) params.categoria = categoria;
            const response = await userClient.get("/restaurants", { params });
            const list = response.data.restaurants || [];
            setRestaurants(list);
            if (!categoria) {
                setAllRestaurants(list);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener restaurantes");
        } finally {
            setLoading(false);
        }
    }, []);

    const searchRestaurants = useCallback((search) => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (searchAbort.current) searchAbort.current.abort();
        if (!search || !search.trim()) {
            setRestaurants(allRestaurants);
            return;
        }
        searchTimer.current = setTimeout(async () => {
            const controller = new AbortController();
            searchAbort.current = controller;
            try {
                const params = { limit: 100, search: search.trim() };
                const response = await userClient.get("/restaurants", { params, signal: controller.signal });
                setRestaurants(response.data.restaurants || []);
            } catch (e) {
                if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {}
            }
        }, 350);
    }, [allRestaurants]);

    useFocusEffect(
        useCallback(() => {
            getRestaurants();
        }, [getRestaurants])
    );

    return { restaurants, allRestaurants, loading, error, getRestaurants, searchRestaurants };
};
