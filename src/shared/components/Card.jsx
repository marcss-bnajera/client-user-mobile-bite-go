import { View } from "react-native";
import { SHADOWS } from "../constants/tokens";

/**
 * Superficie base de tarjeta. Padding por defecto p-4; pásale
 * className="p-0 overflow-hidden" cuando quieras imágenes a sangre.
 */
export default function Card({ children, className = "", style }) {
    return (
        <View
            style={[SHADOWS.card, style]}
            className={`rounded-2xl bg-surface p-4 ${className}`}
        >
            {children}
        </View>
    );
}
