const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Ruta para la página de inicio
router.get('/', (req, res) => {
  if (req.session.userId) {
    // El usuario está autenticado, puedes realizar acciones de inicio de sesión aquí
    res.render('home');
  } else {
    // El usuario no está autenticado, redirige a la página de inicio de sesión
    res.redirect('/login');
  }
});

module.exports = router;
