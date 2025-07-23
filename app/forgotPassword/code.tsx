import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function Code() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // <- recibimos el email desde ForgotPassword
  const [code, setCode] = useState("");

  const handleValidateCode = async () => {
    if (!code) {
      Alert.alert("Error", "Por favor ingrese el código recibido.");
      return;
    }

    // Podrías validar el código en el backend acá si lo deseas
    // pero por ahora asumimos que si llega a esta pantalla, fue enviado por correo correctamente

    router.push({
      pathname: "/forgotPassword/reset",
      params: { email, code },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Código de recupero</Text>
      <Text style={styles.subtitle}>
        Ingrese el código de recupero que fue enviado a su casilla de email. En
        caso de error, vuelva a solicitarlo.
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

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryButtonText}>
          Solicitar un nuevo código
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6F00",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FF6F00",
    fontSize: 16,
  },
});
