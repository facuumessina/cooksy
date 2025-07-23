import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SearchResultsScreen = () => {
  const router = useRouter();
  const {
    searchTerm,
    userSearch,
    selectedCuisines,
    selectedIngredients,
    selectedExcludedIngredients,
  } = useLocalSearchParams();
  
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const queryParams = new URLSearchParams({
          searchTerm: searchTerm || '',
          userSearch: userSearch || '',
          cuisines: Array.isArray(selectedCuisines) ? selectedCuisines.join(',') : '',
          ingredients: Array.isArray(selectedIngredients) ? selectedIngredients.join(',') : '',
          excludedIngredients: Array.isArray(selectedExcludedIngredients) ? selectedExcludedIngredients.join(',') : '',
        }).toString();
        console.log('Query params:', {
          searchTerm,
          userSearch,
          cuisines: Array.isArray(selectedCuisines) ? selectedCuisines.join(',') : '',
          ingredients: Array.isArray(selectedIngredients) ? selectedIngredients.join(',') : '',
          excludedIngredients: Array.isArray(selectedExcludedIngredients) ? selectedExcludedIngredients.join(',') : '',
        });
        const response = await fetch(`http://10.0.2.2:3000/recipes/search?${queryParams}`, {
          method: 'GET',
        });
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setRecipes(data);
        } catch (err) {
          console.error('Respuesta no es JSON válido:', text);
          throw new SyntaxError('Respuesta del servidor no es JSON válido');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchResults();
  }, []);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF6600" />
        </TouchableOpacity>
        <Text style={styles.title}>Resultados</Text>
      </View>
      <ScrollView style={styles.container}>
        {recipes.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron recetas.</Text>
        ) : (
          recipes.map(recipe => (
            <TouchableOpacity
              key={recipe._id}
              onPress={() => router.push(`/recommendations/${recipe._id}`)}
              style={styles.foodItem}
            >
              <Image
                source={{ uri: recipe.imagen }}
                style={styles.foodImage}
                resizeMode="cover"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4 }}>
                <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{recipe.nombre}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="restaurant-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 14, color: '#666' }}>{recipe.ingredientes?.length || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 8,
  },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: '#666' },
  foodItem: {
    marginBottom: 16,
    width: '100%',
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#F2F2F2',
  },
  noResults: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
});

export default SearchResultsScreen;