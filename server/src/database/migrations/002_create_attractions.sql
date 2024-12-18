CREATE TABLE attractions (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  description TEXT,
  interests TEXT[],
  estimated_cost DECIMAL(10, 2),
  recommended_duration INTEGER
);