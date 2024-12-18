CREATE TABLE itineraries (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id),
  traveler_type VARCHAR(100),
  budget VARCHAR(50),
  season VARCHAR(50),
  start_date DATE,
  end_date DATE,
  total_cost DECIMAL(10, 2)
);

CREATE TABLE itinerary_days (
  id SERIAL PRIMARY KEY,
  itinerary_id INTEGER REFERENCES itineraries(id),
  day_number INTEGER,
  date DATE,
  notes TEXT
);

CREATE TABLE itinerary_activities (
  id SERIAL PRIMARY KEY,
  itinerary_day_id INTEGER REFERENCES itinerary_days(id),
  attraction_id INTEGER REFERENCES attractions(id),
  start_time TIME,
  end_time TIME,
  estimated_cost DECIMAL(10, 2)
);