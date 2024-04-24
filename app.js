const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos temporal
const users = [];
const loginAttempts = {}; // Objeto para realizar un seguimiento de los intentos de inicio de sesión

// Contraseña secreta para desbloquear la cuenta
const secretUnlockPassword = "abc";

// Middleware para permitir el análisis de JSON
app.use(express.json());

// Middleware para el bloqueo de cuentas después de varios intentos fallidos
const failedLoginLockout = (req, res, next) => {
    const { username } = req.body;
    if (loginAttempts[username] && loginAttempts[username] >= 3) {
        return res.status(403).send('Too many login attempts. Account locked.');
    }
    next();
};

// Ruta de registro de usuarios
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta de inicio de sesión
app.post('/login', failedLoginLockout, async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(user => user.username === username);
        if (user && await bcrypt.compare(password, user.password)) {
            // Restablecer el contador de intentos de inicio de sesión si la autenticación es exitosa
            delete loginAttempts[username];
            res.status(200).send('Login successful');
        } else {
            // Incrementar el contador de intentos de inicio de sesión si la autenticación falla
            loginAttempts[username] = (loginAttempts[username] || 0) + 1;
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta para desbloquear cuenta
app.post('/unlock-account', (req, res) => {
    const { username, unlockPassword } = req.body;
    // Verificar si la contraseña secreta es correcta
    if (unlockPassword === secretUnlockPassword) {
        // Verificar si la cuenta está actualmente bloqueada
        if (loginAttempts[username] && loginAttempts[username] >= 3) {
            // Restablecer el contador de intentos fallidos o eliminar la información de bloqueo
            delete loginAttempts[username];
            res.status(200).send('Account unlocked successfully');
        } else {
            res.status(400).send('Account is not locked');
        }
    } else {
        res.status(401).send('Unauthorized: Incorrect unlock password');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
