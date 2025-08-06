const express = require('express');
const User = require('../models/User')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')


exports.signup = async(req,res,next)=>{
    try{
        const hash = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            email: req.body.email,
            password : hash
        })
        await user.save();
        res.status(201).json( {message : 'Utilisateur créé !' })
    }
    catch(error){
         console.error('Signup error:', error); // Log complet dans la console
    res.status(500).json({ error: error.message || error.toString() }); 
    }
}
/*
exports.login = async(req,res,next)=>{
    try{
        const loginUser = await User.findOne({email:req.body.email})
        if(!loginUser)
            return res.status(403).json({message : 'unauthorized request'})
        const valid = await bcrypt.compare(req.body.password, loginUser.password)
        if(!valid)
            return res.status(403).json({message : 'unauthorized request'})

        res.status(200).json({
            userId : loginUser._id,
            token : jwt.sign(
                {userId: loginUser._id},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            )
        
        })
    }
    catch(error){
        res.status(500).json({error});
    }
}
*/


exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
        }
        // --- Ajoutez ce log ici ---
        console.log(`Connexion réussie pour l'email: ${user.email}, UserId: ${user._id}`);
        // -------------------------
        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};
