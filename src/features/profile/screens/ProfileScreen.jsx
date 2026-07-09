import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Phone, MapPin, Camera, X, Bell, Home, Star, ChevronRight, LogOut } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { uploadProfilePhoto, deleteProfilePhoto } from "../../../shared/api";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { COLORS } from "../../../shared/constants/theme.js";
import userClient from "../../../shared/api/userClient.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";

const isValidAvatar = (url) =>
    url && url.trim() !== "" && url.includes("res.cloudinary.com") && !url.includes("default-avatar");

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const { show, confirm } = useAlert();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);
    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [reviewCount, setReviewCount] = useState(0);

    const avatarSrc = isValidAvatar(user?.profilePicture)
        ? user.profilePicture
        : isValidAvatar(user?.foto_url)
            ? user.foto_url
            : null;
    const showAvatar = avatarSrc && !imgFailed;

    useEffect(() => { setImgFailed(false); }, [avatarSrc]);

    useFocusEffect(
        useCallback(() => {
            if (!user) { setLoading(false); return; }
            Promise.allSettled([
                userClient.get("/users/me"),
                userClient.get("/users/addresses/list"),
                userClient.get("/reviewsRatings"),
            ]).then(([meRes, addrRes, revRes]) => {
                if (meRes.status === "fulfilled") {
                    const u = meRes.value.data.user || meRes.value.data;
                    setProfile(u);
                    if (u.foto_url || u.profilePicture) {
                        useAuthStore.setState((state) => ({
                            user: { ...state.user, profilePicture: u.foto_url || u.profilePicture },
                        }));
                    }
                }
                if (addrRes.status === "fulfilled") {
                    setAddresses(addrRes.value.data.direcciones || []);
                }
                if (revRes.status === "fulfilled") {
                    setReviewCount((revRes.value.data.reviews || []).length);
                }
            }).finally(() => setLoading(false));
        }, [user])
    );

    const handlePickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        if (asset.fileSize > 5 * 1024 * 1024) {
            show({ type: "error", title: "Imagen muy grande", message: "La imagen no puede superar 5 MB" });
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("foto", {
                uri: asset.uri,
                type: asset.mimeType || "image/jpeg",
                name: asset.fileName || "photo.jpg",
            });
            const { data } = await uploadProfilePhoto(formData);
            if (data.success) {
                useAuthStore.setState((state) => ({
                    user: { ...state.user, profilePicture: data.foto_url },
                }));
                setProfile((prev) => prev ? { ...prev, foto_url: data.foto_url } : prev);
            }
        } catch (err) {
            show({ type: "error", title: "Error al subir", message: err.response?.data?.message || "No se pudo subir la imagen" });
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = () => {
        confirm({
            title: "Eliminar foto",
            message: "¿Eliminar tu foto de perfil?",
            confirmText: "Eliminar",
            onConfirm: async () => {
                try {
                    const { data } = await deleteProfilePhoto();
                    if (data.success) {
                        useAuthStore.setState((state) => ({
                            user: { ...state.user, profilePicture: "" },
                        }));
                        setProfile((prev) => prev ? { ...prev, foto_url: "" } : prev);
                    }
                } catch {}
            },
        });
    };

    const handleLogout = () => {
        confirm({
            title: "Cerrar sesion",
            message: "¿Estas seguro que deseas salir?",
            confirmText: "Salir",
            onConfirm: () => logout(),
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={BRAND.primary} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
                    <TouchableOpacity onPress={handlePickPhoto} disabled={uploading} activeOpacity={0.7} style={styles.avatarTouchable}>
                        <View style={styles.avatarWrap}>
                            {uploading ? (
                                <ActivityIndicator size="large" color="#fff" />
                            ) : showAvatar ? (
                                <Image source={{ uri: avatarSrc }} style={styles.avatarImg} resizeMode="cover" onError={() => setImgFailed(true)} />
                            ) : (
                                <User size={36} color="#fff" />
                            )}
                        </View>
                        <View style={styles.cameraBadge}>
                            <Camera size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {showAvatar && (
                        <TouchableOpacity onPress={handleDeletePhoto} style={styles.deletePhotoBtn}>
                            <X size={12} color="#fff" />
                            <Text style={styles.deletePhotoText}>Eliminar foto</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.heroUsername}>{user?.username || "Usuario"}</Text>
                    <Text style={styles.heroEmail}>{user?.email || ""}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role || "Cliente"}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Informacion personal</Text>
                        <ReadOnlyField icon={User} label="Nombre" value={profile?.nombre || "-"} />
                        <ReadOnlyField icon={Phone} label="Telefono" value={profile?.telefono || "-"} />
                        <ReadOnlyField icon={MapPin} label="Direccion principal" value={profile?.direccion || "-"} last />
                    </View>

                    {addresses.length === 0 && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Addresses")}
                            style={styles.addAddressBanner}
                            activeOpacity={0.7}
                        >
                            <MapPin size={20} color={BRAND.primary} />
                            <View style={styles.addAddressTextWrap}>
                                <Text style={styles.addAddressTitle}>Agrega tu direccion</Text>
                                <Text style={styles.addAddressSub}>Para poder recibir pedidos a domicilio</Text>
                            </View>
                            <ChevronRight size={16} color={BRAND.primary} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.card}>
                        <MenuItem icon={Home} iconColor="#3498DB" label="Mis Direcciones" onPress={() => navigation.navigate("Addresses")} badge={addresses.length > 0 ? `${addresses.length}` : null} />
                        <MenuItem icon={Star} iconColor="#F59E0B" label="Mis Reseñas" onPress={() => navigation.navigate("MyReviews")} badge={reviewCount > 0 ? `${reviewCount}` : null} />
                        <MenuItem icon={Bell} iconColor="#E67E22" label="Notificaciones" onPress={() => navigation.navigate("Notifications")} last />
                    </View>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <LogOut size={18} color={COLORS.error} />
                        <Text style={styles.logoutText}>Cerrar sesion</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>Bite&Go v1.0.0</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const ReadOnlyField = ({ icon: Icon, label, value, last }) => (
    <View style={last ? {} : styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.readOnlyWrap}>
            <Icon size={16} color="#9CA3AF" />
            <Text style={styles.readOnlyValue}>{value}</Text>
        </View>
    </View>
);

const MenuItem = ({ icon: Icon, iconColor, label, onPress, last, badge }) => (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, !last && styles.menuItemBorder]} activeOpacity={0.6}>
        <View style={[styles.menuIconWrap, { backgroundColor: iconColor + "15" }]}>
            <Icon size={16} color={iconColor} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {badge && (
            <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{badge}</Text>
            </View>
        )}
        <ChevronRight size={16} color="#9CA3AF" />
    </TouchableOpacity>
);

const styles = {
    flex: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 40 },
    loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
    loadingText: { marginTop: 10, fontSize: 13, color: COLORS.secondary },

    hero: { alignItems: "center", paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 },
    avatarTouchable: { position: "relative", width: 92, height: 92 },
    avatarWrap: {
        width: 88, height: 88, borderRadius: 44, overflow: "hidden",
        justifyContent: "center", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
    },
    avatarImg: { width: "100%", height: "100%" },
    cameraBadge: {
        position: "absolute", bottom: -2, right: -2,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.darkBg, justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: COLORS.primary,
    },
    deletePhotoBtn: {
        flexDirection: "row", alignItems: "center", marginTop: 8,
        backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    deletePhotoText: { fontSize: 11, color: "#fff", marginLeft: 4, fontWeight: "500" },
    heroUsername: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 12 },
    heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 },
    roleBadge: {
        marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12,
    },
    roleText: { fontSize: 12, fontWeight: "600", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 },

    body: { paddingHorizontal: 16, paddingTop: 20 },
    card: {
        backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 14,
        borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 14 },

    fieldWrap: { marginBottom: 12 },
    fieldLabel: { fontSize: 12, fontWeight: "600", color: COLORS.secondary, marginBottom: 5 },
    readOnlyWrap: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
        backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 10,
    },
    readOnlyValue: { marginLeft: 8, fontSize: 14, color: COLORS.text, flex: 1 },

    addAddressBanner: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: COLORS.primary + "10", borderRadius: 14,
        borderWidth: 1, borderColor: COLORS.primary + "30",
        padding: 14, marginBottom: 14, gap: 12,
    },
    addAddressTextWrap: { flex: 1 },
    addAddressTitle: { fontSize: 14, fontWeight: "700", color: BRAND.primary },
    addAddressSub: { fontSize: 12, color: COLORS.secondary, marginTop: 2 },

    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    menuIconWrap: {
        width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center",
    },
    menuLabel: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600", color: COLORS.text },
    menuBadge: {
        backgroundColor: COLORS.primary, borderRadius: 10,
        minWidth: 22, height: 22, justifyContent: "center", alignItems: "center", marginRight: 6,
    },
    menuBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },

    logoutBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.error + "40",
        paddingVertical: 14, marginTop: 6, gap: 8,
    },
    logoutText: { fontSize: 14, fontWeight: "600", color: COLORS.error },

    version: { textAlign: "center", fontSize: 11, color: COLORS.secondary, marginTop: 20 },
};

export default ProfileScreen;
