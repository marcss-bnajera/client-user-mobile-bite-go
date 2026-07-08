import { useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl } from "react-native";
import { Heart, MapPin } from "lucide-react-native";
import { useFavorites } from "../hooks/useFavorites.js";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common.jsx";
import FadeInView from "../../../shared/components/FadeInView.jsx";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import userClient from "../../../shared/api/userClient.js";

const FavoriteCard = ({ item, onPress, onRemove }) => (
    <FadeInView>
        <Card className="mb-3 flex-row" style={SHADOWS.card}>
            <TouchableOpacity onPress={onPress} className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-canvas">
                {item.fotos_url?.[0] ? (
                    <Image source={{ uri: item.fotos_url[0] }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <View className="h-full w-full items-center justify-center">
                        <Text className="text-2xl">&#127869;</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View className="ml-3 flex-1 justify-between py-1">
                <View>
                    <TouchableOpacity onPress={onPress}>
                        <Text className="text-base font-bold text-ink" numberOfLines={1}>{item.nombre}</Text>
                    </TouchableOpacity>
                    <View className="mt-1 flex-row items-center">
                        <MapPin size={12} color={BRAND.muted} />
                        <Text className="ml-1 text-xs text-muted" numberOfLines={1}>{item.direccion?.texto}</Text>
                    </View>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                    <Text className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.categoria_gastronomica}
                    </Text>
                    <TouchableOpacity onPress={onRemove} hitSlop={8}>
                        <Heart size={18} color={BRAND.primary} fill={BRAND.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    </FadeInView>
);

const FavoritesScreen = ({ navigation }) => {
    const { favorites, loading, error, getFavorites, toggleFavorite } = useFavorites();
    const onRefresh = useCallback(() => { getFavorites(); }, [getFavorites]);

    const handleRemove = async (id) => {
        try {
            await toggleFavorite(id);
            getFavorites();
        } catch {
            // error silencioso
        }
    };

    if (loading && !favorites.length) return <LoadingSpinner />;

    return (
        <View className="flex-1 bg-canvas">
            <FlatList
                data={favorites}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <FavoriteCard
                        item={item}
                        onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
                        onRemove={() => handleRemove(item._id)}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[BRAND.primary]} tintColor={BRAND.primary} />
                }
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                ListEmptyComponent={<EmptyState message="No tienes favoritos" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default FavoritesScreen;
