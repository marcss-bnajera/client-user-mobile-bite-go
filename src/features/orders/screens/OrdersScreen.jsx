import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { Armchair, Bike, ShoppingBag, Store } from "lucide-react-native";
import { useOrders } from "../hooks/useOrders.js";
import { LoadingSpinner, EmptyState, Card, StatusBadge } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";

const ServiceIcon = ({ tipo }) => {
    const props = { size: 14, color: BRAND.muted };
    if (tipo === "Domicilio") return <Bike {...props} />;
    if (tipo === "Para llevar") return <ShoppingBag {...props} />;
    if (tipo === "Comer aquí") return <Armchair {...props} />;
    return <Store {...props} />;
};

const OrderCard = ({ item, index }) => (
    <FadeInView delay={index * 60}>
        <Card className="mb-3" style={SHADOWS.card}>
            <View className="flex-row items-center justify-between">
                <Text className="mr-2 flex-1 text-base font-bold text-ink" numberOfLines={1}>
                    {item.id_restaurante?.nombre || "Restaurante"}
                </Text>
                <StatusBadge status={item.estado} />
            </View>
            <View className="mt-2 flex-row items-center">
                <ServiceIcon tipo={item.tipo_servicio} />
                <Text className="ml-1.5 text-sm text-muted">
                    {item.tipo_servicio} · {new Date(item.createdAt).toLocaleDateString("es-GT")}
                </Text>
            </View>
            <View className="mt-3 border-t border-line pt-3">
                <Text className="text-lg font-extrabold text-primary">Q{item.total}</Text>
            </View>
        </Card>
    </FadeInView>
);

const OrdersScreen = ({ navigation }) => {
    const { orders, loading, error, getOrders } = useOrders();
    const onRefresh = useCallback(() => { getOrders(); }, [getOrders]);
    if (loading && !orders.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate("Restaurants")}
                className="mx-4 mt-4 items-center rounded-xl bg-primary py-3"
            >
                <Text className="text-sm font-bold text-white">+ Nuevo Pedido</Text>
            </TouchableOpacity>
            {error && !orders.length ? <EmptyState message={error} /> : (
                <FlatList data={orders} keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => <OrderCard item={item} index={index} />}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    ListEmptyComponent={<EmptyState message="No tienes pedidos aún" />}
                    showsVerticalScrollIndicator={false} />
            )}
        </View>
    );
};

export default OrdersScreen;
