const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const User = require('./public/models/User.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// Connect to the MongoDB database
const mongo_uri = 'mongodb://localhost/seatshare';

mongoose.connect(mongo_uri)
  .then(() => {
    console.log(`Connected to ${mongo_uri}`);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

  app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    const user = new User({ username, password });
  
    user.save()
      .then(() => {
        res.redirect('/index.html'); // Redirect after successfully registering the user
      })
      .catch((err) => {
        res.status(500).json({ message: 'Error al registrar usuario: ' + err.message });
      });
  });
  
  

  app.post('/authenticate', (req, res) => {
    const { username, password } = req.body;
  
    User.findOne({ username })
      .then((user) => {
        if (!user) {
          return res.status(500).send('El usuario no existe');
        }
  
        user.isCorrectPassword(password, (err, result) => {
          if (err) {
            return res.status(500).send('Error al autenticar: ' + err.message);
          }
  
          if (result) {
            res.redirect('/home.html');
          } else {
            res.status(500).send('Usuario y/o contraseña incorrecta');
          }
        });
      })
      .catch((err) => {
        res.status(500).send('Error al autenticar: ' + err.message);
      });
  });
  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
