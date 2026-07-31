import express from 'express';
import auth from '../middleware/auth.js';
import { addKeyword, getKeywords, getKeyword, refreshKeyword, toggleTracking, deleteKeyword } from '../controller/rankController.js';


const rankRouter = express.Router();

rankRouter.post('/add',auth, addKeyword);
rankRouter.get('/',auth, getKeywords);
rankRouter.get('/:id',auth, getKeyword);
rankRouter.post('/:id/refresh',auth, refreshKeyword);
rankRouter.put('/:id/toggle',auth, toggleTracking);
rankRouter.delete('/:id',auth, deleteKeyword);

export default rankRouter;

