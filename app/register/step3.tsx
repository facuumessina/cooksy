import logo from '@/assets/images/logo.png';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function Step3() {
    const router = useRouter();
    const { alias, email } = useLocalSearchParams();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [errors, setErrors] = useState({ nombre: '', apellido: '', fecha: '', password: '', repeat: '' });

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 80 }, (_, i) => 2025 - i);

    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedYear, setSelectedYear] = useState(2000);

    const [isLoading, setIsLoading] = useState(false);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            spinAnim.stopAnimation();
            opacityAnim.stopAnimation();
        }
    }, [isLoading]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const confirmDate = () => {
        setFechaNacimiento(`${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`);
        setShowPicker(false);
    };

    const validateAndSubmit = async () => {
        let newErrors = { nombre: '', apellido: '', fecha: '', password: '', repeat: '' };
        let isValid = true;

        if (!nombre.trim()) { newErrors.nombre = 'El nombre es obligatorio'; isValid = false; }
        if (!apellido.trim()) { newErrors.apellido = 'El apellido es obligatorio'; isValid = false; }
        if (!fechaNacimiento) { newErrors.fecha = 'La fecha es obligatoria'; isValid = false; }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = 'Debe tener 8+ caracteres, 1 mayúscula y 1 número';
            isValid = false;
        }
        if (password !== repeatPassword) {
            newErrors.repeat = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(newErrors);
        if (!isValid) return;

        setIsLoading(true);
        try {
            const response = await fetch('https://cooksy-p77y.onrender.com/auth/register-step2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    alias: alias,
                    nombre: `${nombre} ${apellido}`,
                    fechaNacimiento,
                    password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Error al registrar usuario');
            } else {
                router.push('/onboarding/onboardingSteps');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <Animated.Image
                        source={logo}
                        style={[
                            styles.loadingLogo,
                            {
                                transform: [{ rotate: spin }],
                                opacity: opacityAnim,
                            },
                        ]}
                    />
                </View>
            )}

            <TouchableOpacity
                onPress={() => {
                    router.replace('/register/step2');
                }}
                style={{ position: "absolute", left: 20, top: 30 }}>
                <Ionicons name="arrow-back" size={24} color="#f57c00" />
            </TouchableOpacity>

            <Text style={styles.title}>Información personal</Text>
            <Text style={styles.subtitle}>Por favor ingrese sus datos para continuar</Text>

            <Text style={styles.label}>Alias</Text>
            <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={alias?.toString()} editable={false} />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={email?.toString()} editable={false} />

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} placeholder="Ingrese su nombre" value={nombre} onChangeText={setNombre} />
            {errors.nombre ? <Text style={styles.error}>{errors.nombre}</Text> : null}

            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} placeholder="Ingrese su apellido" value={apellido} onChangeText={setApellido} />
            {errors.apellido ? <Text style={styles.error}>{errors.apellido}</Text> : null}

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setShowPicker(true)}
            >
                <Text>{fechaNacimiento || 'DD/MM/AAAA'}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
            {errors.fecha ? <Text style={styles.error}>{errors.fecha}</Text> : null}

            <Modal visible={showPicker} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.pickerContainer}>
                        <FlatList horizontal data={days} keyExtractor={i => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedDay(item)} style={[styles.pickerItem, selectedDay === item && styles.selected]}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <FlatList horizontal data={months} keyExtractor={i => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedMonth(item)} style={[styles.pickerItem, selectedMonth === item && styles.selected]}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <FlatList horizontal data={years} keyExtractor={i => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedYear(item)} style={[styles.pickerItem, selectedYear === item && styles.selected]}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.button} onPress={confirmDate}>
                            <Text style={styles.buttonText}>Confirmar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowPicker(false)} style={{ marginTop: 10 }}>
                            <Text style={{ color: 'red' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} placeholder="Ingrese su contraseña" value={password} onChangeText={setPassword} secureTextEntry />
            {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

            <Text style={styles.label}>Repita su contraseña</Text>
            <TextInput style={styles.input} placeholder="Repita la contraseña" value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />
            {errors.repeat ? <Text style={styles.error}>{errors.repeat}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={validateAndSubmit}>
                <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 60, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20, alignSelf: 'center', textAlign: 'center' },
    label: { fontSize: 14, color: '#333', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    button: { backgroundColor: '#F97316', padding: 15, borderRadius: 40, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    pickerContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
    pickerItem: { margin: 5, padding: 10 },
    selected: { backgroundColor: '#eee', borderRadius: 5 },
    error: { color: 'red', fontSize: 12, marginTop: 2 },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    loadingLogo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
    },
});
