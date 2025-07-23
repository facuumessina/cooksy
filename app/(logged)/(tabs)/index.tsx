import { useData } from '@/context/DataProvider';
import { Cuisine, DietaryRestriction } from '@/types/enums';
import { Recipe } from '@/types/types';
import { translateCuisine, translateDietaryRestriction } from '@/utils/enum-translations';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedLoading from '../../AnimatedLoading';

const QUICK_FILTERS = {
    restrictions: [
        DietaryRestriction.VEGAN,
        DietaryRestriction.VEGETARIAN,
        DietaryRestriction.LOW_FAT,
        DietaryRestriction.NO_SUGAR,
    ]
};

const FilterTag = ({ title, active = false, onPress }) => (
    <TouchableOpacity style={[styles.filterTag, active && styles.filterTagActive]} onPress={onPress}>
        <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>{title}</Text>
    </TouchableOpacity>
);

const FilterModal = ({ visible, onClose, activeFilters, onToggleFilter }) => (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filtros</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupTitle}>Restricciones dietéticas</Text>
                        <View style={styles.filterGroupContent}>
                            {Object.values(DietaryRestriction).map((restriction) => (
                                <FilterTag
                                    key={restriction}
                                    title={translateDietaryRestriction(restriction)}
                                    active={activeFilters.restrictions.has(restriction)}
                                    onPress={() => onToggleFilter('restrictions', restriction)}
                                />
                            ))}
                        </View>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupTitle}>Cocinas</Text>
                        <View style={styles.filterGroupContent}>
                            {Object.values(Cuisine).map((cuisine) => (
                                <FilterTag
                                    key={cuisine}
                                    title={translateCuisine(cuisine)}
                                    active={activeFilters.cuisines.has(cuisine)}
                                    onPress={() => onToggleFilter('cuisines', cuisine)}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// Add GuestBanner component at the top
const GuestBanner = ({ onRegister }) => (
  <View style={{ backgroundColor: '#FB8C00', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Estás en modo invitado</Text>
    <TouchableOpacity
      style={{ backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginLeft: 12 }}
      onPress={onRegister}
    >
      <Text style={{ color: '#FB8C00', fontWeight: 'bold' }}>Registrarme</Text>
    </TouchableOpacity>
  </View>
);

export default function Home() {
    const insets = useSafeAreaInsets();
    const navigation = useRouter();
    // Navigate to search screen with empty filters
    const handleSeeAll = () => {
      navigation.navigate('/(logged)/recipes/searchRecipes', {
        searchTerm: '',
        userSearch: '',
        selectedCuisines: [],
        selectedIngredients: [],
        selectedExcludedIngredients: [],
      });
    };
    const { user, setCurrentRecommendations, updateUser } = useData();
    const [recommendations, setRecommendations] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isCalculating, setIsCalculating] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [activeFilters, setActiveFilters] = useState({
        restrictions: new Set(),
        cuisines: new Set()
    });
    const [isGuest, setIsGuest] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadRecommendations = async () => {
        try {
            const response = await fetch('http://10.0.2.2:3000/recipes/latest');
            if (!response.ok) throw new Error('Error al cargar recetas');
            const data = await response.json();
            setRecommendations(data);
            setFilteredRecipes(data);
        } catch (err) {
            console.error("Error al traer recetas:", err);
        } finally {
            setIsCalculating(false);
            setTimeout(() => setShowLoader(false), 300);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('No se encontró el ID del usuario');
            const url = `http://10.0.2.2:3000/users/${userId}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar perfil');
            const data = await response.json();
            updateUser(data);
        } catch (err) {
            console.error("Error al traer perfil:", err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        loadRecommendations();
        return () => {
            setCurrentRecommendations([]);
            setRecommendations([]);
            setFilteredRecipes([]);
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadRecommendations();
        }, [])
    );

    useEffect(() => {
        if (!recommendations.length) return;
        let filtered = [...recommendations];
        if (activeFilters.restrictions.size > 0) {
            filtered = filtered.filter(recipe =>
                Array.from(activeFilters.restrictions).every(r => recipe.restrictions.includes(r))
            );
        }
        if (activeFilters.cuisines.size > 0) {
            filtered = filtered.filter(recipe =>
                Array.from(activeFilters.cuisines).some(c => recipe.cuisine === c)
            );
        }
        // Filtrado por nombre (buscador)
        if (searchQuery.trim()) {
            filtered = filtered.filter(recipe =>
                recipe.nombre.toLowerCase().includes(searchQuery.trim().toLowerCase())
            );
        }
        setFilteredRecipes(filtered);
    }, [activeFilters, recommendations, searchQuery]);

    useEffect(() => {
        AsyncStorage.getItem('isGuestMode').then(val => {
            setIsGuest(val === 'true');
        });
    }, []);

    const toggleFilter = (
        group: 'restrictions' | 'cuisines',
        value: string
    ) => {
        setActiveFilters(prev => {
            const newSet = new Set<string>(prev[group]);
            if (newSet.has(value)) newSet.delete(value);
            else newSet.add(value);
            return { ...prev, [group]: newSet };
        });
    };

    if (isCalculating || showLoader) {
        return <Animated.View exiting={FadeOut}><AnimatedLoading /></Animated.View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {isGuest && <GuestBanner onRegister={() => router.push('/register/step2')} />}
            <ScrollView style={[styles.scrollView, isGuest && { paddingTop: 0, marginTop: 0 }]}>
                <View style={[styles.header, isGuest && { paddingTop: 0, marginTop: 0, marginBottom: 0, height: 0, minHeight: 0 }]}>
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            {!isGuest && (
                                <>
                                    <TouchableOpacity onPress={() => router.navigate('/(logged)/profile')}>
                                        <Ionicons name="person-circle-outline" size={40} color="black" style={{ marginRight: 8 }} />
                                    </TouchableOpacity>
                                    <Text style={styles.greeting}>Hola,</Text>
                                    <Text style={styles.userName}>{user?.name || user?.alias || 'Usuario'}</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="sparkles" size={18} color="#F97316" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#F97316', textAlign: 'center' }}>
                    Inspirate con nuevas recetas cada día
                  </Text>
                  <Ionicons name="sparkles" size={18} color="#F97316" style={{ marginLeft: 6 }} />
                </View>

                <View style={styles.recommendedSection}>
                    <View style={styles.recommendedHeader}>
                        <Text style={styles.recommendedTitle}>Recomendado para ti</Text>
                        <TouchableOpacity onPress={handleSeeAll}>
                            <Text style={styles.seeAllText}>Ver Todo</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        {filteredRecipes.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: 60 }}>
                                <Ionicons name="sad-outline" size={64} color="gray" style={{ marginBottom: 16 }} />
                                <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', maxWidth: 280 }}>
                                    No se encontraron recetas que coincidan con los filtros aplicados o aún no hay recetas disponibles.
                                </Text>
                            </View>
                        ) : (
                            filteredRecipes.map(recipe => (
                                <TouchableOpacity
                                    key={recipe._id}
                                    onPress={() => router.push(`/recommendations/${recipe._id}`)}
                                    style={styles.foodItem}
                                >
                                    <Image
                                        source={{ uri: recipe.imagen || recipe.multimedia?.[0] }}
                                        style={styles.foodImage}
                                        resizeMode="cover"
                                    />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4 }}>
                                        <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{recipe.nombre}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="restaurant-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                                            <Text style={{ fontSize: 14, color: '#666', marginRight: 8 }}>{recipe.ingredientes?.length || 0}</Text>
                                            <Ionicons name="star" size={16} color="#FBBF24" style={{ marginRight: 4 }} />
                                            {recipe.averageRating ? (
                                              <Text style={{ fontSize: 14, color: '#666' }}>{recipe.averageRating.toFixed(1)}</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.createRecipeButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[styles.createRecipeButton, isGuest && { backgroundColor: '#ccc', opacity: 0.6 }]}
                    onPress={() => {
                        if (isGuest) {
                            alert('Funcionalidad solo disponible para usuarios registrados.');
                        } else {
                            navigation.push('/(logged)/recipes/create');
                        }
                    }}
                    disabled={isGuest}
                >
                    <Text style={styles.createRecipeText}>Crear Receta</Text>
                </TouchableOpacity>
            </View>

            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 64
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    greeting: {
        fontSize: 16,
        color: 'gray',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 25,
        margin: 16,
        padding: 10,
    },
    searchText: {
        flex: 1,
        marginLeft: 10,
        color: 'gray',
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButton: {
        padding: 8,
        marginRight: 8,
    },
    filterContainer: {
        flexGrow: 0,
    },
    filterTag: {
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterTagActive: {
        backgroundColor: '#F97316',
    },
    filterTagText: {
        color: 'gray',
    },
    filterTagTextActive: {
        color: 'white',
    },
    recommendedSection: {
        margin: 16,
    },
    recommendedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recommendedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllText: {
        color: '#F97316',
    },
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
    foodTitle: {
        marginTop: 4,
        fontSize: 12, // Reducido para que quepa mejor
        lineHeight: 16, // Ajustado para mejor espaciado
        textAlign: 'left', // Cambiado a left alignment
        color: '#333333',
        paddingHorizontal: 4, // Añadido padding horizontal
        height: 32, // Altura fija para 2 líneas
    },
    createRecipeButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        backgroundColor: 'fff',
        paddingTop: 16,
    },
    createRecipeButton: {
        backgroundColor: '#F97316',
        borderRadius: 25,
        padding: 16,
        alignItems: 'center',
    },
    createRecipeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    filterGroup: {
        marginVertical: 16,
    },
    filterGroupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    filterGroupContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    applyButton: {
        backgroundColor: '#F97316',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skeletonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16,
    },
    skeletonItem: {
        width: 100,
        height: 140,
        backgroundColor: '#E1E9EE',
        borderRadius: 8,
        marginRight: 16,
    },
    emptyState: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        maxWidth: 250,
    },
});

