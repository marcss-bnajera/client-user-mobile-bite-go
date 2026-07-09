import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Bell, Check, CheckCheck, ShoppingBag, CalendarDays, Megaphone, Info } from "lucide-react-native";
import { useNotifications } from "../hooks/useNotifications.js";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";

const tipoConfig = {
    pedido: { icon: ShoppingBag, color: BRAND.primary, bg: "bg-primary/10" },
    reservacion: { icon: CalendarDays, color: "#3B82F6", bg: "bg-blue-50" },
    promocion: { icon: Megaphone, color: "#10B981", bg: "bg-green-50" },
    sistema: { icon: Info, color: BRAND.muted, bg: "bg-gray-100" },
};

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days}d`;
};

const NotificationsScreen = ({ navigation }) => {
    const { notifications, loading, page, totalPages, setPage, getNotifications, markAsRead, markAllRead } = useNotifications();
    const onRefresh = useCallback(() => { getNotifications(page); }, [getNotifications, page]);

    const handlePress = async (notif) => {
        if (!notif.leido) {
            try { await markAsRead(notif._id); } catch {}
        }
        if (notif.id_pedido) {
            navigation.navigate("Orders", {
                screen: "OrdersList",
                params: { highlight: notif.id_pedido },
            });
        } else if (notif.tipo === "reservacion") {
            navigation.navigate("Reservations", {
                screen: "ReservationsList",
            });
        }
    };

    if (loading && !notifications.length) return <LoadingSpinner />;

    const hasUnread = notifications.some((n) => !n.leido);

    return (
        <View className="flex-1 bg-canvas">
            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    const config = tipoConfig[item.tipo] || tipoConfig.sistema;
                    const Icon = config.icon;
                    return (
                        <FadeInView>
                            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
                                <Card
                                    className="mx-4 mt-2 flex-row"
                                    style={[SHADOWS.card, !item.leido && { borderColor: BRAND.primary + "40", borderWidth: 1.5 }]}
                                >
                                    <View className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                                        <Icon size={18} color={config.color} />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <View className="flex-row items-center gap-2">
                                            <Text className={`text-sm font-bold ${!item.leido ? "text-ink" : "text-muted"}`} numberOfLines={1}>
                                                {item.titulo}
                                            </Text>
                                            {!item.leido && <View className="h-2 w-2 rounded-full bg-primary" />}
                                        </View>
                                        <Text className="mt-0.5 text-xs text-muted" numberOfLines={2}>{item.mensaje}</Text>
                                        <Text className="mt-1 text-[10px] text-faint">{timeAgo(item.createdAt)}</Text>
                                    </View>
                                    {item.leido && (
                                        <View className="shrink-0 items-center justify-center" style={{ paddingLeft: 8 }}>
                                            <Check size={14} color="#10B981" />
                                        </View>
                                    )}
                                </Card>
                            </TouchableOpacity>
                        </FadeInView>
                    );
                }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />
                }
                contentContainerStyle={{ paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes notificaciones" />}
                ListHeaderComponent={
                    hasUnread ? (
                        <View style={{ alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                            <TouchableOpacity onPress={async () => { try { await markAllRead(); } catch {} }} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: BRAND.primary + "10" }}>
                                <CheckCheck size={14} color={BRAND.primary} />
                                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: BRAND.primary }}>Marcar todo como leido</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    totalPages > 1 ? (
                        <View className="flex-row items-center justify-center gap-4 py-4">
                            <TouchableOpacity
                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-line px-4 py-2"
                            >
                                <Text className={`text-xs font-semibold ${page === 1 ? "text-faint" : "text-muted"}`}>Anterior</Text>
                            </TouchableOpacity>
                            <Text className="text-xs font-semibold text-muted">{page} / {totalPages}</Text>
                            <TouchableOpacity
                                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-line px-4 py-2"
                            >
                                <Text className={`text-xs font-semibold ${page === totalPages ? "text-faint" : "text-muted"}`}>Siguiente</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default NotificationsScreen;
