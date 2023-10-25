const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Ruta para la página de inicio de sesión
router.get('/', (req, res) => {
  res.render('login');
});

// Implementa la lógica de inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
