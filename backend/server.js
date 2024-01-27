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
        
        let bikeQuery = 'SELECT * FROM bike_stations';

        const bikeResponse = await pool.query(bikeQuery);
        const response = bikeResponse.rows;

        let i = 0;
        for (const row of response) {
            let placesQuery = `SELECT place_number, place_id, name AS category 
            FROM parking_places JOIN bike_categories
            ON parking_places.category_id = bike_categories.category_id
            WHERE station_id=${row['station_id']}
            ORDER BY place_number`;
            
            const placesResponse = await pool.query(placesQuery);
            response[i]['places'] = placesResponse.rows;
            i += 1;
        }
        
        i = 0;
        for (const row of response) {
            let bikesQuery = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
            description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
            bike_categories.name as category_name  
            FROM bikes NATURAL JOIN bike_models JOIN bike_categories
            ON bike_models.category_id = bike_categories.category_id 
            WHERE bikes.station_id=${row['station_id']}
            ORDER BY bikes.place_id`;
            
            const bikeResponse = await pool.query(bikesQuery);
            response[i]['bikes'] = bikeResponse.rows;
            i += 1;
        }

        i = 0;
        for (const row of response) {
            let reviewsQuery = `SELECT * 
            FROM station_reviews
            WHERE station_id=${row['station_id']}`;
            
            const reviewsResponse = await pool.query(reviewsQuery);
            response[i]['reviews'] = reviewsResponse.rows;
            i += 1
        }
        
        res.status(200).send(response);
        
    } catch (err) {
        res.status(401).send("Error when accessing database: " + err);
    }
});


app.get("/station/:id", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        
        let bikeQuery = 'SELECT * FROM bike_stations';

        const bikeResponse = await pool.query(bikeQuery);
        const response = bikeResponse.rows;

        let i = 0;
        for (const row of response) {
            let placesQuery = `SELECT place_number, place_id, name AS category 
            FROM parking_places JOIN bike_categories
            ON parking_places.category_id = bike_categories.category_id
            WHERE station_id=${row['station_id']}
            ORDER BY place_number`;
            
            const placesResponse = await pool.query(placesQuery);
            response[i]['places'] = placesResponse.rows;
            i += 1;
        }
        
        i = 0;
        for (const row of response) {
            let bikesQuery = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
            description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
            bike_categories.name as category_name  
            FROM bikes NATURAL JOIN bike_models JOIN bike_categories
            ON bike_models.category_id = bike_categories.category_id 
            WHERE bikes.station_id=${row['station_id']}
            ORDER BY bikes.place_id`;
            
            const bikeResponse = await pool.query(bikesQuery);
            response[i]['bikes'] = bikeResponse.rows;
            i += 1;
        }

        i = 0;
        for (const row of response) {
            let reviewsQuery = `SELECT * 
            FROM station_reviews
            WHERE station_id=${row['station_id']}`;
            
            const reviewsResponse = await pool.query(reviewsQuery);
            response[i]['reviews'] = reviewsResponse.rows;
            i += 1
        }

        res.status(200).send(response.filter(station => station.station_id == req.params.id)[0]);
        
    } catch (err) {
        res.status(402).send("Error when accessing database: " + err);
    }
});


app.get("/categories", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const categoriesQuery = `SELECT * FROM bike_categories`;
        const categoriesResponse = await pool.query(categoriesQuery);
        
        res.status(200).send(categoriesResponse.rows);

    } catch (err) {
        res.status(403).send("Error when accessing database: " + err);
    }
});


app.get("/models", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const modelsQuery = `SELECT * FROM bike_models`;
        const modelsResponse = await pool.query(modelsQuery);

        res.status(200).send(modelsResponse.rows);

    } catch (err) {
        res.status(404).send("Error when accessing database: " + err);
    }
});


