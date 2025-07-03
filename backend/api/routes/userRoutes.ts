// app/api/routes/userRoutes.ts
import { Router } from 'express';
import {
    addSavedRecipe,
    deleteSavedRecipe,
    getProfile,
    getProfileById,
    getSavedRecipes
} from '../controller/userController';

const router = Router();

router.get('/:id/saved-recipes', getSavedRecipes);
router.post('/:id/saved-recipes', addSavedRecipe);
router.delete('/:id/saved-recipes/:recipeId', deleteSavedRecipe);
router.get('/:id/profile', getProfile);
router.get('/:id', getProfileById);

export default router;