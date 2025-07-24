import Toast from "@/components/Toast";
import { useData } from "@/context/DataProvider";
import { Ingredient, Recipe } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const width = Dimensions.get("window").width;

const RecipeDetailScreen = () => {
  const { id, fromSearch, fromFilter } = useLocalSearchParams();
  const router = useRouter();
  const { currentRecipeIngredients, user } = useData();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<Ingredient[]>(
    []
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  // State for adjusted portions and ingredients
  const [adjustedPortions, setAdjustedPortions] = useState<number | null>(null);
  const [adjustedIngredients, setAdjustedIngredients] = useState<string[]>([]);
  // Modal state for adjusting portions
  const [modalVisible, setModalVisible] = useState(false);
  const [newPortionInput, setNewPortionInput] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`https://cooksy-p77y.onrender.co/recipes/${id}`);
        if (!response.ok) throw new Error("Error al cargar receta");
        const data = await response.json();
        setRecipe(data);

        // Set missing ingredients as before
        if (data) {
          const missing = data.ingredientes.filter((ingredient: Ingredient) => {
            const isInCurrentRecipe = currentRecipeIngredients.some(
              (i) => i.id === ingredient.id
            );
            const isInUserIngredients = user?.ingredients?.some(
              (i) => i.id === ingredient.id
            );
            return !isInCurrentRecipe && !isInUserIngredients;
          });
          setMissingIngredients(missing || []);
        }
        // Set favorite status after recipe is loaded and user is available
        const savedIds = user?.savedRecipes?.map((id) => String(id)) || [];

        setIsFavorite(savedIds.includes(String(data._id)));
      } catch (err) {
        console.error("Error al traer receta:", err);
      }
    };

    fetchRecipe();
    // Only rerun if id, user, or currentRecipeIngredients change
  }, [id, user, currentRecipeIngredients]);

  const isIngredientMissing = (ingredient: Ingredient): boolean => {
    const isInCurrentRecipe = currentRecipeIngredients.some(
      (i) => i.id === ingredient.id
    );
    const isInUserIngredients = user?.ingredients?.some(
      (i) => i.id === ingredient.id
    );
    return !isInCurrentRecipe && !isInUserIngredients;
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (!recipe || !user?._id) {
              setToastVisible(true); // Mostrar mensaje friendly al invitado
              return;
            }

            const endpoint = isFavorite
              ? `https://cooksy-p77y.onrender.co/users/${user._id}/saved-recipes/${recipe._id}`
              : `https://cooksy-p77y.onrender.co/users/${user._id}/saved-recipes`;

            const options: RequestInit = isFavorite
              ? {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                }
              : {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ recipeId: recipe._id }),
                };

            try {
              const response = await fetch(endpoint, options);
              if (!response.ok)
                throw new Error("Error al actualizar favoritos");

              setIsFavorite((prev) => !prev);
            } catch (error) {
              console.error("❌ Error al actualizar favoritos:", error);
            }
          }}
          style={styles.favouriteButton}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color="#f00"
          />
        </TouchableOpacity>

        <Image source={{ uri: recipe.imagen }} style={styles.recipeImage} />

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.title}>{recipe.nombre}</Text>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.sectionContainer}>
              {(adjustedIngredients.length > 0
                ? adjustedIngredients
                : recipe.ingredientes.map(
                    (ingredient) =>
                      `${ingredient.nombre} - ${ingredient.cantidad}`
                  )
              ).map((text, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Ionicons name="ellipse" size={20} color="#333" />
                  <Text style={styles.ingredientText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparación</Text>
            <View style={styles.sectionContainer}>
              {recipe.instrucciones.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepBullet}>
                    <Text style={styles.stepNumber}>{step.paso}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.descripcion}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View>
                <Text style={styles.sectionTitle}>
                  Comen:{" "}
                  <Text style={styles.ingredientText}>
                    {adjustedPortions ?? recipe.porciones} persona
                    {(adjustedPortions ?? recipe.porciones) > 1 ? "s" : ""}
                  </Text>
                </Text>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Creada por:{" "}
                  <Text style={styles.ingredientText}>
                    {recipe.autor?.alias || "Desconocido"}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
              >
                <Text
                  style={{
                    color: "#FF7F00",
                    textDecorationLine: "underline",
                    fontSize: 16,
                  }}
                >
                  Ajustar porciones
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valorar</Text>
            {!user?._id ? (
              <View style={styles.warningContainer}>
                <View style={styles.warningContent}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#F57C00"
                  />
                  <Text style={styles.warningText}>
                    Iniciá sesión o registrate para poder valorar esta receta.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row", marginVertical: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={async () => {
                      setRating(star);

                      try {
                        const response = await fetch(
                          `https://cooksy-p77y.onrender.co/recipes/${id}/rating`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              userId: user?._id,
                              rating: star,
                            }),
                          }
                        );

                        if (!response.ok) {
                          throw new Error("Error al enviar valoración");
                        }

                        setToastVisible(true);
                      } catch (error) {
                        console.error("Error al enviar valoración:", error);
                      }
                    }}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color="#FFA500"
                      style={{ marginHorizontal: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            {!user?._id ? (
              <View style={styles.warningContainer}>
                <View style={styles.warningContent}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#F57C00"
                  />
                  <Text style={styles.warningText}>
                    Iniciá sesión o registrate para dejar un comentario.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#333",
                      paddingVertical: 8,
                    }}
                    placeholder="Escribí tu comentario..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      if (comment.trim()) {

                        try {
                          const response = await fetch(
                            `https://cooksy-p77y.onrender.co/recipes/${id}/comments`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                userId: user?._id,
                                alias: user?.alias,
                                comment: comment.trim(),
                              }),
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Error al enviar comentario");
                          }

                          const updatedRecipe = await response.json();
                          setRecipe(updatedRecipe);
                          setComment("");
                        } catch (error) {
                          console.error("Error al enviar comentario:", error);
                        }
                      }
                    }}
                  >
                    <Ionicons name="send" size={24} color="#FFA500" />
                  </TouchableOpacity>
                </View>

                {recipe.comments && recipe.comments.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    {recipe.comments.map((c, index) => (
                      <View key={index} style={{ marginBottom: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={{ fontWeight: "bold", color: "#333" }}>
                            {c.alias}
                          </Text>
                          {c.userId === user?._id && (
                            <TouchableOpacity
                              onPress={async () => {
                                try {
                                  const response = await fetch(
                                    `https://cooksy-p77y.onrender.co/recipes/${id}/comments/${c._id}?userId=${user?._id}`,
                                    { method: "DELETE" }
                                  );
                                  if (!response.ok)
                                    throw new Error(
                                      "Error al eliminar comentario"
                                    );
                                  setRecipe((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          comments: prev.comments.filter(
                                            (comment) => comment._id !== c._id
                                          ),
                                        }
                                      : prev
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error al eliminar comentario:",
                                    error
                                  );
                                }
                              }}
                            >
                              <Ionicons name="trash" size={16} color="red" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={{ color: "#555" }}>{c.comment}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <Toast
        visible={toastVisible}
        message="Valoración realizada correctamente"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <Toast
        visible={toastVisible && !user?._id}
        message="Iniciá sesión para guardar tus recetas favoritas ❤️"
        type="info"
        onHide={() => setToastVisible(false)}
      />

      {modalVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              width: "80%",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Ajustar porciones
            </Text>
            <Text style={{ marginBottom: 12 }}>
              ¿Para cuántas personas querés ajustar la receta?
            </Text>
            <TextInput
              keyboardType="numeric"
              value={newPortionInput}
              onChangeText={setNewPortionInput}
              placeholder="Ej. 4"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 8,
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ marginRight: 16, color: "red" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newPortions = parseInt(newPortionInput);
                  if (!isNaN(newPortions) && newPortions > 0) {
                    const factor = newPortions / recipe.porciones;
                    const newIngredients = recipe.ingredientes.map(
                      (ingredient) => {
                        const match = ingredient.cantidad.match(/([\d.,]+)/);
                        if (match) {
                          const originalQty = parseFloat(
                            match[1].replace(",", ".")
                          );
                          const adjustedQty = (originalQty * factor)
                            .toFixed(2)
                            .replace(".", ",");
                          const adjustedText = ingredient.cantidad.replace(
                            match[1],
                            adjustedQty
                          );
                          return `${ingredient.nombre} - ${adjustedText}`;
                        }
                        return `${ingredient.nombre} - ${ingredient.cantidad}`;
                      }
                    );

                    setAdjustedPortions(newPortions);
                    setAdjustedIngredients(newIngredients);
                    setModalVisible(false);
                    setNewPortionInput("");
                  } else {
                    alert("Por favor, ingresá un número válido.");
                  }
                }}
              >
                <Text style={{ color: "#007AFF" }}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 8,
  },
  favouriteButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  recipeImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },
  warningContainer: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: {
    marginLeft: 12,
    color: "#F57C00",
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  missingIngredient: {
    color: "#FF5252",
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 16,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 16,
    paddingRight: 16,
  },
  stepBullet: {
    width: 32,
    height: 32,
    backgroundColor: "#1d7dde",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  nutritionContainer: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  portionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  nutritionLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  ingredientsSection: {
    flexDirection: width > 400 ? "row" : "column",
    justifyContent: width > 400 ? "space-between" : "flex-start",
    alignItems: width > 400 ? "center" : "flex-start",
    marginBottom: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    position: "absolute",
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchResultText: {
    fontSize: 16,
    color: "#333",
  },
  backButtonWithSearch: {
    top: 120,
  },
});

export default RecipeDetailScreen;
