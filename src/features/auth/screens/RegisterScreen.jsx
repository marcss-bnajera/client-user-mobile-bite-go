import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import FadeInView from "../../../shared/components/FadeInView";
import { SHADOWS } from "../../../shared/constants/tokens";
import { useAuth } from "../hooks/useAuth";

const RegisterScreen = ({ navigation }) => {
    const { handleRegister, loading } = useAuth();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { name: "", surname: "", username: "", email: "", password: "", phone: "" },
    });

    const onSubmit = async (data) => {
        try {
            await handleRegister(data);
            Alert.alert("Registro exitoso", "Tu cuenta ha sido creada. Ahora puedes iniciar sesión", [
                { text: "OK", onPress: () => navigation.navigate("Login") },
            ]);
        } catch (error) { Alert.alert("Error", error.response?.data?.message || "Error al registrarse"); }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-canvas">
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingVertical: 40 }} keyboardShouldPersistTaps="handled">
                <FadeInView className="mb-6 mt-2 items-center">
                    <Text className="text-5xl font-extrabold text-ink">
                        Bite<Text className="text-primary">&</Text>Go
                    </Text>
                    <Text className="mt-2 text-base text-muted">Crea tu cuenta</Text>
                </FadeInView>

                <FadeInView delay={120} style={SHADOWS.card} className="rounded-3xl bg-surface p-6">
                    <Controller control={control} rules={{ required: "Nombre requerido" }} render={({ field: { onChange, value } }) => <Input label="Nombre" placeholder="Tu nombre" onChangeText={onChange} value={value} error={errors.name?.message} />} name="name" />
                    <Controller control={control} rules={{ required: "Apellido requerido" }} render={({ field: { onChange, value } }) => <Input label="Apellido" placeholder="Tu apellido" onChangeText={onChange} value={value} error={errors.surname?.message} />} name="surname" />
                    <Controller control={control} rules={{ required: "Usuario requerido" }} render={({ field: { onChange, value } }) => <Input label="Usuario" placeholder="nombre_usuario" onChangeText={onChange} value={value} autoCapitalize="none" error={errors.username?.message} />} name="username" />
                    <Controller control={control} rules={{ required: "Teléfono requerido", pattern: { value: /^\d{8}$/, message: "8 dígitos" } }} render={({ field: { onChange, value } }) => <Input label="Teléfono" placeholder="12345678" keyboardType="numeric" onChangeText={onChange} value={value} error={errors.phone?.message} />} name="phone" />
                    <Controller control={control} rules={{ required: "Email requerido", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } }} render={({ field: { onChange, value } }) => <Input label="Email" placeholder="correo@ejemplo.com" onChangeText={onChange} value={value} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} name="email" />
                    <Controller control={control} rules={{ required: "Contraseña requerida", minLength: { value: 8, message: "Mínimo 8 caracteres" } }} render={({ field: { onChange, value } }) => <Input label="Contraseña" placeholder="••••••••" secureTextEntry onChangeText={onChange} value={value} error={errors.password?.message} />} name="password" />
                    <Button title="Crear cuenta" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />
                </FadeInView>

                <FadeInView delay={240} className="mb-6 mt-8 flex-row justify-center">
                    <Text className="text-base text-muted">¿Ya tienes cuenta? </Text>
                    <Text className="text-base font-bold text-primary" onPress={() => navigation.navigate("Login")}>Inicia sesión</Text>
                </FadeInView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;
