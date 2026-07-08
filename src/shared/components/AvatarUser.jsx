import { useState } from "react";
import { View, Image } from "react-native";
import { User } from "lucide-react-native";

const isDefaultAvatar = (url) =>
    !url || url.trim() === "" || url.includes("default-avatar");

export default function AvatarUser({ source, size = 48, className = "" }) {
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = source && !isDefaultAvatar(source) && !imgFailed;

    return (
        <View
            className={`items-center justify-center overflow-hidden rounded-full bg-primary/10 ${className}`}
            style={{ width: size, height: size }}
        >
            {showImage ? (
                <Image
                    source={{ uri: source }}
                    style={{ width: size, height: size }}
                    resizeMode="cover"
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <User size={size * 0.5} color="#E67E22" />
            )}
        </View>
    );
}
