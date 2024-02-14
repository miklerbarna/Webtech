let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');
const checkUserAuth = require('./authenticator_user.js');


router.post("/model", checkUserAuth, async (req,res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const getUserIdQuery = `SELECT user_id FROM users
        WHERE email='${req.user.username}'`;
        const getUserIdResponse = await pool.query(getUserIdQuery);
        let user_id = getUserIdResponse.rows[0].user_id;

        let review = req.body;
        const reviewQuery = `INSERT INTO model_reviews(model_id, user_id, rating, review_text) 
        VALUES(${review.model_id},${user_id}, ${review.rating}, '${review.text}')`;
        let reviewResponse = await pool.query(reviewQuery);

        res.status(200).send("Review Created");

    } catch (err) {
        res.status(423).send("Error when accessing database: " + err);
    }

});

router.post("/station", checkUserAuth, async (req,res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const getUserIdQuery = `SELECT user_id FROM users
        WHERE email='${req.user.username}'`;
        const getUserIdResponse = await pool.query(getUserIdQuery);
        let user_id = getUserIdResponse.rows[0].user_id;

        let review = req.body;
        const reviewQuery = `INSERT INTO station_reviews(station_id, user_id, rating, review_text) 
        VALUES(${review.station_id},${user_id}, ${review.rating}, '${review.text}')`;
        let reviewResponse = await pool.query(reviewQuery);

        res.status(200).send("Review Created");

    } catch (err) {
        res.status(424).send("Error when accessing database: " + err);
    }

});

module.exports = router;