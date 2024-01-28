let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');

router.post("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const stat = req.body;

        const insertStationQuery = `INSERT INTO bike_stations(name, address, city, latitude, longitude, places_taken, places_all)
        VALUES ('${stat.name}', '${stat.address}', '${stat.city}', ${stat.latitude}, ${stat.longitude}, 0, ${stat.places_all})`;

        const stationResults = await pool.query(insertStationQuery);

        // inserting parking places
        const selectStationQuery = `SELECT * FROM bike_stations WHERE name='${stat.name}'`;
        const stationResult = await pool.query(selectStationQuery);
        const station = stationResult.rows[0];
        console.log(station);
        let placesDone = 0;

        for (const place of stat.places) {
            console.log(place);
            for (let index = 0; index < place.place_num; index++) {
                const insertPlaceQuery = `INSERT INTO parking_places(station_id, place_number, category_id)
                VALUES (${station.station_id}, ${placesDone}, ${place.category})`;

                console.log(insertPlaceQuery);
                await pool.query(insertPlaceQuery);

                console.log(`Num: ${placesDone} --parking place created`);
                placesDone++;
            }
        }

        res.status(200).send("Station Created");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(409).send("Error when accessing database: " + err);
    }
});


router.put("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const stat = req.body;
        const statId = stat.station_id;

        for (const key in stat) {
            if (key === "station_id") continue;
            if (stat.hasOwnProperty(key)) {
                const value = stat[key];
                let updateQuery = ';';

                if (typeof value === 'string') {
                    updateQuery = `UPDATE bike_stations
                    SET ${key}='${value}'
                    WHERE station_id=${statId}`;

                } else {
                    updateQuery = `UPDATE bike_stations
                    SET ${key}=${value}
                    WHERE station_id=${statId}`;

                }

                console.log(updateQuery);

                const updateResponse = await pool.query(updateQuery);

                if (updateResponse.rowCount !== 0) {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Station Updated");

    } catch (err) {
        res.status(410).send("Error when accessing database: " + err);
    }
});


router.delete("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const stat = req.body;
        const statId = stat.station_id;

        const updateBikesQuery = `UPDATE bikes SET status='wild', station_id=NULL, place_id=NULL WHERE station_id=${statId}`;
        const bikesResults = await pool.query(updateBikesQuery);

        const deletePlacesQuery = `DELETE FROM parking_places WHERE station_id=${statId}`;
        const placesResults = await pool.query(deletePlacesQuery);
        
        const deleteReviewsQuery = `DELETE FROM station_reviews WHERE station_id=${statId}`;
        const reviewsResults = await pool.query(deleteReviewsQuery);

        const deleteStationQuery = `DELETE FROM bike_stations WHERE station_id=${statId}`;
        const stationResults = await pool.query(deleteStationQuery);
    
        res.status(200).send("Station Deleted");

    } catch (err) {
        res.status(411).send("Error when accessing database: " + err);
    }
});


module.exports = router;