import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RegisterSuccess() {
  const router = useRouter();

  // Redirige automáticamente después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/register/step1');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="#4CAF50" style={styles.icon} />
      <Text style={styles.title}>¡Registro exitoso!</Text>
      <Text style={styles.subtitle}>
        Tu cuenta fue creada correctamente. Serás redirigido para iniciar sesión.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/register/step1')}>
        <Text style={styles.buttonText}>Ir al login ahora</Text>
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
  icon: {
    marginBottom: 30,
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
