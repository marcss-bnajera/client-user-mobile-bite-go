import { useRef } from "react";
import { Pressable, Animated, View } from "react-native";

/**
 * Pressable con micro-interacción de escala usando el Animated NATIVO de RN.
 * Sin react-native-reanimated: no requiere plugin de Babel, worklets ni
 * New Architecture. El estilo visual va en `className`; el `style` (sombra,
 * margen) se aplica sobre la misma vista redondeada para que la sombra
 * respete la forma.
 */
export default function PressableScale({
    children,
    onPress,
    disabled = false,
    className = "",
    style,
    scaleTo = 0.97,
    hitSlop,
    ...props
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const animateTo = (value) =>
        Animated.spring(scale, {
            toValue: value,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
        }).start();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            hitSlop={hitSlop}
            onPressIn={() => animateTo(scaleTo)}
            onPressOut={() => animateTo(1)}
            {...props}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <View className={className} style={style}>
                    {children}
                </View>
            </Animated.View>
        </Pressable>
    );
}
