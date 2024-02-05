let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js');
const checkAdminAuth = require('./authenticator_admin.js');


router.post("/", checkAdminAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bike = req.body;

        const insertQuery = `INSERT INTO bikes(model_id, unique_id, station_id, place_id, place_number, status)
        VALUES(${bike.model_id}, '${bike.unique_id}', NULL, NULL, -1, 'wild')`;

        const insertResponse = await pool.query(insertQuery);

        res.status(200).send("Created Bike");
        
    } catch (err) {
        res.status(418).send("Error when accessing database: " + err);
    }
});


router.put("/", checkAdminAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bike = req.body;
        const bikeId = bike.bike_id;

        for (const key in bike) {
            if (key === "bike_id" || key === "station_id" || key === "place_number" || key === "place_id") continue;
            if (bike.hasOwnProperty(key)) {
                const value = bike[key];
                let updateQuery = ``;
                
                //How should this section be handled by frontend-backend
                if (key === "status") {
                    if (value === "wild") { //changing to wild

                        const stationQuery = `UPDATE bike_stations 
                        SET places_taken=places_taken - 1
                        WHERE station_id IN (
                        SELECT station_id FROM bikes WHERE bike_id = ${bike['bike_id']})`;

                        const stationResponse = await pool.query(stationQuery);
                        
                        const updateStatusQuery = `UPDATE bikes
                        SET status='wild', station_id=NULL, place_id=NULL, place_number=-1 
                        WHERE bike_id=${bikeId}`;
                        
                        const updateStatusResponse = await pool.query(updateStatusQuery);

                    } else { //changing to parked
                        //check if station has capacity
                        const stationCapacityQuery = `SELECT * FROM bike_stations 
                        WHERE station_id=${bike.station_id} AND places_taken!=places_all`;
                        const stationCapacityResponse = await pool.query(stationCapacityQuery);
                        if (stationCapacityResponse.rowCount === 0) {
                            res.status(427);
                            throw new Error('This station is full');
                        }

                        //check if the parking place is free and category is good
                        //grab parking place
                        const parkingPlaceQuery = `SELECT * FROM parking_places 
                        WHERE station_id=${bike.station_id} AND place_id NOT IN 
                        (SELECT place_id from bikes WHERE station_id=${bike.station_id} AND status='parked')
                        AND place_number=${bike.place_number}`
                        const parkingPlaceResponse = await pool.query(parkingPlaceQuery);
                        if (parkingPlaceResponse.rowCount === 0) {
                            res.status(425);
                            throw new Error('This parking place is not free');
                        }


                        const place = parkingPlaceResponse.rows[0];
                        if (place.category_id != 4) {
                            const categoryIdQuery = `SELECT category_id FROM bike_models 
                            WHERE model_id IN (
                            SELECT model_id FROM bikes 
                            WHERE bike_id=${bikeId})`;
                            const categoryIdResponse = await pool.query(categoryIdQuery);
                            if (categoryIdResponse.rows[0].category_id != place.category_id) {
                                res.status(426);
                                throw new Error('This parking place is not the right category');
                            }
                        }

                        const updateStatusQuery = `UPDATE bikes 
                        SET station_id=${bike.station_id}, place_id=${place.place_id}, place_number=${place.place_number}, status='parked' 
                        WHERE bike_id=${bikeId}`;
                        const updateStatusResponse = await pool.query(updateStatusQuery);

                        updateStations();

                        // const updateStationQuery = `UPDATE bike_stations
                        // SET places_taken=places_taken + 1
                        // WHERE station_id=${bike.station_id}`;
                        // const updateStationResponse = await pool.query(updateStationQuery);

                    }
                } else if (typeof value === 'string') {
                    updateQuery = `UPDATE bikes
                             SET ${key}='${value}'
                             WHERE bike_id=${bikeId}`;
                } else {
                    updateQuery = `UPDATE bikes
                             SET ${key}=${value}
                             WHERE bike_id=${bikeId}`;
                }

                console.log(updateQuery);

                const updateResult = await pool.query(updateQuery);

                if (updateResult.rowCount !== 0) {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Updated Bike");

    } catch (err) {
        res.send("Error when accessing database: " + err);
    }
});

router.delete("/", checkAdminAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bikeId = req.body.bike_id;

        
        // const stationQuery = `UPDATE bike_stations 
        // SET places_taken=places_taken - 1
        // WHERE station_id IN (
            // SELECT station_id FROM bikes WHERE bike_id = ${bikeId})`;
            // const stationResponse = await pool.query(stationQuery);
            
            
        const deleteQuery = `DELETE FROM bikes WHERE bike_id=${bikeId}`;
        
        
        const deleteResponse = await pool.query(deleteQuery);
        
        updateStations();
        
        res.status(200).send("Deleted Bike");

    } catch (err) {
        res.status(420).send("Error when accessing database: " + err);
    }
});


async function updateStations() {
    
    const stationsQuery = `SELECT station_id FROM bike_stations`;
    const stationsResponse = await pool.query(stationsQuery);

    let stations = stationsResponse.rows;
    
    for (const station of stations) {
        let bikeCountQuery = `SELECT COUNT(*) AS count FROM bikes WHERE station_id=${station.station_id}`;
        let bikeCountResponse = await pool.query(bikeCountQuery);
        let count = bikeCountResponse.rows[0];

        let bikeStationUpdateQuery = `UPDATE bike_stations 
        SET places_taken = ${count.count} where station_id=${station.station_id}`;
        let bikeStationUpdateResponse = await pool.query(bikeStationUpdateQuery);

        console.log("Updated station: " + station.station_id + " TO: " + count.count);
    }
}

module.exports = router;