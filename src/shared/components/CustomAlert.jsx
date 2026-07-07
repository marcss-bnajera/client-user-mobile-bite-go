import { useEffect, useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BRAND, SHADOWS } from "../constants/tokens";

const TYPE_CONFIG = {
    success: {
        color: "#0F6E56",
        bg: "#0F6E5615",
        icon: "check-circle",
        defaultTitle: "Listo",
    },
    error: {
        color: "#C0392B",
        bg: "#C0392B15",
        icon: "error",
        defaultTitle: "Algo salio mal",
    },
    warning: {
        color: "#F59E0B",
        bg: "#F59E0B15",
        icon: "warning",
        defaultTitle: "Atencion",
    },
    info: {
        color: BRAND.primary,
        bg: BRAND.primary + "15",
        icon: "info",
        defaultTitle: "Bite & Go",
    },
    confirm: {
        color: "#C0392B",
        bg: "#C0392B15",
        icon: "help-outline",
        defaultTitle: "Confirmar accion",
    },
};

export default function CustomAlert({ visible, type = "info", title, message, buttons = [], onClose }) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const scale = useRef(new Animated.Value(0.85)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scale.setValue(0.85);
            opacity.setValue(0);
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, { toValue: 0.85, duration: 150, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleButtonPress = (btn) => {
        onClose();
        if (btn.onPress) btn.onPress();
    };

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity }]} />
            </Pressable>
            <View style={styles.center}>
                <Animated.View style={[styles.card, SHADOWS.card, { transform: [{ scale }] }]}>
                    <View style={[styles.accentBar, { backgroundColor: config.color }]} />

                    <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                        <MaterialIcons name={config.icon} size={36} color={config.color} />
                    </View>

                    <Text style={styles.title}>{title || config.defaultTitle}</Text>
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <View style={styles.buttonRow}>
                        {buttons.length === 0 ? (
                            <TouchableOpacity style={[styles.button, { backgroundColor: config.color }]} onPress={onClose} activeOpacity={0.8}>
                                <Text style={styles.buttonText}>Entendido</Text>
                            </TouchableOpacity>
                        ) : (
                            buttons.map((btn, i) => {
                                const isCancel = btn.style === "cancel";
                                const isDestructive = btn.style === "destructive";
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.button,
                                            isCancel && styles.buttonCancel,
                                            isDestructive && { backgroundColor: btn.color || config.color },
                                            buttons.length > 1 && !isCancel && { flex: 1 },
                                            isCancel && buttons.length > 1 && { flex: 1 },
                                        ]}
                                        onPress={() => handleButtonPress(btn)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            isCancel && styles.buttonCancelText,
                                            isDestructive && { color: "#fff" },
                                        ]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = {
    backdrop: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: "center", alignItems: "center",
    },
    overlay: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(42, 42, 42, 0.55)",
    },
    center: {
        flex: 1, justifyContent: "center", alignItems: "center",
        paddingHorizontal: 32,
    },
    card: {
        width: "100%", maxWidth: 340,
        backgroundColor: "#fff", borderRadius: 24, overflow: "hidden",
        borderWidth: 1, borderColor: BRAND.line,
        paddingTop: 0,
    },
    accentBar: {
        height: 5, width: "100%",
    },
    iconCircle: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: "center", alignItems: "center",
        alignSelf: "center", marginTop: 24,
    },
    title: {
        fontSize: 18, fontWeight: "800", color: BRAND.ink,
        textAlign: "center", marginTop: 16, marginHorizontal: 24,
    },
    message: {
        fontSize: 14, color: BRAND.muted, lineHeight: 20,
        textAlign: "center", marginTop: 8, marginHorizontal: 24, marginBottom: 24,
    },
    buttonRow: {
        flexDirection: "row", gap: 10,
        paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4,
    },
    button: {
        flex: 1, height: 48, borderRadius: 14,
        backgroundColor: BRAND.primary,
        justifyContent: "center", alignItems: "center",
    },
    buttonCancel: {
        backgroundColor: "transparent", borderWidth: 1.5, borderColor: BRAND.line,
    },
    buttonText: {
        fontSize: 15, fontWeight: "700", color: "#fff",
    },
    buttonCancelText: {
        color: BRAND.muted,
    },
};
