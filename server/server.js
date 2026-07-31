import express from "express";
import dotenv from "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import rankRouter from "./routes/rankRoutes.js";
import analysisRouter from "./routes/analysisRoutes.js";
import comparisonRouter from "./routes/comparisonRoutes.js";

connectDB();    
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {res.send("Server is running...")}); 
app.use("/api/auth", authRouter);
app.use("/api/rank", rankRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/comparison', comparisonRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


console.log("Gemini Key:", process.env.GEMINI_API_KEY);