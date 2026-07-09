import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import userClient from "../../../shared/api/userClient.js";

export const useAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAddresses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/users/addresses/list");
            setAddresses(response.data.direcciones || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener direcciones");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getAddresses();
        }, [getAddresses]),
    );

    const addAddress = useCallback(async (data) => {
        const response = await userClient.post("/users/addresses/add", data);
        setAddresses(response.data.direcciones);
        return response.data;
    }, []);

    const deleteAddress = useCallback(async (id) => {
        const response = await userClient.delete(`/users/addresses/${id}`);
        setAddresses(response.data.direcciones);
        return response.data;
    }, []);

    return { addresses, loading, error, getAddresses, addAddress, deleteAddress };
};
