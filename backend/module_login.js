let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

const checkUserAuth = require('./authenticator_user.js');
const checkAdminAuth = require('./authenticator_admin.js');

const jwt = require('jsonwebtoken');

// login route creating/returning a token on successful login
router.post('/', async (req, res) => {

    try {
        res.setHeader('Content-Type', 'application/json');
        
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

        let token;

        if (userEmailResponse.rows[0].status == 'admin') {
            token = jwt.sign(
                {"username": user.email},
                cfg.auth_admin.jwt_key,
                {"expiresIn": cfg.auth_admin.expiration}
            );
        } else {
            token = jwt.sign(
                {"username": user.email},
                cfg.auth_user.jwt_key,
                {"expiresIn": cfg.auth_user.expiration}
            );
        }


        res.status(200).json({
            "message": "login successful",
            login: user.email,
            token: token,
            status: userEmailResponse.rows[0].status
        });



    } catch (err) {
        res.send("Login error: " + err);
    }
});



//Dummy routers to test authenticators
router.get("/tryuser", checkUserAuth, (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("Authenticated User");

});

router.get("/tryadmin", checkAdminAuth, (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("Authenticated Admin");

});

module.exports = router;
