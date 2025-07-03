// app/api/routes/userRoutes.ts
import { Router } from 'express';
import {
    addSavedRecipe,
    deleteSavedRecipe,
    getSavedRecipes
} from '../controller/userController';

const router = Router();

router.get('/:id/saved-recipes', getSavedRecipes);
router.post('/:id/saved-recipes', addSavedRecipe);
router.delete('/:id/saved-recipes/:recipeId', deleteSavedRecipe);

export default router;