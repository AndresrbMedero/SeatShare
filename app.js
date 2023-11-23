const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const User = require('./public/models/User.js');

const app = express();

// Configura la ubicación de las vistas
app.set('views', path.join(__dirname, 'views'));

// Configura el motor de plantillas (ejs en este caso)
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

const mongo_uri = 'mongodb://localhost/seatshare';

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Conectado a: ${mongo_uri}`);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        if (user.password === password) { // Comparación directa sin encriptación
          return done(null, user);
        } else {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
      })
      .catch(err => {
        return done(err);
      });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      console.error('Error al deserializar usuario:', err);
      done(err);
    });
});

// Ruta para el registro de usuarios
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario ya existe en la base de datos
  User.findOne({ username })
    .then(existingUser => {
      if (existingUser) {
        const errorMessage = 'El nombre de usuario ya está en uso.';
        return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
      } else {
        // Verificar si la contraseña cumple con los requisitos
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)/; // Requiere al menos una mayúscula y un número
        if (!passwordPattern.test(password)) {
          const errorMessage = 'La contraseña debe contener al menos una letra mayúscula y un número.';
          return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
        }

        // Si el usuario no existe y la contraseña cumple con los requisitos, crear y guardar el nuevo usuario
        const user = new User({ username, password }); // Almacenar sin encriptar

        user.save()
          .then(() => {
            console.log('Registro exitoso');
            return res.redirect('/index.html');
            
          })
          .catch((err) => {
            console.error('Error al registrar usuario:', err);
            const errorMessage = 'Error al registrar usuario: ' + err.message;
            return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
          });
      }
    })
    .catch((err) => {
      console.error('Error al verificar usuario existente:', err);
      const errorMessage = 'Error al verificar usuario existente.';
      return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
    });
});


// Ruta para la autenticación de usuarios
app.post('/authenticate', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error de autenticación:', err);
      return next(err);
    }
    if (!user) {
      console.error('Fallo de autenticación:', info.message);
      const errorMessage = 'Usuario o contraseña incorrecto';
      return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
    }

    // Comparación directa de contraseñas (NO RECOMENDADA para entornos de producción)
    if (user.password === req.body.password) {
      console.log('Autenticación exitosa');
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Error al iniciar sesión:', loginErr);
          return next(loginErr);
        }

        // Redirige al usuario a la página de inicio en lugar de la página de inicio de sesión
        return res.redirect('/home');
      });
    } else {
      console.error('Fallo de autenticación: Contraseña incorrecta');
      const errorMessage = 'Usuario o contraseña incorrecto';
      return res.send(`<script>alert("${errorMessage}"); window.location.href = '/index.html';</script>`);
    }
  })(req, res, next);
});


// Ruta para la página de inicio
app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    // Puedes pasar datos del usuario u otra información a la vista si es necesario
    const usuario = req.user; // Obtén los datos del usuario autenticado
    res.render('home.ejs', { usuario });
  } else {
    // Redirige al usuario a la página de inicio de sesión si no está autenticado
    res.redirect('/index.html');
  }
});

app.get('/asientos.html', (req, res) => {
  // Verifica si el usuario está autenticado
  if (req.isAuthenticated()) {
    res.render(path.join(__dirname, 'public', 'asientos.html'));
  } else {
    // Redirige al usuario a la página de inicio de sesión si no está autenticado
    res.redirect('/index.html');
  }
});


app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
