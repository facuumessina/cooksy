import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const StepOne = () => {
    const router = useRouter();
    const [alias, setAlias] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Por favor ingrese sus datos para continuar</Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
                style={styles.input}
                placeholder="Ingrese su correo"
                value={alias}
                onChangeText={setAlias}
            />

            <View style={{ position: 'relative' }}>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese su contraseña"
                    value={email}
                    onChangeText={setEmail}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 15, top: 15 }}
                >
                    <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 20, height: 20, borderWidth: 1, borderColor: '#333',
                  backgroundColor: rememberMe ? '#007BFF' : 'transparent', marginRight: 8
                }} />
                <Text>Recordar esta cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
                <Text style={{ color: '#007BFF' }}>Olvidé mi contraseña</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/(logged)')}>
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
        backgroundColor: '#007BFF',
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
        borderColor: '#007BFF',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 15
    },
    googleButtonText: {
        color: '#007BFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    link: {
        color: '#007BFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        textDecorationLine: 'underline'
    }
});

export default StepOne;