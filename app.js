const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb://localhost/seatshare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  username: String,
  password: String,
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile('public/login.html', { root: __dirname });
});

app.get('/register', (req, res) => {
  res.sendFile('public/register.html', { root: __dirname });
});



app.use(express.static('public'));

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el usuario' });
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
