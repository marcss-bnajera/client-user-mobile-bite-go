import { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Pressable, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import userClient from "../../../shared/api/userClient";
import { useAddresses } from "../../profile/hooks/useAddresses.js";
import { BRAND, SHADOWS } from "../../../shared/constants/tokens.js";
import { useAlert } from "../../../shared/providers/AlertProvider.jsx";
import DatePickerModal from "../../../shared/components/DatePickerModal.jsx";
import TimePickerModal from "../../../shared/components/TimePickerModal.jsx";
import BottomSheet from "../../../shared/components/BottomSheet.jsx";

const SERVICE_TYPES = ["Comer aquí", "Para llevar", "Domicilio"];
const PAYMENT_METHODS = ["Efectivo", "Tarjeta"];
const PAYMENT_BACKEND = { "Efectivo": "efectivo", "Tarjeta": "tarjeta" };
const TIP_OPTIONS = [0, 5, 10, 15, 20];

const CreateOrderScreen = ({ route, navigation }) => {
    const { restaurant, preloadedItems, id_sucursal } = route.params || {};
    const { show } = useAlert();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState(preloadedItems || []);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("");

    const [tipoServicio, setTipoServicio] = useState("Para llevar");
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [propina, setPropina] = useState(0);
    const [notas, setNotas] = useState("");
    const [direccionEntrega, setDireccionEntrega] = useState("");
    const [codigoCupon, setCodigoCupon] = useState("");
    const [descuento, setDescuento] = useState(0);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [scheduleDate, setScheduleDate] = useState(null);
    const [scheduleTime, setScheduleTime] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);
    const detailSheetRef = useRef(null);
    const optionsSheetRef = useRef(null);

    const { addresses } = useAddresses();

    useEffect(() => {
        Promise.all([
            userClient.get(`/products/restaurant/${restaurant._id}`),
            userClient.get("/categories", { params: { restaurante: restaurant._id } }),
        ])
            .then(([prodRes, catRes]) => {
                setProducts(prodRes.data.products || []);
                setCategories(catRes.data.categories || []);
            })
            .finally(() => setLoading(false));
    }, [restaurant._id]);

    const addToCart = (product) => {
        setSelected((prev) => {
            const exists = prev.find((i) => i.id_producto === product._id);
            if (exists) return prev;
            return [...prev, { id_producto: product._id, nombre: product.nombre, precio: product.precio, cantidad: 1, notas: "" }];
        });
    };

    const removeFromCart = (id_producto) => {
        setSelected((prev) => prev.filter((i) => i.id_producto !== id_producto));
    };

    const updateQty = (id_producto, delta) => {
        setSelected((prev) => {
            const item = prev.find((i) => i.id_producto === id_producto);
            if (!item) return prev;
            const newQty = item.cantidad + delta;
            if (newQty < 1) return prev.filter((i) => i.id_producto !== id_producto);
            return prev.map((i) => (i.id_producto === id_producto ? { ...i, cantidad: newQty } : i));
        });
    };

    const subtotal = selected.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
    const total = subtotal - descuento + propina;
    const cartCount = selected.reduce((sum, i) => sum + i.cantidad, 0);

    const openDetail = (product) => {
        setDetailProduct(product);
        setTimeout(() => detailSheetRef.current?.present(), 50);
    };

    const closeDetail = () => {
        detailSheetRef.current?.dismiss();
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (activeCategory && p.categoria?._id !== activeCategory) return false;
            if (productSearch) {
                const q = productSearch.toLowerCase();
                if (!p.nombre.toLowerCase().includes(q) && !p.descripcion?.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [products, activeCategory, productSearch]);

    const handleValidateCoupon = async () => {
        if (!codigoCupon.trim()) return;
        setValidatingCoupon(true);
        try {
            const { data } = await userClient.post("/coupons/validate", {
                codigo: codigoCupon.trim(),
                monto_total: subtotal,
            });
            if (data.valid) {
                setDescuento(data.descuento || 0);
                show({ type: "success", title: "Cupon valido", message: `Descuento de Q${data.descuento}` });
            } else {
                setDescuento(0);
                show({ type: "error", title: "Cupon invalido", message: data.message || "El cupon no es valido" });
            }
        } catch (err) {
            setDescuento(0);
            show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo validar el cupon" });
        } finally {
            setValidatingCoupon(false);
        }
    };

    const hasSucursales = restaurant?.tiene_sucursales && restaurant?.sucursales?.length > 0;

    const handleOrder = async () => {
        if (selected.length === 0) return show({ type: "warning", title: "Sin productos", message: "Selecciona al menos un producto" });
        if (hasSucursales && !id_sucursal) {
            return show({ type: "warning", title: "Sucursal requerida", message: "Debes seleccionar una sucursal para este restaurante" });
        }
        if (tipoServicio === "Domicilio" && !direccionEntrega.trim()) {
            return show({ type: "warning", title: "Direccion requerida", message: "Ingresa una direccion de entrega" });
        }

        setSending(true);
        try {
            const payload = {
                id_restaurante: restaurant._id,
                items: selected.map((i) => ({
                    id_producto: i.id_producto,
                    nombre_historico: i.nombre,
                    precio_historico: i.precio,
                    cantidad: i.cantidad,
                    notas: i.notas || "",
                })),
                tipo_servicio: tipoServicio,
                metodo_pago: PAYMENT_BACKEND[metodoPago] || "efectivo",
                propina,
                notas,
            };

            if (id_sucursal) payload.id_sucursal = id_sucursal;
            if (tipoServicio === "Domicilio") payload.direccion_entrega = direccionEntrega;
            if (descuento > 0) {
                payload.codigo_cupon = codigoCupon;
                payload.descuento_cupon = descuento;
            }
            if (scheduleDate && scheduleTime) {
                const y = scheduleDate.getFullYear();
                const m = String(scheduleDate.getMonth() + 1).padStart(2, "0");
                const d = String(scheduleDate.getDate()).padStart(2, "0");
                payload.fecha_programada = `${y}-${m}-${d}T${scheduleTime}:00.000`;
            }

            await userClient.post("/orders", payload);
            show({
                type: "success",
                title: "Pedido realizado",
                message: "Tu pedido fue registrado exitosamente",
                buttons: [{ text: "OK", onPress: () => navigation.goBack() }],
            });
        } catch (err) {
            show({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo crear el pedido" });
        } finally {
            setSending(false);
        }
    };

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <View style={s.container}>
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    const isSelected = selected.find((i) => i.id_producto === item._id);
                    const qty = isSelected?.cantidad || 0;
                    return (
                        <View style={[s.itemCard, isSelected && s.itemSelected]}>
                            {item.foto_url?.[0] ? (
                                <Image source={{ uri: item.foto_url[0] }} style={s.itemImage} />
                            ) : (
                                <View style={[s.itemImage, s.itemImagePlaceholder]}>
                                    <MaterialIcons name="restaurant" size={24} color={COLORS.border} />
                                </View>
                            )}
                            <Pressable onPress={() => openDetail(item)} style={s.itemInfo}>
                                <Text style={s.itemName} numberOfLines={1}>{item.nombre}</Text>
                                {item.descripcion ? <Text style={s.itemDesc} numberOfLines={2}>{item.descripcion}</Text> : null}
                                <Text style={s.itemPrice}>Q{item.precio}</Text>
                            </Pressable>
                            {isSelected ? (
                                <View style={s.qtyRow}>
                                    <Pressable onPress={() => updateQty(item._id, -1)} style={s.qtyBtn}>
                                        <Text style={s.qtyText}>-</Text>
                                    </Pressable>
                                    <Text style={s.qtyNum}>{qty}</Text>
                                    <Pressable onPress={() => updateQty(item._id, 1)} style={s.qtyBtn}>
                                        <Text style={s.qtyText}>+</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable onPress={() => addToCart(item)} style={s.addBtn}>
                                    <MaterialIcons name="add" size={20} color="#fff" />
                                </Pressable>
                            )}
                        </View>
                    );
                }}
                ListHeaderComponent={
                    <>
                        <Text style={s.title}>Menu de {restaurant.nombre}</Text>
                        <View style={s.searchContainer}>
                            <MaterialIcons name="search" size={18} color={COLORS.secondary} style={{ marginRight: 8 }} />
                            <TextInput
                                value={productSearch}
                                onChangeText={setProductSearch}
                                placeholder="Buscar producto..."
                                placeholderTextColor={COLORS.textLight}
                                style={s.searchInput}
                            />
                            {productSearch ? (
                                <TouchableOpacity onPress={() => setProductSearch("")}>
                                    <MaterialIcons name="close" size={18} color={COLORS.secondary} />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {categories.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContainer}>
                                <TouchableOpacity
                                    onPress={() => setActiveCategory("")}
                                    style={[s.catChip, !activeCategory && s.catChipActive]}
                                >
                                    <Text style={[s.catChipText, !activeCategory && s.catChipTextActive]}>Todos</Text>
                                </TouchableOpacity>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat._id}
                                        onPress={() => setActiveCategory(activeCategory === cat._id ? "" : cat._id)}
                                        style={[s.catChip, activeCategory === cat._id && s.catChipActive]}
                                    >
                                        <Text style={[s.catChipText, activeCategory === cat._id && s.catChipTextActive]}>{cat.nombre}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </>
                }
                contentContainerStyle={{ paddingBottom: selected.length > 0 ? 90 : 16 }}
                keyboardShouldPersistTaps="handled"
            />

            {selected.length > 0 && (
                <View style={s.footer}>
                    <View style={s.footerCompact}>
                        <View style={s.footerCompactLeft}>
                            <Text style={s.summaryCount}>{cartCount} {cartCount === 1 ? "producto" : "productos"}</Text>
                            <Text style={s.summaryTotal}>Q{total.toFixed(2)}</Text>
                        </View>
                        <Button title="Pedir" onPress={() => optionsSheetRef.current?.present()} style={{ height: 40, paddingHorizontal: 16 }} />
                    </View>
                </View>
            )}

            <BottomSheet ref={optionsSheetRef} title="Opciones del pedido">
                <View style={s.optionsSheetWrap}>
                    <ScrollView style={s.optionsSheetScroll} contentContainerStyle={s.optionsSheetContent} bounces={false} showsVerticalScrollIndicator={false}>
                        <View style={s.chipRow}>
                            {SERVICE_TYPES.map((t) => (
                                <TouchableOpacity key={t} onPress={() => setTipoServicio(t)} style={[s.chip, tipoServicio === t && s.chipActive]}>
                                    <Text style={[s.chipText, tipoServicio === t && s.chipTextActive]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={s.chipRow}>
                            {PAYMENT_METHODS.map((m) => (
                                <TouchableOpacity key={m} onPress={() => setMetodoPago(m)} style={[s.chip, metodoPago === m && s.chipActive]}>
                                    <Text style={[s.chipText, metodoPago === m && s.chipTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {tipoServicio === "Domicilio" && (
                            <>
                                <Text style={s.optLabel}>Direccion de entrega</Text>
                                {addresses.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                                        {addresses.map((addr) => (
                                            <TouchableOpacity
                                                key={addr._id}
                                                onPress={() => setDireccionEntrega(addr.direccion)}
                                                style={[s.chip, direccionEntrega === addr.direccion && s.chipActive]}
                                            >
                                                <Text style={[s.chipText, direccionEntrega === addr.direccion && s.chipTextActive]} numberOfLines={1}>
                                                    {addr.etiqueta}: {addr.direccion}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                                <Input placeholder="Direccion de entrega" value={direccionEntrega} onChangeText={setDireccionEntrega} />
                            </>
                        )}

                        {tipoServicio !== "Para llevar" && (
                            <>
                                <Text style={s.optLabel}>Propina ({tipoServicio === "Domicilio" ? "repartidor" : "mesero"})</Text>
                                <View style={s.chipRow}>
                                    {TIP_OPTIONS.map((t) => (
                                        <TouchableOpacity key={t} onPress={() => setPropina(t)} style={[s.chip, propina === t && s.chipActive]}>
                                            <Text style={[s.chipText, propina === t && s.chipTextActive]}>Q{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <Text style={s.optLabel}>Cupon</Text>
                        <View style={s.couponRow}>
                            <View style={{ flex: 1 }}>
                                <Input placeholder="Codigo" value={codigoCupon} onChangeText={setCodigoCupon} />
                            </View>
                            <TouchableOpacity
                                onPress={handleValidateCoupon}
                                disabled={validatingCoupon || !codigoCupon.trim()}
                                style={[s.couponBtn, (!codigoCupon.trim() || validatingCoupon) && { opacity: 0.5 }]}
                            >
                                <Text style={s.couponBtnText}>{validatingCoupon ? "..." : "Aplicar"}</Text>
                            </TouchableOpacity>
                        </View>
                        {descuento > 0 && <Text style={s.discountText}>Descuento: -Q{descuento}</Text>}

                        <Text style={s.optLabel}>Notas</Text>
                        <Input placeholder="Instrucciones especiales..." value={notas} onChangeText={setNotas} />

                        {tipoServicio !== "Comer aquí" && (
                            <>
                                <Text style={s.optLabel}>Programar pedido</Text>
                                <TouchableOpacity style={s.pickerBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                                    <MaterialIcons name="calendar-today" size={16} color={scheduleDate ? BRAND.primary : BRAND.faint} />
                                    <Text style={[s.pickerText, scheduleDate && s.pickerTextSelected]}>
                                        {scheduleDate ? `${scheduleDate.getDate()}/${scheduleDate.getMonth() + 1}/${scheduleDate.getFullYear()}` : "Fecha"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.pickerBtn, { marginTop: 8 }]} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
                                    <MaterialIcons name="schedule" size={16} color={scheduleTime ? BRAND.primary : BRAND.faint} />
                                    <Text style={[s.pickerText, scheduleTime && s.pickerTextSelected]}>
                                        {scheduleTime || "Hora"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>

                    <View style={s.optionsSheetFooter}>
                        <View style={s.totalRow}>
                            <Text style={s.summaryCount}>Subtotal</Text>
                            <Text style={s.totalValue}>Q{subtotal.toFixed(2)}</Text>
                        </View>
                        {descuento > 0 && (
                            <View style={s.totalRow}>
                                <Text style={s.summaryCount}>Descuento</Text>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.success }}>-Q{descuento.toFixed(2)}</Text>
                            </View>
                        )}
                        {propina > 0 && (
                            <View style={s.totalRow}>
                                <Text style={s.summaryCount}>Propina</Text>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.secondary }}>+Q{propina.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[s.totalRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 2 }]}>
                            <Text style={s.totalLabel}>Total</Text>
                            <Text style={s.totalValue}>Q{total.toFixed(2)}</Text>
                        </View>
                        <Button title="Realizar Pedido" onPress={handleOrder} loading={sending} />
                    </View>
                </View>
            </BottomSheet>

            <DatePickerModal visible={showDatePicker} onClose={() => setShowDatePicker(false)} onSelect={(d) => setScheduleDate(d)} selectedDate={scheduleDate} />
            <TimePickerModal visible={showTimePicker} onClose={() => setShowTimePicker(false)} onSelect={(t) => setScheduleTime(t)} selectedTime={scheduleTime} selectedDate={scheduleDate} />

            <BottomSheet ref={detailSheetRef} onDismiss={() => setDetailProduct(null)} title={detailProduct?.nombre || ""}>
                {detailProduct && (
                    <View style={s.detailWrap}>
                        <ScrollView style={s.detailContent} contentContainerStyle={s.detailInner} bounces={false} showsVerticalScrollIndicator={false}>
                            {detailProduct.foto_url?.[0] ? (
                                <Image source={{ uri: detailProduct.foto_url[0] }} style={s.detailImage} />
                            ) : (
                                <View style={[s.detailImage, s.detailImagePlaceholder]}>
                                    <MaterialIcons name="restaurant" size={48} color={COLORS.border} />
                                </View>
                            )}
                            <Text style={s.detailName}>{detailProduct.nombre}</Text>
                            <Text style={s.detailPrice}>Q{detailProduct.precio}</Text>
                            {detailProduct.descripcion ? (
                                <Text style={s.detailDesc}>{detailProduct.descripcion}</Text>
                            ) : (
                                <Text style={s.detailDescNoDesc}>Sin descripcion disponible</Text>
                            )}
                        </ScrollView>
                        <View style={s.detailFooter}>
                            <Button
                                title={selected.find((i) => i.id_producto === detailProduct._id) ? "Agregado al pedido" : "Agregar al pedido"}
                                onPress={() => {
                                    addToCart(detailProduct);
                                    closeDetail();
                                }}
                                disabled={!!selected.find((i) => i.id_producto === detailProduct._id)}
                            />
                        </View>
                    </View>
                )}
            </BottomSheet>
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "700", color: COLORS.text, padding: 16, paddingBottom: 0 },

    searchContainer: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: COLORS.surface, borderRadius: 12,
        marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, height: 42,
        borderWidth: 1, borderColor: COLORS.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },

    catScroll: { marginTop: 12, marginBottom: 4 },
    catContainer: { paddingHorizontal: 16, gap: 8 },
    catChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catChipText: { fontSize: 12, color: COLORS.secondary, fontWeight: "600" },
    catChipTextActive: { color: "#fff" },

    itemCard: {
        flexDirection: "row", alignItems: "center",
        marginHorizontal: 16, marginBottom: 8, padding: 10,
        backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    },
    itemSelected: { borderColor: COLORS.primary, borderWidth: 2 },
    itemImage: {
        width: 64, height: 64, borderRadius: 10,
        backgroundColor: COLORS.background, marginRight: 10,
    },
    itemImagePlaceholder: { justifyContent: "center", alignItems: "center" },
    itemInfo: { flex: 1, justifyContent: "center" },
    itemName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
    itemDesc: { fontSize: 11, color: COLORS.secondary, marginTop: 2, lineHeight: 14 },
    itemPrice: { fontSize: 13, color: COLORS.primary, fontWeight: "700", marginTop: 4 },

    addBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
    },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    qtyBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
    },
    qtyText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    qtyNum: { fontSize: 16, fontWeight: "700", color: COLORS.text, minWidth: 20, textAlign: "center" },

    footer: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
        ...SHADOWS.md,
    },
    footerCompact: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: 12, paddingHorizontal: 16,
    },
    footerCompactLeft: { flex: 1 },
    summaryCount: { fontSize: 13, fontWeight: "600", color: COLORS.secondary },
    summaryTotal: { fontSize: 16, fontWeight: "800", color: COLORS.text },

    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 12, color: COLORS.secondary, fontWeight: "600" },
    chipTextActive: { color: "#fff" },

    optionsSheetWrap: { flex: 1 },
    optionsSheetScroll: { flex: 1 },
    optionsSheetContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
    optionsSheetFooter: { padding: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    optLabel: { fontSize: 12, fontWeight: "700", color: COLORS.secondary, marginTop: 14, marginBottom: 8 },

    couponRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    couponBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, height: 44, justifyContent: "center", alignItems: "center" },
    couponBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    discountText: { fontSize: 12, color: COLORS.success, fontWeight: "600", marginTop: 4 },

    pickerBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: COLORS.background, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 10, height: 38,
    },
    pickerText: { flex: 1, fontSize: 12, color: COLORS.secondary },
    pickerTextSelected: { color: COLORS.text, fontWeight: "600" },

    totalRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingTop: 2, marginBottom: 10,
    },
    totalLabel: { fontSize: 15, fontWeight: "800", color: COLORS.text },
    totalValue: { fontSize: 17, fontWeight: "800", color: COLORS.primary },

    detailWrap: { flex: 1 },
    detailContent: { flex: 1 },
    detailInner: { padding: 12, paddingBottom: 8 },
    detailFooter: { padding: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
    detailImage: {
        width: "100%", height: 300, borderRadius: 150,
        backgroundColor: COLORS.background, marginBottom: 10,
    },
    detailImagePlaceholder: { justifyContent: "center", alignItems: "center" },
    detailName: { fontSize: 18, fontWeight: "800", color: COLORS.text },
    detailPrice: { fontSize: 16, fontWeight: "700", color: COLORS.primary, marginTop: 4 },
    detailDesc: { fontSize: 13, color: COLORS.secondary, marginTop: 6, lineHeight: 17 },
    detailDescNoDesc: { fontSize: 13, color: COLORS.textLight, marginTop: 6, fontStyle: "italic" },
});

export default CreateOrderScreen;
