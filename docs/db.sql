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

INSERT INTO bike_stations(name, address, city, latitude, longitude,places_taken, places_all) VALUES
('Station A', '123 Main St', 'Cityville', 40.7128, -74.006, 10,	10),
('Station B', '456 Elm St', 'Townsville', 35.6895, 139.6917, 10, 10),
('Station C', '789 Oak St', 'Villageton', 51.5074, -0.1278,	10, 10);

INSERT INTO bike_categories(name) VALUES
('electric'),
('child'),
('mountain'),
('universal');

INSERT INTO parking_places(station_id,place_number,category_id) VALUES
(1, 1, 4),
(1, 2, 4),
(1, 3, 4),
(1, 4, 4),
(1, 5, 4),
(1, 6, 1),
(1, 7, 1),
(1, 8, 2),
(1, 9, 2),
(1, 10, 2),
(2, 1, 4),
(2, 2, 4),
(2, 3, 4),
(2, 4, 4),
(2, 5, 3),
(2, 6, 3),
(2, 7, 3),
(2, 8, 3),
(2, 9, 1),
(2, 10, 1),
(3, 1, 4),
(3, 2, 4),
(3, 3, 4),
(3, 4, 2),
(3, 5, 2),
(3, 6, 3),
(3, 7, 3),
(3, 8, 3),
(3, 9, 3),
(3, 10, 3);

INSERT INTO bike_models(category_id, name, description, wheel_size, manufacturer, brakes_type) VALUES
(1,	'Electric Model A',	'An electric bike with advanced features',	26,	'ElectroBike Co.',	'Disc'),
(1,	'Electric Model B',	'A sleek and powerful electric bike',	28,	'EcoRide',	'Hydraulic'),
(2,	'Kids Model X',	'A fun and colorful bike for children',	20,	'KidCycles',	'Caliper'),
(2,	'Kids Model Y',	'Durable and safe bike for young riders',	16,	'TinyBikes',	'Coaster'),
(3,	'Mountain Model 1',	'Designed for off-road adventures',	29,	'TrailBlazer',	'Disc'),
(3,	'Mountain Model 2',	'Agile and sturdy mountain bike',	28,	'SummitCycles',	'Hydraulic');

INSERT INTO bikes(model_id, unique_id, status) VALUES
(5,	'MON1',	'parked'),
(5,	'MON2',	'parked'),
(5,	'MON3',	'booked'),
(5,	'MON4',	'parked'),
(5,	'MON5',	'parked'),
(6,	'MON6',	'parked'),
(6,	'MON7',	'parked'),
(6,	'MON8',	'parked'),
(6,	'MON9',	'parked'),
(6,	'MON10', 'parked'),
(1,	'EL1',	'booked'),
(1,	'EL2',	'parked'),
(1,	'EL3',	'parked'),
(1,	'EL4',	'parked'),
(1,	'EL5',	'parked'),
(2,	'EL6',	'parked'),
(2,	'EL7',	'parked'),
(2,	'EL8',	'parked'),
(2,	'EL9',	'parked'),
(2,	'EL10',	'parked'),
(3,	'CH1',	'parked'),
(3,	'CH2',	'parked'),
(3,	'CH3',	'parked'),
(3,	'CH4',	'parked'),
(3,	'CH5',	'parked'),
(4,	'CH6',	'parked'),
(4,	'CH7',	'parked'),
(4,	'CH8',	'parked'),
(4,	'CH9',	'parked'),
(4,	'CH10',	'parked');

INSERT INTO parking_places_bikes(parking_place_id, bike_id) VALUES
(1, 1),
(2, 11),
(3, 12),
(4, 13),
(5, 14),
(6, 15),
(7, 16),
(8, 21),
(9, 22),
(10, 23),
(11, 17),
(12, 18),
(13, 24),
(14, 25),
(15, 2),
(16, 3),
(17, 4),
(18, 5),
(19, 19),
(20, 20),
(21, 26),
(22, 27),
(23, 28),
(24, 29),
(25, 30),
(26, 6),
(27, 7),
(28, 8),
(29, 9),
(30, 10);


INSERT INTO customers(email, password_hash, wallet_balance) VALUES
('user1@example.com', 'password_hash_1', 0.00),
('user2@example.com', 'password_hash_2', 0.00),
('user3@example.com', 'password_hash_3', 0.00);


INSERT INTO booked_tickets(customer_id, bike_id, start_time, end_time, ticket_price, station_id, status) VALUES
(1,	11,	'2024-02-29 08:00:00',	'2024-02-29 10:00:00',	20.00,	1,	'bought'),
(3,	3,	'2024-02-15 07:00:00',	'2024-02-15 09:00:00',	20.00,	2,	'bought');

INSERT INTO model_reviews(model_id, customer_id, rating, review_text) VALUES
(3,	1,	4,	'Lovely childs bike'),
(3,	3,	5,	'Very safe bike'),
(4,	2,	3,	'There is room for improvement..'),
(2,	1,	2,	'Ran out of power soon'),
(2,	3,	5,	'Is very comfortable'),
(5,	2,	1,	'It broke!!'),
(5,	3,	4,	'Very durable bike');


INSERT INTO station_reviews(station_id, customer_id, rating, review_text) VALUES
(1,	1,	5,	'Plenty of bikes available and easy to use'),
(1,	2,	4,	'Convenient location'),
(2,	3,	3,	'This station needs improvement'),
(3,	2,	4,	'Bikes were in good shape, and the process was quick'),
(3,	1,	3,	'Inefficient setup'),
(3,	3,	2,	'Not impressed with this station');