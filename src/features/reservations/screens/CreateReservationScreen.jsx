import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import DatePickerModal from "../../../shared/components/DatePickerModal.jsx";
import TimePickerModal from "../../../shared/components/TimePickerModal.jsx";
import RestaurantPickerModal from "../../../shared/components/RestaurantPickerModal.jsx";
import SucursalPickerModal from "../../../shared/components/SucursalPickerModal.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens";

const CreateReservationScreen = ({ navigation }) => {
    const { show } = useAlert();
    const restaurantRef = useRef(null);
    const sucursalRef = useRef(null);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState("");
    const [people, setPeople] = useState(2);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        userClient.get("/restaurants")
            .then(({ data }) => setRestaurants(data.restaurants || []))
            .finally(() => setLoading(false));
    }, []);

    const hasSucursales = selectedRestaurant?.tiene_sucursales && selectedRestaurant?.sucursales?.length > 0;

    const getMesas = () => {
        if (hasSucursales && selectedSucursal) return selectedSucursal.mesas || [];
        if (!hasSucursales && selectedRestaurant) return selectedRestaurant.mesas || [];
        return [];
    };

    const mesas = getMesas().filter((m) => m.estado === "Disponible");

    const formatDate = (d) => {
        if (!d) return "";
        const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    };

    const handleCreate = async () => {
        if (!selectedRestaurant) return show({ type: "warning", title: "Restaurante requerido", message: "Selecciona un restaurante para continuar" });
        if (hasSucursales && !selectedSucursal) return show({ type: "warning", title: "Sucursal requerida", message: "Selecciona una sucursal" });
        if (!date) return show({ type: "warning", title: "Fecha requerida", message: "Selecciona una fecha para tu reservacion" });
        if (!time) return show({ type: "warning", title: "Hora requerida", message: "Selecciona una hora para tu reservacion" });

        setSending(true);
        try {
            const fechaReserva = new Date(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${time}:00`);
            const payload = {
                id_restaurante: selectedRestaurant._id,
                fecha_reserva: fechaReserva.toISOString(),
                cantidad_personas: people,
            };
            if (selectedSucursal) payload.id_sucursal = selectedSucursal._id;
            if (selectedMesa) payload.id_mesa = selectedMesa._id;

            await userClient.post("/reservations", payload);
            show({
                type: "success",
                title: "Reservacion creada",
                message: `Tu mesa para ${people} persona${people > 1 ? "s" : ""} fue reservada exitosamente`,
                buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
            });
        } catch (err) {
            show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo crear la reservacion" });
        } finally {
            setSending(false);
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content}>
            <Text style={s.sectionTitle}>Restaurante</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => restaurantRef.current?.present()} activeOpacity={0.7}>
                <MaterialIcons name="restaurant" size={18} color={selectedRestaurant ? BRAND.primary : BRAND.faint} />
                <Text style={[s.pickerText, selectedRestaurant && s.pickerTextSelected]} numberOfLines={1}>
                    {selectedRestaurant?.nombre || "Seleccionar restaurante"}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={BRAND.faint} />
            </TouchableOpacity>

            {hasSucursales && (
                <>
                    <Text style={s.sectionTitle}>Sucursal</Text>
                    <TouchableOpacity style={s.pickerBtn} onPress={() => sucursalRef.current?.present()} activeOpacity={0.7}>
                        <MaterialIcons name="store" size={18} color={selectedSucursal ? BRAND.primary : BRAND.faint} />
                        <Text style={[s.pickerText, selectedSucursal && s.pickerTextSelected]} numberOfLines={1}>
                            {selectedSucursal?.nombre || "Seleccionar sucursal"}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color={BRAND.faint} />
                    </TouchableOpacity>
                </>
            )}

            {mesas.length > 0 && (
                <>
                    <Text style={s.sectionTitle}>Mesa (opcional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
                        {mesas.map((m) => (
                            <TouchableOpacity
                                key={m._id}
                                onPress={() => setSelectedMesa(selectedMesa?._id === m._id ? null : m)}
                                style={[s.chip, selectedMesa?._id === m._id && s.chipActive]}
                            >
                                <Text style={[s.chipText, selectedMesa?._id === m._id && s.chipTextActive]}>
                                    Mesa {m.numero} ({m.capacidad})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}

            <Text style={s.sectionTitle}>Fecha</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <MaterialIcons name="calendar-today" size={18} color={date ? BRAND.primary : BRAND.faint} />
                <Text style={[s.pickerText, date && s.pickerTextSelected]}>
                    {date ? formatDate(date) : "Seleccionar fecha"}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={BRAND.faint} />
            </TouchableOpacity>

            <Text style={s.sectionTitle}>Hora</Text>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
                <MaterialIcons name="schedule" size={18} color={time ? BRAND.primary : BRAND.faint} />
                <Text style={[s.pickerText, time && s.pickerTextSelected]}>
                    {time || "Seleccionar hora"}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={BRAND.faint} />
            </TouchableOpacity>

            <Text style={s.sectionTitle}>Personas</Text>
            <View style={s.stepperRow}>
                <TouchableOpacity style={s.stepperBtn} onPress={() => setPeople(Math.max(1, people - 1))}>
                    <MaterialIcons name="remove" size={20} color={BRAND.primary} />
                </TouchableOpacity>
                <View style={s.stepperValue}>
                    <Text style={s.stepperText}>{people}</Text>
                    <Text style={s.stepperLabel}>{people === 1 ? "persona" : "personas"}</Text>
                </View>
                <TouchableOpacity style={s.stepperBtn} onPress={() => setPeople(Math.min(20, people + 1))}>
                    <MaterialIcons name="add" size={20} color={BRAND.primary} />
                </TouchableOpacity>
            </View>

            <Button title="Crear Reservacion" onPress={handleCreate} loading={sending} style={{ marginTop: 24 }} />

            <RestaurantPickerModal
                ref={restaurantRef}
                onSelect={(r) => { setSelectedRestaurant(r); setSelectedSucursal(null); setSelectedMesa(null); }}
                restaurants={restaurants}
                selectedId={selectedRestaurant?._id}
            />

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelect={(d) => setDate(d)}
                selectedDate={date}
            />

            <TimePickerModal
                visible={showTimePicker}
                onClose={() => setShowTimePicker(false)}
                onSelect={(t) => setTime(t)}
                selectedTime={time}
                selectedDate={date}
                openingTime={selectedRestaurant?.horarios_atencion?.split(" - ")[0]}
                closingTime={selectedRestaurant?.horarios_atencion?.split(" - ")[1]}
            />

            <SucursalPickerModal
                ref={sucursalRef}
                onSelect={(s) => { setSelectedSucursal(s); setSelectedMesa(null); }}
                sucursales={selectedRestaurant?.sucursales || []}
                selectedId={selectedSucursal?._id}
            />
        </ScrollView>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 8, marginTop: 16 },
    pickerBtn: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
        paddingHorizontal: 14, height: 50,
    },
    pickerText: { flex: 1, fontSize: 14, color: COLORS.secondary },
    pickerTextSelected: { color: COLORS.text, fontWeight: "600" },
    chipScroll: { marginBottom: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 14, color: COLORS.secondary, fontWeight: "600" },
    chipTextActive: { color: "#fff" },
    stepperRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
        paddingVertical: 8, gap: 20,
    },
    stepperBtn: {
        width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center",
        backgroundColor: BRAND.primary + "12", borderWidth: 1.5, borderColor: BRAND.primary + "30",
    },
    stepperValue: { alignItems: "center", minWidth: 60 },
    stepperText: { fontSize: 24, fontWeight: "800", color: COLORS.text },
    stepperLabel: { fontSize: 11, color: COLORS.secondary, marginTop: -2 },
});

export default CreateReservationScreen;
