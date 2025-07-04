// app/api/controller/recipeController.ts
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Receta from '../model/Receta';

export async function getLatestRecipes(_req: Request, res: Response) {
  const latest = await Receta.find({ estado: 'aprobada' })
    .sort({ createdAt: -1 })
    .limit(3);
  res.json(latest);
}

export async function searchRecipes(req: Request, res: Response) {
  const { name, type, includeIngredient, excludeIngredient, user, orderBy } = req.query;
  const filter: any = { estado: 'aprobada' };
  if (name) filter.nombre = new RegExp(String(name), 'i');
  if (type) filter.tipo = String(type);
  if (includeIngredient) filter['ingredientes.nombre'] = new RegExp(String(includeIngredient), 'i');
  if (excludeIngredient) filter['ingredientes.nombre'] = { $nin: [String(excludeIngredient)] };
  if (user) filter.autor = String(user);

  let q = Receta.find(filter);
  if (orderBy === 'newest') q = q.sort({ createdAt: -1 });
  if (orderBy === 'name')    q = q.sort({ nombre: 1 });
  if (orderBy === 'user')    q = q.sort({ autor: 1 });

  const results = await q.exec();
  res.json(results);
}

export async function createRecipe(req: Request, res: Response) {
  try {
    const receta = new Receta({ ...req.body, estado: 'aprobada' });
    await receta.save();
    res.status(201).json(receta);
  } catch (e: any) {
    if (e.code === 11000) return res.status(409).json({ message: 'Receta duplicada' });
    res.status(400).json({ message: 'Datos inválidos' });
  }
}

export async function getRecipeById(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const receta = await Receta.findById(req.params.id).populate('autor', 'email alias nombre');
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
  res.json(receta);
}

export async function updateRecipe(req: Request, res: Response) {
  const receta = await Receta.findById(req.params.id);
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
  Object.assign(receta, req.body);
  await receta.save();
  res.json(receta);
}

export async function deleteRecipe(req: Request, res: Response) {
  const deleted = await Receta.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Receta no encontrada' });
  res.status(204).end();
}

export async function addRating(req: Request, res: Response) {
  const receta = await Receta.findById(req.params.id);
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
  receta.ratings.push({
    userId: req.body.userId,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  await receta.save();
  res.status(201).json({ message: 'Valoración registrada' });
}

export async function getComments(req: Request, res: Response) {
  const receta = await Receta.findById(req.params.id);
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
  const comments = receta.ratings.filter(r => !!r.comment);
  res.json(comments);
}

export async function adjustRecipe(req: Request, res: Response) {
  const receta = await Receta.findById(req.params.id);
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

  const { porciones, cantidadIngrediente } = req.body as any;
  const factor = porciones
    ? porciones
    : cantidadIngrediente
    ? cantidadIngrediente.cantidad / 1
    : 1;

  const ajustados = receta.ingredientes.map(i => ({
    nombre: i.nombre,
    cantidad: `${parseFloat(i.cantidad) * factor}`,
  }));

  res.json({ porciones: porciones || 1, ingredientes: ajustados });
}
export async function getLatestApprovedRecipes(_req: Request, res: Response) {
  const latest = await Receta.find({ estado: 'aprobada' })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('autor', 'alias email nombre');
  res.json(latest);
}