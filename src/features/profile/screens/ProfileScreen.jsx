import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Phone, MapPin, Save, RotateCcw } from "lucide-react-native";
import Button from "../../../shared/components/Button.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { SHADOWS } from "../../../shared/constants/tokens.js";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { getProfile, updateProfile } from "../../../shared/api";

const EMPTY = { nombre: "", telefono: "", direccion: "" };

const ProfileScreen = () => {
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [initial, setInitial] = useState(EMPTY);
    const [focused, setFocused] = useState(null);

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        getProfile(user.id)
            .then(({ data }) => {
                const u = data.user || data;
                const loaded = {
                    nombre: u.nombre || "",
                    telefono: u.telefono || "",
                    direccion: u.direccion || "",
                };
                setForm(loaded);
                setInitial(loaded);
            })
            .catch(() => {
                // Usuario no existe en MongoDB (ej: superadmin del seeder)
                setForm(EMPTY);
                setInitial(EMPTY);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

    const dirty = JSON.stringify(form) !== JSON.stringify(initial);

    const handleChange = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
    const handleReset = () => setForm(initial);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user.id, form);
            setInitial(form);
            Alert.alert("Listo", "Tu perfil fue actualizado");
        } catch {
            Alert.alert("Error", "No se pudo actualizar tu perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert("Cerrar sesión", "¿Estás seguro que deseas salir?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Aceptar", onPress: () => logout() },
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-canvas">
                <ActivityIndicator size="large" color="#E67E22" />
                <Text className="mt-3 text-sm text-faint">Cargando perfil…</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
                <LinearGradient colors={["#3A2E2A", "#2B211D"]} className="items-center px-6 pb-10 pt-16">
                    <FadeInView className="h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white" style={SHADOWS.primary}>
                        <Text className="text-4xl font-extrabold text-primary">
                            {user?.username?.[0]?.toUpperCase() || "?"}
                        </Text>
                    </FadeInView>
                    <Text className="mt-4 text-2xl font-bold text-white">{user?.username || "Usuario"}</Text>
                    <View className="mt-1.5 rounded-full bg-white/15 px-3 py-1">
                        <Text className="text-xs font-semibold uppercase tracking-wide text-white">{user?.role || "Cliente"}</Text>
                    </View>
                </LinearGradient>

                <FadeInView delay={120} className="flex-1 px-5 pt-6">
                    <View className="mb-5 rounded-2xl bg-surface p-4" style={SHADOWS.card}>
                        <Text className="mb-4 text-base font-bold text-ink">Información personal</Text>

                        <Field
                            icon={User}
                            label="Nombre"
                            value={form.nombre}
                            onChangeText={handleChange("nombre")}
                            placeholder="Tu nombre completo"
                            focused={focused === "nombre"}
                            onFocus={() => setFocused("nombre")}
                            onBlur={() => setFocused(null)}
                        />
                        <Field
                            icon={Phone}
                            label="Teléfono"
                            value={form.telefono}
                            onChangeText={handleChange("telefono")}
                            placeholder="1234 5678"
                            keyboardType="phone-pad"
                            focused={focused === "telefono"}
                            onFocus={() => setFocused("telefono")}
                            onBlur={() => setFocused(null)}
                        />
                        <Field
                            icon={MapPin}
                            label="Dirección"
                            value={form.direccion}
                            onChangeText={handleChange("direccion")}
                            placeholder="Zona, calle y número"
                            focused={focused === "direccion"}
                            onFocus={() => setFocused("direccion")}
                            onBlur={() => setFocused(null)}
                            last
                        />

                        {dirty && (
                            <View className="mt-2 flex-row gap-3">
                                <View className="flex-1">
                                    <Button title="Descartar" variant="secondary" onPress={handleReset} disabled={saving} icon={RotateCcw} />
                                </View>
                                <View className="flex-1">
                                    <Button
                                        title={saving ? "Guardando…" : "Guardar"}
                                        variant="primary"
                                        onPress={handleSave}
                                        disabled={saving}
                                        loading={saving}
                                        icon={Save}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    <Button title="Cerrar sesión" variant="danger" onPress={handleLogout} />
                    <Text className="mt-8 pb-4 text-center text-xs text-faint">Bite&Go v1.0.0</Text>
                </FadeInView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const Field = ({ icon: Icon, label, value, onChangeText, placeholder, keyboardType, focused, onFocus, onBlur, last }) => (
    <View className={last ? "" : "mb-4"}>
        <Text className="mb-1.5 text-xs font-semibold text-ink">{label}</Text>
        <View className={`flex-row items-center rounded-xl border bg-canvas px-3 ${focused ? "border-primary" : "border-transparent"}`}>
                            <Icon size={17} color={focused ? "#E67E22" : "#9CA3AF"} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#B8B8B8"
                keyboardType={keyboardType}
                onFocus={onFocus}
                onBlur={onBlur}
                className="ml-2 flex-1 py-2.5 text-sm text-ink"
            />
        </View>
    </View>
);

export default ProfileScreen;