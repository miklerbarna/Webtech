let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

router.post("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        const bikeInsertQuery = `INSERT INTO bike_categories(name)
        VALUES ('${category.name}')`;

        const bikeInsertResponse = await pool.query(bikeInsertQuery);

        res.status(200).send("Category Added");

    } catch (err) {
        res.status(412).send("Error when accessing database: " + err);
    }
});

router.put("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        const updateQuery = `UPDATE bike_categories 
        SET name='${category.name}'
        WHERE category_id=${category.id} `;

        const updateResponse = await pool.query(updateQuery);

        res.status(200).send("Category Updated");
        
    } catch (err) {
        res.status(413).send("Error when accessing database: " + err);
    }
});

router.delete("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        const bikeDeleteQuery = `DELETE FROM bikes 
        WHERE model_id IN (SELECT DISTINCT model_id FROM bike_models WHERE category_id=${category.id})`;
        const bikeDeleteResponse = await pool.query(bikeDeleteQuery);
        
        
        //For updating the station parking places counter
        const parkingPlaceGrabQuery = `SELECT * FROM parking_places
        WHERE category_id=${category.id}`;

        const parkingPlaceGrabResponse = await pool.query(parkingPlaceGrabQuery);

        for (const place of parkingPlaceGrabResponse.rows) {
            let decreasePlacesQuery = `UPDATE bike_stations 
            SET places_taken=places_taken - 1
            WHERE station_id=${place['station_id']}`;
            const decreasePlacesResponse = await pool.query(decreasePlacesQuery);
        }

        
        const parkingPlaceDeleteQuery = `DELETE FROM parking_places
        WHERE category_id=${category.id}`;
        const parkingPlaceDeleteResponse = await pool.query(parkingPlaceDeleteQuery);
        
        const reviewDeleteQuery = `DELETE FROM model_reviews 
        WHERE model_id IN (SELECT DISTINCT model_id FROM bike_models WHERE category_id=${category.id})`;
        const reviewDeleteResponse = await pool.query(reviewDeleteQuery);

        const modelDeleteQuery = `DELETE FROM bike_models 
        WHERE category_id=${category.id}`;
        const modelDeleteResponse = await pool.query(modelDeleteQuery);
        
        const categoryDeleteQuery = `DELETE FROM bike_categories 
        WHERE category_id=${category.id}`;
        const categoryDeleteResponse = await pool.query(categoryDeleteQuery);

        res.status(200).send("Category Deleted");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(414).send("Error when accessing database: " + err);
    }
});


module.exports = router;