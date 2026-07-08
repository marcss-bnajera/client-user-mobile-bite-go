import { useState, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MapPin, Phone, Table } from "lucide-react-native";
import { BRAND } from "../constants/tokens";
import BottomSheet from "./BottomSheet.jsx";

const SucursalPickerModal = forwardRef(({ onSelect, sucursales, selectedId }, ref) => {
    const [search, setSearch] = useState("");
    const sheetRef = useRef(null);

    useImperativeHandle(ref, () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
    }));

    const filtered = useMemo(() => {
        const active = sucursales.filter((s) => s.activo !== false);
        if (!search.trim()) return active;
        const q = search.toLowerCase();
        return active.filter((s) =>
            s.nombre?.toLowerCase().includes(q) ||
            s.direccion?.texto?.toLowerCase().includes(q)
        );
    }, [sucursales, search]);

    const handleSelect = useCallback((sucursal) => {
        onSelect(sucursal);
        sheetRef.current?.dismiss();
        setSearch("");
    }, [onSelect]);

    return (
        <BottomSheet ref={sheetRef} title="Selecciona una sucursal">
            <View style={styles.searchWrap}>
                <MaterialIcons name="search" size={18} color={BRAND.faint} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o direccion..."
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
                        <Text style={styles.emptyText}>No se encontraron sucursales</Text>
                    </View>
                ) : (
                    filtered.map((item) => {
                        const isSelected = item._id === selectedId;
                        const mesaCount = item.mesas?.length || 0;
                        return (
                            <TouchableOpacity key={item._id} onPress={() => handleSelect(item)} style={[styles.item, isSelected && styles.itemSelected]} activeOpacity={0.7}>
                                <View style={styles.itemIcon}>
                                    <MaterialIcons name="store" size={22} color={isSelected ? "#fff" : BRAND.primary} />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                                    {item.direccion?.texto && (
                                        <View style={styles.itemRow}>
                                            <MapPin size={12} color={BRAND.muted} />
                                            <Text style={styles.itemAddress} numberOfLines={1}>{item.direccion.texto}</Text>
                                        </View>
                                    )}
                                    <View style={styles.itemMeta}>
                                        {mesaCount > 0 && (
                                            <View style={styles.badge}>
                                                <Table size={10} color={BRAND.primary} />
                                                <Text style={styles.badgeText}>{mesaCount} mesa{mesaCount > 1 ? "s" : ""}</Text>
                                            </View>
                                        )}
                                        {item.informacion_contacto?.telefono && (
                                            <View style={styles.badge}>
                                                <Phone size={10} color={BRAND.muted} />
                                                <Text style={[styles.badgeText, { color: BRAND.muted }]}>{item.informacion_contacto.telefono}</Text>
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

export default SucursalPickerModal;

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
    itemIcon: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: BRAND.primary + "12",
        justifyContent: "center", alignItems: "center",
    },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: "700", color: BRAND.ink },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
    itemAddress: { fontSize: 12, color: BRAND.muted, flex: 1 },
    itemMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: BRAND.primary + "10", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: "600", color: BRAND.primary },
    empty: { alignItems: "center", paddingVertical: 40 },
    emptyText: { fontSize: 14, color: BRAND.muted, marginTop: 8 },
});
