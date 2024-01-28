let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

router.post("/model", async (req,res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        let review = req.body;
        const reviewQuery = `INSERT INTO model_reviews(model_id, user_id, rating, review_text) 
        VALUES(${review.model_id},${review.user_id}, ${review.rating}, '${review.text}')`;
        let reviewResponse = await pool.query(reviewQuery);

        res.status(200).send("Review Created");

    } catch (err) {
        res.status(423).send("Error when accessing database: " + err);
    }

});

router.post("/station", async (req,res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        let review = req.body;
        const reviewQuery = `INSERT INTO station_reviews(station_id, user_id, rating, review_text) 
        VALUES(${review.station_id},${review.user_id}, ${review.rating}, '${review.text}')`;
        let reviewResponse = await pool.query(reviewQuery);

        res.status(200).send("Review Created");

    } catch (err) {
        res.status(424).send("Error when accessing database: " + err);
    }

});

module.exports = router;