let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

const checkAuth = require('./auth');

const jwt = require('jsonwebtoken');

// login route creating/returning a token on successful login
router.post('/', async (req, res) => {

    try {
        res.setHeader('Content-Type', 'text/html');
        
        const user = req.body;
        const userEmailQuery = `SELECT * FROM USERS 
        WHERE email='${user.email}'`;
        const userEmailResponse = await pool.query(userEmailQuery);
        
        if (userEmailResponse.rowCount === 0) {
            res.status(501);
            throw new Error('Invalid email');
        }
        
        
        if (userEmailResponse.rows[0].password != user.password) {
            res.status(502);
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            {"username": user.email},
            cfg.auth.jwt_key,
            {"expiresIn": cfg.auth.expiration}
        );

        res.status(200).json({
            "message": "login successful",
            login: user.email,
            token: token
        });



    } catch (err) {
        res.send("Login error: " + err);
    }
});

router.get("/tryforauth", checkAuth, (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("Authenticated");

});

module.exports = router;
