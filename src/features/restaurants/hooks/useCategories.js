import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCategories = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await userClient.get("/categories/all");
            setCategories(data.categories || []);
        } catch {
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getCategories();
        }, [getCategories])
    );

    return { categories, loading };
};
