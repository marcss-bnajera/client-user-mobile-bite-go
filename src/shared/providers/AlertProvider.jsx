import { createContext, useContext, useState, useCallback, useRef } from "react";
import CustomAlert from "../components/CustomAlert";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [alert, setAlert] = useState({ visible: false, type: "info", title: "", message: "", buttons: [] });
    const callbacksRef = useRef([]);

    const hide = useCallback(() => {
        setAlert((prev) => ({ ...prev, visible: false }));
        setTimeout(() => {
            callbacksRef.current.forEach((cb) => cb());
            callbacksRef.current = [];
        }, 200);
    }, []);

    const show = useCallback(({ type = "info", title, message, buttons = [] }) => {
        callbacksRef.current = [];
        const wrappedButtons = buttons.map((btn) => ({
            ...btn,
            onPress: btn.onPress ? () => callbacksRef.current.push(btn.onPress) : undefined,
        }));
        setAlert({ visible: true, type, title, message, buttons: wrappedButtons });
    }, []);

    const confirm = useCallback(({ title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar" }) => {
        show({
            type: "confirm",
            title,
            message,
            buttons: [
                { text: cancelText, style: "cancel", onPress: onCancel },
                { text: confirmText, style: "destructive", onPress: onConfirm },
            ],
        });
    }, [show]);

    return (
        <AlertContext.Provider value={{ show, confirm, hide }}>
            {children}
            <CustomAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                buttons={alert.buttons}
                onClose={hide}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error("useAlert must be used within AlertProvider");
    return ctx;
}
