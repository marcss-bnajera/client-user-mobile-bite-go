import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Check, RotateCcw, Star } from "lucide-react-native";
import { COLORS } from "../../../shared/constants/theme";
import { Card, LoadingSpinner } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { BRAND, SHADOWS, STATUS_HEX } from "../../../shared/constants/tokens";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";

const ORDER_STEPS = ["Pendiente", "Preparacion", "Listo", "Servido", "Entregado"];

const OrderDetailScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const { confirm, show } = useAlert();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrder = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [orderRes, itemsRes] = await Promise.all([
                userClient.get(`/orders/${orderId}`),
                userClient.get(`/items/${orderId}`),
            ]);
            setOrder(orderRes.data.order || null);
            setItems(itemsRes.data.items || itemsRes.data || []);
        } catch {
            // silencioso en polling
        } finally {
            if (!silent) setLoading(false);
        }
    }, [orderId]);

    useEffect(() => { fetchOrder(false); }, [fetchOrder]);

    useEffect(() => {
        const interval = setInterval(() => fetchOrder(true), 8000);
        return () => clearInterval(interval);
    }, [fetchOrder]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchOrder(true);
        setRefreshing(false);
    }, [fetchOrder]);

    const getStepIndex = (estado) => {
        if (estado === "Cancelado") return -1;
        return ORDER_STEPS.indexOf(estado);
    };

    const currentStep = order ? getStepIndex(order.estado) : -1;

    const handleRepeat = () => {
        const preloadedItems = items.map((item) => ({
            id_producto: item.id_producto?._id || item.id_producto,
            nombre: item.nombre_historico || item.id_producto?.nombre || "Producto",
            precio: item.precio_historico || item.precio || 0,
            cantidad: item.cantidad || 1,
            notas: item.notas || "",
        }));
        const parent = navigation.getParent();
        if (parent) {
            parent.navigate("Restaurants", {
                screen: "CreateOrder",
                params: {
                    restaurant: order.id_restaurante,
                    preloadedItems,
                    id_sucursal: order.id_sucursal,
                },
            });
        }
    };

    const handleCancel = () => {
        confirm({
            title: "Cancelar Pedido",
            message: "¿Estas seguro de que deseas cancelar este pedido?",
            confirmText: "Cancelar pedido",
            onConfirm: async () => {
                try {
                    await userClient.delete(`/orders/${orderId}`);
                    show({ type: "success", title: "Pedido cancelado", message: "Tu pedido ha sido cancelado" });
                    fetchOrder(true);
                } catch (err) {
                    show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo cancelar el pedido" });
                }
            },
        });
    };

    if (loading) return <LoadingSpinner />;

    if (!order) {
        return (
            <View className="flex-1 items-center justify-center bg-canvas">
                <Text className="text-muted">Pedido no encontrado</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-canvas"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />}
        >
            <View className="px-4 pt-4">
                <Card style={SHADOWS.card}>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-extrabold text-ink">
                            Pedido #{order._id.slice(-6).toUpperCase()}
                        </Text>
                        <View className="rounded-full px-3 py-1" style={{ backgroundColor: STATUS_HEX[order.estado] || "#D6D6D6" }}>
                            <Text className="text-[11px] font-bold text-[#33383F]">{order.estado}</Text>
                        </View>
                    </View>

                    <Text className="mt-1 text-sm text-muted">
                        {order.id_restaurante?.nombre || "Restaurante"}
                    </Text>
                    <Text className="text-xs text-faint">
                        {order.tipo_servicio} • {new Date(order.createdAt).toLocaleDateString("es-GT")} {new Date(order.createdAt).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                    </Text>

                    {order.estado !== "Cancelado" && (
                        <View className="mt-5">
                            <View className="flex-row items-start justify-between">
                                {ORDER_STEPS.map((step, idx) => {
                                    const isActive = idx <= currentStep;
                                    return (
                                        <View key={step} style={{ flex: 1, alignItems: "center" }}>
                                            <View className={`h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-success" : "bg-line"}`}>
                                                {isActive ? (
                                                    <Check size={14} color="#fff" />
                                                ) : (
                                                    <Text className="text-xs font-bold text-muted">{idx + 1}</Text>
                                                )}
                                            </View>
                                            <Text style={{ fontSize: 10, color: isActive ? BRAND.ink : BRAND.faint, fontWeight: isActive ? "700" : "500", marginTop: 4, textAlign: "center" }}>
                                                {step}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </Card>

                <Card className="mt-3" style={SHADOWS.card}>
                    <Text className="mb-3 text-sm font-bold text-ink">Resumen</Text>
                    {items.map((item, idx) => (
                        <View key={idx} className="mb-2 flex-row justify-between border-b border-line pb-2">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-ink">
                                    {item.cantidad}x {item.nombre_historico || item.id_producto?.nombre || "Producto"}
                                </Text>
                                {item.notas ? <Text className="text-xs text-muted">{item.notas}</Text> : null}
                            </View>
                            <Text className="text-sm font-bold text-primary">Q{(item.precio_historico || item.precio || 0) * item.cantidad}</Text>
                        </View>
                    ))}

                    <View className="mt-2 flex-row justify-between">
                        <Text className="text-sm text-muted">Subtotal</Text>
                        <Text className="text-sm font-semibold text-ink">Q{order.total - (order.propina || 0) + (order.descuento_cupon || 0)}</Text>
                    </View>
                    {order.propina > 0 && (
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-muted">Propina</Text>
                            <Text className="text-sm font-semibold text-ink">Q{order.propina}</Text>
                        </View>
                    )}
                    {order.descuento_cupon > 0 && (
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-muted">Descuento</Text>
                            <Text className="text-sm font-semibold text-success">-Q{order.descuento_cupon}</Text>
                        </View>
                    )}
                    <View className="mt-2 flex-row justify-between border-t border-line pt-2">
                        <Text className="text-base font-extrabold text-ink">Total</Text>
                        <Text className="text-base font-extrabold text-primary">Q{order.total}</Text>
                    </View>
                </Card>

                {order.notas ? (
                    <Card className="mt-3" style={SHADOWS.card}>
                        <Text className="mb-1 text-sm font-bold text-ink">Notas</Text>
                        <Text className="text-sm text-muted">{order.notas}</Text>
                    </Card>
                ) : null}

                <View className="mb-8 mt-4 flex-row gap-3">
                    {order.estado === "Pendiente" && (
                        <View className="flex-1">
                            <Button
                                title="Cancelar pedido"
                                onPress={handleCancel}
                                variant="danger"
                            />
                        </View>
                    )}
                    {order.estado === "Entregado" && (
                        <>
                            <View className="flex-1">
                                <Button
                                    title="Repetir pedido"
                                    onPress={handleRepeat}
                                    icon={<RotateCcw size={16} color="#fff" />}
                                />
                            </View>
                            <View className="flex-1">
                                <Button
                                    title="Calificar"
                                    onPress={() => navigation.navigate("CreateReview", {
                                        id_pedido: order._id,
                                        id_restaurante: order.id_restaurante?._id || order.id_restaurante,
                                        restaurantName: order.id_restaurante?.nombre || "Restaurante",
                                        id_sucursal: order.id_sucursal || "",
                                    })}
                                    icon={<Star size={16} color="#fff" />}
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default OrderDetailScreen;
