import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/reviewsRatings");
            setReviews(response.data.reviews || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener tus calificaciones");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getReviews();
        }, [getReviews])
    );

    const reviewedOrderIds = useMemo(
        () => new Set(reviews.map((r) => String(r.id_pedido))),
        [reviews]
    );

    const createReview = useCallback(async ({ id_pedido, id_reservacion, id_sucursal, calificacion, comentario }) => {
        const response = await userClient.post("/reviewsRatings", { id_pedido, id_reservacion, id_sucursal, calificacion, comentario });
        await getReviews();
        return response.data;
    }, [getReviews]);

    const getEligible = useCallback(async (id_restaurante, id_sucursal) => {
        const params = {};
        if (id_sucursal) params.id_sucursal = id_sucursal;
        const response = await userClient.get(`/reviewsRatings/eligible/${id_restaurante}`, { params });
        return response.data;
    }, []);

    return { reviews, reviewedOrderIds, loading, error, getReviews, createReview, getEligible };
};
