import { View, Text, ActivityIndicator } from "react-native";
import { Inbox } from "lucide-react-native";
import Card from "./Card";
import FadeInView from "./FadeInView";
import { BRAND, STATUS_HEX } from "../constants/tokens";

export const LoadingSpinner = ({ message = "Cargando…" }) => (
    <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={BRAND.primary} />
        <Text className="mt-3 text-sm font-medium text-muted">{message}</Text>
    </View>
);

export const EmptyState = ({ message = "Sin resultados" }) => (
    <FadeInView className="flex-1 items-center justify-center px-10 py-20">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/5">
            <Inbox size={34} color={BRAND.primaryLight} strokeWidth={1.6} />
        </View>
        <Text className="text-center text-base font-semibold text-ink">{message}</Text>
        <Text className="mt-1 text-center text-sm text-faint">Desliza hacia abajo para actualizar.</Text>
    </FadeInView>
);

export const StatusBadge = ({ status }) => {
    const bg = STATUS_HEX[status] || "#D6D6D6";
    return (
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: bg }}>
            <Text className="text-[11px] font-bold tracking-wide text-[#33383F]">{status}</Text>
        </View>
    );
};

export { Card };
