const express = require('express');
import {User} from '../database.js'
import {JWT_SECRET} from '../config.js'
const zod = require('zod');
const jwt = require('jsonwebtoken')

const router = express.Router();

const inpuValidation = (req,res,next) => {

    const schema = zod.object({
        username : zod.string().email(),
        password : zod.string().min(5,{message: "Mininmum length 5"}),
        firstName : zod.string(),
        lastName : zod.string()
    })

    const input = req.body;
    const response = schema.safeParse(input)

    if(response.success){
        next();
    }
    else{
        res.status(411).json({
            message: "Invalid Inputs",
            error : response.error.errors
        })
    }
}

router.post('/signup',inpuValidation,async(req,res)=>{

    try{
        const {username,password,firstname,lastname} = req.body;
        const existingUser = await User.findOne({username});

        // If Databse already contains the user 

        if(existingUser){
            return res.status(400).json({
            message: 'Username already exists' 
            });
        }

        const newUser = new User({username,password,firstname,lastname})

        //Saved new user
        await newUser.save()

        // create JWT token 
        const token = jwt.sign({userId : newUser._id},{JWT_SECRET})

        res.status(201).json({ 
            message: 'User created successfully', 
            token : token,
        });
    }
    catch(error){
        console.error(error)
        res.status(500).json({
            message : 'Internal Server error'
        })
    }

})

const loginSchema = zod.object({
    firstName : zod.string(),
    lastName : zod.string(),
    username : zod.string().email(),
    password : zod.string().min(5),
})

router.post('./login', async(req,res)=>{
    const inputs = req.body;
    const {success} = loginSchema.safeParse(inputs);

    // Wrong Inputs 
    if(!success){
        res.status(411).json({
            message : 'Invalid Inputs',
        })
    }

    // Find user in db
    const existingUser = await User.findOne({
        username : req.body.username,
        password : req.body.password,
    })

    // If found sign the token 
    if(existingUser){
        const token = jwt.sign({useId : existingUser._id} , JWT_SECRET);
        res.status(200).json({
            token : token,
        })
        return;
    }
    else{
        res.status(411).json({
            message: 'User not found'
        })
    }

})

module.exports = router;