app.get("/bikes", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const bikesQuery = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
        description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
        bike_categories.name as category_name, bikes.station_id  
        FROM bikes NATURAL JOIN bike_models JOIN bike_categories
        ON bike_models.category_id = bike_categories.category_id 
        ORDER BY bikes.bike_id`;

        const bikesResponse = await pool.query(bikesQuery);

        const response = bikesResponse.rows;
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

    } catch (err) {
        res.status(405).send("Error when accessing database: " + err);
    }
});


app.get("/bike/:id", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const bikeQuery = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
        description, wheel_size, manufacturer, brakes_type, bike_categories.category_id as category_id, 
        bike_categories.name as category_name, bikes.station_id  
        FROM bikes NATURAL JOIN bike_models JOIN bike_categories
        ON bike_models.category_id = bike_categories.category_id 
        WHERE bike_id=${req.params.id}
        ORDER BY bikes.bike_id`;

        const bikeResponse = await pool.query(bikeQuery);

        const response = bikeResponse.rows;
        const promises = [];

        for (const bike of response) {
            const reviewsQuery = `SELECT customer_id, rating, review_text 
            FROM model_reviews
            WHERE model_id = ${bike['model_id']}`;

            promises.push(pool.query(reviewsQuery).then(reviewsResult => {
                bike['reviews'] = reviewsResult.rows;
            }).catch(err => {
                res.status(406).send("Error when accessing database: " + err);
            }));
        }

        await Promise.all(promises);

        res.status(200).send(response);

    } catch (err) {
        res.status(407).send("Error when accessing database: " + err);
    }
});


app.get("/model_reviews", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const reviewsQuery = `SELECT * FROM model_reviews`;
        const reviewsResponse = await pool.query(reviewsQuery);

        res.status(200).send(reviewsResponse.rows);

    } catch (err) {
        res.status(408).send("Error when accessing database: " + err);
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


app.put("/station", async (req, res) => {
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
    
        res.status(200).send("Station Deleted");

    } catch (err) {
        res.status(411).send("Error when accessing database: " + err);
    }
});
//#endregion

//BIKE CATEGORIES
//#region 
app.post("/category", async (req, res) => {
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

app.put("/category", async (req, res) => {
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

app.delete("/category", async (req, res) => {
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
//#endregion

//BIKE MODELS
//#region 
app.post("/model", async (req, res) => {
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
        const deleteModelResponse = await pool.query(deleteModelQuery);

        res.status(200).send("Deleted Model");

    } catch (err) {
        console.error("Error when accessing database: " + err);
        res.status(417).send("Error when accessing database: " + err);
    }
});
//#endregion

//BIKES
//#region 
app.post("/bike", async (req, res) => {
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


app.put("/bike", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bike = req.body;
        const bikeId = bike.bike_id;

        for (const key in bike) {
            if (key === "bike_id") continue;
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

                    } else { //changing to parked
                        console.log("to parked");
                        //check if there is parking place left and if it fits the category
                    }
                }

                if (typeof value === 'string') {
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
        res.status(419).send("Error when accessing database: " + err);
    }
});

app.delete("/bike", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html');

        const bikeId = req.body.bike_id;

        const stationQuery = `UPDATE bike_stations 
        SET places_taken=places_taken - 1
        WHERE station_id IN (
        SELECT station_id FROM bikes WHERE bike_id = ${bikeId})`;
        const stationResponse = await pool.query(stationQuery);


        const deleteQuery = `DELETE FROM bikes WHERE bike_id=${bikeId}`;

        const deleteResponse = await pool.query(deleteQuery);

        res.status(200).send("Deleted Bike");

    } catch (err) {
        res.status(420).send("Error when accessing database: " + err);
    }
});
//#endregion

//Customer Routers
//#region 
app.post("/user", async (req,res) => {
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

app.delete("/user", async (req, res) => {
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
//#endregion

//Review Routers
//#region 
app.post("/review/model", async (req,res) => {
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

app.post("/review/station", async (req,res) => {
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

//#endregion


let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
