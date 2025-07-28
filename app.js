require('dotenv').config();
const uri = process.env.MONGO_URI;
const path = require('path')

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user')
const booksRoutes = require('./routes/books')

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


async function mongoConnect(){
    try{
     await mongoose.connect(uri)
       console.log('Connexion réussie à MongoDB !');
    }
    catch(error){
        console.error('Connexion à MongoDB échouée', error)
    }
}
mongoConnect();

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.use('/api/auth', userRoutes)

app.use('/api/books', booksRoutes)

app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app;