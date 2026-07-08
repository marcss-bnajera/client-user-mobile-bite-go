import { useCallback, useState, useMemo } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, Clock, Heart, MapPin, Bell, Flame, Utensils } from "lucide-react-native";
import { useRestaurants } from "../hooks/useRestaurants.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { COLORS } from "../../../shared/constants/theme.js";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";
import PressableScale from "../../../shared/components/PressableScale.jsx";

const getETA = () => Math.floor(Math.random() * 31) + 15;

const RestaurantCard = ({ item, onPress, isFavorite, onToggleFavorite }) => {
    const eta = useMemo(getETA, [item._id]);

    return (
        <PressableScale onPress={onPress} style={styles.cardShadow}>
            <View style={styles.card}>
                <View style={styles.imageWrap}>
                    {item.fotos_url?.[0] ? (
                        <Image source={{ uri: item.fotos_url[0] }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Utensils size={42} color={COLORS.secondary} />
                        </View>
                    )}

                    <LinearGradient
                        colors={["transparent", "rgba(20,15,12,0.05)", "rgba(20,15,12,0.75)"]}
                        locations={[0, 0.55, 1]}
                        style={styles.imageGradient}
                    />

                    <LinearGradient
                        colors={["rgba(20,15,12,0.35)", "transparent"]}
                        style={styles.imageTopGradient}
                        pointerEvents="none"
                    />

                    <TouchableOpacity
                        onPress={onToggleFavorite}
                        style={styles.heartBtn}
                        hitSlop={10}
                        activeOpacity={0.7}
                    >
                        <Heart
                            size={18}
                            color={isFavorite ? COLORS.error : "#fff"}
                            fill={isFavorite ? COLORS.error : "transparent"}
                            strokeWidth={2.25}
                        />
                    </TouchableOpacity>

                    {item.precio_promedio > 250 && (
                        <View style={styles.popularBadge}>
                            <Flame size={11} color="#fff" />
                            <Text style={styles.popularText}>Popular</Text>
                        </View>
                    )}

                    <View style={styles.etaBadge}>
                        <Clock size={11} color="#fff" />
                        <Text style={styles.etaText}>{eta} min</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.titleRow}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.nombre}</Text>
                        {item.precio_promedio > 0 && (
                            <Text style={styles.priceText}>Q{item.precio_promedio}</Text>
                        )}
                    </View>

                    <View style={styles.addressRow}>
                        <MapPin size={12} color={COLORS.secondary} />
                        <Text style={styles.cardAddress} numberOfLines={1}>
                            {item.direccion?.texto || "Direccion no disponible"}
                        </Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText} numberOfLines={1}>{item.categoria_gastronomica}</Text>
                        </View>
                        {item.tiene_sucursales && item.sucursales?.length > 0 && (
                            <View style={styles.sucursalPill}>
                                <View style={styles.sucursalDot} />
                                <Text style={styles.sucursalText}>{item.sucursales.length} sucursal(es)</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </PressableScale>
    );
};

