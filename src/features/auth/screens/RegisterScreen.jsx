import { useState } from "react";
import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { Mail } from "lucide-react-native";
import Input from "../../../shared/components/Input.jsx";
import Button from "../../../shared/components/Button.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { SHADOWS, BRAND } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { useAuth } from "../hooks/useAuth.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import logo from "../../../../assets/BiteGoLogo.png";

const RegisterScreen = ({ navigation }) => {
    const { handleRegister, handleResendVerification, loading } = useAuth();
    const { show } = useAlert();
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { name: "", surname: "", username: "", email: "", password: "", phone: "" },
    });

    const onSubmit = async (data) => {
        try {
            await handleRegister(data);
            setRegisteredEmail(data.email);
        } catch (error) {
            show({ type: "error", title: "Error al registrarse", message: error.response?.data?.message || "Intenta con otros datos" });
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            await handleResendVerification(registeredEmail);
        } catch {
            show({ type: "error", title: "Error", message: "No se pudo reenviar el correo" });
        } finally {
            setResending(false);
            setCooldown(45);
            const interval = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    if (registeredEmail) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <StatusBar barStyle="dark-content" />
                <LinearGradient colors={["#F5EFE6", "#E8D8C3"]} style={styles.hero}>
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        <FadeInView style={[styles.card, SHADOWS.card]} delay={120}>
                            <View style={{ alignItems: "center" }}>
                                <View style={styles.mailIconWrap}>
                                    <Mail size={32} color={BRAND.primary} />
                                </View>
                                <Text style={styles.verifTitle}>Revisa tu correo</Text>
                                <Text style={styles.verifSub}>
                                    Te enviamos un enlace de verificación a{" "}
                                    <Text style={{ fontWeight: "700", color: BRAND.ink }}>{registeredEmail}</Text>.
                                    {"\n"}Haz clic en el enlace para activar tu cuenta.
                                </Text>
                                <View style={styles.verifTip}>
                                    <Text style={styles.verifTipText}>¿No recibiste el correo?</Text>
                                    <Text style={styles.verifTipSub}>Revisa tu carpeta de spam o solicita un nuevo enlace.</Text>
                                </View>
                                <Text
                                    style={[styles.resendLink, (resending || cooldown > 0) && { color: "#9CA3AF" }]}
                                    onPress={handleResend}
                                    disabled={resending || cooldown > 0}
                                >
                                    {resending ? "Enviando..." : cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar correo"}
                                </Text>
                                <Button title="Ya lo verifiqué, iniciar sesión" onPress={() => navigation.navigate("Login")} style={{ marginTop: 16 }} />
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
                    <FadeInView style={styles.headerWrap}>
                        <Image source={logo} style={styles.logo} />
                        <Text style={styles.subtitle}>Crea tu cuenta</Text>
                    </FadeInView>

                    <FadeInView delay={120} style={[styles.card, SHADOWS.card]}>
                        <Controller control={control} rules={{ required: "Nombre requerido" }} render={({ field: { onChange, value } }) => <Input label="Nombre" placeholder="Tu nombre" onChangeText={onChange} value={value} error={errors.name?.message} />} name="name" />
                        <Controller control={control} rules={{ required: "Apellido requerido" }} render={({ field: { onChange, value } }) => <Input label="Apellido" placeholder="Tu apellido" onChangeText={onChange} value={value} error={errors.surname?.message} />} name="surname" />
                        <Controller control={control} rules={{ required: "Usuario requerido" }} render={({ field: { onChange, value } }) => <Input label="Usuario" placeholder="nombre_usuario" onChangeText={onChange} value={value} autoCapitalize="none" error={errors.username?.message} />} name="username" />
                        <Controller control={control} rules={{ required: "Telefono requerido", pattern: { value: /^\d{8}$/, message: "8 digitos" } }} render={({ field: { onChange, value } }) => <Input label="Telefono" placeholder="12345678" keyboardType="numeric" onChangeText={onChange} value={value} error={errors.phone?.message} />} name="phone" />
                        <Controller control={control} rules={{ required: "Email requerido", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email invalido" } }} render={({ field: { onChange, value } }) => <Input label="Email" placeholder="correo@ejemplo.com" onChangeText={onChange} value={value} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} name="email" />
                        <Controller control={control} rules={{ required: "Contrasena requerida", minLength: { value: 8, message: "Minimo 8 caracteres" } }} render={({ field: { onChange, value } }) => <Input label="Contrasena" placeholder="********" secureTextEntry onChangeText={onChange} value={value} error={errors.password?.message} />} name="password" />
                        <Button title="Crear cuenta" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />
                    </FadeInView>

                    <FadeInView delay={240} style={styles.loginWrap}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>Inicia sesion</Text>
                    </FadeInView>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = {
    flex: { flex: 1 },
    hero: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24, paddingVertical: 40 },
    headerWrap: { alignItems: "center", marginBottom: 24 },
    logo: { width: 220, height: 65, resizeMode: "contain" },
    subtitle: { fontSize: 14, color: BRAND.muted, marginTop: 4, textAlign: "center" },
    card: {
        backgroundColor: "#fff", borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: COLORS.border,
    },
    loginWrap: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, width: "100%" },
    loginText: { fontSize: 14, color: BRAND.muted, textAlign: "center" },
    loginLink: { fontSize: 14, fontWeight: "700", color: BRAND.primary, textAlign: "center" },
    mailIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "#F5EFE6", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
    },
    verifTitle: { fontSize: 22, fontWeight: "800", color: BRAND.ink, textAlign: "center" },
    verifSub: { fontSize: 13, color: BRAND.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
    verifTip: {
        backgroundColor: "#F5EFE6", borderRadius: 12, padding: 16,
        marginTop: 20, width: "100%", alignItems: "center",
    },
    verifTipText: { fontSize: 13, color: BRAND.muted, fontWeight: "600" },
    verifTipSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
    resendLink: { fontSize: 14, color: BRAND.primary, fontWeight: "700", marginTop: 16 },
};

export default RegisterScreen;
