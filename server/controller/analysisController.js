import Analysis from "../models/Analysis.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/scrapperService.js";

//Analyze a URL

export const analyzeUrl = async (req, res) => {
    try{
        const { url } = req.body;
        if(!url) {
            return res.status(400).json({success: false, message: "URL is required" });
        }

        let validUrl;
        try{
            validUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
        }catch(err){
            return res.status(400).json({success: false, message: "Invalid URL format" });
        }
        console.log("req.user:", req.user); 
        const analysis = await  Analysis.create({
            userId: req.userId,
            url: validUrl.href,
            status: 'processing',
        });

        res.json({success: true, message: "Analysis started successfully" , analysisId: analysis._id});

        try{
            const scrapeResult = await scrapeUrl(validUrl.href);

            if(!scrapeResult.success){
                analysis.status = 'failed';
                await analysis.save();
                return;
            }
            //step 2 analyse with gemini AI
            const aiResult = await analyzeSeoData(scrapeResult.data);

            console.log("AI Result:", JSON.stringify(aiResult, null, 2));

            if(!aiResult.success){
                analysis.status = 'failed';
                await analysis.save();
                return;
            }

            //step.3 save the result to database
           analysis.overallScore = aiResult.data.overallScore;
analysis.categories = aiResult.data.categories;

analysis.keywords = aiResult.data.keywords;
analysis.issues = aiResult.data.issues;

// These come from the scraper
analysis.metaData = scrapeResult.data.metaData;
analysis.headings = scrapeResult.data.headings;
analysis.links = scrapeResult.data.links;
analysis.images = scrapeResult.data.images;
analysis.loadTime = scrapeResult.data.loadTime;
analysis.pageSize = scrapeResult.data.pageSize;
analysis.wordCount = scrapeResult.data.wordCount;

analysis.status = "completed";

await analysis.save();

console.log("Saved document:");
console.log(JSON.stringify(analysis, null, 2));


            await analysis.save();

        }catch(bgError){
            console.error("Background scraping error:", bgError.message);
            try{
                analysis.status = 'failed';
                await analysis.save(); 

            }catch(error){

            }
        }

    }catch(err){
        console.error("Analyse URL error:", err.message);
        if(!res.headersSent) {
            res.status(500).json({success: false, message: "Internal server error" });
        }
    }

}
//get all analysis by ID
export const getAnalysis = async (req, res) => {
    try{
        const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });

        if(!analysis) return res.status(404).json({success: false, message: "Analysis not found" });

        res.json({success: true, data: analysis});

    }catch(err){
        console.error("Get analysis error:", err.message);
        res.status(500).json({success: false, message: "Internal server error" });

    }
}

//get all analyses for user
export const getUserAnalyses = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await Analysis.find({ userId: req.userId }).sort({createdAt: -1}).skip(skip).limit(limit).select("-issues -keywords");

        const total = await Analysis.countDocuments({ userId: req.userId });

        res.json({success: true,  analyses, pagination:{total, page, limit,pages:Math.ceil(total/limit)}});

        
    }catch(err){
        console.error("Get analyses error:", err.message);
        res.status(500).json({success: false, message: "Internal server error" });

    }
}

export const deleteAnalysis = async (req, res) => {
    try{
        const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });

        if(!analysis) return res.status(404).json({success: false, message: "Analysis not found" });

        res.json({success: true,message: "Analysis deleted successfully"});

    }catch(err){
        console.error("Delete analysis error:", err.message);
        res.status(500).json({success: false, message: "Internal server error" });

    }
}