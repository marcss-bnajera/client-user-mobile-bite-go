import { forwardRef, useImperativeHandle, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate, Extrapolation } from "react-native-reanimated";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.88;
const DISMISS_THRESHOLD = SHEET_H * 0.3;
const VELOCITY_THRESHOLD = 800;

const springBack = { damping: 28, stiffness: 220, mass: 1 };
const springDismiss = { damping: 35, stiffness: 300, mass: 1 };

const BottomSheet = forwardRef(({ children, onDismiss, title }, ref) => {
    const [visible, setVisible] = useState(false);
    const translateY = useSharedValue(SHEET_H);

    const dismiss = () => {
        translateY.value = withSpring(SHEET_H, springDismiss, () => {
            runOnJS(setVisible)(false);
            if (onDismiss) runOnJS(onDismiss)();
        });
    };

    const open = () => {
        setVisible(true);
        translateY.value = SHEET_H;
        translateY.value = withSpring(0, springBack);
    };

    useImperativeHandle(ref, () => ({
        present: () => open(),
        dismiss: () => dismiss(),
    }));

    const handlePan = Gesture.Pan()
        .onUpdate((e) => {
            const newY = e.translationY;
            translateY.value = Math.max(0, newY);
        })
        .onEnd((e) => {
            const pos = translateY.value;
            const vel = e.velocityY;
            if (pos > DISMISS_THRESHOLD || vel > VELOCITY_THRESHOLD) {
                translateY.value = withSpring(SHEET_H, springDismiss, () => {
                    runOnJS(setVisible)(false);
                    if (onDismiss) runOnJS(onDismiss)();
                });
            } else {
                translateY.value = withSpring(0, springBack);
            }
        });

    const backdropOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateY.value, [0, SHEET_H], [0.5, 0], Extrapolation.CLAMP),
        pointerEvents: translateY.value > SHEET_H * 0.9 ? "none" : "auto",
    }));

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Modal visible={visible} transparent animationType="none">
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropOpacity]}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={dismiss} />
                </Animated.View>
                <Animated.View style={[styles.sheet, sheetStyle]}>
                    <GestureDetector gesture={handlePan}>
                        <View style={styles.handleWrap}>
                            <View style={styles.handle} />
                            {title && <Text style={styles.handleTitle}>{title}</Text>}
                        </View>
                    </GestureDetector>
                    {children}
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
});

export default BottomSheet;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SHEET_H,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleWrap: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 4,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D1D5DB",
    },
    handleTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#2B2B2B",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 4,
        paddingHorizontal: 16,
    },
});
