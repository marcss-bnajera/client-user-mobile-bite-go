import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { Star } from "lucide-react-native";
import { useReviews } from "../hooks/useReviews.js";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";

const ReviewCard = ({ item, index }) => (
    <FadeInView delay={index * 60}>
        <Card className="mb-3" style={SHADOWS.card}>
            <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-ink">
                    {item.id_restaurante?.nombre || "Restaurante"}
                </Text>
                <View className="flex-row gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={12} color={BRAND.primary} fill={n <= item.calificacion ? BRAND.primary : "transparent"} />
                    ))}
                </View>
            </View>
            {item.comentario ? (
                <Text className="mt-2 text-sm text-muted">{item.comentario}</Text>
            ) : null}
            <Text className="mt-2 text-[10px] text-faint">
                {new Date(item.createdAt).toLocaleDateString("es-GT")}
            </Text>
        </Card>
    </FadeInView>
);

const ReviewsScreen = () => {
    const { reviews, loading, error, getReviews } = useReviews();
    const onRefresh = useCallback(() => { getReviews(); }, [getReviews]);

    if (loading && !reviews.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <FlatList
                data={reviews}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => <ReviewCard item={item} index={index} />}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />
                }
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes reseñas aun" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default ReviewsScreen;
