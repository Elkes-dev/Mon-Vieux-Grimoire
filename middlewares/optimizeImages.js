const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const storage = require('../middlewares/multer-config')


module.exports = async(req,res,next) =>{
    if(!req.file){
        console.log("Il n'y a pas de fichier à traiter")
        return next();
    }
    try{
        // Récupération de l'image sans l'extension
        const originalName = path.parse(req.file.originalname).name;
        const filename = `${originalName}-${Date.now()}.webp`;
        const newPath = path.join('images', filename)

         await sharp(req.file.buffer)
            .resize({width:300, height:300, fit: 'inside'})
            .toFormat('webp')
            .webp({quality: 80})
            .toFile(newPath)
        
        req.file.buffer = null; // Nettoie la mémoire si le fichier est trop gros    

        req.file.filename = filename;
        req.file.path = newPath;

        next();
    }catch(error){
        res.status(400).json({error});
    }
}