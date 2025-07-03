// app/api/controller/userController.ts
import type { Request, Response } from 'express';
import Usuario from '../model/Usuario';

export const getSavedRecipes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await Usuario.findById(id).populate('savedRecipes');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user.savedRecipes);
};

export const addSavedRecipe = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { recipeId } = req.body;
  const user = await Usuario.findById(id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (user.savedRecipes.includes(recipeId as any)) {
    return res.status(409).json({ message: 'Receta ya guardada' });
  }
  user.savedRecipes.push(recipeId as any);
  await user.save();
  res.status(201).json({ message: 'Receta agregada a guardadas' });
};

export const deleteSavedRecipe = async (req: Request, res: Response) => {
  const { id, recipeId } = req.params;
  const user = await Usuario.findById(id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  user.savedRecipes = user.savedRecipes.filter(r => r.toString() !== recipeId);
  await user.save();
  res.status(204).end();
};