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
                let query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                                description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                                bike_categories.name as category_name  
                             FROM bikes NATURAL JOIN bike_models JOIN bike_categories
                             ON bike_models.category_id = bike_categories.category_id 
                             WHERE bikes.station_id=${row['station_id']}
                             ORDER BY bikes.place_id`;
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
                let query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                                description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                                bike_categories.name as category_name  
                             FROM bikes NATURAL JOIN bike_models join bike_categories
                             on bike_models.category_id = bike_categories.category_id 
                             WHERE bikes.station_id=${row['station_id']}
                             ORDER BY bikes.place_id`;
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

    var query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                    description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                    bike_categories.name as category_name, bikes.station_id  
                 FROM bikes NATURAL JOIN bike_models JOIN bike_categories
                 ON bike_models.category_id = bike_categories.category_id 
                 ORDER BY bikes.bike_id`;
    //also add reviews for the bike model in a list 
    //also add where it is parked: station id, place number from parking_places
    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No bikes retrieved");
        }
        else {
            var response = result.rows;
            var promises = []
            for (const bike of response) {
                let query = `SELECT customer_id,rating, review_text 
                             FROM model_reviews
                             WHERE model_id = ${bike['model_id']}`;
                promises.push(pool.query(query).then(result => {
                    bike['reviews'] = result.rows;
                }).catch(err => {
                    res.status(402).send("Error when accessing database " + err);
                }));
            }

            Promise.all(promises).then(() => {
                res.status(200).send(response);
            });
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database " + err);
    });
})

app.get("/bike/:id", (req,res) => {

    res.setHeader('Content-Type', 'application/json');

    var query = `SELECT bike_id, unique_id, bikes.place_number, status, model_id, bike_models.name as model_name, 
                    description, wheel_size,manufacturer, brakes_type,bike_categories.category_id as category_id, 
                    bike_categories.name as category_name, bikes.station_id  
                 FROM bikes NATURAL JOIN bike_models JOIN bike_categories
                 ON bike_models.category_id = bike_categories.category_id 
                 WHERE bike_id=${req.params.id}
                 ORDER BY bikes.bike_id`;
    //also add reviews for the bike model in a list 
    //also add where it is parked: station id, place number from parking_places
    pool.query(query).then(result => {
        if (result.rowCount == 0) {
            res.status(401).send("No bikes retrieved");
        }
        else {
            var response = result.rows;
            var promises = []
            for (const bike of response) {
                let query = `SELECT customer_id,rating, review_text 
                             FROM model_reviews
                             WHERE model_id = ${bike['model_id']}`;
                promises.push(pool.query(query).then(result => {
                    bike['reviews'] = result.rows;
                }).catch(err => {
                    res.status(402).send("Error when accessing database " + err);
                }));
            }

            Promise.all(promises).then(() => {
                res.status(200).send(response);
            });
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

//#endregion

//API for updating database
//STATION
//#region 
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
            // res.status(200).send("Row added");
            query = `SELECT * from bike_stations WHERE name='${stat.name}'`;
            pool.query(query).then(result => {
                var station = result.rows[0];
                console.log(station);
                var places_done = 0;

                for (const place of stat.places) {
                    console.log(place);
                    for (let index = 0; index < place.place_num; index++) {
                        let query = `INSERT INTO parking_places(station_id,place_number,category_id)
                                     VALUES (${station.station_id},${places_done},${place.category})` 
                        console.log(query);
                        pool.query(query).then(result => {
                            if (result.rowCount == 0) {
                                console.log("Failed to create parking place");
                            }
                            else {
                                console.log(`Num: ${places_done} --parking place created`);
                            }
                        }).catch(err => {
                            res.status(402).send("Error when accessing database: " + err);
                        });
                        places_done++;
                    }
                }
                res.status(200).send("Station created");
            })
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
        if (key=="station_id") continue;
        if (stat.hasOwnProperty(key)) {
            const value = stat[key];
            var query = `;`
            if (typeof value === 'string') {
                query = `UPDATE bike_stations
                         SET ${key}='${value}'
                         WHERE station_id=${stat_id}`;
            }
            else {
                query = `UPDATE bike_stations
                         SET ${key}=${value}
                         WHERE station_id=${stat_id}`;
            }
            console.log(query);
            
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

    res.status(200).send("Updated");

});


app.delete("/station", (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    var stat = req.body;

    var stat_id = stat.station_id;

    //set the bikes' status that used the parking places to wild


    var query = `DELETE FROM parking_places WHERE station_id=${stat_id}`;

    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No row deleted from parking_places");
        }
        else {
            let query = `DELETE FROM bike_stations WHERE station_id=${stat_id}`;
            pool.query(query).then(results => {
                if (results.rowCount == 0) {
                    res.status(401).send("No row deleted from bike_stations");
                }
                else {
                    res.status(200).send("Deleted");
                }
            }).catch(err => {
                res.status(402).send("Error when accessing database: " + err);
            });
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });
});

//#endregion

//BIKE CATEGORIES
//#region 

app.post("/category", (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    category = req.body;
    
    var query = `INSERT INTO bike_categories(name)
                 VALUES ('${category.name}')`

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

app.put("/category", (req,res) => {
    console.log(req.body);
    res.setHeader('Content-Type', 'text/html');

    category = req.body;
    
    var query = `UPDATE bike_categories 
                 SET name='${category.name}'
                 WHERE category_id=${category.id} `

    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Update");
        }
        else {
            res.status(200).send("Updated");
        }
    }).catch(err => {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    });
});

app.delete("/category", (req,res) => {
    res.setHeader('Content-Type', 'text/html');

    category = req.body;


    //DELETE ALL MODELS FIRST, THE BIKES, THE PARKING_PLACE CONNECTIONS

    var query = `DELETE FROM bike_categories 
                 WHERE category_id=${category.id} `

    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Delete");
        }
        else {
            res.status(200).send("Deleted row");
        }
    }).catch(err => {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    });
});

//#endregion

//BIKE MODELS
//#region 

app.post("/model", (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    
    model = req.body;
    
    //must check if category exists
    
    let query = `INSERT INTO bike_models(category_id,name,description,wheel_size,manufacturer,brakes_type)
    VALUES(${model.category_id}, '${model.name}','${model.description}', ${model.wheel_size}, '${model.manufacturer}', '${model.brakes_type}')`
    
    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Creation");
        }
        else {
            res.status(200).send("Created");
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });
    
});

app.put("/model", (req,res) => {
    console.log("Adatok: " + req.body.model_id + " " + req.body.name);
    res.setHeader('Content-Type', 'text/html');
    
    var model = req.body;
    
    var model_id = model.model_id;
    
    for (const key in model) {
        if (key=="model_id") continue;
        if (model.hasOwnProperty(key)) {
            const value = model[key];
            var query = ``;
            if(typeof value === 'string') {
                query = `UPDATE bike_models
                SET ${key}='${value}'
                WHERE model_id=${model_id}`;
                
            }
            else {
                query = `UPDATE bike_models
                SET ${key}=${value}
                WHERE model_id=${model_id}`;
            }
            
            console.log(query);
            pool.query(query).then(results => {
                if (results.rowCount == 0) {
                    res.status(401).send("No Update");
                }
                else {
                    console.log(`Updated ${key}`);
                }
            }).catch(err => {
                res.status(402).send("Error when accessing database: " + err);
            });
        }
    }
    
    res.status(200).send("Updated");
    
    
});

app.delete("/model", (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    
    //delete all bikes for the model
    
    var model_id = req.body.model_id; 
    
    
    var query = `DELETE FROM bike_models WHERE model_id=${model_id}`;
    
    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Delete");
        }
        else {
            res.status(200).send("Deleted");
        }
    }).catch(err => {
        console.error("Error when accessing database: " + err);
        res.status(402).send("Error when accessing database: " + err);
    });
    
});

//#endregion

//BIKES
//#region 

app.post("/bike", (req,res) => {
    res.setHeader('Content-Type', 'text/html');

    var bike = req.body;
    //originally it is not assigned to any station-place
    var query = `INSERT INTO bikes(model_id,unique_id,station_id,place_id,place_number,status)
                 VALUES(${bike.model_id},'${bike.unique_id}', NULL, NULL, -1, 'wild')`; 
    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Creation");
        }
        else {
            res.status(200).send("Created");
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });
    


});


app.put("/bike", (req,res) => {
    res.setHeader('Content-Type', 'text/html');

    var bike = req.body;
    
    var bike_id = bike.bike_id;
    
    for (const key in bike) {
        if (key=="bike_id") continue;
        if (bike.hasOwnProperty(key)) {
            const value = bike[key];
            var query = ``;
            if(typeof value === 'string') {
                query = `UPDATE bikes
                SET ${key}='${value}'
                WHERE bike_id=${bike_id}`;
                
            }
            else {
                query = `UPDATE bikes
                SET ${key}=${value}
                WHERE bike_id=${bike_id}`;
            }
            
            console.log(query);
            pool.query(query).then(results => {
                if (results.rowCount == 0) {
                    res.status(401).send("No Update");
                }
                else {
                    console.log(`Updated ${key}`);
                }
            }).catch(err => {
                res.status(402).send("Error when accessing database: " + err);
            });
        }
    }
    
    res.status(200).send("Updated");


});

app.delete("/bike", (req,res) => {
    res.setHeader('Content-Type', 'text/html');

    var bike_id = req.body.bike_id;

    //Also delete them from parking_places_bikes connection table
    //also update station properties
    var query = `DELETE FROM bikes WHERE bike_id=${bike_id}`;
    
    pool.query(query).then(results => {
        if (results.rowCount == 0) {
            res.status(401).send("No Delete");
        }
        else {
            res.status(200).send("Deleted");
        }
    }).catch(err => {
        res.status(402).send("Error when accessing database: " + err);
    });
    
});

//#endregion


let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
