import { useCallback, useRef, useEffect } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Armchair, Bike, ShoppingBag, Store, Star, Plus, XCircle, ChevronRight } from "lucide-react-native";
import { useOrders } from "../hooks/useOrders.js";
import { useReviews } from "../../reviews/hooks/useReviews.js";
import { LoadingSpinner, EmptyState, Card, StatusBadge } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import userClient from "../../../shared/api/userClient.js";

const POLL_INTERVAL = 10000;

const ServiceIcon = ({ tipo }) => {
    const props = { size: 14, color: BRAND.muted };
    if (tipo === "Domicilio") return <Bike {...props} />;
    if (tipo === "Para llevar") return <ShoppingBag {...props} />;
    if (tipo === "Comer aquí") return <Armchair {...props} />;
    return <Store {...props} />;
};

const OrderCard = ({ item, index, reviewed, onRate, onPress, onCancel }) => (
    <FadeInView delay={index * 60}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card className="mb-3" style={SHADOWS.card}>
                <View className="flex-row items-center justify-between">
                    <Text className="mr-2 flex-1 text-base font-bold text-ink" numberOfLines={1}>
                        {item.id_restaurante?.nombre || "Restaurante"}
                    </Text>
                    <StatusBadge status={item.estado} />
                </View>
                {item.id_sucursal && (
                    <Text className="mt-1 text-xs font-semibold text-primary">Sucursal</Text>
                )}
                <View className="mt-2 flex-row items-center">
                    <ServiceIcon tipo={item.tipo_servicio} />
                    <Text className="ml-1.5 text-sm text-muted">
                        {item.tipo_servicio} · {new Date(item.createdAt).toLocaleDateString("es-GT")}
                    </Text>
                </View>

                <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3">
                    <Text className="text-lg font-extrabold text-primary">Q{item.total}</Text>
                    <View className="flex-row items-center gap-2">
                        {item.estado === "Pendiente" && (
                            <TouchableOpacity onPress={onCancel} className="flex-row items-center rounded-full bg-danger/10 px-3 py-1.5">
                                <XCircle size={14} color={BRAND.danger} />
                                <Text className="ml-1 text-xs font-bold text-danger">Cancelar</Text>
                            </TouchableOpacity>
                        )}
                        {item.estado === "Entregado" && (
                            reviewed ? (
                                <View className="flex-row items-center">
                                    <Star size={16} color={BRAND.primary} fill={BRAND.primary} />
                                    <Text className="ml-1 text-xs font-semibold text-muted">Calificado</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={onRate}
                                    className="flex-row items-center rounded-full bg-primary/10 px-3 py-1.5"
                                >
                                    <Star size={14} color={BRAND.primary} />
                                    <Text className="ml-1 text-xs font-bold text-primary">Calificar</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
                <View className="mt-2 flex-row items-center justify-center gap-1">
                    <Text className="text-xs text-muted">Ver detalle</Text>
                    <ChevronRight size={12} color={BRAND.muted} />
                </View>
            </Card>
        </TouchableOpacity>
    </FadeInView>
);

const OrdersScreen = ({ navigation }) => {
    const { orders, loading, error, getOrders } = useOrders();
    const { reviewedOrderIds } = useReviews();
    const { confirm, show } = useAlert();
    const pollRef = useRef(null);
    const ordersRef = useRef(orders);
    ordersRef.current = orders;

    useEffect(() => {
        pollRef.current = setInterval(() => {
            userClient.get("/orders/history").then((res) => {
                const data = res.data.orders || [];
                const prev = ordersRef.current.map((o) => o.estado);
                const next = data.map((o) => o.estado);
                if (JSON.stringify(prev) !== JSON.stringify(next)) {
                    getOrders();
                }
            }).catch(() => {});
        }, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [getOrders]);

    const onRefresh = useCallback(() => { getOrders(); }, [getOrders]);

    const handleCancel = (orderId) => {
        confirm({
            title: "Cancelar Pedido",
            message: "¿Estas seguro de que deseas cancelar este pedido?",
            confirmText: "Cancelar pedido",
            onConfirm: async () => {
                try {
                    await userClient.delete(`/orders/${orderId}`);
                    show({ type: "success", title: "Pedido cancelado", message: "Tu pedido ha sido cancelado" });
                    getOrders();
                } catch (err) {
                    show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo cancelar el pedido" });
                }
            },
        });
    };

    if (loading && !orders.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                    <OrderCard
                        item={item}
                        index={index}
                        reviewed={reviewedOrderIds.has(String(item._id))}
                        onRate={() => navigation.navigate("CreateReview", {
                            id_pedido: item._id,
                            id_restaurante: item.id_restaurante?._id,
                            restaurantName: item.id_restaurante?.nombre,
                            id_sucursal: item.id_sucursal || "",
                        })}
                        onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
                        onCancel={() => handleCancel(item._id)}
                    />
                )}
                ListHeaderComponent={
                    <TouchableOpacity
                        onPress={() => {
                            const parent = navigation.getParent();
                            if (parent) {
                                parent.navigate("Restaurants", { screen: "RestaurantsList" });
                            }
                        }}
                        activeOpacity={0.8}
                        style={{ marginBottom: 14 }}
                    >
                        <LinearGradient colors={["#E67E22", "#D35400"]} style={{ borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 }}>
                            <Plus size={18} color="#fff" />
                            <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Nuevo Pedido</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                }
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes pedidos aun" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default OrdersScreen;
