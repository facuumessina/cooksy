import ingredientsData from '@/assets/data/ingredients.json';
import recipesData from '@/assets/data/recipes.json';
import FavoriteButton from '@/components/FavoriteButton';
import Toast from '@/components/Toast';
import { useData } from '@/context/DataProvider';
import { Ingredient, Recipe } from '@/types/types';
import { translateFoodUnit } from '@/utils/enum-translations';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const imageMap = {
  "1.jpg": require('@/assets/images/cuisines/carbonara.jpg'),
  "2.jpg": require('@/assets/images/cuisines/guacamole.jpeg'),
  "3.webp": require('@/assets/images/cuisines/mediterranean.webp'),
};

const width = Dimensions.get('window').width;

const RecipeDetailScreen = () => {
  const { id, fromSearch, fromFilter } = useLocalSearchParams();
  const router = useRouter();
  const {
    currentRecipeIngredients,
    user,
  } = useData();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<Ingredient[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const foundRecipe = recipesData.find(r => r.id === id) || null;
    setRecipe(foundRecipe);

    if (foundRecipe) {
      const missing = foundRecipe.ingredients.filter((ingredient) => {
        const isInCurrentRecipe = currentRecipeIngredients.some(i => i.id === ingredient.id);
        const isInUserIngredients = user?.ingredients?.some(i => i.id === ingredient.id);
        return !isInCurrentRecipe && !isInUserIngredients;
      });
      setMissingIngredients(missing || []);
    }
  }, [id]);

  const isIngredientMissing = (ingredient: Ingredient): boolean => {
    const isInCurrentRecipe = currentRecipeIngredients.some(i => i.id === ingredient.id);
    const isInUserIngredients = user?.ingredients?.some(i => i.id === ingredient.id);
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
        <FavoriteButton recipe={recipe} style={styles.favouriteButton} />
        <Image
          source={imageMap[recipe.image]}
          style={styles.recipeImage}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{recipe.name}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.sectionContainer}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Ionicons
                    name="ellipse"
                    size={20}
                    color="#333"
                  />
                  <Text style={styles.ingredientText}>
                    {JSON.stringify(ingredientsData.find(i => Number(i.id) === Number(ingredient.id)))} - {ingredient.quantity} {translateFoodUnit(ingredient)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparación</Text>
            <View style={styles.sectionContainer}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepBullet}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valorar</Text>
            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FFA500"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              paddingHorizontal: 12,
              marginBottom: 8,
            }}>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#333',
                  paddingVertical: 8,
                }}
                placeholder="Escribí tu comentario..."
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity onPress={() => {
                console.log(`Comentario: ${comment}, Rating: ${rating}`);
                setComment('');
                setRating(0);
              }}>
                <Ionicons name="send" size={24} color="#FFA500" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      <Toast
        visible={toastVisible}
        message="Ingredientes agregados a la lista de compras"
        type="success"
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
  },
  favouriteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
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
    textAlign: 'center',
    marginTop: 100,
  },
  recipeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 12,
    color: '#F57C00',
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  missingIngredient: {
    color: '#FF5252',
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 16,
  },
  stepBullet: {
    width: 32,
    height: 32,
    backgroundColor: '#1d7dde',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  nutritionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  portionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ingredientsSection: {
    flexDirection: width > 400 ? 'row' : 'column',
    justifyContent: width > 400 ? 'space-between' : 'flex-start',
    alignItems: width > 400 ? 'center' : 'flex-start',
    marginBottom: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  backButtonWithSearch: {
    top: 120,
  },
});

export default RecipeDetailScreen;