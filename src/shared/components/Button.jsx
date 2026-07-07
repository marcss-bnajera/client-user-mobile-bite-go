import { Text, ActivityIndicator, View } from "react-native";
import PressableScale from "./PressableScale";
import { SHADOWS, BRAND } from "../constants/tokens";

const VARIANTS = {
    primary: {
        container: "bg-primary",
        text: "text-white",
        spinner: "#FFFFFF",
        shadow: SHADOWS.primary,
    },
    secondary: {
        container: "bg-surface border-2 border-primary",
        text: "text-primary",
        spinner: BRAND.primary,
        shadow: SHADOWS.soft,
    },
    ghost: {
        container: "bg-transparent",
        text: "text-primary",
        spinner: BRAND.primary,
        shadow: null,
    },
    danger: {
        container: "bg-surface border-2 border-danger",
        text: "text-danger",
        spinner: BRAND.danger,
        shadow: SHADOWS.soft,
    },
};

/**
 * Botón principal. Conserva la API original (title, onPress, variant, style)
 * y añade `loading`/`disabled` + feedback de escala al presionar.
 */
export default function Button({
    title,
    onPress,
    variant = "primary",
    loading = false,
    disabled = false,
    style,
    className = "",
    icon = null,
}) {
    const v = VARIANTS[variant] ?? VARIANTS.primary;
    const isDisabled = disabled || loading;

    return (
        <PressableScale
            onPress={onPress}
            disabled={isDisabled}
            style={[v.shadow, style]}
            className={`h-14 flex-row items-center justify-center rounded-2xl px-6 ${v.container} ${isDisabled ? "opacity-60" : ""} ${className}`}
        >
            {loading ? (
                <ActivityIndicator color={v.spinner} />
            ) : (
                <View className="flex-row items-center">
                    {icon ? <View className="mr-2">{icon}</View> : null}
                    <Text className={`text-base font-bold tracking-wide ${v.text}`}>
                        {title}
                    </Text>
                </View>
            )}
        </PressableScale>
    );
}
