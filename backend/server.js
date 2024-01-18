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
app.get("/stations", (req,res) => {
    
    res.setHeader('Content-Type', 'application/json');

    let query = 'select * from bike_stations';

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No stations from database");
        }
        else {
            var promises = []
            var response = result.rows;
            for (const row of response) {
                let query = `SELECT place_number, place_id,name AS category 
                             FROM parking_places JOIN bike_categories
                             ON parking_places.category_id = bike_categories.category_id
                             WHERE station_id=${row['station_id']}
                             ORDER BY place_number`
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No parking place of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['places'] = results.rows
                    }
                }));
            }

            for (const row of response) {
                let query = `SELECT bike_id, unique_id, parking_place_id, status, model_id, bike_models.name as model_name, 
                                    description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                                    bike_categories.name as category_name  
                             FROM parking_places_bikes NATURAL JOIN bikes NATURAL JOIN bike_models join bike_categories
                             on bike_models.category_id = bike_categories.category_id 
                             WHERE parking_places_bikes.parking_place_id IN (
                             SELECT place_id 
                             FROM parking_places
                             WHERE station_id=${row['station_id']})
                             ORDER BY parking_place_id`;
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No bikes of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['bikes'] = results.rows;
                    }
                }));
            }

            for (const row of response) {
                let query = `SELECT * 
                             FROM station_reviews
                             WHERE station_id=${row['station_id']}`
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No reviews of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['reviews'] = results.rows;
                    }
                }));
            }

            Promise.all(promises).then(()=>{
                console.log(response);
                res.status(200).send(response);
            })
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });

});

app.get("/station/:id", (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    let query = 'select * from bike_stations';

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No stations from database");
        }
        else {
            var promises = []
            var response = result.rows;
            for (const row of response) {
                let query = `SELECT place_number, place_id,name AS category 
                             FROM parking_places JOIN bike_categories
                             ON parking_places.category_id = bike_categories.category_id
                             WHERE station_id=${row['station_id']}
                             ORDER BY place_number`
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No parking place of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['places'] = results.rows
                    }
                }));
            }

            for (const row of response) {
                let query = `SELECT bike_id, unique_id, parking_place_id, status, model_id, bike_models.name as model_name, 
                                    description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                                    bike_categories.name as category_name  
                             FROM parking_places_bikes NATURAL JOIN bikes NATURAL JOIN bike_models join bike_categories
                             on bike_models.category_id = bike_categories.category_id 
                             WHERE parking_places_bikes.parking_place_id IN (
                             SELECT place_id 
                             FROM parking_places
                             WHERE station_id=${row['station_id']})
                             ORDER BY parking_place_id`;
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No bikes of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['bikes'] = results.rows;
                    }
                }));
            }

            for (const row of response) {
                let query = `SELECT * 
                             FROM station_reviews
                             WHERE station_id=${row['station_id']}`
                promises.push(pool.query(query).then(results => {
                    if (results.rowCount == 0) {
                        res.status(401).send(`No reviews of station_id ${row['station_id']} from database`);
                    }
                    else {
                        response[row['station_id']-1]['reviews'] = results.rows;
                    }
                }));
            }

            Promise.all(promises).then(()=>{
                console.log(response);
                res.status(200).send(response[req.params.id - 1]);
            })
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });

});
        
        
        
app.get("/categories", (req,res) => {
            
    res.setHeader('Content-Type', 'application/json');
    
    var query = `SELECT * FROM bike_categories`;
    
    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No categories retrieved");
    }
    else {
        res.status(200).send(result.rows);
    }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });


});

app.get("/models", (req,res) => {

    res.setHeader('Content-Type', 'application/json');

    var query = `SELECT * FROM bike_models`;

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No models retrieved");
        }
        else {
            res.status(200).send(result.rows);
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });
});

app.get("/bikes", (req,res) => {

    res.setHeader('Content-Type', 'application/json');

    var query = `SELECT bike_id, unique_id, parking_place_id, status, model_id, bike_models.name as model_name, 
                        description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                        bike_categories.name as category_name  
                 FROM parking_places_bikes NATURAL JOIN bikes NATURAL JOIN bike_models join bike_categories
                 on bike_models.category_id = bike_categories.category_id 
                 ORDER BY bike_id`;

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No bikes retrieved");
        }
        else {
            res.status(200).send(result.rows);
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });
})

app.get("/bike/:id", (req,res) => {

    res.setHeader('Content-Type', 'application/json');

    var query = `SELECT bike_id, unique_id, parking_place_id, status, model_id, bike_models.name as model_name, 
                        description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                        bike_categories.name as category_name  
                 FROM parking_places_bikes NATURAL JOIN bikes NATURAL JOIN bike_models join bike_categories
                 on bike_models.category_id = bike_categories.category_id 
                 WHERE bike_id=${req.params.id}
                 ORDER BY bike_id`;

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No bikes retrieved");
        }
        else {
            res.status(200).send(result.rows);
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });
})



app.get("/model_reviews", (req,res) => {

    res.setHeader('Content-Type', 'application/json');

    var query = `SELECT * FROM model_reviews`;

    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No reviews retrieved");
        }
        else {
            res.status(200).send(result.rows);
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });

})



//API for updating database
//STATION
app.post("/station", (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    stat = req.body;
    
    var query = `INSERT INTO bike_stations(name,address,city,latitude,longitude,places_taken,places_all)
                 VALUES ('${stat.name}','${stat.address}','${stat.city}',${stat.latitude},${stat.longitude},0,${stat.places_all})`

    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No row added");
        }
        else {
            res.status(200).send("Row added");
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });

});

app.put("/station", (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    var stat = req.body;

    var stat_id = stat.station_id;

    for (const key in stat) {
        if (key=="id") continue;
        if (stat.hasOwnProperty(key)) {
            const value = stat[key];
            var query = `UPDATE bike_stations
                       SET ${key}=${value}
                       WHERE station_id=${stat_id}`;
            
            pool.query(query).then(results => {
                if (results.rowCount == 0) {
                    res.status(401).send("No Update");
                }
                else {
                    console.log(query);
                }
            }).catch(err => {
                res.status(402).send("Error when accessing database: " + err);
            });
        }
    }

    res.status(200).send("Update happened");

});


app.delete("/station", (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    var stat = req.body;

    var stat_id = stat.station_id;

    query = `DELETE FROM bike_stations WHERE station_id=${stat_id}`;

    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No row deleted");
        }
        else {
            res.status(200).send("Delete happened");
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });

});


//BIKE CATEGORIES
app.post("/category", (req, res) => {
    res.setHeader('Content-Type', 'text/html');



});


// app.get("/bike/:id", (req,res) => {

// })


let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
