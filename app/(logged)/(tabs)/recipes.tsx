import { Cuisine, DietaryRestriction, DietType } from '@/types/enums';
import { translateCuisine, translateDietaryRestriction } from '@/utils/enum-translations';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const INGREDIENT_RANGES = [
  'Cualquiera',
  '1 a 5 ingredientes',
  '6 a 10 ingredientes',
  '11 a 15 ingredientes',
  'Más de 15 ingredientes'
];

const recipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<Set<DietaryRestriction>>(new Set());
  const [selectedCuisines, setSelectedCuisines] = useState<Set<Cuisine>>(new Set());
  const [selectedDietTypes, setSelectedDietTypes] = useState<Set<DietType>>(new Set());
  const [ingredientsRange, setIngredientsRange] = useState('Cualquiera');
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showDietTypeModal, setShowDietTypeModal] = useState(false);
  // Ingredients filter modal state
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [allIngredients] = useState<string[]>([
    'Pasta', 'Huevo', 'Bacon', 'Queso Parmesano', 'Pimienta Negra', 'Aceite de Oliva',
    'Palta', 'Cebolla', 'Tomate', 'Cilantro', 'Lima', 'Sal'
  ]);
  const [filteredIngredients, setFilteredIngredients] = useState(allIngredients);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');

  const [excludedIngredientsModalVisible, setExcludedIngredientsModalVisible] = useState(false);
  const [excludedIngredientSearch, setExcludedIngredientSearch] = useState('');
  const [filteredExcludedIngredients, setFilteredExcludedIngredients] = useState(allIngredients);
  const [selectedExcludedIngredients, setSelectedExcludedIngredients] = useState<string[]>([]);
  // Usuario filter state
  const [userSearch, setUserSearch] = useState('');

  const handleToggleRestriction = (restriction: DietaryRestriction) => {
    setSelectedRestrictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(restriction)) {
        newSet.delete(restriction);
      } else {
        newSet.add(restriction);
      }
      return newSet;
    });
  };

  const handleToggleCuisine = (cuisine: Cuisine) => {
    setSelectedCuisines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cuisine)) {
        newSet.delete(cuisine);
      } else {
        newSet.add(cuisine);
      }
      return newSet;
    });
  };

  const handleToggleDietType = (dietType: DietType) => {
    setSelectedDietTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dietType)) {
        newSet.delete(dietType);
      } else {
        newSet.add(dietType);
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
            <View style={styles.searchContainer}>
              <Ionicons name="person" size={20} color="#333" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por usuario"
                value={userSearch}
                onChangeText={setUserSearch}
              />
            </View>
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
            <Text style={styles.sectionTitle}>Restricción alimentaria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {Object.values(DietaryRestriction).map((restriction) => (
                  <TouchableOpacity
                    key={restriction}
                    style={[
                      styles.chip,
                      selectedRestrictions.has(restriction) && styles.chipSelected
                    ]}
                    onPress={() => handleToggleRestriction(restriction)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedRestrictions.has(restriction) && styles.chipTextSelected
                    ]}>
                      {translateDietaryRestriction(restriction)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes que debe contener</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setIngredientsModalVisible(true)}
            >
              <Text style={styles.selectButtonText}>
                {selectedIngredients.length > 0 ? selectedIngredients.join(', ') : 'Seleccionar ingredientes'}
              </Text>
            </TouchableOpacity>
            {selectedIngredients.length > 0 && (
              <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
                {selectedIngredients.map((ingredient) => (
                  <View
                    key={ingredient}
                    style={{
                      backgroundColor: '#F97316',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14 }}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes que no debe contener</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setExcludedIngredientsModalVisible(true)}
            >
              <Text style={styles.selectButtonText}>
                {selectedExcludedIngredients.length > 0 ? selectedExcludedIngredients.join(', ') : 'Seleccionar ingredientes'}
              </Text>
            </TouchableOpacity>
            {selectedExcludedIngredients.length > 0 && (
              <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
                {selectedExcludedIngredients.map((ingredient) => (
                  <View
                    key={ingredient}
                    style={{
                      backgroundColor: '#F97316',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14 }}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/recommendations',
              params: {
                fromFilter: 'true',
                restrictions: Array.from(selectedRestrictions),
                cuisines: Array.from(selectedCuisines),
                dietTypes: Array.from(selectedDietTypes),
                ingredients: selectedIngredients,
                excludedIngredients: selectedExcludedIngredients,
                searchTerm,
                user: userSearch,
              },
            })}
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
        {/* Modal de selección de ingredientes */}
        <Modal visible={ingredientsModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Buscar Ingrediente</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar ingrediente..."
                value={ingredientSearch}
                onChangeText={(text) => {
                  setIngredientSearch(text);
                  setFilteredIngredients(
                    allIngredients.filter(ing => ing.toLowerCase().includes(text.toLowerCase()))
                  );
                }}
              />
              <ScrollView style={{ marginTop: 16 }}>
                {filteredIngredients.map((ingredient) => (
                  <TouchableOpacity
                    key={ingredient}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEE',
                    }}
                    onPress={() => {
                      setSelectedIngredients(prev =>
                        prev.includes(ingredient)
                          ? prev.filter(i => i !== ingredient)
                          : [...prev, ingredient]
                      );
                    }}
                  >
                    <Text>{ingredient}</Text>
                    {selectedIngredients.includes(ingredient) && (
                      <Ionicons name="checkmark" size={20} color="#F97316" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setIngredientsModalVisible(false)}
                style={[styles.searchButton, { marginTop: 20 }]}
              >
                <Text style={styles.searchButtonText}>Hecho</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
        {/* Modal de selección de ingredientes excluidos */}
        <Modal visible={excludedIngredientsModalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Buscar Ingrediente</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar ingrediente..."
                value={excludedIngredientSearch}
                onChangeText={(text) => {
                  setExcludedIngredientSearch(text);
                  setFilteredExcludedIngredients(
                    allIngredients.filter(ing => ing.toLowerCase().includes(text.toLowerCase()))
                  );
                }}
              />
              <ScrollView style={{ marginTop: 16 }}>
                {filteredExcludedIngredients.map((ingredient) => (
                  <TouchableOpacity
                    key={ingredient}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEE',
                    }}
                    onPress={() => {
                      setSelectedExcludedIngredients(prev =>
                        prev.includes(ingredient)
                          ? prev.filter(i => i !== ingredient)
                          : [...prev, ingredient]
                      );
                    }}
                  >
                    <Text>{ingredient}</Text>
                    {selectedExcludedIngredients.includes(ingredient) && (
                      <Ionicons name="checkmark" size={20} color="#F97316" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setExcludedIngredientsModalVisible(false)}
                style={[styles.searchButton, { marginTop: 20 }]}
              >
                <Text style={styles.searchButtonText}>Hecho</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
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