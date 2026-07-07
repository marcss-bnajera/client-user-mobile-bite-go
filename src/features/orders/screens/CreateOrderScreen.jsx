import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { COLORS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";

const CreateOrderScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        userClient.get(`/products/restaurant/${restaurant._id}`)
            .then(({ data }) => setProducts(data.products || []))
            .finally(() => setLoading(false));
    }, [restaurant._id]);

    const toggle = (product) => {
        setSelected(prev => {
            const exists = prev.find(i => i._id === product._id);
            if (exists) return prev.filter(i => i._id !== product._id);
            return [...prev, { ...product, cantidad: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setSelected(prev => prev.map(i =>
            i._id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
        ));
    };

    const total = selected.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    const handleOrder = async () => {
        if (selected.length === 0) return Alert.alert("Error", "Seleccioná al menos un producto");
        setSending(true);
        try {
            await userClient.post("/orders", {
                id_restaurante: restaurant._id,
                tipo_servicio: "Para llevar",
                items: selected.map(i => ({
                    id_producto: i._id,
                    nombre_historico: i.nombre,
                    precio_historico: i.precio,
                    cantidad: i.cantidad,
                })),
            });
            Alert.alert("Pedido creado", "Tu pedido fue registrado exitosamente", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "No se pudo crear el pedido");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <View style={s.container}>
            <Text style={s.title}>Menú de {restaurant.nombre}</Text>
            <FlatList
                data={products}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                    const isSelected = selected.find(i => i._id === item._id);
                    const qty = isSelected?.cantidad || 0;
                    return (
                        <TouchableOpacity onPress={() => toggle(item)}>
                            <Card style={[s.itemCard, isSelected && s.itemSelected]}>
                                <View style={s.itemRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.itemName}>{item.nombre}</Text>
                                        <Text style={s.itemPrice}>Q{item.precio}</Text>
                                    </View>
                                    {isSelected && (
                                        <View style={s.qtyRow}>
                                            <TouchableOpacity onPress={() => updateQty(item._id, -1)} style={s.qtyBtn}>
                                                <Text style={s.qtyText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={s.qtyNum}>{qty}</Text>
                                            <TouchableOpacity onPress={() => updateQty(item._id, 1)} style={s.qtyBtn}>
                                                <Text style={s.qtyText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </Card>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            {selected.length > 0 && (
                <View style={s.footer}>
                    <Text style={s.total}>Total: Q{total}</Text>
                    <Button title="Realizar Pedido" onPress={handleOrder} loading={sending} />
                </View>
            )}
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "700", color: COLORS.text, padding: 16 },
    itemCard: { marginHorizontal: 16, marginBottom: 8 },
    itemSelected: { borderColor: COLORS.primary, borderWidth: 2 },
    itemRow: { flexDirection: "row", alignItems: "center" },
    itemName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
    itemPrice: { fontSize: 14, color: COLORS.primary, fontWeight: "700", marginTop: 4 },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
    qtyText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    qtyNum: { fontSize: 16, fontWeight: "700", color: COLORS.text, minWidth: 20, textAlign: "center" },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    total: { fontSize: 18, fontWeight: "800", color: COLORS.primary, marginBottom: 12, textAlign: "right" },
});

export default CreateOrderScreen;
