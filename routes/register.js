const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Ruta para la página de registro
router.get('/', (req, res) => {
  res.render('register');
});

// Implementa la lógica de registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
  });

  await user.save();

  res.redirect('/login');
});

module.exports = router;
