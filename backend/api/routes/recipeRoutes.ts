// app/api/routes/recipeRoutes.ts
import { Router } from 'express';
import {
    addRating,
    adjustRecipe,
    createRecipe,
    deleteRecipe,
    getComments,
    getLatestApprovedRecipes,
    getRecipeById,
    getUsersWithRecipes,
    searchRecipes,
    updateRecipe
} from '../controller/recipeController';

const router = Router();

router.get('/latest', getLatestApprovedRecipes);
router.get('/search',  searchRecipes);
router.post('/',       createRecipe);

router.get('/userslist', getUsersWithRecipes);

router.get('/:id',     getRecipeById);
router.put('/:id',     updateRecipe);
router.delete('/:id',  deleteRecipe);

router.post('/:id/rating',   addRating);
router.get('/:id/comments',  getComments);

router.post('/:id/adjust',   adjustRecipe);

export default router;