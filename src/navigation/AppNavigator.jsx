import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../shared/constants/theme";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import { useAuthStore } from "../shared/store/authStore";
import { useAppLifecycle } from "../shared/hooks/useAppLifecycle";

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isHydrated = useAuthStore((state) => state._hasHydrated);
    const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

    useAppLifecycle();

    if (!isHydrated || (isAuthenticated && isLoadingAuth)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
});

export default AppNavigator;
