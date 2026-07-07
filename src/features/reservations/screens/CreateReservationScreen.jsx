import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";

const CreateReservationScreen = ({ navigation }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [people, setPeople] = useState("2");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        userClient.get("/restaurants")
            .then(({ data }) => setRestaurants(data.restaurants || []))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!selectedRestaurant) return Alert.alert("Error", "Seleccioná un restaurante");
        if (!date || !time) return Alert.alert("Error", "Ingresá fecha y hora");
        if (parseInt(people) < 1) return Alert.alert("Error", "Mínimo 1 persona");

        setSending(true);
        try {
            const fechaReserva = new Date(`${date}T${time}:00`);
            await userClient.post("/reservations", {
                id_restaurante: selectedRestaurant._id,
                fecha_reserva: fechaReserva.toISOString(),
                cantidad_personas: parseInt(people),
            });
            Alert.alert("Reservación creada", "Tu reservación fue registrada", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "No se pudo crear la reservación");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content}>
            <Text style={s.label}>Restaurante</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.restScroll}>
                {restaurants.map(r => (
                    <TouchableOpacity
                        key={r._id}
                        onPress={() => setSelectedRestaurant(r)}
                        style={[s.restChip, selectedRestaurant?._id === r._id && s.restChipActive]}
                    >
                        <Text style={[s.restText, selectedRestaurant?._id === r._id && s.restTextActive]} numberOfLines={1}>{r.nombre}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={s.label}>Fecha (YYYY-MM-DD)</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="2026-07-15" placeholderTextColor={COLORS.secondary} />

            <Text style={s.label}>Hora (HH:MM)</Text>
            <TextInput style={s.input} value={time} onChangeText={setTime} placeholder="19:00" placeholderTextColor={COLORS.secondary} />

            <Text style={s.label}>Personas</Text>
            <TextInput style={s.input} value={people} onChangeText={setPeople} keyboardType="numeric" placeholder="2" placeholderTextColor={COLORS.secondary} />

            <Button title="Crear Reservación" onPress={handleCreate} loading={sending} style={{ marginTop: 24 }} />
        </ScrollView>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16 },
    label: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: COLORS.text },
    restScroll: { marginBottom: 8 },
    restChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
    restChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    restText: { fontSize: 14, color: COLORS.secondary, fontWeight: "600" },
    restTextActive: { color: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CreateReservationScreen;
