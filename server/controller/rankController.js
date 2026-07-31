import { keywordTracking } from "../services/keywordTrackingService.js";
import KeywordTracking from "../models/keywordTracking.js";


export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;
        
        if(!keyword || !url){
            return res.status(400).json({ message: "Keyword and URL are required" });   
        }

        //extract domain from url
        let domain;
        try{
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            domain = urlObj.hostname.replace('www.', '');
        }catch(err){
            return res.status(400).json({ message: "Invalid URL format" });
        }
        const existing = await KeywordTracking.findOne({ userId: req.userId, keyword:keyword.toLowerCase().trim(), domain });

        if(existing){
            return res.status(400).json({success:false, message: "Already tracking this keyword for this domain" });
        }

        //create tracking entry
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url:url.startsWith('http') ? url : `https://${url}`,
            domain,
            status:"checking"
        })

        res.status(201).json({success:true, message: "Keyword tracking started", data: tracking });
        keywordTracking(tracking)
        

    }catch(err){
        console.error(err);
        if(err.code === 11000){
            return res.status(400).json({success:false, message: "Already tracking this keyword" });
        }
        res.status(500).json({success:false, message: "Internal server error" });
    }

}
export const getKeywords = async (req, res) => {
    try {
        const keywords = await KeywordTracking.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-rankHistory"); 
        
        res.status(200).json({ success: true, data: keywords });
    } catch (error) {
        console.error("Get keywords error:", error.message);
        res.status(500).json({success:false, message: "server error" });
    }
    
}


export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id , userId: req.userId }); 
        if(!tracking) return res.status(404).json({success:false, message: "Keyword tracking not found" });
        res.json({ success: true, tracking});
    } catch (error) {
        console.error("Get keywords error:", error.message);
        res.status(500).json({success:false, message: "server error" });
    }
}

export const refreshKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id , userId: req.userId }); 
        if(!tracking) return res.status(404).json({success:false, message: "Keyword tracking not found" });
        tracking.status = "checking";
        await tracking.save();
        res.json({ success: true, message:"Rank check started"});
        keywordTracking(tracking)
    } catch (error) {
        console.error("Refresh keyword error:", error.message); 
        res.status(500).json({success:false, message: "server error" });
    }
}

export const deleteKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOneAndDelete({ _id: req.params.id , userId: req.userId }); 
        if(!tracking) return res.status(404).json({success:false, message: "Keyword tracking not found" });
        res.json({ success: true, message:"Keyword tracking deleted"});
    } catch (error) {
        console.error("Delete keyword error:", error.message); 
        res.status(500).json({success:false, message: "server error" });
    }

}

export const toggleTracking = async (req, res) => {
     try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id , userId: req.userId }); 
        if(!tracking) return res.status(404).json({success:false, message: "Keyword tracking not found" });
        tracking.active = !tracking.active;
        await tracking.save();
        res.json({ success: true, tracking });

    } catch (error) {
        console.error("Toggle  tracking error:", error.message); 
        res.status(500).json({success:false, message: "server error" });
    }
}

