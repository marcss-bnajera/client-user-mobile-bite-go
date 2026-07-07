import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme.js";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common.jsx";
import Button from "../../../shared/components/Button.jsx";
import userClient from "../../../shared/api/userClient.js";

const RestaurantDetailScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            userClient.get(`/products/restaurant/${restaurant._id}`),
            userClient.get("/categories", { params: { restaurante: restaurant._id } }),
        ]).then(([prodRes, catRes]) => {
            setProducts(prodRes.data.products || []);
            setCategories(catRes.data.categories || []);
        }).finally(() => setLoading(false));
    }, [restaurant._id]);

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.categoria?._id === activeCategory);

    return (
        <ScrollView style={styles.container}>
            {restaurant.fotos_url?.[0] ? (
                <Image source={{ uri: restaurant.fotos_url[0] }} style={styles.headerImage} />
            ) : (
                <View style={[styles.headerImage, styles.placeholder]}>
                    <Text style={styles.placeholderText}>🍽️</Text>
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.name}>{restaurant.nombre}</Text>
                <Text style={styles.info}>{restaurant.direccion?.texto}</Text>
                <Text style={styles.info}>{restaurant.horarios_atencion}</Text>

                <Text style={styles.sectionTitle}>Menú</Text>

                {categories.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        <TouchableOpacity
                            onPress={() => setActiveCategory("all")}
                            style={[styles.categoryChip, activeCategory === "all" && styles.categoryChipActive]}
                        >
                            <Text style={[styles.categoryText, activeCategory === "all" && styles.categoryTextActive]}>Todos</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat._id}
                                onPress={() => setActiveCategory(cat._id)}
                                style={[styles.categoryChip, activeCategory === cat._id && styles.categoryChipActive]}
                            >
                                <Text style={[styles.categoryText, activeCategory === cat._id && styles.categoryTextActive]}>{cat.nombre}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {loading ? <LoadingSpinner /> : filteredProducts.length === 0 ? (
                    <EmptyState message="No hay productos disponibles" />
                ) : (
                    filteredProducts.map((p) => (
                        <Card key={p._id} style={styles.productCard}>
                            <View style={styles.productRow}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{p.nombre}</Text>
                                    {p.descripcion && <Text style={styles.productDesc} numberOfLines={1}>{p.descripcion}</Text>}
                                </View>
                                <Text style={styles.productPrice}>Q{p.precio}</Text>
                            </View>
                        </Card>
                    ))
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Hacer Pedido"
                    onPress={() => navigation.navigate("CreateOrder", { restaurant })}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerImage: { width: "100%", height: 220 },
    placeholder: { backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
    placeholderText: { fontSize: 60 },
    content: { padding: SPACING.lg },
    name: { fontSize: FONT_SIZE.xxl, fontWeight: "800", color: COLORS.text },
    info: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 4 },
    sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
    categoriesScroll: { marginBottom: SPACING.md },
    categoryChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm },
    categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontWeight: "600" },
    categoryTextActive: { color: COLORS.surface },
    productCard: { marginBottom: SPACING.sm },
    productRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    productInfo: { flex: 1, marginRight: SPACING.md },
    productName: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.text },
    productDesc: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginTop: 2 },
    productPrice: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary },
    footer: { padding: 16, paddingBottom: 32 },
});

export default RestaurantDetailScreen;
