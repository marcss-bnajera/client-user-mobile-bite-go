import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/orders/history");
            setOrders(response.data.orders || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener pedidos");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getOrders();
        }, [getOrders])
    );

    return { orders, loading, error, getOrders };
};
