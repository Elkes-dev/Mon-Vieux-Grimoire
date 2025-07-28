const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: {type : String, required: true, unique : true},
    password: {type: String, required: true}
})

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema)

