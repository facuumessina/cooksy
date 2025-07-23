// app/api/routes/recipeRoutes.ts
import { Router } from 'express';
import {
    addComment,
    addRating,
    adjustRecipe,
    createRecipe,
    deleteComment,
    deleteRecipe,
    getComments,
    getLatestApprovedRecipes,
    getRecipeById,
    getUsersWithRecipes,
    searchRecipes,
    toggleFavoriteRecipe,
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
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

router.post('/:id/adjust',   adjustRecipe);

router.post('/:id/favorite', toggleFavoriteRecipe);

export default router;