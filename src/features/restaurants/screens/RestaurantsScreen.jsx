import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, RefreshControl } from "react-native";
import { useRestaurants } from "../hooks/useRestaurants.js";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme.js";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common.jsx";

const RestaurantCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <Card style={styles.card}>
            {item.fotos_url?.[0] ? (
                <Image source={{ uri: item.fotos_url[0] }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={[styles.image, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>🍽️</Text>
                </View>
            )}
            <View style={styles.details}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.info}>{item.direccion?.texto || "Dirección no disponible"}</Text>
                <View style={styles.footer}>
                    <Text style={styles.category}>{item.categoria_gastronomica}</Text>
                    {item.precio_promedio > 0 && (
                        <Text style={styles.price}>Q{item.precio_promedio} promedio</Text>
                    )}
                </View>
            </View>
        </Card>
    </TouchableOpacity>
);

const RestaurantsScreen = ({ navigation }) => {
    const { restaurants, loading, error, getRestaurants } = useRestaurants();

    const onRefresh = useCallback(() => { getRestaurants(); }, [getRestaurants]);

    if (loading && !restaurants.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {error && !restaurants.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <RestaurantCard
                            item={item}
                            onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState message="No hay restaurantes disponibles" />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    listContent: { padding: SPACING.md },
    cardContainer: { marginBottom: SPACING.md },
    card: { padding: 0, overflow: "hidden" },
    image: { width: "100%", height: 160 },
    placeholderImage: { backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
    placeholderText: { fontSize: 40 },
    details: { padding: SPACING.md },
    name: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text },
    info: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.sm },
    category: { fontSize: FONT_SIZE.xs, fontWeight: "600", color: COLORS.primary, backgroundColor: COLORS.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    price: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
});

export default RestaurantsScreen;
