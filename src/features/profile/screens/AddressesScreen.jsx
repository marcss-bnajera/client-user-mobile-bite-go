import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { MapPin, Trash2, Plus, Home, Briefcase, Star } from "lucide-react-native";
import { useAddresses } from "../hooks/useAddresses.js";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import Button from "../../../shared/components/Button.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";

const iconMap = { Casa: Home, Trabajo: Briefcase };

const AddressesScreen = () => {
    const { addresses, loading, addAddress, deleteAddress } = useAddresses();
    const { show, confirm } = useAlert();
    const [showForm, setShowForm] = useState(false);
    const [etiqueta, setEtiqueta] = useState("Casa");
    const [direccion, setDireccion] = useState("");
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!direccion.trim()) return show({ type: "warning", title: "Direccion requerida", message: "Ingresa una direccion" });
        setSaving(true);
        try {
            const predeterminada = addresses.length === 0;
            await addAddress({ etiqueta, direccion: direccion.trim(), predeterminada });
            setDireccion("");
            setShowForm(false);
        } catch (err) {
            show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo agregar la direccion" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        confirm({
            title: "Eliminar direccion",
            message: "¿Eliminar esta direccion?",
            confirmText: "Eliminar",
            onConfirm: async () => {
                try { await deleteAddress(id); } catch {}
            },
        });
    };

    if (loading && !addresses.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <View className="flex-row items-center justify-between px-4 pt-4">
                <View className="flex-row items-center">
                    <MapPin size={22} color={BRAND.primary} />
                    <Text className="ml-2 text-lg font-extrabold text-ink">Mis Direcciones</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowForm(!showForm)}
                    className="flex-row items-center rounded-lg bg-primary px-3 py-2"
                >
                    <Plus size={16} color="#fff" />
                    <Text className="ml-1 text-xs font-bold text-white">Agregar</Text>
                </TouchableOpacity>
            </View>

            {showForm && (
                <FadeInView className="mx-4 mt-3 rounded-xl bg-surface p-4" style={SHADOWS.card}>
                    <Text className="mb-2 text-sm font-semibold text-ink">Etiqueta</Text>
                    <View className="mb-3 flex-row gap-2">
                        {["Casa", "Trabajo", "Otro"].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setEtiqueta(opt)}
                                className={`rounded-lg px-3 py-1.5 ${etiqueta === opt ? "bg-primary" : "bg-canvas"}`}
                            >
                                <Text className={`text-xs font-semibold ${etiqueta === opt ? "text-white" : "text-muted"}`}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text className="mb-1.5 text-sm font-semibold text-ink">Direccion</Text>
                    <View className="mb-3 rounded-xl border-2 border-line bg-canvas px-3">
                        <TextInput
                            value={direccion}
                            onChangeText={setDireccion}
                            placeholder="Calle, colonia, referencias..."
                            placeholderTextColor={BRAND.faint}
                            className="py-2.5 text-sm text-ink"
                        />
                    </View>
                    <View className="flex-row gap-2">
                        <View className="flex-1">
                            <Button title="Guardar" onPress={handleAdd} loading={saving} />
                        </View>
                        <View className="flex-1">
                            <Button title="Cancelar" variant="secondary" onPress={() => setShowForm(false)} />
                        </View>
                    </View>
                </FadeInView>
            )}

            <FlatList
                data={addresses}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    const Icon = iconMap[item.etiqueta] || MapPin;
                    return (
                        <FadeInView>
                            <Card className="mx-4 mt-3 flex-row items-center" style={SHADOWS.card}>
                                <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas">
                                    <Icon size={18} color={BRAND.primary} />
                                </View>
                                <View className="ml-3 flex-1">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-sm font-semibold text-ink">{item.etiqueta}</Text>
                                        {item.predeterminada && (
                                            <View className="flex-row items-center rounded-full bg-primary/10 px-1.5 py-0.5">
                                                <Star size={8} color={BRAND.primary} fill={BRAND.primary} />
                                                <Text className="ml-0.5 text-[10px] font-bold text-primary">Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>{item.direccion}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={8} className="p-2">
                                    <Trash2 size={16} color={BRAND.muted} />
                                </TouchableOpacity>
                            </Card>
                        </FadeInView>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes direcciones guardadas" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default AddressesScreen;
