import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import Input from "../../../shared/components/Input.jsx";
import Button from "../../../shared/components/Button.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { SHADOWS, BRAND } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { useAuth } from "../hooks/useAuth.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import logo from "../../../../assets/BiteGoLogo.png";

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();
    const { show } = useAlert();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { emailOrUsername: "", password: "" },
    });

    const getErrorMessage = (raw) => {
        if (!raw) return "Verifica tus credenciales e intenta de nuevo";
        if (raw === "User account is disabled") {
            return "Tu cuenta no está activada. Revisa tu correo y haz clic en el enlace de verificación.";
        }
        return raw;
    };

    const onSubmit = async (data) => {
        try { await handleLogin(data); }
        catch (error) {
            const raw = error.response?.data?.message;
            show({ type: "error", title: "Error al iniciar sesion", message: getErrorMessage(raw) });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={["#F5EFE6", "#E8D8C3"]} style={styles.hero}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <FadeInView style={styles.logoWrap}>
                        <Image source={logo} style={styles.logo} />
                        <Text style={styles.tagline}>Los mejores restaurantes, en tu bolsillo</Text>
                    </FadeInView>

                    <FadeInView delay={120} style={[styles.card, SHADOWS.card]}>
                        <Text style={styles.cardTitle}>Bienvenido de vuelta</Text>
                        <Text style={styles.cardSubtitle}>Inicia sesion para continuar</Text>

                        <Controller control={control} rules={{ required: "Email o usuario requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input label="Email o usuario" placeholder="correo@ejemplo.com" onChangeText={onChange} value={value} autoCapitalize="none" error={errors.emailOrUsername?.message} />
                            )} name="emailOrUsername" />

                        <Controller control={control} rules={{ required: "Contrasena requerida" }}
                            render={({ field: { onChange, value } }) => (
                                <Input label="Contrasena" placeholder="********" secureTextEntry onChangeText={onChange} value={value} autoCapitalize="none" error={errors.password?.message} />
                            )} name="password" />

                        <Button title="Iniciar sesion" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />

                        <Text style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
                            ¿Olvidaste tu contraseña?
                        </Text>
                    </FadeInView>

                    <FadeInView delay={240} style={styles.registerWrap}>
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <Text style={styles.registerLink} onPress={() => navigation.navigate("Register")}>Registrate</Text>
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
    logoWrap: { alignItems: "center", marginBottom: 32 },
    logo: { width: 220, height: 65, resizeMode: "contain" },
    tagline: { fontSize: 14, color: BRAND.muted, marginTop: 8, textAlign: "center" },
    card: {
        backgroundColor: "#fff", borderRadius: 20, padding: 24,
        borderWidth: 1, borderColor: COLORS.border,
    },
    cardTitle: { fontSize: 22, fontWeight: "800", color: BRAND.ink },
    cardSubtitle: { fontSize: 13, color: BRAND.muted, marginTop: 2, marginBottom: 20 },
    forgotPassword: { fontSize: 13, color: BRAND.primary, textAlign: "center", marginTop: 12, fontWeight: "600" },
    registerWrap: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24, width: "100%" },
    registerText: { fontSize: 14, color: BRAND.muted, textAlign: "center" },
    registerLink: { fontSize: 14, fontWeight: "700", color: BRAND.primary, textAlign: "center" },
};

export default LoginScreen;
