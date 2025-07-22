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
  try {
    const { searchTerm, userSearch, cuisines, ingredients, excludedIngredients } = req.query;

    const filter: any = { estado: 'aprobada' };

    if (searchTerm) {
      filter.nombre = { $regex: new RegExp(searchTerm as string, 'i') };
    }

    if (userSearch) {
      let userId = userSearch;
      if (!mongoose.Types.ObjectId.isValid(userSearch as string)) {
        const userDoc = await mongoose.model('Usuario').findOne({ alias: userSearch });
        if (!userDoc) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        userId = userDoc._id;
      }
      filter.autor = userId;
    }

    if (cuisines) {
      const tipos = Array.isArray(cuisines) ? cuisines : [cuisines];
      filter.tipo = { $in: tipos };
    }

    // ingredients filter (debe ir antes que excludedIngredients)
    if (ingredients) {
      const incluidosRaw = Array.isArray(ingredients) ? ingredients : (ingredients as string).split(',');
      const incluidos = incluidosRaw.map(i => i.trim().toLowerCase());

      filter['ingredientes.nombre'] = { $all: incluidos.map(i => new RegExp(`^${i}$`, 'i')) };
    }

    // excludedIngredients filter (después de ingredients)
    if (excludedIngredients) {
      const excluidosRaw = Array.isArray(excludedIngredients)
        ? excludedIngredients
        : (excludedIngredients as string).split(',');
      const excluidos = excluidosRaw.map(i => i.trim().toLowerCase());

      filter['ingredientes.nombre'] = {
        ...(filter['ingredientes.nombre'] || {}),
        $not: {
          $in: excluidos.map(i => new RegExp(`^${i}$`, 'i'))
        }
      };
    }

    const recetas = await Receta.find(filter)
      .populate('autor', 'alias')
      .sort({ createdAt: -1 });

    res.status(200).json(recetas);
  } catch (error) {
    console.error('Error al buscar recetas:', error);
    res.status(500).json({ message: 'Error al buscar recetas' });
  }
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

export async function getUsersWithRecipes(req: Request, res: Response) {
  try {
    console.log("getUsersWithRecipes triggered");
    const users = await Receta.aggregate([
      { $match: { estado: 'aprobada' } },
      { $group: { _id: '$autor' } },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $project: {
          _id: '$userData._id',
          alias: '$userData.alias',
          nombre: '$userData.nombre',
          email: '$userData.email'
        }
      }
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios con recetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}