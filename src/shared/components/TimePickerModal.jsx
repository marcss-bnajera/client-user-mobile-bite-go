import { useState, useMemo, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Pressable, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BRAND } from "../constants/tokens";

export default function TimePickerModal({ visible, onClose, onSelect, selectedTime, openingTime, closingTime, selectedDate }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isToday = useMemo(() => {
        if (!selectedDate) return true;
        const sel = new Date(selectedDate);
        const selDay = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate());
        return selDay.getTime() === today.getTime();
    }, [selectedDate]);

    const openH = openingTime ? parseInt(openingTime.split(":")[0]) : 8;
    const closeH = closingTime ? parseInt(closingTime.split(":")[0]) : 22;
    const closeM = closingTime ? parseInt(closingTime.split(":")[1]) : 0;

    const hours = useMemo(() => {
        const arr = [];
        const startHour = isToday ? Math.max(openH, now.getHours() + 1) : openH;
        const endHour = closeH;
        for (let h = startHour; h <= endHour; h++) {
            if (h === endHour && closeM === 0) continue;
            arr.push(String(h).padStart(2, "0"));
        }
        return arr;
    }, [openH, closeH, closeM, isToday]);

    const minutes = ["00", "15", "30", "45"];

    const [selectedH, setSelectedH] = useState("");
    const [selectedM, setSelectedM] = useState("");

    useEffect(() => {
        if (visible && selectedTime) {
            const [h, m] = selectedTime.split(":");
            setSelectedH(h || "");
            setSelectedM(m || "");
        } else if (visible) {
            setSelectedH("");
            setSelectedM("");
        }
    }, [visible, selectedTime]);

    const isMinuteDisabled = (h, m) => {
        if (!h) return false;
        const hi = parseInt(h);
        const mi = parseInt(m);
        if (isToday && hi === now.getHours() && mi <= now.getMinutes()) return true;
        if (hi === closeH && mi >= closeM && closeM > 0) return true;
        return false;
    };

    const handleConfirm = () => {
        if (selectedH) {
            onSelect(`${selectedH}:${selectedM || "00"}`);
        }
        onClose();
    };

    const noHoursAvailable = hours.length === 0;

    const HourItem = ({ hour, isSelected, onPress }) => {
        return (
            <TouchableOpacity onPress={onPress} disabled={false} style={[styles.pill, isSelected && styles.pillActive]}>
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{hour}</Text>
            </TouchableOpacity>
        );
    };

    const MinuteItem = ({ minute, isSelected, onPress }) => {
        const disabled = selectedH ? isMinuteDisabled(selectedH, minute) : false;
        return (
            <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.pill, isSelected && styles.pillActive, disabled && styles.pillDisabled]}>
                <Text style={[styles.pillText, isSelected && styles.pillTextActive, disabled && styles.pillTextDisabled]}>{minute}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.center}>
                    <Pressable onPress={() => {}} style={styles.card}>
                        <Text style={styles.title}>Selecciona la hora</Text>

                        {noHoursAvailable ? (
                            <View style={styles.noHoursWrap}>
                                <MaterialIcons name="schedule" size={36} color={BRAND.faint} />
                                <Text style={styles.noHoursTitle}>No hay horarios disponibles</Text>
                                <Text style={styles.noHoursText}>
                                    {isToday
                                        ? "El restaurante ya cerro para hoy. Prueba con otra fecha."
                                        : "No hay horarios disponibles para esta fecha."
                                    }
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sectionLabel}>Hora</Text>
                                <FlatList
                                    data={hours}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <HourItem hour={item} isSelected={selectedH === item} onPress={() => setSelectedH(item)} />
                                    )}
                                    contentContainerStyle={styles.pillList}
                                />

                                <Text style={styles.sectionLabel}>Minutos</Text>
                                <FlatList
                                    data={minutes}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <MinuteItem minute={item} isSelected={selectedM === item} onPress={() => setSelectedM(item)} />
                                    )}
                                    contentContainerStyle={styles.pillList}
                                />
                            </>
                        )}

                        <View style={styles.previewRow}>
                            <MaterialIcons name="schedule" size={20} color={noHoursAvailable ? BRAND.faint : BRAND.primary} />
                            <Text style={[styles.previewText, noHoursAvailable && { color: BRAND.faint }]}>
                                {selectedH ? `${selectedH}:${selectedM || "00"}` : noHoursAvailable ? "Sin disponibilidad" : "Selecciona una hora"}
                            </Text>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmBtn, (!selectedH || noHoursAvailable) && styles.confirmBtnDisabled]} onPress={handleConfirm} disabled={!selectedH || noHoursAvailable}>
                                <Text style={styles.confirmBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = {
    backdrop: { flex: 1, backgroundColor: "rgba(42,42,42,0.5)", justifyContent: "center", alignItems: "center" },
    center: { justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
    card: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BRAND.line },
    title: { fontSize: 17, fontWeight: "800", color: BRAND.ink, textAlign: "center", marginBottom: 16 },
    sectionLabel: { fontSize: 12, fontWeight: "600", color: BRAND.muted, marginBottom: 8, marginTop: 4 },
    pillList: { gap: 8, paddingVertical: 4 },
    pill: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: BRAND.canvas, borderWidth: 1.5, borderColor: BRAND.line,
    },
    pillActive: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
    pillDisabled: { opacity: 0.35 },
    pillText: { fontSize: 14, fontWeight: "600", color: BRAND.ink },
    pillTextActive: { color: "#fff" },
    pillTextDisabled: { color: BRAND.faint },
    noHoursWrap: { alignItems: "center", paddingVertical: 16, gap: 8 },
    noHoursTitle: { fontSize: 15, fontWeight: "700", color: BRAND.ink, textAlign: "center" },
    noHoursText: { fontSize: 13, color: BRAND.muted, textAlign: "center", lineHeight: 18 },
    previewRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, marginTop: 16, paddingVertical: 12,
        backgroundColor: BRAND.canvas, borderRadius: 12,
    },
    previewText: { fontSize: 20, fontWeight: "800", color: BRAND.ink },
    buttonRow: { flexDirection: "row", gap: 10, marginTop: 16 },
    cancelBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: BRAND.line },
    cancelBtnText: { fontSize: 14, fontWeight: "600", color: BRAND.muted },
    confirmBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: BRAND.primary },
    confirmBtnDisabled: { opacity: 0.5 },
    confirmBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
};
