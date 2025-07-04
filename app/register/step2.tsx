import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Step2() {
    const router = useRouter();
    const [alias, setAlias] = useState('');
    const [email, setEmail] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return regex.test(email);
    };

    const canContinue = alias.trim() !== '' && email.trim() !== '' && validateEmail(email);

    const handleContinue = async () => {
        if (!validateEmail(email)) {
            Alert.alert('Correo inválido', 'Ingrese un correo electrónico válido.');
            return;
        }

        try {
            const response = await fetch('https://cooksy-p77y.onrender.com/auth/register-step1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, alias })
            });

            const data = await response.json();

            if (response.status === 409) {
                Alert.alert('Alias o correo en uso', data.message || 'El alias o correo ya está en uso.');
            } else if (response.ok) {
                router.push(`/register/step3?alias=${encodeURIComponent(alias)}&email=${encodeURIComponent(email)}`);
            } else {
                console.error('API validation error:', data);
                Alert.alert('Error', data.message || 'Hubo un problema al registrar.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => {
                router.push("/register/step1");
            }} style={{ position: "absolute", left: 20, top: 30 }}>
                <Ionicons name="arrow-back" size={24} color="#f57c00" />
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Nuevo usuario</Text>
                <Text style={styles.subtitle}>Introduzca un alias y un correo electrónico válidos</Text>
            </View>
            <View style={{ marginTop: 0, marginBottom: 200 }}>
                <Text style={styles.label}>Alias</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese un alias"
                    value={alias}
                    onChangeText={setAlias}
                />
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese su correo"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                {!validateEmail(email) && email.length > 0 && (
                    <Text style={{ color: 'red', marginTop: 4 }}>Formato de correo inválido</Text>
                )}
            </View>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: canContinue ? '#F97316' : '#ccc' }]}
                disabled={!canContinue}
                onPress={handleContinue}
            >
                <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'space-between' },
    header: { marginTop: 50, alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 20, alignSelf: 'center', textAlign: 'center' },
    label: { fontSize: 14, color: '#333', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginVertical: 4 },
    button: { padding: 15, borderRadius: 40, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
