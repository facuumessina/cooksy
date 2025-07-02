

import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EmailSent() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revisa tu correo</Text>
      <Text style={styles.subtitle}>
        Te enviamos un email para que puedas reestablecer tu contraseña.
      </Text>
      <Image
        source={require('../../assets/images/email_icon.png')} // Ajustar path o reemplazar por un icono de librería si no está
        style={styles.image}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.button} onPress={() => router.push('/forgotPassword/code')}>
        <Text style={styles.buttonText}>Ingresar código</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF6F00',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});