import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";
import Input from "../../../shared/components/Input.jsx";
import Button from "../../../shared/components/Button.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { SHADOWS, BRAND } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import authClient from "../../../shared/api/authClient.js";

const ResetPasswordScreen = ({ route, navigation }) => {
    const token = route?.params?.token;
    const [status, setStatus] = useState(token ? "form" : "error");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { show } = useAlert();

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await authClient.post("/reset-password", { token, newPassword: data.newPassword });
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={["#F5EFE6", "#E8D8C3"]} style={styles.hero}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <FadeInView style={[styles.card, SHADOWS.card]}>
                        {status === "form" && (
                            <>
                                <Text style={styles.title}>Restablecer Contraseña</Text>
                                <View style={styles.divider} />
                                <Text style={styles.subtitle}>Ingresa tu nueva contraseña</Text>

                                <View style={{ marginTop: 20 }}>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "La contraseña es obligatoria",
                                            minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <View>
                                                <Input
                                                    label="Nueva contraseña"
                                                    placeholder="Mínimo 8 caracteres"
                                                    secureTextEntry={!showPassword}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    error={errors.newPassword?.message}
                                                />
                                                <Text style={styles.togglePass} onPress={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? "Ocultar" : "Mostrar"}
                                                </Text>
                                            </View>
                                        )}
                                        name="newPassword"
                                    />
                                </View>

                                <Controller
                                    control={control}
                                    rules={{
                                        required: "Confirma tu contraseña",
                                        validate: (val) => val === watch("newPassword") || "Las contraseñas no coinciden",
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Confirmar contraseña"
                                            placeholder="Repite la contraseña"
                                            secureTextEntry
                                            onChangeText={onChange}
                                            value={value}
                                            error={errors.confirmPassword?.message}
                                        />
                                    )}
                                    name="confirmPassword"
                                />

                                <Button
                                    title={loading ? "Restableciendo..." : "Restablecer Contraseña"}
                                    onPress={handleSubmit(onSubmit)}
                                    loading={loading}
                                    style={{ marginTop: 16 }}
                                />
                            </>
                        )}

                        {status === "success" && (
                            <View style={styles.center}>
                                <Text style={styles.icon}>✅</Text>
                                <Text style={styles.title}>Contraseña actualizada</Text>
                                <Text style={styles.subtitle}>Tu contraseña se ha restablecido exitosamente. Ya puedes iniciar sesión.</Text>
                                <Button title="Iniciar Sesión" onPress={() => navigation.navigate("Login")} style={{ marginTop: 24 }} />
                            </View>
                        )}

                        {status === "error" && (
                            <View style={styles.center}>
                                <Text style={styles.icon}>❌</Text>
                                <Text style={styles.title}>Enlace inválido o expirado</Text>
                                <Text style={styles.subtitle}>El enlace para restablecer tu contraseña no es válido o ya expiró. Solicita uno nuevo.</Text>
                                <Button title="Ir al Login" onPress={() => navigation.navigate("Login")} style={{ marginTop: 24 }} />
                            </View>
                        )}
                    </FadeInView>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = {
    flex: { flex: 1 },
    hero: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
    card: {
        backgroundColor: "#fff", borderRadius: 20, padding: 24,
        borderWidth: 1, borderColor: COLORS.border,
    },
    title: { fontSize: 22, fontWeight: "800", color: BRAND.ink, textAlign: "center" },
    divider: { height: 4, width: 48, backgroundColor: BRAND.primary, borderRadius: 2, marginVertical: 8, alignSelf: "center" },
    subtitle: { fontSize: 13, color: BRAND.muted, textAlign: "center", marginTop: 4 },
    togglePass: { fontSize: 12, color: BRAND.primary, textAlign: "right", marginTop: -8, marginBottom: 12, fontWeight: "600" },
    center: { alignItems: "center" },
    icon: { fontSize: 40, marginBottom: 16 },
};

export default ResetPasswordScreen;
