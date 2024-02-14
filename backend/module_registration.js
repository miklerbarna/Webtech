let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');


router.post('/', async (req, res) => {
    
    try {
        res.setHeader('Content-Type', 'text/html');
        const user = req.body;


        const getUsersQuery = `SELECT email FROM users`;
        const getUsersResponse = await pool.query(getUsersQuery);
        let users = getUsersResponse.rows;

        if (!users.some(u => u.email === user.email)) {
            const insertUserQuery = `INSERT INTO users(email, password, status, wallet_balance) 
            VALUES('${user.email}','${user.password}','user', 0.00)`;
            const insertUserResponse = await pool.query(insertUserQuery);
    
            if (insertUserResponse.rowCount === 0) {
                res.status(520);
                throw new Error('Failed to registrate');
            }
        }
        else {
            res.status(521);
            throw new Error('Email already exists');

        }

        res.status(200).send("Succesful login");


    } catch (err) {
        res.send("Login error: " + err);
    }
});

module.exports = router;
