import { useState, useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BRAND } from "../constants/tokens";

const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

export default function DatePickerModal({ visible, onClose, onSelect, selectedDate, minDate, maxDate }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const min = minDate || today;
    const max = maxDate || new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    const [viewDate, setViewDate] = useState(selectedDate || today);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const days = useMemo(() => {
        const total = getDaysInMonth(year, month);
        const start = getFirstDayOfMonth(year, month);
        const arr = [];
        for (let i = 0; i < start; i++) arr.push(null);
        for (let d = 1; d <= total; d++) arr.push(d);
        return arr;
    }, [year, month]);

    const isDisabled = (day) => {
        if (!day) return true;
        const d = new Date(year, month, day);
        d.setHours(0, 0, 0, 0);
        return d < min || d > max;
    };

    const isSelected = (day) => {
        if (!day || !selectedDate) return false;
        return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    };

    const isToday = (day) => {
        if (!day) return false;
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const handleSelect = (day) => {
        if (!day || isDisabled(day)) return;
        const d = new Date(year, month, day);
        onSelect(d);
        onClose();
    };

    const prevMonth = () => {
        if (month === 0) setViewDate(new Date(year - 1, 11, 1));
        else setViewDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        if (month === 11) setViewDate(new Date(year + 1, 0, 1));
        else setViewDate(new Date(year, month + 1, 1));
    };

    const canGoPrev = !(year === min.getFullYear() && month <= min.getMonth());
    const canGoNext = !(year === max.getFullYear() && month >= max.getMonth());

    const displayText = selectedDate
        ? `${DAYS_ES[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]} ${selectedDate.getDate()} ${MONTHS_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : "Seleccionar fecha";

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.center}>
                    <Pressable onPress={() => {}} style={styles.card}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={prevMonth} disabled={!canGoPrev} style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}>
                                <MaterialIcons name="chevron-left" size={22} color={canGoPrev ? BRAND.primary : BRAND.faint} />
                            </TouchableOpacity>
                            <Text style={styles.monthTitle}>{MONTHS_ES[month]} {year}</Text>
                            <TouchableOpacity onPress={nextMonth} disabled={!canGoNext} style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}>
                                <MaterialIcons name="chevron-right" size={22} color={canGoNext ? BRAND.primary : BRAND.faint} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.daysHeader}>
                            {DAYS_ES.map((d) => (
                                <Text key={d} style={styles.dayLabel}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.grid}>
                            {days.map((day, i) => {
                                const disabled = isDisabled(day);
                                const selected = isSelected(day);
                                const todayMark = isToday(day);
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => handleSelect(day)}
                                        disabled={disabled || !day}
                                        style={[
                                            styles.dayCell,
                                            selected && styles.daySelected,
                                            todayMark && !selected && styles.dayToday,
                                        ]}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            selected && styles.dayTextSelected,
                                            disabled && styles.dayTextDisabled,
                                            todayMark && !selected && styles.dayTextToday,
                                        ]}>
                                            {day || ""}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Text style={styles.closeBtnText}>Cancelar</Text>
                        </TouchableOpacity>
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    navBtn: { padding: 4 },
    navBtnDisabled: { opacity: 0.4 },
    monthTitle: { fontSize: 16, fontWeight: "800", color: BRAND.ink },
    daysHeader: { flexDirection: "row", marginBottom: 8 },
    dayLabel: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: BRAND.muted },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    dayCell: { width: "14.28%", height: 38, justifyContent: "center", alignItems: "center", borderRadius: 19 },
    daySelected: { backgroundColor: BRAND.primary },
    dayToday: { backgroundColor: BRAND.primary + "15" },
    dayText: { fontSize: 14, fontWeight: "500", color: BRAND.ink, lineHeight: 20, includeFontPadding: false },
    dayTextSelected: { color: "#fff", fontWeight: "700" },
    dayTextDisabled: { color: BRAND.faint },
    dayTextToday: { color: BRAND.primary, fontWeight: "700" },
    closeBtn: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
    closeBtnText: { fontSize: 14, fontWeight: "600", color: BRAND.muted },
};
