import express from "express";
import auth from "../middleware/auth.js";
import {analyzeUrl, getUserAnalyses,getAnalysis,deleteAnalysis } from "../controller/analysisController.js";

const analysisRouter = express.Router();


analysisRouter.post("/analyze", auth,analyzeUrl);
analysisRouter.get('/list',auth,getUserAnalyses);
analysisRouter.get('/:id',auth,getAnalysis);
analysisRouter.delete('/:id',auth,deleteAnalysis);

export default analysisRouter;