import { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Clock, Phone, ArrowLeft, Star, Store, X } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";
import Button from "../../../shared/components/Button.jsx";
import SucursalPickerModal from "../../../shared/components/SucursalPickerModal.jsx";
import userClient from "../../../shared/api/userClient.js";
import { BRAND } from "../../../shared/constants/tokens.js";

const RestaurantDetailScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("menu");
    const sucursalModalRef = useRef(null);

    useEffect(() => {
        Promise.all([
            userClient.get(`/products/restaurant/${restaurant._id}`),
            userClient.get("/categories", { params: { restaurante: restaurant._id } }),
            userClient.get(`/reviewsRatings/restaurant/${restaurant._id}`),
        ]).then(([prodRes, catRes, revRes]) => {
            setProducts(prodRes.data.products || []);
            setCategories(catRes.data.categories || []);
            setReviews(revRes.data.reviews || []);
        }).finally(() => setLoading(false));
    }, [restaurant._id]);

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter((p) => p.categoria?._id === activeCategory);

    const hasSucursales = restaurant.tiene_sucursales && restaurant.sucursales?.length > 0;

    const getSucursalName = (id_sucursal) => {
        if (!id_sucursal || !hasSucursales) return null;
        const suc = restaurant.sucursales.find((s) => s._id === id_sucursal);
        return suc?.nombre || null;
    };

    const filteredReviews = useMemo(() => {
        const limited = selectedSucursal
            ? reviews.filter((r) => r.id_sucursal === selectedSucursal._id)
            : reviews;
        return limited.slice(0, 5);
    }, [reviews, selectedSucursal]);

    const avgRating = filteredReviews.length > 0
        ? (filteredReviews.reduce((s, r) => s + (r.calificacion || 0), 0) / filteredReviews.length).toFixed(1)
        : null;

    const handleOrder = () => {
        if (hasSucursales && !selectedSucursal) {
            return;
        }
        navigation.navigate("CreateOrder", {
            restaurant,
            id_sucursal: selectedSucursal?._id || "",
        });
    };

    const canOrder = !hasSucursales || !!selectedSucursal;

    return (
        <View style={styles.flex}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
                    {restaurant.fotos_url?.[0] && (
                        <Image source={{ uri: restaurant.fotos_url[0] }} style={styles.heroBg} resizeMode="cover" />
                    )}
                    <LinearGradient
                        colors={restaurant.fotos_url?.[0] ? ["rgba(58,46,42,0.3)", "rgba(58,46,42,0.1)"] : ["transparent", "transparent"]}
                        style={styles.heroOverlay}
                    />
                    <View style={styles.heroTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroName}>{restaurant.nombre}</Text>
                        <View style={styles.metaRow}>
                            <MapPin size={13} color="rgba(255,255,255,0.85)" />
                            <Text style={styles.metaText}>{restaurant.direccion?.texto}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Clock size={13} color="rgba(255,255,255,0.85)" />
                            <Text style={styles.metaText}>{restaurant.horarios_atencion}</Text>
                        </View>
                        {restaurant.informacion_contacto?.telefono && (
                            <View style={styles.metaRow}>
                                <Phone size={13} color="rgba(255,255,255,0.85)" />
                                <Text style={styles.metaText}>{restaurant.informacion_contacto.telefono}</Text>
                            </View>
                        )}
                        <View style={styles.badgeRow}>
                            <View style={styles.heroBadge}>
                                <Text style={styles.heroBadgeText}>{restaurant.categoria_gastronomica}</Text>
                            </View>
                            {restaurant.precio_promedio > 0 && (
                                <View style={styles.heroBadge}>
                                    <Text style={styles.heroBadgeText}>Q{restaurant.precio_promedio} promedio</Text>
                                </View>
                            )}
                            {avgRating && (
                                <View style={styles.heroBadge}>
                                    <Star size={12} color="#fff" fill="#fff" />
                                    <Text style={[styles.heroBadgeText, { marginLeft: 3 }]}>{avgRating}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    {hasSucursales && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sucursales</Text>
                            <TouchableOpacity style={styles.sucursalBtn} onPress={() => sucursalModalRef.current?.present()}>
                                <Store size={18} color={COLORS.primary} />
                                <Text style={styles.sucursalBtnText} numberOfLines={1}>
                                    {selectedSucursal ? selectedSucursal.nombre : "Seleccionar sucursal..."}
                                </Text>
                                {selectedSucursal ? (
                                    <TouchableOpacity onPress={() => setSelectedSucursal(null)} hitSlop={8}>
                                        <X size={18} color="#C0392B" />
                                    </TouchableOpacity>
                                ) : (
                                    <MaterialIcons name="chevron-right" size={20} color={COLORS.secondary} />
                                )}
                            </TouchableOpacity>
                            {selectedSucursal && (
                                <View style={styles.sucursalDetail}>
                                    <MapPin size={13} color={COLORS.primary} />
                                    <Text style={styles.sucursalAddress}>{selectedSucursal.direccion?.texto}</Text>
                                </View>
                            )}
                            <SucursalPickerModal
                                ref={sucursalModalRef}
                                onSelect={(s) => setSelectedSucursal(s)}
                                sucursales={restaurant.sucursales || []}
                                selectedId={selectedSucursal?._id}
                            />
                        </View>
                    )}

                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            onPress={() => setActiveTab("menu")}
                            style={[styles.tab, activeTab === "menu" && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, activeTab === "menu" && styles.tabTextActive]}>Menu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab("reviews")}
                            style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, activeTab === "reviews" && styles.tabTextActive]}>
                                Reseñas ({filteredReviews.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === "menu" && (
                        <>
                            {categories.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                    <TouchableOpacity
                                        onPress={() => setActiveCategory("all")}
                                        style={[styles.catChip, activeCategory === "all" && styles.catChipActive]}
                                    >
                                        <Text style={[styles.catText, activeCategory === "all" && styles.catTextActive]}>Todos</Text>
                                    </TouchableOpacity>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat._id}
                                            onPress={() => setActiveCategory(cat._id)}
                                            style={[styles.catChip, activeCategory === cat._id && styles.catChipActive]}
                                        >
                                            <Text style={[styles.catText, activeCategory === cat._id && styles.catTextActive]}>{cat.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {loading ? <LoadingSpinner /> : filteredProducts.length === 0 ? (
                                <EmptyState message="No hay productos disponibles" />
                            ) : (
                                filteredProducts.map((p) => (
                                    <View key={p._id} style={styles.productCard}>
                                        {p.foto_url ? (
                                            <Image source={{ uri: Array.isArray(p.foto_url) ? p.foto_url[0] : p.foto_url }} style={styles.productImage} resizeMode="cover" />
                                        ) : (
                                            <View style={[styles.productImage, styles.productImagePlaceholder]}>
                                                <Text style={styles.productImagePlaceholderText}>{p.nombre?.charAt(0) || "?"}</Text>
                                            </View>
                                        )}
                                        <View style={styles.productLeft}>
                                            <Text style={styles.productName}>{p.nombre}</Text>
                                            {p.descripcion && <Text style={styles.productDesc} numberOfLines={2}>{p.descripcion}</Text>}
                                            <Text style={styles.productPrice}>Q{p.precio}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </>
                    )}

                    {activeTab === "reviews" && (
                        <>
                            {filteredReviews.length === 0 ? (
                                <EmptyState message={selectedSucursal ? "No hay reseñas para esta sucursal" : "No hay reseñas aun"} />
                            ) : (
                                filteredReviews.map((rev) => {
                                    const sucName = !selectedSucursal ? getSucursalName(rev.id_sucursal) : null;
                                    return (
                                        <View key={rev._id} style={styles.reviewCard}>
                                            <View style={styles.reviewHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.reviewUser}>{rev.id_usuario?.nombre || "Usuario"}</Text>
                                                    {sucName && (
                                                        <View style={styles.reviewSucBadge}>
                                                            <Store size={10} color={COLORS.primary} />
                                                            <Text style={styles.reviewSucText}>{sucName}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.starsRow}>
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <Star key={n} size={13} color={BRAND.primary} fill={n <= rev.calificacion ? BRAND.primary : "transparent"} />
                                                    ))}
                                                </View>
                                            </View>
                                            {rev.comentario && <Text style={styles.reviewComment}>{rev.comentario}</Text>}
                                            <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString("es-GT")}</Text>
                                        </View>
                                    );
                                })
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {activeTab === "menu" && (
                <View style={styles.footer}>
                    {hasSucursales && !selectedSucursal && (
                        <Text style={styles.footerWarning}>Selecciona una sucursal para continuar</Text>
                    )}
                    <Button title="Hacer Pedido" onPress={handleOrder} disabled={!canOrder} />
                </View>
            )}
        </View>
    );
};

const styles = {
    flex: { flex: 1, backgroundColor: COLORS.background },
    hero: { paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16, position: "relative", overflow: "hidden" },
    heroBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.25 },
    heroOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    heroTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, zIndex: 10 },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
    },
    heroContent: { position: "relative", zIndex: 5 },
    heroName: { fontSize: 22, fontWeight: "800", color: "#fff" },
    metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 },
    metaText: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
    heroBadge: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    heroBadgeText: { fontSize: 12, fontWeight: "600", color: "#fff" },

    body: { padding: 16 },
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
    sucursalBtn: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
        borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, gap: 8,
    },
    sucursalBtnText: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.text },
    sucursalDetail: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
    sucursalAddress: { fontSize: 13, color: COLORS.secondary },

    tabBar: { flexDirection: "row", gap: 8, marginBottom: 16 },
    tab: {
        flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
        backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border,
    },
    tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tabText: { fontSize: 14, fontWeight: "600", color: COLORS.secondary },
    tabTextActive: { color: "#fff" },

    catScroll: { marginBottom: 12 },
    catChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
        backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
    },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 13, color: COLORS.secondary, fontWeight: "600" },
    catTextActive: { color: "#fff" },

    productCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    productImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
    productImagePlaceholder: {
        backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center",
    },
    productImagePlaceholderText: { fontSize: 22, fontWeight: "700", color: COLORS.textLight },
    productLeft: { flex: 1 },
    productName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
    productDesc: { fontSize: 12, color: COLORS.secondary, marginTop: 3 },
    productPrice: { fontSize: 15, fontWeight: "700", color: COLORS.primary, marginTop: 4 },

    reviewCard: {
        backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    reviewUser: { fontSize: 14, fontWeight: "700", color: COLORS.text },
    reviewSucBadge: {
        flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3,
        backgroundColor: COLORS.primary + "10", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
        alignSelf: "flex-start",
    },
    reviewSucText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
    starsRow: { flexDirection: "row", gap: 2 },
    reviewComment: { fontSize: 13, color: COLORS.secondary, marginTop: 6 },
    reviewDate: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },

    footer: { padding: 16, paddingBottom: 32, backgroundColor: COLORS.background },
    footerWarning: { fontSize: 13, color: "#C0392B", fontWeight: "600", textAlign: "center", marginBottom: 8 },
};

export default RestaurantDetailScreen;
