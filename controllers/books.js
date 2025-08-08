const Books = require('../models/books');
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
            return res.status(404).json({ message: "Livre non trouvé" });
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
    
  if (!req.body.book) {
    return res.status(400).json({ message: 'book manquant' });
  }
    try{
        const bookObject =  JSON.parse(req.body.book);
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
    
    try{
        const bookObject =  req.file ? {
            ...JSON.parse(req.body.book), 
            imageUrl :  `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        } : JSON.parse(req.body.book)

        delete bookObject.userId
             

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
                return res.status(403).json({message : 'unauthorized request'})
            }else{
                const filename =  book.imageUrl.split('images/')[1];
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
            const grade = Number(req.body.rating)
                if(grade < 0 || grade > 5 ){
                    return res.status(400).json({message : 'Note invalide (doit être entre 0 et 5'})
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

