import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            login: async (accessToken, user, refreshToken) => {
                set({
                    token: accessToken,
                    user,
                    isAuthenticated: true,
                });
                if (refreshToken) {
                    await import("expo-secure-store").then(({ setItemAsync }) =>
                        setItemAsync("refreshToken", refreshToken),
                    );
                }
            },

            setAccessToken: (token) => set({ token }),

            logout: async () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
                await import("expo-secure-store").then(({ deleteItemAsync }) =>
                    deleteItemAsync("refreshToken"),
                );
            },
        }),
        {
            name: "bitego-auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
