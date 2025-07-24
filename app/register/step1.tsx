import logo from "@/assets/images/logo.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const StepOne = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;
  
  const spinAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  // ✅ Cargar credenciales si fueron guardadas
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error al cargar las credenciales guardadas", error);
      }
    };

    loadSavedCredentials();
  }, []);

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
    Animated.timing(checkScale, {
      toValue: rememberMe ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [rememberMe]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ✅ Login con guardado o limpieza de credenciales
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://cooksy-p77y.onrender.co/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("userId", data.id);
        await AsyncStorage.removeItem("isGuestMode"); // Remove guest mode flag on login

        if (rememberMe) {
          await AsyncStorage.setItem("savedEmail", email);
          await AsyncStorage.setItem("savedPassword", password);
        } else {
          await AsyncStorage.removeItem("savedEmail");
          await AsyncStorage.removeItem("savedPassword");
        }

        router.replace("/(logged)");
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Store guest mode flag
      await AsyncStorage.setItem("isGuestMode", "true");
      // Navigate to logged in area
      router.replace("/(logged)");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo iniciar como invitado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={logo}
          style={{ width: 140, height: 140, resizeMode: "contain" }}
        />
      </View>

      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Por favor ingrese sus datos para continuar
      </Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su correo"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rememberContainer}>
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          style={styles.rememberCheckbox}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: "#333",
              backgroundColor: rememberMe ? "#F26E04" : "transparent",
              marginRight: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </Animated.View>
          </View>

          <Text>Recordar esta cuenta</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
          <Text style={{ color: "#F26E04" }}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.guestButton]} 
        onPress={handleGuestLogin}
      >
        <Text style={styles.buttonText}>Modo Invitado</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register/step2")}>
        <Text style={styles.link}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rememberCheckbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#F26E04",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#F26E04",
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    textDecorationLine: "underline",
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
  guestButton: {
    backgroundColor: "#666",
    marginTop: 10,
  },
});

export default StepOne;
