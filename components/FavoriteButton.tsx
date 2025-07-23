// components/FavoriteButton.tsx
import { useData } from '@/context/DataProvider';
import { Recipe } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FavoriteButtonProps {
    recipe: Recipe;
    size?: number;
    style?: object;
}

const FavoriteButton = ({ recipe, size = 24, style }: FavoriteButtonProps) => {
    const { favouriteRecipes, toggleFavourite } = useData();
    const isFavourite = favouriteRecipes.includes(recipe._id);
    console.log('📌 recipe._id (verificación):', recipe._id);
    console.log('❤️ Renderizando botón favorito para receta con ID:', recipe._id);
    console.log('📌 favouriteRecipes:', favouriteRecipes);

    return (
        <TouchableOpacity
            style={[styles.favouriteButton, style]}
            onPress={() => {
                if (!recipe._id) {
                    console.warn('⚠️ No se pudo guardar la receta como favorita: _id no definido');
                    return;
                }

                console.log('💾 toggleFavourite ejecutado con ID:', recipe._id);
                toggleFavourite(prev => {
                    if (prev.includes(recipe._id)) {
                        return prev.filter(id => id !== recipe._id);
                    } else {
                        return [...prev, recipe._id];
                    }
                });
            }}
        >
            <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={size}
                color={isFavourite ? "#FF4081" : "#666666"}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    favouriteButton: {
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
});

export default FavoriteButton;