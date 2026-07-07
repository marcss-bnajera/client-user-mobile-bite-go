import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getReservations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/reservations");
            setReservations(response.data.reservations || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener reservaciones");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getReservations();
        }, [getReservations])
    );

    return { reservations, loading, error, getReservations };
};
