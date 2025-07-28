const mongoose = require('mongoose');

const booksSchema = mongoose.Schema({
    userId:{type : String, },
    title:{type : String, },
    author:{type : String, },
    imageUrl:{type : String, },
    year:{type : Number, },
    genre:{type : String, },
    ratings:[
        {
            userId : String, 
            grade : Number
        }],
    averageRating: {type:Number}
})


module.exports = mongoose.model('Books', booksSchema)