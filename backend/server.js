const { Pool } = require('pg');

let cfg = require('./config.json')

let express = require('express');
let cors = require('cors')
const app = express();
app.use(express.static('public')); 
app.use(express.json());
app.use(cors());

const pool = require('./pool.js'); 

let bodyParser = require('body-parser');
app.use(bodyParser.json()); 

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("Working");
});

//GET REQUESTS, API for sending data
//#region 

app.get("/stations", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let query = 'select * from bike_stations';

        const result = await pool.query(query);
        const response = result.rows;

        let i = 0;
        for (const row of response) {
            let query = `SELECT place_number, place_id, name AS category 
            FROM parking_places JOIN bike_categories
            ON parking_places.category_id = bike_categories.category_id
            WHERE station_id=${row['station_id']}
            ORDER BY place_number`;
            
            const results = await pool.query(query);
            response[i]['places'] = results.rows;
            i += 1;
        }
        
        i = 0;
        for (const row of response) {
            let query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
            description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
            bike_categories.name as category_name  
            FROM bikes NATURAL JOIN bike_models JOIN bike_categories
            ON bike_models.category_id = bike_categories.category_id 
            WHERE bikes.station_id=${row['station_id']}
            ORDER BY bikes.place_id`;
            
            const results = await pool.query(query);
            response[i]['bikes'] = results.rows;
            i += 1;
        }

        i = 0;
        for (const row of response) {
            let query = `SELECT * 
            FROM station_reviews
            WHERE station_id=${row['station_id']}`;
            
            const results = await pool.query(query);
            response[i]['reviews'] = results.rows;
            i += 1
        }
        res.status(200).send(response);
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/station/:id", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        let query = 'select * from bike_stations';
        const result = await pool.query(query);

        const promises = [];
        const response = result.rows;

        let i = 0;
        for (const row of response) {
            let query = `SELECT place_number, place_id, name AS category 
                            FROM parking_places JOIN bike_categories
                            ON parking_places.category_id = bike_categories.category_id
                            WHERE station_id=${row['station_id']}
                            ORDER BY place_number`;

            const results = await pool.query(query);
            response[i]['places'] = results.rows;
            i += 1;
        }

        i = 0;
        for (const row of response) {
            let query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                            description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
                            bike_categories.name as category_name  
                            FROM bikes NATURAL JOIN bike_models JOIN bike_categories
                            ON bike_models.category_id = bike_categories.category_id 
                            WHERE bikes.station_id=${row['station_id']}
                            ORDER BY bikes.place_id`;

            const results = await pool.query(query);
            response[i]['bikes'] = results.rows;
            i += 1;
        }

        i = 0;
        for (const row of response) {
            let query = `SELECT * 
                            FROM station_reviews
                            WHERE station_id=${row['station_id']}`;

            const results = await pool.query(query);
            response[i]['reviews'] = results.rows;
            i += 1;
        }

        res.status(200).send(response.filter(station => station.station_id == req.params.id)[0]);

    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/categories", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const query = `SELECT * FROM bike_categories`;
        const result = await pool.query(query);

        if (result.rowCount === 0) {
            res.status(401).send("No categories retrieved");
        } else {
            res.status(200).send(result.rows);
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/models", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const query = `SELECT * FROM bike_models`;
        const result = await pool.query(query);

        if (result.rowCount === 0) {
            res.status(401).send("No models retrieved");
        } else {
            res.status(200).send(result.rows);
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/bikes", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                        description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
                        bike_categories.name as category_name, bikes.station_id  
                        FROM bikes NATURAL JOIN bike_models JOIN bike_categories
                     ON bike_models.category_id = bike_categories.category_id 
                     ORDER BY bikes.bike_id`;

        const result = await pool.query(query);

        if (result.rowCount === 0) {
            res.status(401).send("No bikes retrieved");
        } else {
            const response = result.rows;
            const promises = [];

            for (const bike of response) {
                const reviewsQuery = `SELECT customer_id, rating, review_text 
                                     FROM model_reviews
                                     WHERE model_id = ${bike['model_id']}`;

                promises.push(pool.query(reviewsQuery).then(reviewsResult => {
                    bike['reviews'] = reviewsResult.rows;
                }).catch(err => {
                    res.status(402).send("Error when accessing database: " + err);
                }));
            }

            await Promise.all(promises);

            res.status(200).send(response);
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/bike/:id", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
            description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
            bike_categories.name as category_name, bikes.station_id  
            FROM bikes NATURAL JOIN bike_models JOIN bike_categories
            ON bike_models.category_id = bike_categories.category_id 
            WHERE bike_id=${req.params.id}
            ORDER BY bikes.bike_id`;

        const result = await pool.query(query);

        if (result.rowCount === 0) {
            res.status(401).send("No bikes retrieved");
        } else {
            const response = result.rows;
            const promises = [];

            for (const bike of response) {
                const reviewsQuery = `SELECT customer_id, rating, review_text 
                                     FROM model_reviews
                                     WHERE model_id = ${bike['model_id']}`;

                promises.push(pool.query(reviewsQuery).then(reviewsResult => {
                    bike['reviews'] = reviewsResult.rows;
                }).catch(err => {
                    res.status(402).send("Error when accessing database: " + err);
                }));
            }

            await Promise.all(promises);

            res.status(200).send(response);
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/model_reviews", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const query = `SELECT * FROM model_reviews`;
        const result = await pool.query(query);

        if (result.rowCount === 0) {
            res.status(401).send("No reviews retrieved");
        } else {
            res.status(200).send(result.rows);
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});

//#endregion

//API for updating database
//STATION
//#region 
app.post("/station", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const stat = req.body;

        const insertStationQuery = `INSERT INTO bike_stations(name, address, city, latitude, longitude, places_taken, places_all)
                                    VALUES ('${stat.name}', '${stat.address}', '${stat.city}', ${stat.latitude}, ${stat.longitude}, 0, ${stat.places_all})`;

        const stationResults = await pool.query(insertStationQuery);

        if (stationResults.rowCount === 0) {
            res.status(401).send("No row added");
        } else {
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
            res.status(200).send("Station created");
        }
    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.put("/station", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const stat = req.body;
        const statId = stat.station_id;

        for (const key in stat) {
            if (key === "station_id") continue;
            if (stat.hasOwnProperty(key)) {
                const value = stat[key];
                let query = ';';

                if (typeof value === 'string') {
                    query = `UPDATE bike_stations
                             SET ${key}='${value}'
                             WHERE station_id=${statId}`;
                } else {
                    query = `UPDATE bike_stations
                             SET ${key}=${value}
                             WHERE station_id=${statId}`;
                }

                console.log(query);

                const results = await pool.query(query);

                if (results.rowCount === 0) {
                    res.status(401).send("No Update");
                } else {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Updated");
    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.delete("/station", async (req, res) => {
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
    
        res.status(200).send("Deleted");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});
//#endregion

//BIKE CATEGORIES
//#region 
app.post("/category", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        const query = `INSERT INTO bike_categories(name)
                       VALUES ('${category.name}')`;

        const results = await pool.query(query);

        if (results.rowCount === 0) {
            res.status(401).send("No row added");
        } else {
            res.status(200).send("Row added");
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});

app.put("/category", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        const query = `UPDATE bike_categories 
                       SET name='${category.name}'
                       WHERE category_id=${category.id} `;

        const results = await pool.query(query);

        if (results.rowCount === 0) {
            res.status(401).send("No Update");
        } else {
            res.status(200).send("Updated");
        }
    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});

app.delete("/category", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const category = req.body;

        //UPDATE STATION (places_taken - deletebikeResponse rowcount?)
        
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

        res.status(200).send("Deleted Category");
    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});
//#endregion

//BIKE MODELS
//#region 
app.post("/model", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const model = req.body;

        console.log("Adding Model: " + model.name);

        const query = `INSERT INTO bike_models(category_id, name, description, wheel_size, manufacturer, brakes_type)
                       VALUES(${model.category_id}, '${model.name}', '${model.description}', ${model.wheel_size}, '${model.manufacturer}', '${model.brakes_type}')`;

        const results = await pool.query(query);

        if (results.rowCount === 0) {
            res.status(401).send("No Creation");
        } else {
            res.status(200).send("Created");
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});

app.put("/model", async (req, res) => {
    try {
        console.log("Data: " + req.body.model_id + " " + req.body.name);
        res.setHeader('Content-Type', 'text/html');

        const model = req.body;
        const modelId = model.model_id;

        for (const key in model) {
            if (key === "model_id") continue;
            if (model.hasOwnProperty(key)) {
                const value = model[key];
                let query = ``;

                if (typeof value === 'string') {
                    query = `UPDATE bike_models
                             SET ${key}='${value}'
                             WHERE model_id=${modelId}`;
                } else {
                    query = `UPDATE bike_models
                             SET ${key}=${value}
                             WHERE model_id=${modelId}`;
                }

                console.log(query);

                const results = await pool.query(query);

                if (results.rowCount === 0) {
                    res.status(401).send("No Update");
                } else {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Updated");
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});

app.delete("/model", async (req, res) => {
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
        const results = await pool.query(deleteModelQuery);

        res.status(200).send("Deleted");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    }
});
//#endregion

//BIKES
//#region 
app.post("/bike", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bike = req.body;
        // Originally it is not assigned to any station-place
        const query = `INSERT INTO bikes(model_id, unique_id, station_id, place_id, place_number, status)
                       VALUES(${bike.model_id}, '${bike.unique_id}', NULL, NULL, -1, 'wild')`;

        const results = await pool.query(query);

        if (results.rowCount === 0) {
            res.status(401).send("No Creation");
        } else {
            res.status(200).send("Created");
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.put("/bike", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bike = req.body;
        const bikeId = bike.bike_id;

        for (const key in bike) {
            if (key === "bike_id") continue;
            if (bike.hasOwnProperty(key)) {
                const value = bike[key];
                let query = ``;
                
                //How should this section be handled by frontend-backend
                if (key === "status") {
                    if (value === "wild") { //changingto wild

                        console.log("to wild");
                        const stationQuery = `UPDATE bike_stations 
                        SET places_taken=places_taken - 1
                        WHERE station_id IN (
                        SELECT station_id FROM bikes WHERE bike_id = ${bike['bike_id']})`;
                        const stationResponse = await pool.query(stationQuery);
                    } else { //changing to parked
                        console.log("to parked");
                    }
                }

                if (typeof value === 'string') {
                    query = `UPDATE bikes
                             SET ${key}='${value}'
                             WHERE bike_id=${bikeId}`;
                } else {
                    query = `UPDATE bikes
                             SET ${key}=${value}
                             WHERE bike_id=${bikeId}`;
                }

                console.log(query);

                const results = await pool.query(query);

                if (results.rowCount === 0) {
                    res.status(401).send("No Update");
                } else {
                    console.log(`Updated ${key}`);
                }
            }
        }

        res.status(200).send("Updated");
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});

app.delete("/bike", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bikeId = req.body.bike_id;

        // Also update station properties, reduce places taken

        const query = `DELETE FROM bikes WHERE bike_id=${bikeId}`;

        const results = await pool.query(query);

        if (results.rowCount === 0) {
            res.status(401).send("No Delete");
        } else {
            res.status(200).send("Deleted");
        }
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});
//#endregion



let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
