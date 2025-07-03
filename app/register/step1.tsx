import logo from '@/assets/images/logo.png'; // adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StepOne = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch('http://192.168.0.59:3000/auth/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("TOKEN:", data.token); 
                await AsyncStorage.setItem('token', data.token);
                router.replace('/(logged)');
            } else {
                const error = await response.json();
                Alert.alert("Error", error.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Image source={logo} style={{ width: 140, height: 140, resizeMode: 'contain' }} />
            </View>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Por favor ingrese sus datos para continuar</Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
                style={styles.input}
                placeholder="Ingrese su correo"
                value={email}
                onChangeText={setEmail}
            />

            <View style={{ position: 'relative', marginBottom: 10 }}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 15, top: 0, bottom: 0, justifyContent: 'center' }}
                >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#555" />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 20, height: 20, borderWidth: 1, borderColor: '#333',
                        backgroundColor: rememberMe ? '#F26E04' : 'transparent', marginRight: 8
                    }} />
                    <Text>Recordar esta cuenta</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
                    <Text style={{ color: '#F26E04' }}>Olvidé mi contraseña</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
                <Text style={styles.googleButtonText}>G  Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register/step2')}>
                <Text style={styles.link}>Registrarme</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555'
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 14,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#f9f9f9'
    },
    button: {
        backgroundColor: '#F26E04',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 15
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    googleButton: {
        borderWidth: 1,
        borderColor: '#F26E04',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 15
    },
    googleButtonText: {
        color: '#F26E04',
        fontSize: 16,
        fontWeight: 'bold'
    },
    link: {
        color: '#F26E04',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        textDecorationLine: 'underline'
    }
});

export default StepOne;