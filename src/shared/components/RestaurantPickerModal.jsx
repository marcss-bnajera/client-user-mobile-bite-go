import { useState, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BRAND } from "../constants/tokens";
import BottomSheet from "./BottomSheet.jsx";

const RestaurantPickerModal = forwardRef(({ onSelect, restaurants, selectedId }, ref) => {
    const [search, setSearch] = useState("");
    const sheetRef = useRef(null);

    useImperativeHandle(ref, () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
    }));

    const filtered = useMemo(() => {
        if (!search.trim()) return restaurants;
        const q = search.toLowerCase();
        return restaurants.filter((r) =>
            r.nombre?.toLowerCase().includes(q) ||
            r.categoria_gastronomica?.toLowerCase().includes(q) ||
            r.direccion?.texto?.toLowerCase().includes(q)
        );
    }, [restaurants, search]);

    const handleSelect = useCallback((restaurant) => {
        onSelect(restaurant);
        sheetRef.current?.dismiss();
        setSearch("");
    }, [onSelect]);

    return (
        <BottomSheet ref={sheetRef} title="Selecciona un restaurante">
            <View style={styles.searchWrap}>
                <MaterialIcons name="search" size={18} color={BRAND.faint} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar restaurante..."
                    placeholderTextColor={BRAND.faint}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <MaterialIcons name="close" size={18} color={BRAND.faint} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} bounces={false}>
                {filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <MaterialIcons name="search-off" size={40} color={BRAND.faint} />
                        <Text style={styles.emptyText}>No se encontraron restaurantes</Text>
                    </View>
                ) : (
                    filtered.map((item) => {
                        const isSelected = item._id === selectedId;
                        const photo = item.fotos_url?.[0];
                        return (
                            <TouchableOpacity key={item._id} onPress={() => handleSelect(item)} style={[styles.item, isSelected && styles.itemSelected]} activeOpacity={0.7}>
                                {photo ? (
                                    <Image source={{ uri: photo }} style={styles.itemImage} />
                                ) : (
                                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                                        <MaterialIcons name="restaurant" size={24} color={BRAND.primary} />
                                    </View>
                                )}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                                    {item.categoria_gastronomica && (
                                        <Text style={styles.itemCategory} numberOfLines={1}>{item.categoria_gastronomica}</Text>
                                    )}
                                    {item.direccion?.texto && (
                                        <Text style={styles.itemAddress} numberOfLines={1}>{item.direccion.texto}</Text>
                                    )}
                                    <View style={styles.itemMeta}>
                                        {item.precio_promedio && (
                                            <Text style={styles.itemPrice}>Q{item.precio_promedio} promedio</Text>
                                        )}
                                        {item.tiene_sucursales && item.sucursales?.length > 0 && (
                                            <View style={styles.branchBadge}>
                                                <Text style={styles.branchBadgeText}>{item.sucursales.length} sucursal{item.sucursales.length > 1 ? "es" : ""}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                {isSelected && <MaterialIcons name="check-circle" size={20} color={BRAND.primary} />}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </BottomSheet>
    );
});

export default RestaurantPickerModal;

const styles = StyleSheet.create({
    searchWrap: {
        flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12,
        backgroundColor: BRAND.canvas, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: BRAND.line,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: BRAND.ink, padding: 0 },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    item: {
        flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 8,
        borderRadius: 14, borderWidth: 1.5, borderColor: BRAND.line, backgroundColor: "#fff",
    },
    itemSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primary + "08" },
    itemImage: { width: 56, height: 56, borderRadius: 12 },
    itemImagePlaceholder: { backgroundColor: BRAND.canvas, justifyContent: "center", alignItems: "center" },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: "700", color: BRAND.ink },
    itemCategory: { fontSize: 12, color: BRAND.primary, fontWeight: "600", marginTop: 2 },
    itemAddress: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
    itemMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    itemPrice: { fontSize: 11, color: BRAND.faint },
    branchBadge: { backgroundColor: BRAND.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    branchBadgeText: { fontSize: 10, fontWeight: "700", color: BRAND.primary },
    empty: { alignItems: "center", paddingVertical: 40 },
    emptyText: { fontSize: 14, color: BRAND.muted, marginTop: 8 },
});
