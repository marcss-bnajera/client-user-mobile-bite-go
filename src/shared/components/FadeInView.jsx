import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

/**
 * Animación de entrada (fade + subida) con el Animated NATIVO de RN.
 * Reemplaza el `entering={FadeInDown}` de reanimated. Acepta `delay` para
 * escalonar listas. El `className` se aplica a una View interna para máxima
 * compatibilidad con NativeWind.
 */
export default function FadeInView({
    children,
    delay = 0,
    duration = 400,
    translateY = 12,
    className = "",
    style,
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translate = useRef(new Animated.Value(translateY)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translate, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[{ opacity, transform: [{ translateY: translate }] }, style]}
        >
            <View className={className}>{children}</View>
        </Animated.View>
    );
}
