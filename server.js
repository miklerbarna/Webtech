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
