-- Table to store information about bike stations
CREATE TABLE bike_stations (
    station_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    places_taken INTEGER,
    places_all INTEGER
);

-- Table to store information about bike categories
-- defines broader set of models (mountain bike, electric, child etc) 
CREATE TABLE bike_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table to store information about parking places at each station
CREATE TABLE parking_places (
    place_id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES bike_stations(station_id),
    place_number INTEGER NOT NULL, --from 0-places_all in bike_stations
    category_id INTEGER REFERENCES bike_categories(category_id)
);
--By filtering for station_id we can tell whats the capacity is for 
-- the specific station for all categories


-- Table to store information about bike models
CREATE TABLE bike_models (
    model_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES bike_categories(category_id), -- the category it belongs to
    name VARCHAR(255) NOT NULL,
    description TEXT,
    wheel_size INTEGER,
    manufacturer VARCHAR(255),
    brakes_type VARCHAR(255)
);

-- Table to store information about individual bikes
CREATE TABLE bikes (
    bike_id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES bike_models(model_id),
    unique_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL --can be under wild/use/parked/booked
);
--wild: it has not been assigned to a station either because its a new bike or because the station is destroyed
--use: It is currently used
--booked: it is at a station but a ticket is already booked for it
--parked: it is at t place in a station and is free to book/use

-- Connecting table to represent the association between bike stations and bikes
CREATE TABLE parking_places_bikes (
    parking_place_id INTEGER REFERENCES parking_places(place_id),
    bike_id INTEGER REFERENCES bikes(bike_id),
    PRIMARY KEY (parking_place_id, bike_id)
);

-- Table to store information about customer accounts
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.0
);

-- Table to store information about booked tickets
CREATE TABLE booked_tickets (
    ticket_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    bike_id INTEGER REFERENCES bikes(bike_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    station_id INTEGER REFERENCES bike_stations(station_id),
    status VARCHAR(50) NOT NULL -- e.g., "bought", "active", "returned", "overdue"
);

-- Table to store customer reviews for bike models
CREATE TABLE model_reviews (
    review_id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES bike_models(model_id),
    customer_id INTEGER REFERENCES customers(customer_id),
    rating INTEGER,
    review_text TEXT
);

-- Table to store customer reviews for bike stations
CREATE TABLE station_reviews (
    review_id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES bike_stations(station_id),
    customer_id INTEGER REFERENCES customers(customer_id),
    rating INTEGER,
    review_text TEXT
);

--INSERT INTO table() VALUES(),(),()