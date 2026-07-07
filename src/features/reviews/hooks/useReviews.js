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

    const createReview = useCallback(async ({ id_pedido, calificacion, comentario }) => {
        const response = await userClient.post("/reviewsRatings", { id_pedido, calificacion, comentario });
        await getReviews();
        return response.data;
    }, [getReviews]);

    return { reviews, reviewedOrderIds, loading, error, getReviews, createReview };
};
