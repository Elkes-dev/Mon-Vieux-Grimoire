const express = require('express');
const app = express();

app.use(express.json());

app.post('/test-upload', (req, res) => {
  console.log('Requête reçue sur /test-upload');
  console.log('req.body:', req.body);
  res.status(200).json({ message: 'Ça marche !' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mini serveur démarré sur le port ${PORT}`);
});
