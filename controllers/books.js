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
    console.log('📩 createBook exécuté');
  console.log('📦 req.body:', req.body);
  console.log('🖼️ req.file:', req.file);
  if (!req.body.book) {
    return res.status(400).json({ message: 'book manquant' });
  }
    try{
        const bookObject = await JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject.userId;

    if(!req.file || !req.file.filename ){
        return res.status(400).json({message: "Erreur dans l'optimisation de l'image"})
    }
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
        res.status(400).json({ error: error.message,
  body: req.body,
  file: req.file})
    }
}


exports.modifyBooks = async (req,res,next)=>{
     // Loguez ce que vous recevez pour comprendre l'état initial
        console.log('Requête reçue pour modifier un livre:', req.params.id);
        console.log('req.file:', req.file); // Y a-t-il un fichier ?
        console.log('req.body:', req.body); // Que contient le corps de la requête ?

    try{
        const bookObject =  req.file ? {
            ...JSON.parse(req.body.book), 
            imageUrl :  `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        } : {...req.body}

        delete bookObject.userId
             console.log('Objet de mise à jour (bookObject):', bookObject);

        const book = await Books.findOne({_id: req.params.id})
            if(book.userId != req.auth.userId){
                return res.status(403).json({error : 'unauthorized request'})
            }
            if(req.file){
                if(!req.file.filename){
                    return res.status(400).json({message : "Erreur d'optimisation de l'image"}) 
                }
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, 
                    (error) =>{
                    if(error){ 
                        console.log( 'Erreur de supression', error)
                        }   
                    });
                }
            
            await  Books.updateOne({_id: req.params.id},{...bookObject, _id : req.params.id})
            console.log('Livre trouvé dans la base de données (avant mise à jour):', book);
            res.status(200).json({message : 'Livre modifié !'})
    }
    catch (error){
        res.status(400).json({error})
    }
}

exports.deleteBook = async(req,res,next)=>{
    try{
        const book = await Books.findOne({_id : req.params.id})
            if(book.userId != req.auth.userId){
                return res.status(403).json({message : 'unautorized request'})
            }else{
                const filename = await book.imageUrl.split('images/')[1];
                fs.unlink(`images/${filename}`, async(error)=>{
                    if(error){
                        return res.status(500).json({message : 'Erreur !' })
                    }
                    await Books.deleteOne({_id : req.params.id})
                    res.status(200).json({message :  'Supression validée ! '})
                });
            }
    }
    catch(error){
        res.status(400).json({error})
    }
}

exports.ratingBooks = async (req,res,next)=>{
     const bookId = req.params.id;
  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required." });
  }
    try{
        const book = await Books.findOne({_id: req.params.id})
            const isRated = book.ratings.some((rating) => rating.userId === req.auth.userId)
        if(isRated){
            return res.status(400).json({message : "Vous avez déjà noté ce livre"})
        }else{
            const grade = (req.body.rating)
                if(grade < 0 || grade > 5 ){
                    return res.status(400).json({message : 'Erreur'})
                }
                else{
                    book.ratings.push({
                        userId : req.auth.userId,
                        grade : grade
                    })
                    const total = book.ratings.reduce((acc, current) => acc + current.grade, 0 )
                    book.averageRating = total / book.ratings.length
                    await book.save ()
                }
        }
        res.status(200).json({message: "Note attribuée !"})
    }
    catch(error){
        res.status(400).json({error})
    }
}

