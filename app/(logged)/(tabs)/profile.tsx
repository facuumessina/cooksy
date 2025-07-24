import { envConfig } from "@/configs/envConfig";
import { STORAGE_KEYS } from "@/service/storage";
import { ActivityLevel } from "@/types/enums";
import { User } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../../context/DataProvider";

const ProfileSection = ({ title, children, icon }: any) => (
  <View style={styles.section}>
    <LinearGradient
      colors={["#FFFFFF", "#F8FAFC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.sectionGradient}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#FB8C00" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

const InfoItem = ({ label, value }: any) => (
  <View style={styles.infoContainer}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={styles.infoValue}>{value || "No especificado"}</Text>
    </View>
  </View>
);

const FavRecipesInfoItem = () => {
  const { user } = useData();
  const [isGuest, setIsGuest] = useState(false);
  const [detailedFavorites, setDetailedFavorites] = useState([]);
  const favouriteRecipes = user?.savedRecipes ?? [];

  useEffect(() => {
    AsyncStorage.getItem('isGuestMode').then(val => {
      setIsGuest(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (isGuest || !user || !user.savedRecipes) return;

    const fetchFavoritesDetails = async () => {
      try {
        const promises = favouriteRecipes.map((id: string) =>
          fetch(`https://cooksy-p77y.onrender.com/recipes/${id}`).then((res) => res.json())
        );
        const results = await Promise.all(promises);
        setDetailedFavorites(results);
      } catch (error) {
        console.error("❌ Error al traer detalles de recetas favoritas:", error);
      }
    };

    if (
      favouriteRecipes.length > 0 &&
      typeof favouriteRecipes[0] === "string"
    ) {
      fetchFavoritesDetails();
    } else {
      setDetailedFavorites(favouriteRecipes);
    }
  }, [favouriteRecipes, isGuest]);

  if (isGuest || !user || !user.savedRecipes) return null;

  if (favouriteRecipes.length === 0) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoValue}>{"No tenés recetas favoritas aún"}</Text>
      </View>
    );
  }

  return (
    <View>
      {Array.isArray(detailedFavorites) &&
        detailedFavorites.map((fav: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.recipeContainer}
            onPress={() =>
              router.push({
                pathname: "/recommendations/[id]",
                params: {
                  id: fav._id?.$oid || fav._id || fav.id,
                  fromSearch: "true",
                },
              })
            }
          >
            {fav.image && (
              <Image
                source={{
                  uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${fav.image?.filename || fav.image}`,
                }}
                resizeMode="contain"
                style={styles.recipeImage}
              />
            )}
            <View style={styles.recipeContainerInfo}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="restaurant"
                  size={16}
                  color="#FB8C00"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.recipeName}>{fav.name || fav.nombre}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
};


const MyRecipesInfoItem = () => {
  const { user } = useData();
  const [myRecipes, setMyRecipes] = useState([]);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('isGuestMode').then(val => {
      setIsGuest(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (isGuest || !user?._id) return;

    const fetchMyRecipes = async () => {
      try {
        const response = await fetch(
          `https://cooksy-p77y.onrender.com/users/${user._id}/my-recipes`
        );
        const data = await response.json();
        setMyRecipes(data);
      } catch (error) {
        console.error("❌ Error al traer mis recetas:", error);
      }
    };

    fetchMyRecipes();
  }, [user, isGuest]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Eliminar receta',
      '¿Estás seguro de que querés eliminar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`https://cooksy-p77y.onrender.com/recipes/${id}`, { method: 'DELETE' });
              setMyRecipes(prev => prev.filter((r: any) => r._id !== id));
            } catch (err) {
              console.error('❌ Error al eliminar receta:', err);
            }
          }
        }
      ]
    );
  };

  if (isGuest || !user || Object.keys(user).length === 0) return null;

  if (!myRecipes || myRecipes.length === 0) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoValue}>{"Aún no has creado recetas."}</Text>
      </View>
    );
  }

  return (
    <View>
      {Array.isArray(myRecipes) && myRecipes.map((recipe, index) => (
        <View
          key={index}
          style={[styles.recipeContainer, { justifyContent: 'space-between' }]}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.push({
              pathname: '/recommendations/[id]',
              params: { id: recipe._id?.$oid || recipe._id || recipe.id, fromSearch: 'true' }
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {recipe.image && (
                <Image
                  source={{ uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image?.filename || recipe.image}` }}
                  resizeMode="contain"
                  style={styles.recipeImage}
                />
              )}
              <Ionicons name="restaurant" size={16} color="#FB8C00" style={{ marginRight: 6 }} />
              <Text style={styles.recipeName}>{recipe.name || recipe.nombre}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/recipes/editRecipe', params: { id: recipe._id } })}
              style={{ marginHorizontal: 6 }}
            >
              <Ionicons name="create-outline" size={20} color="#FB8C00" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(recipe._id)}
              style={{ marginHorizontal: 6 }}
            >
              <Ionicons name="close-outline" size={24} color="#FB8C00" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};


const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useData();
  const [isGuest, setIsGuest] = useState(false);

useEffect(() => {
  const init = async () => {
    try {
      const isGuestMode = await AsyncStorage.getItem("isGuestMode");
      const guest = isGuestMode === "true";
      setIsGuest(guest);

      if (guest) return;

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("No se encontró el ID del usuario");

      const url = `https://cooksy-p77y.onrender.com/users/${userId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar perfil");

      const data = await response.json();
      updateUser(data);

      // Guardar email para auto-login (solo si existe)
      if (data?.email) {
        await AsyncStorage.setItem("loginEmail", data.email);
      }

    } catch (err) {
      console.error("❌ Error al traer perfil:", err);
    }
  };

  init();
}, []);


  const handleLogout = async () => {
    try {
      // Usuario inicial sin preferencias ni datos
      const initialUser: User = {
        ...user!,
        Onboarding: {
          completed: false,
          step: 1,
        },
        measurements: {
          activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          age: 0,
          bmr: 0,
          dailyCalories: 0,
          height: 0,
          weight: 0,
        },
        preferences: {
          dietaryRestrictions: [],
          goals: [],
          preferredCategories: [],
          preferredCuisines: [],
        },
      };

      // Actualizar el usuario en el Provider y AsyncStorage
      await updateUser(initialUser);

      // Limpiar cualquier otra data relacionada al usuario
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.FAVORITE_RECIPES,
        STORAGE_KEYS.RECOMMENDATIONS,
        STORAGE_KEYS.INGREDIENTS,
        STORAGE_KEYS.RECIPES,
        "loginEmail"
      ]);

      // Redirigir a la pantalla de autenticación paso 1
      router.replace("/register/step1");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al cerrar sesión. Por favor intenta de nuevo."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isGuest ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#FB8C00",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 24,
            }}
          >
            Funcionalidad no disponible en modo invitado.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#FB8C00",
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 25,
            }}
            onPress={() => router.push("/register/step2")}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Registrarme
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#FFA726", "#FB8C00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Ionicons
                name="person-circle-outline"
                size={120}
                color="#FFFFFF"
              />
              <Text style={styles.nameText}>
                {user?.alias || "Nombre no disponible"}
              </Text>
              <Text style={styles.usernameText}>
                {user?.email || "Email no disponible"}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <View style={{ marginTop: 20 }}>
              <ProfileSection title="Recetas favoritas" icon="heart-outline">
                <FavRecipesInfoItem />
              </ProfileSection>
            </View>
            <ProfileSection title="Mis recetas" icon="restaurant-outline">
              <MyRecipesInfoItem />
            </ProfileSection>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => router.push("/forgotPassword" as never)}
            >
              <LinearGradient
                colors={["#FFA500", "#FF8C00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoutGradient}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Cambiar contraseña</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={["#FF4B4B", "#FF3636"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoutGradient}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.logoutIcon}
                />
                <Text onPress={handleLogout} style={styles.logoutText}>
                  Cerrar Sesión
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    marginTop: -20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#F8FAFC",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionGradient: {
    padding: 20,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 10,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  infoValueContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
  },
  infoValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  logoutButton: {
    marginVertical: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  recipeContainer: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    marginBottom: 12,
  },
  recipeContainerInfo: {
    flexDirection: "column",
  },
  recipeImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  moreRecipeInfo: {
    textDecorationLine: "underline",
    fontSize: 14,
    color: "#4B5563",
  },
});

export default ProfileScreen;
