import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getRestaurants = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/restaurants");
            setRestaurants(response.data.restaurants || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener restaurantes");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getRestaurants();
        }, [getRestaurants])
    );

    return { restaurants, loading, error, getRestaurants };
};
