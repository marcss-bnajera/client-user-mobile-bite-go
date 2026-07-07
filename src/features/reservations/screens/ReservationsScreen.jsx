import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { CalendarDays, Users } from "lucide-react-native";
import { useReservations } from "../hooks/useReservations.js";
import { LoadingSpinner, EmptyState, Card, StatusBadge } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";

const ReservationCard = ({ item, index }) => (
    <FadeInView delay={index * 60}>
        <Card className="mb-3" style={SHADOWS.card}>
            <View className="flex-row items-center justify-between">
                <Text className="mr-2 flex-1 text-base font-bold text-ink" numberOfLines={1}>
                    {item.id_restaurante?.nombre || "Restaurante"}
                </Text>
                <StatusBadge status={item.estado} />
            </View>
            <View className="mt-3 flex-row items-center">
                <View className="flex-row items-center">
                    <CalendarDays size={15} color={BRAND.primary} />
                    <Text className="ml-1.5 text-sm text-muted">{new Date(item.fecha_reserva).toLocaleDateString("es-GT")}</Text>
                </View>
                <View className="ml-4 flex-row items-center">
                    <Users size={15} color={BRAND.primary} />
                    <Text className="ml-1.5 text-sm text-muted">{item.cantidad_personas} personas</Text>
                </View>
            </View>
        </Card>
    </FadeInView>
);

const ReservationsScreen = ({ navigation }) => {
    const { reservations, loading, error, getReservations } = useReservations();
    const onRefresh = useCallback(() => { getReservations(); }, [getReservations]);
    if (loading && !reservations.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <TouchableOpacity
                onPress={() => navigation.navigate("CreateReservation")}
                className="mx-4 mt-4 items-center rounded-xl bg-primary py-3"
            >
                <Text className="text-sm font-bold text-white">+ Nueva Reservación</Text>
            </TouchableOpacity>
            {error && !reservations.length ? <EmptyState message={error} /> : (
                <FlatList data={reservations} keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => <ReservationCard item={item} index={index} />}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    ListEmptyComponent={<EmptyState message="No tienes reservaciones aún" />}
                    showsVerticalScrollIndicator={false} />
            )}
        </View>
    );
};

export default ReservationsScreen;
