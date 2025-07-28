const Books = require('../models/books');
const mongoose = require('mongoose');
const fs = require('fs')


exports.getAllBooks = async(req,res,next)=>{
    try{
        const arrayBooks = await Books.find()
        res.status(200).json(arrayBooks)
    }
    catch(error){
        res.status(400).json({error})
        console.error({error})
    }
}

exports.singleBook = async(req,res,next)=>{
    try{
        const bookOne = await Books.findOne({_id:req.params.id})
        if(!bookOne){
            return res.status(404).json();
        }
        res.status(200).json(bookOne);
    }
    catch(error){
        res.status(400).json({error})
    }
}

exports.bestRating = async(req,res,next)=>{
    try{
        const arrayBestRating = await Books.find().sort({averageRating: -1}).limit(3)
        res.status(200).json(arrayBestRating)
        }
    catch(error){
        res.status(400).json({error})
    }
}

exports.createBook = async(req,res,next)=>{
    try{
        const bookObject = await JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject.userId;
        const newBookCreate= new Books({
            ...bookObject,
            userId : req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            averageRating : 0,
            ratings :[]
        })
        await newBookCreate.save();
        res.status(201).json({message : 'Livre enregistré !'})
    }
    catch(error){
        res.status(400).json({error : error.message})
    }
}
