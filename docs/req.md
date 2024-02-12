### Project Description Web-Technologies WS 23

#### Overview
- [ ] Implement an online system for local bike rental.
- [ ] Customers can buy tickets remotely or locally via special terminals.
- [ ] Same web service interface for both remote and local ticket purchases.

#### Customer Interface
- [ ] Browse a list of rental stations and available bikes.
- [ ] View details of available bikes including category, model, and attributes.
- [ ] Book tickets for renting bikes immediately or in the future.
- [ ] Specify ticket details such as bike category, model, size, and rental duration.
- [ ] Make a user account to maintain wallet, view booked tickets, request QR codes, and write reviews.
- [ ] Receive a QR code upon booking a ticket to unlock bike from parking place and start riding, with full price charged.
- [ ] Return bike to any rental station with free parking place for that type of bike.

#### Management View
1. **Bike Rental Management**
   - [ ] Create, update, and delete bike stations.
      - [ ] Define station name, address, and coordinates.
      - [ ] Manage bike parking places including unique number and capacity.
   - [ ] Create, update, and delete bike categories and models.
      - [ ] Define bike categories and associated models with attributes.
      - [ ] Manage bike models including name, description, wheel size, and extra features.
   - [ ] Create, update, and delete individual bikes.
      - [ ] Assign unique ID to each bike.
      - [ ] Correspond bikes to specific models.
   - [ ] Assign or reassign individual bikes to stations and parking places.
      - [ ] Ensure bikes are assigned to only one place within one station at a time.
      - [ ] Consider bike category and station capacity during assignment.

2. **Booking Tickets**
   - [ ] Provide booking tickets for bikes of specific model, category, or attributes.
      - [ ] Define ticket price based on factors such as time, date, duration, bike model, and station proximity to city center.
      - [ ] Offer tickets for immediate or future renting.
      - [ ] Ensure availability of bikes at specified station for immediate rentals.
      - [ ] Consider proximity of alternative stations for immediate rentals.
      - [ ] Implement ticket bundling for children bikes with adult tickets.
      - [ ] Handle ticket cancellation and refunds for future rentals.

#### Customer View
1. **User Actions**
   - [ ] Register in the system.
   - [ ] Maintain user account, check wallet status, and add money.
   - [ ] Browse bike types, stations, and check reviews and ratings.
   - [ ] View available bikes at specific stations.
   - [ ] Book tickets for bikes of specific category, model, or attributes.
   - [ ] Manage booked tickets, including returning and viewing rental history.
   - [ ] Write reviews and give ratings.

2. **Simulation**
   - [ ] Simulate renting and returning bikes.
   - [ ] Handle overdue rentals with appropriate penalties.

#### Backend Requirements
- [ ] Store data in a database (PostgreSQL recommended).
- [ ] Implement backend in Node.js, expose functionality via REST API.
- [ ] Support user authentication.
- [ ] Allow users to see only their own data.
- [ ] Ensure application is not easily hackable.

#### Additional Notes
- [ ] Make the application responsive and have a coherent UI.
- [ ] Consider security measures such as prepared statements and input filtering.
- [ ] Intuitively usable on mobile phones.
