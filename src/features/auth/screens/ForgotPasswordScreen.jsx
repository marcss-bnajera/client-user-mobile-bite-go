import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { Mail } from "lucide-react-native";
import Input from "../../../shared/components/Input.jsx";
import Button from "../../../shared/components/Button.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { SHADOWS, BRAND } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import authClient from "../../../shared/api/authClient.js";

const ForgotPasswordScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");
    const { show } = useAlert();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: "" },
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await authClient.post("/forgot-password", { email: data.email });
            setEmail(data.email);
            setSent(true);
        } catch {
            show({ type: "error", title: "Error", message: "No se pudo enviar el correo. Intenta de nuevo." });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <StatusBar barStyle="dark-content" />
                <LinearGradient colors={["#F5EFE6", "#E8D8C3"]} style={styles.hero}>
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        <FadeInView style={[styles.card, SHADOWS.card]}>
                            <View style={styles.center}>
                                <View style={styles.mailIconWrap}>
                                    <Mail size={32} color={BRAND.primary} />
                                </View>
                                <Text style={styles.title}>Revisa tu correo</Text>
                                <Text style={styles.subtitle}>
                                    Te enviamos un enlace de recuperación a{" "}
                                    <Text style={{ fontWeight: "700", color: BRAND.ink }}>{email}</Text>.
                                    {"\n\n"}Haz clic en el enlace para restablecer tu contraseña.
                                </Text>
                                <Button title="Volver al Login" onPress={() => navigation.navigate("Login")} style={{ marginTop: 24 }} />
                            </View>
                        </FadeInView>
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={["#F5EFE6", "#E8D8C3"]} style={styles.hero}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <FadeInView style={[styles.card, SHADOWS.card]}>
                        <Text style={styles.title}>Recuperar Contraseña</Text>
                        <View style={styles.divider} />
                        <Text style={styles.subtitle}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "El correo es obligatorio",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo no válido" },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Correo electrónico"
                                    placeholder="correo@ejemplo.com"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    error={errors.email?.message}
                                />
                            )}
                            name="email"
                        />

                        <Button title={loading ? "Enviando..." : "Enviar enlace"} onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 16 }} />

                        <Text style={styles.backLink} onPress={() => navigation.goBack()}>
                            Volver al inicio de sesión
                        </Text>
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
    subtitle: { fontSize: 13, color: BRAND.muted, textAlign: "center", marginTop: 4, lineHeight: 20 },
    backLink: { fontSize: 13, color: BRAND.primary, textAlign: "center", marginTop: 16, fontWeight: "600" },
    center: { alignItems: "center" },
    mailIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "#F5EFE6", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
    },
};

export default ForgotPasswordScreen;
