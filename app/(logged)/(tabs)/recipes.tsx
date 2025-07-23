import { Cuisine } from '@/types/enums';
import { translateCuisine } from '@/utils/enum-translations';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const INGREDIENT_RANGES = [
  'Cualquiera',
  '1 a 5 ingredientes',
  '6 a 10 ingredientes',
  '11 a 15 ingredientes',
  'Más de 15 ingredientes'
];

const recipes = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<Set<Cuisine>>(new Set());
  const [ingredientsRange, setIngredientsRange] = useState('Cualquiera');
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  // For input field to add ingredient manually
  const [ingredientInput, setIngredientInput] = useState('');

  const [selectedExcludedIngredients, setSelectedExcludedIngredients] = useState<string[]>([]);
  // For input field to add excluded ingredient manually
  const [excludedIngredientInput, setExcludedIngredientInput] = useState('');
  // Usuario filter state
  const [userSearch, setUserSearch] = useState('');
  const [userAliasDisplay, setUserAliasDisplay] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsersWithRecipes = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('http://10.0.2.2:3000/recipes/userslist');
      const data = await res.json();
      console.log('Usuarios traídos:', data);
      setUserSuggestions(data);
    } catch (error) {
      console.error('Error al obtener usuarios con recetas:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsersWithRecipes();
  }, []);
  // Navegar a la pantalla de resultados de búsqueda pasando los parámetros actuales
  const handleSearch = () => {
    navigation.navigate('recipes/searchRecipes', {
      searchTerm,
      userSearch,
      selectedCuisines: [...selectedCuisines],
      selectedIngredients,
      selectedExcludedIngredients,
    });
  };


  const handleToggleCuisine = (cuisine: Cuisine) => {
    setSelectedCuisines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cuisine)) {
        newSet.delete(cuisine); // Si ya está seleccionado, lo deselecciona
      } else {
        newSet.clear();         // Si no está, elimina los anteriores...
        newSet.add(cuisine);    // ...y agrega el nuevo
      }
      return newSet;
    });
  };


  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  selectedValue === option && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option && styles.modalOptionTextSelected
                  ]}
                >
                  {option}
                </Text>
                {selectedValue === option && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 30 }}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Que estas buscando?</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#333" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Usuario filter section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usuario</Text>
            <TouchableOpacity
              style={[styles.searchContainer, { marginBottom: 0 }]}
              onPress={() => setShowUserDropdown(!showUserDropdown)}
            >
              <Ionicons name="person" size={20} color="#333" />
              {userAliasDisplay ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.searchInput}>{userAliasDisplay}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setUserSearch('');
                      setUserAliasDisplay('');
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#F97316" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.searchInput}>Seleccionar usuario</Text>
              )}
            </TouchableOpacity>
            {showUserDropdown && userSuggestions.length > 0 && (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 8,
                elevation: 4,
                maxHeight: 200
              }}>
                <ScrollView>
                  {userSuggestions.map((user) => (
                    <TouchableOpacity key={user._id} onPress={() => {
                      setUserSearch(user._id);
                      setUserAliasDisplay(user.alias);
                      setShowUserDropdown(false);
                    }}>
                      <Text style={{ padding: 8 }}>{user.alias}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de receta</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {Object.values(Cuisine).map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.chip,
                      selectedCuisines.has(cuisine) && styles.chipSelected
                    ]}
                    onPress={() => handleToggleCuisine(cuisine)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedCuisines.has(cuisine) && styles.chipTextSelected
                    ]}>
                      {translateCuisine(cuisine)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes que debe contener</Text>
            {/* Input + button for adding ingredient */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput
                style={[styles.searchInput, { flex: 1 }]}
                placeholder="Agregar ingrediente"
                value={ingredientInput}
                onChangeText={setIngredientInput}
              />
              <TouchableOpacity
                onPress={() => {
                  if (ingredientInput.trim()) {
                    setSelectedIngredients([...selectedIngredients, ingredientInput.trim()]);
                    setIngredientInput('');
                  }
                }}
                style={{ marginLeft: 8, backgroundColor: '#F97316', padding: 12, borderRadius: 12 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>
            {/* Chips for added ingredients */}
            {selectedIngredients.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {selectedIngredients.map((ingredient, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: '#F97316',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14 }}>{ingredient}</Text>
                    <TouchableOpacity onPress={() => {
                      setSelectedIngredients(selectedIngredients.filter((_, i) => i !== idx));
                    }}>
                      <Ionicons name="close" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes que no debe contener</Text>
            {/* Input + button for adding excluded ingredient */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput
                style={[styles.searchInput, { flex: 1 }]}
                placeholder="Agregar ingrediente"
                value={excludedIngredientInput}
                onChangeText={setExcludedIngredientInput}
              />
              <TouchableOpacity
                onPress={() => {
                  if (excludedIngredientInput.trim()) {
                    setSelectedExcludedIngredients([...selectedExcludedIngredients, excludedIngredientInput.trim()]);
                    setExcludedIngredientInput('');
                  }
                }}
                style={{ marginLeft: 8, backgroundColor: '#F97316', padding: 12, borderRadius: 12 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>
            {/* Chips for added excluded ingredients */}
            {selectedExcludedIngredients.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {selectedExcludedIngredients.map((ingredient, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: '#F97316',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14 }}>{ingredient}</Text>
                    <TouchableOpacity onPress={() => {
                      setSelectedExcludedIngredients(selectedExcludedIngredients.filter((_, i) => i !== idx));
                    }}>
                      <Ionicons name="close" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {renderModal(
          showIngredientsModal,
          () => setShowIngredientsModal(false),
          'Cantidad de ingredientes',
          INGREDIENT_RANGES,
          ingredientsRange,
          setIngredientsRange
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: '#F97316',
  },
  chipText: {
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    padding: 16,
  },
  searchButton: {
    backgroundColor: '#F97316',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionSelected: {
    backgroundColor: '#F97316',
  },
  modalOptionText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default recipes;