import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getUserClient = () => require("../api/userClient").default;

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoadingAuth: true,
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

            syncSession: async () => {
                const token = get().token;
                if (!token) {
                    set({ isLoadingAuth: false });
                    return;
                }
                try {
                    const userClient = getUserClient();
                    console.log("[AUTH] syncSession starting...");
                    await Promise.race([
                        userClient.post("/users/sync"),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("sync_timeout")), 5000),
                        ),
                    ]);
                    console.log("[AUTH] syncSession OK");
                } catch (e) {
                    console.log("[AUTH] syncSession failed:", e.message || e);
                    const status = e?.response?.status;
                    if (status === 401 || status === 403) {
                        get().logout();
                    }
                } finally {
                    set({ isLoadingAuth: false });
                }
            },

            verifySession: async () => {
                const token = get().token;
                const isAuth = get().isAuthenticated;
                if (!token || !isAuth) return;
                try {
                    const userClient = getUserClient();
                    await userClient.get("/users/me");
                } catch {
                    get().logout();
                }
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
