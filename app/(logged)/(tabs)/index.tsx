import SearchBar from '@/components/Search';
import { useData } from '@/context/DataProvider';
import { Cuisine, DietaryRestriction } from '@/types/enums';
import { Recipe } from '@/types/types';
import { translateCuisine, translateDietaryRestriction } from '@/utils/enum-translations';
import { Ionicons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Filtros rápidos para el ScrollView horizontal
const QUICK_FILTERS = {
    restrictions: [
        DietaryRestriction.VEGAN,
        DietaryRestriction.VEGETARIAN,
        DietaryRestriction.LOW_FAT,
        DietaryRestriction.NO_SUGAR
    ]
};

// Filtros completos para el modal
const ALL_FILTERS = {
    restrictions: Object.values(DietaryRestriction),
    cuisines: Object.values(Cuisine),
};


const FilterTag = ({ title, active = false, onPress }: { title: string; active?: boolean; onPress?: () => void }) => (
    <TouchableOpacity
        style={[styles.filterTag, active && styles.filterTagActive]}
        onPress={onPress}
    >
        <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>
            {title}
        </Text>
    </TouchableOpacity>
);

const FilterModal = ({ visible, onClose, activeFilters, onToggleFilter }: {
    visible: boolean;
    onClose: () => void;
    activeFilters: {
        restrictions: Set<DietaryRestriction>;
        cuisines: Set<Cuisine>;
    };
    onToggleFilter: (group: "restrictions" | "cuisines", value: any) => void;
}) => (
    <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
    >
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
                            {ALL_FILTERS.restrictions.map((restriction) => (
                                <FilterTag
                                    key={restriction as unknown as string}
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
                            {ALL_FILTERS.cuisines.map((cuisine) => (
                                <FilterTag
                                    key={cuisine as unknown as string}
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

import type { ImageSourcePropType } from 'react-native';

// Mapeo de imágenes locales
const imageMap = {
    "1.jpg": require('@/assets/images/cuisines/carbonara.jpg'),
    "2.jpg": require('@/assets/images/cuisines/guacamole.jpeg'),
    "3.webp": require('@/assets/images/cuisines/mediterranean.webp'),
};
const FoodItem = ({ title, imageUrl, id, ingredientsCount }: { id: string, title: string; imageUrl: ImageSourcePropType, ingredientsCount: number }) => (
    <TouchableOpacity
        onPress={() => router.push({
            pathname: '/recommendations/[id]',
            params: { id },
        })}
        style={styles.foodItem}
    >
        <Image
            source={imageUrl}
            style={styles.foodImage}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4 }}>
            <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="restaurant-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 14, color: '#666' }}>{ingredientsCount}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function Home() {
    const insets = useSafeAreaInsets();
    const navigation = useRouter();
    const { user, ingredients, recipes, isInitialized, isLoading, setCurrentRecommendations } = useData();
    const [recommendations, setRecommendations] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isCalculating, setIsCalculating] = useState(true);
    const [activeFilters, setActiveFilters] = useState<{
        restrictions: Set<DietaryRestriction>;
        cuisines: Set<Cuisine>;
    }>({
        restrictions: new Set(),
        cuisines: new Set()
    });

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const response = await fetch('http://192.168.0.59:3000/recipes/latest');
                if (!response.ok) throw new Error('Error al cargar recetas');
                const data = await response.json();
                setRecommendations(data);
                setFilteredRecipes(data);
            } catch (err) {
                console.error("Error al traer recetas:", err);
            } finally {
                setIsCalculating(false);
            }
        };

        loadRecommendations();

        return () => {
            setCurrentRecommendations([]);
            setRecommendations([]);
            setFilteredRecipes([]);
        };
    }, []);

    const toggleFilter = (group: keyof typeof activeFilters, value: DietaryRestriction | Cuisine) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };

            if ((newFilters[group] as Set<DietaryRestriction | Cuisine>).has(value)) {
                (newFilters[group] as Set<DietaryRestriction | Cuisine>).delete(value);
            } else {
                (newFilters[group] as Set<DietaryRestriction | Cuisine>).add(value);
            }

            return newFilters;
        });
    };

    useEffect(() => {
        if (!recommendations.length) return;

        let filtered = [...recommendations];

        // Filtrar por restricciones dietéticas
        if (activeFilters.restrictions.size > 0) {
            filtered = filtered.filter(recipe => {
                const cumpleRestricciones = Array.from(activeFilters.restrictions)
                    .every(restriction => recipe.restrictions.includes(restriction));

                return cumpleRestricciones;
            });
        }

        // Filtrar por tipo de cocina
        if (activeFilters.cuisines.size > 0) {
            filtered = filtered.filter(recipe => {
                const cumpleCocina = Array.from(activeFilters.cuisines)
                    .some(cuisine => recipe.cuisine === cuisine);
                return cumpleCocina;
            });
        }

        setFilteredRecipes(filtered);
    }, [activeFilters, recommendations]);

    const renderFilterSection = () => (
        <View style={styles.filterSection}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
            >
                <Ionicons name="filter" size={24} color="#F97316" />
            </TouchableOpacity>
            <ScrollView horizontal scrollEnabled showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {QUICK_FILTERS.restrictions.map((restriction) => (
                    <FilterTag
                        key={restriction}
                        title={translateDietaryRestriction(restriction)}
                        active={activeFilters.restrictions.has(restriction)}
                        onPress={() => toggleFilter('restrictions', restriction)}
                    />
                ))}
            </ScrollView>
        </View>
    );

    const renderRecommendedSection = () => (
        <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
                <Text style={styles.recommendedTitle}>Recomendado para ti</Text>
                <TouchableOpacity onPress={() => router.navigate('/(logged)/recommendations')}>
                    <Text style={styles.seeAllText}>Ver Todo</Text>
                </TouchableOpacity>
            </View>
            <View>
                {filteredRecipes?.map(recipe => (
                    <TouchableOpacity
                        key={recipe._id}
                        onPress={() => router.push(`/recommendations/${recipe._id}`)}
                        style={styles.foodItem}
                    >
                        <View style={[styles.foodImage, styles.imagePlaceholder]} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginTop: 4 }}>
                            <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                                {recipe.nombre}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="restaurant-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                                <Text style={{ fontSize: 14, color: '#666' }}>
                                    {recipe.ingredientes?.length || 0}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => router.navigate('/(logged)/profile')}>
                                <Ionicons name="person-circle-outline" size={40} color="black" style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                            <Text style={styles.greeting}>Hola,</Text>
                            <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <SearchBar />

                {renderFilterSection()}
                {renderRecommendedSection()}
            </ScrollView>

            <View style={[styles.createRecipeButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={styles.createRecipeButton}
                    onPress={() => navigation.push('/(logged)/recipes/create')}
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

