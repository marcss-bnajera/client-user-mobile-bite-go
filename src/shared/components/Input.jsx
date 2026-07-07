import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { BRAND } from "../constants/tokens";

export default function Input({ label, placeholder, onChangeText, value, error, secureTextEntry = false, autoCapitalize = "sentences", keyboardType = "default" }) {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secureTextEntry);
    const borderClass = error ? "border-danger" : focused ? "border-primary" : "border-line";

    return (
        <View className="mb-4">
            {label && <Text className="mb-1.5 text-sm font-semibold text-ink">{label}</Text>}
            <View className={`h-14 flex-row items-center rounded-xl border-2 bg-surface px-4 ${borderClass}`}>
                <TextInput
                    className="flex-1 text-base text-ink"
                    placeholder={placeholder}
                    placeholderTextColor={BRAND.faint}
                    onChangeText={onChangeText}
                    value={value}
                    secureTextEntry={hidden}
                    autoCapitalize={autoCapitalize}
                    keyboardType={keyboardType}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {secureTextEntry && (
                    <Pressable onPress={() => setHidden(h => !h)} hitSlop={10} className="pl-2">
                        {hidden ? <Eye size={20} color={BRAND.muted} /> : <EyeOff size={20} color={BRAND.muted} />}
                    </Pressable>
                )}
            </View>
            {error && <Text className="mt-1 text-xs font-medium text-danger">{error}</Text>}
        </View>
    );
}
