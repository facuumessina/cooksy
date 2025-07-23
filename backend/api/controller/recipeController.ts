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
    // Asegurarse de que el campo autor esté presente
    if (!req.body.autor) {
      return res.status(400).json({ message: 'Falta el campo autor en la receta' });
    }
    if (req.body.porciones == null || isNaN(req.body.porciones)) {
      return res.status(400).json({ message: 'Falta el campo porciones en la receta' });
    }
    const { nombre, tipo, ingredientes, instrucciones, autor, porciones, imagen } = req.body;
    const receta = new Receta({
      nombre,
      tipo,
      ingredientes,
      instrucciones,
      autor,
      porciones,
      imagen,
      estado: 'aprobada'
    });
    await receta.save();
    // Agregar la receta a myRecipes del usuario
    const Usuario = mongoose.model('Usuario');
    await Usuario.findByIdAndUpdate(receta.autor, {
      $push: { myRecipes: receta._id }
    });
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
  if (req.body.porciones != null && isNaN(req.body.porciones)) {
    return res.status(400).json({ message: 'El campo porciones debe ser un número' });
  }
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

  const { userId, rating } = req.body;
  if (!userId || rating == null) {
    return res.status(400).json({ message: 'Faltan datos para valorar' });
  }

  // Reemplazar si ya existe valoración de ese usuario
  const existing = receta.ratings.find(r => r.userId.toString() === userId);
  if (existing) {
    existing.rating = rating;
  } else {
    receta.ratings.push({ userId, rating });
  }

  await receta.save();
  res.status(201).json({ message: 'Valoración registrada' });
}

export async function addComment(req: Request, res: Response) {
  try {
    const receta = await Receta.findById(req.params.id);
    if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

    const { userId, alias, comment } = req.body;
    if (!userId || !alias || !comment) {
      return res.status(400).json({ message: 'Faltan datos para comentar' });
    }

    receta.comments = receta.comments || [];
    receta.comments.push({ userId, alias, comment, createdAt: new Date() });

    await receta.save();
    // Obtener receta actualizada para enviar con comentarios incluidos
    const updated = await Receta.findById(req.params.id).populate('autor', 'alias email nombre');
    res.status(201).json(updated);
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getComments(req: Request, res: Response) {
  try {
    const receta = await Receta.findById(req.params.id);
    if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

    const comentarios = receta.comments || [];
    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function adjustRecipe(req: Request, res: Response) {
  const receta = await Receta.findById(req.params.id);
  if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

  const { porciones } = req.body as any;
  if (!porciones || isNaN(porciones)) {
    return res.status(400).json({ message: 'Debe especificar un número válido de porciones' });
  }

  const { cantidadIngrediente } = req.body as any;
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
  const latest = await Receta.aggregate([
    { $match: { estado: 'aprobada' } },
    { $sort: { createdAt: -1 } },
    { $limit: 3 },
    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: "$ratings" }, 0] },
            then: { $avg: "$ratings.rating" },
            else: null
          }
        }
      }
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "autor",
        foreignField: "_id",
        as: "autor"
      }
    },
    { $unwind: "$autor" },
    {
      $project: {
        _id: 1,
        nombre: 1,
        tipo: 1,
        ingredientes: 1,
        instrucciones: 1,
        imagen: 1,
        estado: 1,
        createdAt: 1,
        averageRating: 1,
        autor: {
          _id: "$autor._id",
          alias: "$autor.alias",
          email: "$autor.email",
          nombre: "$autor.nombre"
        }
      }
    }
  ]);
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
export async function deleteComment(req: Request, res: Response) {
  try {
    const { id, commentId } = req.params;
    const userId = req.query.userId as string;

    console.log('Intentando eliminar comentario');
    console.log('ID de receta:', id);
    console.log('ID de comentario:', commentId);
    console.log('ID de usuario:', userId);

    const receta = await Receta.findById(id);
    if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

    const comment = receta.comments.find(
      (c: any) => c._id?.toString() === commentId && c.userId?.toString() === userId
    );

    if (!comment) {
      return res.status(403).json({ message: 'No autorizado para eliminar este comentario' });
    }

    console.log('Comentarios actuales en la receta:', receta.comments);

    const result = await Receta.updateOne(
      { _id: id },
      {
        $pull: {
          comments: {
            _id: new mongoose.Types.ObjectId(commentId),
          }
        }
      }
    );
    console.log('Resultado del updateOne:', result);

    if (result.modifiedCount === 0) {
      console.warn('No se eliminó ningún comentario');
    }

    res.status(200).json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function toggleFavoriteRecipe(req: Request, res: Response) {
  const { userId, recipeId } = req.body;

  if (!userId || !recipeId) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const Usuario = mongoose.model('Usuario');
    const user = await Usuario.findById(userId);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const index = user.favoritos.indexOf(recipeId);
    if (index > -1) {
      user.favoritos.splice(index, 1); // eliminar
    } else {
      user.favoritos.push(recipeId); // agregar
    }

    await user.save();

    res.status(200).json({ message: 'Favoritos actualizados', favoritos: user.favoritos });
  } catch (error) {
    console.error('Error al actualizar favoritos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}