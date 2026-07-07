import { useState } from "react";
import { View, Text, TextInput, Alert, Pressable } from "react-native";
import { Star } from "lucide-react-native";
import Button from "../../../shared/components/Button.jsx";
import { Card } from "../../../shared/components/Common.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { useReviews } from "../hooks/useReviews.js";

const CreateReviewScreen = ({ route, navigation }) => {
    const { id_pedido, restaurantName } = route.params;
    const { createReview } = useReviews();
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async () => {
        if (calificacion < 1) return Alert.alert("Calificación requerida", "Selecciona de 1 a 5 estrellas");

        setSending(true);
        try {
            await createReview({ id_pedido, calificacion, comentario });
            Alert.alert("¡Gracias!", "Tu calificación fue registrada", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "No se pudo registrar la calificación");
        } finally {
            setSending(false);
        }
    };

    return (
        <View className="flex-1 bg-canvas px-4 pt-6">
            <Card style={SHADOWS.card}>
                <Text className="text-base font-bold text-ink">{restaurantName || "Restaurante"}</Text>
                <Text className="mt-1 text-sm text-muted">¿Cómo estuvo el servicio?</Text>

                <View className="mt-4 flex-row justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable key={n} onPress={() => setCalificacion(n)} hitSlop={8} style={{ marginHorizontal: 4 }}>
                            <Star
                                size={36}
                                color={BRAND.primary}
                                fill={n <= calificacion ? BRAND.primary : "transparent"}
                            />
                        </Pressable>
                    ))}
                </View>

                <Text className="mb-1.5 mt-5 text-sm font-semibold text-ink">Comentario (opcional)</Text>
                <TextInput
                    className="min-h-[100px] rounded-xl border-2 border-line bg-surface p-4 text-base text-ink"
                    placeholder="Cuéntanos tu experiencia..."
                    placeholderTextColor={BRAND.faint}
                    value={comentario}
                    onChangeText={setComentario}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                />

                <Button title="Enviar calificación" onPress={handleSubmit} loading={sending} style={{ marginTop: 24 }} />
            </Card>
        </View>
    );
};

export default CreateReviewScreen;
