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
  if (user.savedRecipes.some(r => r.toString() === recipeId)) {
    return res.status(409).json({ message: 'Receta ya guardada' });
  }
  console.log(`Usuario ID: ${id}`);
  console.log(`Receta a agregar: ${recipeId}`);
  console.log('Favoritos antes de agregar:', user.savedRecipes);
  console.log('Agregando receta a favoritos:', recipeId);
  user.savedRecipes.push(recipeId as any);
  await user.save();
  res.status(201).json({ message: 'Receta agregada a guardadas', savedRecipes: user.savedRecipes });
};

export const deleteSavedRecipe = async (req: Request, res: Response) => {
  const { id, recipeId } = req.params;
  if (!recipeId) return res.status(400).json({ message: 'recipeId es requerido' });
  const user = await Usuario.findById(id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  console.log(`Usuario ID: ${id}`);
  console.log(`Receta a eliminar: ${recipeId}`);
  console.log('Favoritos antes de eliminar:', user.savedRecipes);
  console.log('Eliminando receta de favoritos:', recipeId);
  user.savedRecipes = user.savedRecipes.filter(r => r.toString() !== recipeId);
  await user.save();
  res.status(200).json({ message: 'Receta eliminada de guardadas', savedRecipes: user.savedRecipes });
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.userId; // obtenido del middleware auth
  const user = await Usuario.findById(userId).select('alias email nombre apellido fechaNacimiento savedRecipes myRecipes');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

export const getProfileById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await Usuario.findById(id)
    .select('alias email nombre apellido fechaNacimiento savedRecipes myRecipes')
    .populate('myRecipes'); // para traer los datos completos de las recetas propias
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};
export const getMyRecipes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await Usuario.findById(id).populate('myRecipes');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user.myRecipes);
};