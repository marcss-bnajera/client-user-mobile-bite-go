import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "../store/authStore";

export const useAppLifecycle = () => {
    const appState = useRef(AppState.currentState);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const syncSession = useAuthStore((s) => s.syncSession);
    const verifySession = useAuthStore((s) => s.verifySession);

    useEffect(() => {
        syncSession();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (appState.current.match(/inactive|background/) && nextState === "active") {
                if (isAuthenticated) {
                    verifySession();
                }
            }
            appState.current = nextState;
        });

        return () => subscription?.remove();
    }, [isAuthenticated, verifySession]);
};
