let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

router.post("/", async (req,res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const user = req.body;
        const insertQuery = `INSERT INTO users(email, password, wallet_balance)
                       VALUES('${user.email}', '${user.password}', 0)`;

        const insertResponse = await pool.query(insertQuery);

        res.status(200).send("User Created");

    } catch (err) {
        res.status(421).send("Error when accessing database: " + err);
    }
});

router.delete("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const userId = req.body.user_id;

        const modelReviewDeleteQuery = `DELETE FROM model_reviews
        WHERE user_id=${userId}`
        const modelReviewDeleteResponse = pool.query(modelReviewDeleteQuery);

        const stationReviewDeleteQuery = `DELETE FROM station_reviews
        WHERE user_id=${userId}`
        const stationReviewDeleteResponse = pool.query(stationReviewDeleteQuery);

        const userDeleteQuery = `DELETE FROM users WHERE user_id=${userId}`;
        const userDeleteResponse = await pool.query(userDeleteQuery);

        res.status(200).send("User Deleted");
    } catch (err) {
        res.status(422).send("Error when accessing database: " + err);
    }
});

module.exports = router;