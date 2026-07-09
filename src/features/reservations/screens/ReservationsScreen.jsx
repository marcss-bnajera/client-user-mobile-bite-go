import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, Clock, Users, Plus, XCircle, Star } from "lucide-react-native";
import { useReservations } from "../hooks/useReservations.js";
import { LoadingSpinner, EmptyState, Card, StatusBadge } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import userClient from "../../../shared/api/userClient.js";

const ReservationCard = ({ item, index, onCancel, onRate }) => {
    const date = new Date(item.fecha_reserva);
    const timeStr = date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
    const dateStr = date.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });

    return (
        <FadeInView delay={index * 60}>
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
                <View className="mt-3 gap-2">
                    <View className="flex-row items-center">
                        <CalendarDays size={14} color={BRAND.primary} />
                        <Text className="ml-2 text-sm text-muted">{dateStr}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock size={14} color={BRAND.primary} />
                        <Text className="ml-2 text-sm text-muted">{timeStr}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Users size={14} color={BRAND.primary} />
                        <Text className="ml-2 text-sm text-muted">{item.cantidad_personas} personas</Text>
                    </View>
                </View>
                {item.estado === "Confirmada" && (
                    <TouchableOpacity onPress={() => onCancel(item._id)} className="mt-3 flex-row items-center justify-center rounded-xl border border-danger/30 py-2.5">
                        <XCircle size={14} color={BRAND.danger} />
                        <Text className="ml-1.5 text-xs font-bold text-danger">Cancelar reservacion</Text>
                    </TouchableOpacity>
                )}
                {item.estado === "Atendida" && (
                    <TouchableOpacity onPress={() => onRate(item)} className="mt-3 flex-row items-center justify-center rounded-xl border border-primary/30 py-2.5">
                        <Star size={14} color={BRAND.primary} />
                        <Text className="ml-1.5 text-xs font-bold text-primary">Calificar experiencia</Text>
                    </TouchableOpacity>
                )}
            </Card>
        </FadeInView>
    );
};

const ReservationsScreen = ({ navigation }) => {
    const { reservations, loading, error, getReservations } = useReservations();
    const { confirm, show } = useAlert();
    const onRefresh = useCallback(() => { getReservations(); }, [getReservations]);

    const handleCancel = (id) => {
        confirm({
            title: "Cancelar Reservacion",
            message: "¿Estas seguro de que deseas cancelar esta reservacion?",
            confirmText: "Cancelar reservacion",
            onConfirm: async () => {
                try {
                    await userClient.delete(`/reservations/${id}`);
                    show({ type: "success", title: "Reservacion cancelada", message: "Tu reservacion ha sido cancelada" });
                    getReservations();
                } catch (err) {
                    show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo cancelar la reservacion" });
                }
            },
        });
    };

    if (loading && !reservations.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <FlatList
                data={reservations}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                    <ReservationCard
                        item={item}
                        index={index}
                        onCancel={handleCancel}
                        onRate={(r) => navigation.navigate("CreateReview", {
                            id_reservacion: r._id,
                            id_restaurante: r.id_restaurante?._id || r.id_restaurante,
                            restaurantName: r.id_restaurante?.nombre || "Restaurante",
                            id_sucursal: r.id_sucursal || "",
                        })}
                    />
                )}
                ListHeaderComponent={
                    <TouchableOpacity
                        onPress={() => navigation.navigate("CreateReservation")}
                        activeOpacity={0.8}
                        style={{ marginBottom: 14 }}
                    >
                        <LinearGradient colors={["#E67E22", "#D35400"]} style={{ borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 8 }}>
                            <Plus size={18} color="#fff" />
                            <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Nueva Reservacion</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                }
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes reservaciones aun" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default ReservationsScreen;
