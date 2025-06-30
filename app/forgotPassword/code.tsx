

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Code() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleValidateCode = () => {
    // Aquí en el futuro podrías hacer la validación del código con el backend
    router.push('/forgotPassword/reset');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Código de recupero</Text>
      <Text style={styles.subtitle}>
        Ingrese el código de recupero que fue enviado a su casilla de email, en caso de error vuelva a solicitarlo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese aquí su código de recuperación"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleValidateCode}>
        <Text style={styles.buttonText}>Validar código</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => console.log('Solicite un nuevo código')}>
        <Text style={styles.secondaryButtonText}>Solicite un nuevo código</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
});