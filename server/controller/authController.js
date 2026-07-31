import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";




const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn:"30d"});
}


export const register = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success:false, message:"Please fill all the fields"});
        }

        //check if user already exists
      const existingUser = await User.findOne({ email });

if (existingUser) {
    return res.status(400).json({
        success: false,
        message: "User already exists",
    });
}

        //hash password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        //cerate new user
        const user = await User.create({
            name,
            email,
            password:hashedPassword,
        });

        const token = generateToken(user._id);

        return res.status(201).json({success:true, token,user});

    }catch(error){
        console.error("Register error:", error.message);
        return res.status(500).json({success:false, message:"Internal server error"});
    }          
}

//login user
export const login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({success:false, message:"Please fill all the fields"});
        }

        //check if user already exists
        const user = await User.findOne({
            email
        })
        if(!user){
            return res.status(400).json({success:false, message:"Invalid credentials"});
        }

        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success:false, message:"Invalid credentials"});
        }
        const token = generateToken(user._id);

        return res.status(201).json({success:true, token,user});

    }catch(error){
        console.error("Register error:", error.message);
        return res.status(500).json({success:false, message:"Internal server error"});
    }          
}

//get user profile
export const getUser = async(req,res)=>{
    try{
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(404).json({success:false, message:"User not found"});
        }
         res.json({success:true, user});

    }catch(error){
        console.error("Get User error:", error.message);
        return res.status(500).json({success:false, message:"Internal server error"});
    }          
}

