// app/api/routes/recipeRoutes.ts
import { Router } from 'express';
import {
    addRating,
    adjustRecipe,
    createRecipe,
    deleteRecipe,
    getComments,
    getLatestRecipes,
    getRecipeById,
    searchRecipes,
    updateRecipe
} from '../controller/recipeController';

const router = Router();

router.get('/latest', getLatestRecipes);
router.get('/search',  searchRecipes);
router.post('/',       createRecipe);

router.get('/:id',     getRecipeById);
router.put('/:id',     updateRecipe);
router.delete('/:id',  deleteRecipe);

router.post('/:id/rating',   addRating);
router.get('/:id/comments',  getComments);

router.post('/:id/adjust',   adjustRecipe);

export default router;