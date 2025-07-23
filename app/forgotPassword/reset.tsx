import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Reset() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // 1️⃣ Solicitar permiso
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Necesitamos permiso para acceder a tus fotos');
      return;
    }

    try {
      // 2️⃣ Llamar al picker (prueba ambas opciones según tu SDK)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error al abrir la galería:', err);
      alert('Error al abrir la galería');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de contraseña</Text>
      <Text style={styles.subtitle}>Establezca su nueva contraseña</Text>

      <View style={{ marginBottom: 24, alignItems: 'center' }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={28} color="#FF6F00" />
          <Text style={{ marginLeft: 12, color: '#666', fontSize: 16 }}>
            Subí tu multimedia de la receta
          </Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 120, height: 120, marginTop: 10, borderRadius: 8 }}
          />
        )}
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese aquí su nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirme su nueva contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          alert('Contraseña restablecida con éxito');
          router.replace('/register/step1');
        }}
      >
        <Text style={styles.buttonText}>Reestablecer contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF6F00',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});