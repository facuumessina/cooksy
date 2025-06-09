import api from './api';
import { handleApiError } from './errorHandler';
import {
    AdjustByIngredientDTO,
    AdjustByPortionsDTO,
    Receta,
    RecipeRatingDTO,
} from './types';

export const getLatestRecipes = async () => {
  try {
    const res = await api.get('/recipes/latest');
    return res.data;
  } catch (error) {
    handleApiError(error, 'getLatestRecipes');
  }
};

export const searchRecipes = async (params: {
  name?: string;
  type?: string;
  includeIngredient?: string;
  excludeIngredient?: string;
  user?: string;
  orderBy?: 'newest' | 'name' | 'user';
}) => {
  try {
    const res = await api.get('/recipes/search', { params });
    return res.data;
  } catch (error) {
    handleApiError(error, 'searchRecipes');
  }
};

export const createRecipe = async (data: Receta, token: string) => {
  try {
    const res = await api.post('/recipes', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, 'createRecipe');
  }
};

export const getRecipeDetails = async (id: string) => {
  try {
    const res = await api.get(`/recipes/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'getRecipeDetails');
  }
};

export const updateRecipe = async (id: string, data: Partial<Receta>, token: string) => {
  try {
    const res = await api.put(`/recipes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, 'updateRecipe');
  }
};

export const deleteRecipe = async (id: string, token: string) => {
  try {
    await api.delete(`/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    handleApiError(error, 'deleteRecipe');
  }
};

export const rateRecipe = async (id: string, data: RecipeRatingDTO) => {
  try {
    const res = await api.post(`/recipes/${id}/rating`, data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'rateRecipe');
  }
};

export const getRecipeComments = async (id: string) => {
  try {
    const res = await api.get(`/recipes/${id}/comments`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'getRecipeComments');
  }
};

export const adjustRecipeByPortions = async (id: string, data: AdjustByPortionsDTO) => {
  try {
    const res = await api.post(`/recipes/${id}/adjust`, data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'adjustRecipeByPortions');
  }
};

export const adjustRecipeByIngredient = async (id: string, data: AdjustByIngredientDTO) => {
  try {
    const res = await api.post(`/recipes/${id}/adjust`, data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'adjustRecipeByIngredient');
  }
};