import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Step2() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
                    <TouchableOpacity onPress={() => router.push("/register/step1")} style={{ position: "absolute", left: 20, top: 30 }}>
                <Ionicons name="arrow-back" size={24} color="#f57c00" />
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Nuevo usuario</Text>
                <Text style={styles.subtitle}>Introduzca un alias y un correo electrónico válidos</Text>
            </View>
            <View style={{ marginTop: 0, marginBottom: 200}}>

                <Text style={styles.label}>Alias</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese un alias"
                />

                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese su correo"
                    keyboardType="email-address"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/register/step3')}>
                <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'space-between' },
    backArrow: {},
    header: { marginTop: 50, alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20, alignSelf: 'center', textAlign: 'center' },
    label: { fontSize: 14, color: '#333', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginVertical: 4 },
    button: { backgroundColor: '#F97316', padding: 15, borderRadius: 40, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
