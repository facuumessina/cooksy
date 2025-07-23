import logo from "@/assets/images/logo.png";
import { useData } from "@/context/DataProvider"; // al inicio del archivo
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [counter, setCounter] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones para el spinner del logo
  const spinAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const { user } = useData();


  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.stopAnimation();
      opacityAnim.stopAnimation();
    }
  }, [isLoading]);

  useEffect(() => {
  const preloadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("loginEmail");
        if (savedEmail) setEmail(savedEmail);
      } catch (error) {
        console.error("Error al cargar email:", error);
      }
  };

  preloadEmail();
}, [user]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingrese su correo electrónico.");
      return;
    }

    setIsDisabled(true); // se desactiva de inmediato
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://10.0.2.2:3000/auth/recover-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo enviar el correo de recuperación.");
      }

      Alert.alert("Correo enviado", "Por favor revisá tu bandeja de entrada.");
      setEmailSent(true);
      setAttempts((prev) => prev + 1);

      const waitTime = attempts >= 3 ? 600 : 60;
      setCounter(waitTime);

      intervalRef.current = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Ocurrió un error inesperado.");
      setIsDisabled(false); // reactivamos solo si hay error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Loading Spinner */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Animated.Image
            source={logo}
            style={[
              styles.loadingLogo,
              {
                transform: [{ rotate: spin }],
                opacity: opacityAnim,
              },
            ]}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: "absolute", left: 20, top: 40, zIndex: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#FF6F00" />
      </TouchableOpacity>

      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingrese su email para reestablecer la contraseña
      </Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese aquí su correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, isDisabled && { backgroundColor: "#ccc" }]}
        onPress={handleReset}
        disabled={isDisabled || isLoading}
      >
        <Text style={styles.buttonText}>
          {isDisabled ? `Reintentar en ${counter}s` : "Reestablecer contraseña"}
        </Text>
      </TouchableOpacity>

      {attempts >= 3 && counter === 0 && (
        <Text style={styles.notice}>
          Ya hiciste 3 intentos. Ahora debes esperar 10 minutos entre
          reintentos.
        </Text>
      )}

      {emailSent && (
        <Text style={styles.infoText}>
          ¿Ya recibiste nuestro correo?{" "}
          <Link
            href={{ pathname: "/forgotPassword/code", params: { email } }}
            style={styles.linkText}
          >
            Para ingresar tu código haz click aquí.
          </Link>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6F00",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  notice: {
    color: "#FF6F00",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 10,
  },
  infoText: {
    marginTop: 20,
    textAlign: "center",
    color: "#444",
    fontSize: 14,
  },
  linkText: {
    color: "#FF6F00",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingLogo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});
