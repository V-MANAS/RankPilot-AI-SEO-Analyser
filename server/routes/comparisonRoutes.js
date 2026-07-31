import express from 'express';
import auth from '../middleware/auth.js';
import { compareWebsites, getUserComparisons, getComparison, deleteComparison } from '../controller/comparisonController.js';

const comparisonRouter = express.Router();

comparisonRouter.post('/compare', auth, compareWebsites);
comparisonRouter.get('/list', auth, getUserComparisons);
comparisonRouter.get('/:id', auth, getComparison);
comparisonRouter.delete('/:id', auth, deleteComparison);

export default comparisonRouter;
