let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');
const checkAdminAuth = require('./authenticator_admin.js');


router.post("/", checkAdminAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const model = req.body;

        console.log("Adding Model: " + model.name);

        const insertQuery = `INSERT INTO bike_models(category_id, name, description, wheel_size, manufacturer, brakes_type)
        VALUES(${model.category_id}, '${model.name}', '${model.description}', ${model.wheel_size}, '${model.manufacturer}', '${model.brakes_type}')`;

        const insertResponse = await pool.query(insertQuery);

        res.status(200).send("Created Model");

    } catch (err) {
        res.status(415).send("Error when accessing database: " + err);
    }
});

router.put("/", checkAdminAuth, async (req, res) => {
    try {
        console.log("Data: " + req.body.model_id + " " + req.body.name);
        res.setHeader('Content-Type', 'text/html');

        const model = req.body;
        const modelId = model.model_id;

        for (const key in model) {
            if (key === "model_id") continue;
            if (model.hasOwnProperty(key)) {
                const value = model[key];
                let updateQuery = ``;

                if (typeof value === 'string') {
                    updateQuery = `UPDATE bike_models
                    SET ${key}='${value}'
                    WHERE model_id=${modelId}`;

                } else {
                    updateQuery = `UPDATE bike_models
                    SET ${key}=${value}
                    WHERE model_id=${modelId}`;
                
                }

                console.log(updateQuery);

                const updateResponse = await pool.query(updateQuery);

                if (updateResponse.rowCount !== 0) {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Updated Model");

    } catch (err) {
        res.status(416).send("Error when accessing database: " + err);
    }
});

router.delete("/", checkAdminAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const deleteReviewsQuery = `DELETE FROM model_reviews WHERE model_id=${req.body.model_id}`;
        await pool.query(deleteReviewsQuery);

        //For updating the station parking places counter
        const bikeGrabQuery = `SELECT * FROM bikes
        WHERE model_id=${req.body.model_id}`;

        const bikeGrabResponse = await pool.query(bikeGrabQuery);

        for (const bike of bikeGrabResponse.rows) {
            let decreasePlacesQuery = `UPDATE bike_stations 
            SET places_taken=places_taken - 1
            WHERE station_id=${bike['station_id']}`;
            const decreasePlacesResponse = await pool.query(decreasePlacesQuery);
        }


        const deleteBikesQuery = `DELETE FROM bikes WHERE model_id=${req.body.model_id}`;
        await pool.query(deleteBikesQuery);

        const deleteModelQuery = `DELETE FROM bike_models WHERE model_id=${req.body.model_id}`;
        const deleteModelResponse = await pool.query(deleteModelQuery);

        res.status(200).send("Deleted Model");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(417).send("Error when accessing database: " + err);
    }
});

module.exports = router;