const RestaurantsScreen = ({ navigation }) => {
    const { restaurants, allRestaurants, loading, error, getRestaurants, searchRestaurants } = useRestaurants();
    const { favorites, toggleFavorite } = useFavorites();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const categories = useMemo(() => {
        const cats = new Set();
        allRestaurants.forEach((r) => {
            if (r.categoria_gastronomica) cats.add(r.categoria_gastronomica);
        });
        return [...cats];
    }, [allRestaurants]);

    const filtered = useMemo(() => {
        if (!selectedCategory) return restaurants;
        return restaurants.filter((r) => r.categoria_gastronomica === selectedCategory);
    }, [restaurants, selectedCategory]);

    const onRefresh = useCallback(() => { getRestaurants(); }, [getRestaurants]);

    const handleCategorySelect = useCallback((cat) => {
        setSelectedCategory(selectedCategory === cat ? null : cat);
    }, [selectedCategory]);

    const handleSearch = useCallback((text) => {
        setSearchQuery(text);
        searchRestaurants(text);
    }, [searchRestaurants]);

    const handleCategoryClear = useCallback(() => {
        setSelectedCategory(null);
        setSearchQuery("");
        getRestaurants();
    }, [getRestaurants]);

    const favoriteIds = useMemo(
        () => new Set(favorites.map((f) => f._id)),
        [favorites],
    );

    const handleToggleFavorite = useCallback(
        async (id) => {
            try { await toggleFavorite(id); } catch {}
        },
        [toggleFavorite],
    );

    if (loading && !restaurants.length) return <LoadingSpinner />;

    const hasFilter = searchQuery.trim() || selectedCategory;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
                <View style={styles.heroTopRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.heroEyebrow}>BITE & GO</Text>
                        <Text style={styles.heroTitle}>¿Qué se te antoja hoy?</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Favorites")}
                        style={styles.headerIconBtn}
                        activeOpacity={0.75}
                    >
                        <Heart size={19} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.getParent()?.navigate("Profile", { screen: "Notifications" })}
                        style={styles.headerIconBtn}
                        activeOpacity={0.75}
                    >
                        <Bell size={19} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Search size={18} color={COLORS.secondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar restaurante o categoría..."
                        placeholderTextColor="#A39C97"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                    />
                </View>
            </LinearGradient>

            {categories.length > 0 && (
                <View style={styles.catBarWrap}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={["__all__", ...categories]}
                        keyExtractor={(cat) => cat}
                        contentContainerStyle={styles.catBarInner}
                        renderItem={({ item: cat }) => {
                            const isAll = cat === "__all__";
                            const active = isAll ? !selectedCategory : selectedCategory === cat;
                            return (
                                <TouchableOpacity
                                    onPress={isAll ? handleCategoryClear : () => handleCategorySelect(cat)}
                                    style={[styles.catChip, active && styles.catChipActive]}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                                        {isAll ? "Todos" : cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            <FlatList
                data={filtered}
                keyExtractor={(item) => item._id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                    <RestaurantCard
                        item={item}
                        onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
                        isFavorite={favoriteIds.has(item._id)}
                        onToggleFavorite={() => handleToggleFavorite(item._id)}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Search size={40} color={COLORS.border} style={{ marginBottom: 10 }} />
                        <Text style={styles.emptyText}>
                            {hasFilter ? "No se encontraron restaurantes" : "No hay restaurantes disponibles"}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {hasFilter ? "Prueba con otra búsqueda o categoría" : "Vuelve a intentarlo más tarde"}
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    hasFilter ? (
                        <View style={styles.resultBar}>
                            <Text style={styles.resultCount}>{filtered.length} restaurante(s) encontrado(s)</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = {
    container: { flex: 1, backgroundColor: COLORS.background },

    hero: {
        paddingTop: 52,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...SHADOWS.card,
    },
    heroTopRow: { flexDirection: "row", alignItems: "center" },
    heroEyebrow: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.5,
        color: "rgba(255,255,255,0.65)",
        marginBottom: 2,
    },
    heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
    headerIconBtn: {
        width: 40, height: 40, borderRadius: 20, marginLeft: 8,
        backgroundColor: "rgba(255,255,255,0.16)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        justifyContent: "center", alignItems: "center",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        marginTop: 18,
        ...SHADOWS.card,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: COLORS.text,
    },

    catBarWrap: {
        height: 52,
        justifyContent: "center",
    },
    catBarInner: {
        paddingHorizontal: 16,
        alignItems: "center",
        gap: 8,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    catChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    catChipText: {
        fontSize: 13,
        color: COLORS.secondary,
        fontWeight: "600",
    },
    catChipTextActive: {
        color: "#fff",
    },

    listContent: { padding: 16, paddingBottom: 32 },
    resultBar: { marginBottom: 12 },
    resultCount: { fontSize: 13, color: COLORS.secondary, fontWeight: "500" },
    emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: COLORS.text, fontWeight: "700", textAlign: "center" },
    emptySubtext: { fontSize: 13, color: COLORS.secondary, marginTop: 4, textAlign: "center" },

    cardShadow: { marginBottom: 18 },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    imageWrap: { position: "relative" },
    image: { width: "100%", height: 180 },
    placeholder: { backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
    imageGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 90 },
    imageTopGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 56 },

    heartBtn: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(20,15,12,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },
    popularBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.error,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    popularText: { fontSize: 11, fontWeight: "800", color: "#fff" },

    etaBadge: {
        position: "absolute",
        bottom: 10,
        left: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(20,15,12,0.55)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    etaText: { fontSize: 11, fontWeight: "700", color: "#fff" },

    cardBody: { padding: 14 },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    cardName: { fontSize: 17, fontWeight: "800", color: COLORS.text, flex: 1 },
    priceText: { fontSize: 14, fontWeight: "800", color: COLORS.primary },
    addressRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
    cardAddress: { fontSize: 13, color: COLORS.secondary, marginLeft: 4, flex: 1 },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        gap: 8,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary + "15",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        flexShrink: 1,
    },
    categoryText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
    sucursalPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    sucursalDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
    },
    sucursalText: { fontSize: 12, fontWeight: "600", color: COLORS.success },
};

export default RestaurantsScreen;
