import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Step3() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [alias, setAlias] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    // Simple picker para seleccionar día/mes/año
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 80 }, (_, i) => 2025 - i);

    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedYear, setSelectedYear] = useState(2000);

    const confirmDate = () => {
        setFechaNacimiento(`${selectedDay.toString().padStart(2,'0')}/${selectedMonth.toString().padStart(2,'0')}/${selectedYear}`);
        setShowPicker(false);
    };

    return (
        <SafeAreaView style={styles.container}>
                    <TouchableOpacity onPress={() => router.push("/register/step2")} style={{ position: "absolute", left: 20, top: 30 }}>
                <Ionicons name="arrow-back" size={24} color="#f57c00" />
            </TouchableOpacity>
            <Text style={styles.title}>Información personal</Text>
            <Text style={styles.subtitle}>Por favor ingrese sus datos para continuar</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} placeholder="Ingrese aquí su nombre" value={nombre} onChangeText={setNombre} />

            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} placeholder="Ingrese aquí su apellido" value={apellido} onChangeText={setApellido} />

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => setShowPicker(true)}>
                <Text>{fechaNacimiento || 'DD/MM/AAAA'}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>

            <Modal visible={showPicker} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.pickerContainer}>
                        <FlatList horizontal data={days} keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedDay(item)} style={[styles.pickerItem, selectedDay === item && styles.selected]}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <FlatList horizontal data={months} keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedMonth(item)} style={[styles.pickerItem, selectedMonth === item && styles.selected]}>
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <FlatList horizontal data={years} keyExtractor={(item) => item.toString()}
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

            <Text style={styles.label}>Alias</Text>
            <TextInput style={styles.input} placeholder="Alias" value={alias} onChangeText={setAlias} />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput style={styles.input} placeholder="Correo electrónico" value={correo} onChangeText={setCorreo} keyboardType="email-address" />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} placeholder="Ingrese aquí su contraseña" value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={styles.label}>Repita su contraseña</Text>
            <TextInput style={styles.input} placeholder="Repita aquí su contraseña" value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding/onboardingSteps')}>
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
});