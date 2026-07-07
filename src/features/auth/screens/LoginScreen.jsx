import { View, Text, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import FadeInView from "../../../shared/components/FadeInView";
import { SHADOWS } from "../../../shared/constants/tokens";
import { useAuth } from "../hooks/useAuth";
import logo from "../../../../assets/BiteGoLogo.png";

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { emailOrUsername: "", password: "" },
    });

    const onSubmit = async (data) => {
        try { await handleLogin(data); }
        catch (error) { Alert.alert("Error", error.response?.data?.message || "Error al iniciar sesión"); }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-canvas">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
                <FadeInView className="mb-10 items-center">
                    <Image source={logo} style={{ width: 200, height: 60, resizeMode: "contain" }} />
                    <Text className="mt-2 text-sm text-muted">Los mejores restaurantes, en tu bolsillo</Text>
                </FadeInView>

                <FadeInView delay={120} style={SHADOWS.card} className="rounded-3xl bg-surface p-6">
                    <Text className="mb-5 text-xl font-bold text-ink">Bienvenido de vuelta</Text>

                    <Controller control={control} rules={{ required: "Email o usuario requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input label="Email o usuario" placeholder="correo@ejemplo.com" onChangeText={onChange} value={value} autoCapitalize="none" error={errors.emailOrUsername?.message} />
                        )} name="emailOrUsername" />

                    <Controller control={control} rules={{ required: "Contraseña requerida" }}
                        render={({ field: { onChange, value } }) => (
                            <Input label="Contraseña" placeholder="••••••••" secureTextEntry onChangeText={onChange} value={value} autoCapitalize="none" error={errors.password?.message} />
                        )} name="password" />

                    <Button title="Iniciar sesión" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />
                </FadeInView>

                <FadeInView delay={240} className="mt-8 flex-row justify-center">
                    <Text className="text-base text-muted">¿No tienes cuenta? </Text>
                    <Text className="text-base font-bold text-primary" onPress={() => navigation.navigate("Register")}>Regístrate</Text>
                </FadeInView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
