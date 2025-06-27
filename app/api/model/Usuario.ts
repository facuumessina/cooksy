import api from '../api';
import { handleApiError } from '../errorHandler';

export interface Usuario {
  id: string;
  email: string;
  alias: string;
  nombre: string;
}

export const getSavedRecipes = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/saved-recipes`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'getSavedRecipes');
  }
};

export const saveRecipe = async (userId: string, recipeId: string) => {
  try {
    const response = await api.post(`/users/${userId}/saved-recipes`, { recipeId });
    return response.data;
  } catch (error) {
    handleApiError(error, 'saveRecipe');
  }
};

export const deleteSavedRecipe = async (userId: string, recipeId: string) => {
  try {
    await api.delete(`/users/${userId}/saved-recipes/${recipeId}`);
  } catch (error) {
    handleApiError(error, 'deleteSavedRecipe');
  }
};
