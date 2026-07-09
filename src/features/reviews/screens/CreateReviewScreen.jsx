import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Star, ShoppingCart, Calendar, CheckCircle } from "lucide-react-native";
import Button from "../../../shared/components/Button.jsx";
import { BRAND } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { useReviews } from "../hooks/useReviews.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";

const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" });
};

const CreateReviewScreen = ({ route, navigation }) => {
    const { id_restaurante, restaurantName, id_sucursal } = route.params || {};
    const { createReview, getEligible } = useReviews();
    const { show } = useAlert();

    const [eligible, setEligible] = useState({ orders: [], reservations: [] });
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        getEligible(id_restaurante, id_sucursal)
            .then(setEligible)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id_restaurante, id_sucursal]);

    const allItems = [
        ...eligible.orders.map((o) => ({
            ...o,
            _type: "order",
            _label: o.items?.map((i) => i.nombre).join(", ") || "Pedido",
            _date: o.createdAt,
            _status: o.estado,
            _detail: `Q${o.total} - ${o.tipo_servicio || ""}`,
            alreadyReviewed: o.reviewed,
        })),
        ...eligible.reservations.map((r) => ({
            ...r,
            _type: "reservation",
            _label: `${r.cantidad_personas} persona${r.cantidad_personas > 1 ? "s" : ""}${r.mesa_numero ? ` - Mesa #${r.mesa_numero}` : ""}`,
            _date: r.fecha_reserva || r.createdAt,
            _status: r.reviewed ? "Ya calificada" : "Calificable",
            _detail: r.sucursal_nombre || "",
            alreadyReviewed: r.reviewed,
        })),
    ].filter((i) => !i.alreadyReviewed).sort((a, b) => new Date(b._date) - new Date(a._date));

    const handleSelect = (item) => {
        if (item.alreadyReviewed) return;
        setSelected(item);
    };

    const handleSubmit = async () => {
        if (!selected) return show({ type: "warning", title: "Selecciona un item", message: "Debes elegir un pedido o reservacion para calificar" });
        if (calificacion < 1) return show({ type: "warning", title: "Calificacion requerida", message: "Selecciona de 1 a 5 estrellas" });

        setSending(true);
        try {
            const payload = {
                id_pedido: selected._type === "order" ? selected._id : undefined,
                id_reservacion: selected._type === "reservation" ? selected._id : undefined,
                id_sucursal: selected.id_sucursal || id_sucursal || "",
                calificacion,
                comentario,
            };
            await createReview(payload);
            show({
                type: "success",
                title: "Gracias por tu calificacion",
                message: "Tu opinion nos ayuda a mejorar",
                buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
            });
        } catch (err) {
            show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo registrar la calificacion" });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <FlatList
                data={allItems}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                ListHeaderComponent={
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>{restaurantName || "Restaurante"}</Text>
                        <Text style={{ fontSize: 13, color: COLORS.secondary, marginTop: 4 }}>Selecciona que deseas calificar:</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const isSelected = selected?._id === item._id && selected?._type === item._type;
                    const Icon = item._type === "order" ? ShoppingCart : Calendar;
                    return (
                        <TouchableOpacity
                            onPress={() => handleSelect(item)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 8,
                                borderRadius: 14, borderWidth: 1.5,
                                borderColor: isSelected ? COLORS.primary : COLORS.border,
                                backgroundColor: isSelected ? COLORS.primary + "08" : "#fff",
                            }}
                        >
                            <View style={{
                                width: 40, height: 40, borderRadius: 10,
                                backgroundColor: isSelected ? COLORS.primary + "18" : COLORS.border + "40",
                                justifyContent: "center", alignItems: "center", marginRight: 12,
                            }}>
                                <Icon size={20} color={isSelected ? COLORS.primary : COLORS.secondary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }} numberOfLines={1}>{item._label}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.secondary, marginTop: 2 }}>{fmtDate(item._date)}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.secondary }}>{item._detail}</Text>
                            </View>
                            {isSelected && <CheckCircle size={20} color={COLORS.primary} />}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", paddingVertical: 40 }}>
                        <Text style={{ fontSize: 14, color: COLORS.secondary }}>No tienes pedidos o reservaciones para calificar</Text>
                    </View>
                }
            />

            {selected && (
                <View style={{ padding: 16, paddingBottom: 32, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 10 }}>Tu calificacion</Text>
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <TouchableOpacity key={n} onPress={() => setCalificacion(n)} hitSlop={8} style={{ marginHorizontal: 4 }}>
                                <Star size={36} color={BRAND.primary} fill={n <= calificacion ? BRAND.primary : "transparent"} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={{
                            borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
                            padding: 12, minHeight: 60, marginBottom: 16, fontSize: 14, color: COLORS.text,
                        }}
                        placeholder="Cuentanos tu experiencia (opcional)..."
                        placeholderTextColor={COLORS.textLight}
                        value={comentario}
                        onChangeText={setComentario}
                        multiline
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Button title="Enviar calificacion" onPress={handleSubmit} loading={sending} />
                </View>
            )}
        </View>
    );
};

export default CreateReviewScreen;
