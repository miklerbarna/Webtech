# REST API for Webtech Project

## Management view

### a) Create, update, and delete bike stations:
* Create: POST request, in body the necessary JSON formatted object for a bike station is present
* Update: PUT request, request body contains the list of updateable attributes with the new value
* Delete: DELETE request, with the specific *station_id* inside. The database deletes the station and every place in the *bike_station* and every bikes from *bikes* placed in those places will be changed to **wild**.
### b) Create, update and delete bike categories and bike models
1) Categories => Create: POST request, body has the category name
Update: PUT request, body has the old (for identification) and new name
Delete: DELETE request, *category_id* in body for identification. All models under this category should also be removed, and all bikes from that model too.
2) Models => Create: POST request, in body the necessary JSON formatted object for a bike model is present. Category must exist already
Update: PUT request with the list of properties to be updated, with the new values.
Delete: DELETE request, with the *model_id* in the body. All bikes with this model, all model revies and all parking places should also be deleted

### c) Create, update and delete individual bikes
Create: POST request, create a bike, its model is in the body of the request, and by default its *status* is **wild**
Update: PUT request, with the list of properties to be updated, with the new values.
DELETE: DELETE request, bike's id is in the request body can only be done if the bike's status is **wild** or **parked**

### d) Assign or reassign individual bikes to stations and parking places
PUT request, in request body we assign the bike to the parking space, and as a result the station od the parking space will also get updated

### e) Booking tickets for bikes of the specific model, category or for the specific value of the model attribute for a given time
The booking is done through creating a POST request and updating the *booked_tickets* table. The specifics of choosing a model/category/value are done through UI, here we only need the bike's id, the interval for the time and other attributes of a ticket for the table update, these will be in the request's body