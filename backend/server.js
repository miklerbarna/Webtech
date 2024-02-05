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


const checkUserAuth = require('./authenticator_user.js');


const stationRouter = require('./module_station.js');
app.use('/station', stationRouter);

const categoriesRouter = require('./module_category.js');
app.use('/category', categoriesRouter);

const modelRouter = require('./module_model.js');
app.use('/model', modelRouter);

const bikeRouter = require('./module_bike.js');
app.use('/bike', bikeRouter);

const userRouter = require('./module_user.js');
app.use('/user', userRouter);

const reviewRouter = require('./module_review.js');
app.use('/user', reviewRouter);

const loginRouter = require('./module_login.js');
app.use('/login', loginRouter);


app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("Server is Running");
});


//GET REQUESTS, API for sending data
app.get("/stations", checkUserAuth, async (req, res) => {
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


app.get("/station/:id", checkUserAuth, async (req, res) => {
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


app.get("/categories", checkUserAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const categoriesQuery = `SELECT * FROM bike_categories`;
        const categoriesResponse = await pool.query(categoriesQuery);
        
        res.status(200).send(categoriesResponse.rows);

    } catch (err) {
        res.status(403).send("Error when accessing database: " + err);
    }
});


app.get("/models", checkUserAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const modelsQuery = `SELECT * FROM bike_models`;
        const modelsResponse = await pool.query(modelsQuery);

        res.status(200).send(modelsResponse.rows);

    } catch (err) {
        res.status(404).send("Error when accessing database: " + err);
    }
});


app.get("/bikes", checkUserAuth, async (req, res) => {
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
            const reviewsQuery = `SELECT user_id, rating, review_text 
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


app.get("/bike/:id", checkUserAuth, async (req, res) => {
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
            const reviewsQuery = `SELECT user_id, rating, review_text 
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


app.get("/model_reviews", checkUserAuth, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const reviewsQuery = `SELECT * FROM model_reviews`;
        const reviewsResponse = await pool.query(reviewsQuery);

        res.status(200).send(reviewsResponse.rows);

    } catch (err) {
        res.status(408).send("Error when accessing database: " + err);
    }
});



let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
