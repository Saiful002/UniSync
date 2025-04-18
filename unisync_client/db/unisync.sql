-- Active: 1726242650294@@127.0.0.1@3306@unisync
CREATE DATABASE IF NOT EXISTS unisync;
USE unisync;

-- Room types
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  annex VARCHAR(50),
  name VARCHAR(100),
  type_id INT,
  capacity INT,
  FOREIGN KEY (type_id) REFERENCES room_types(id) ON DELETE SET NULL
);

-- Room Amenities (Many-to-Many)
CREATE TABLE IF NOT EXISTS room_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  amenity_id INT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  user_id INT,
  date DATE,
  start_time TIME,
  end_time TIME,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);


-- Insert Room Types
INSERT INTO room_types (name) VALUES
  ('Classroom'),
  ('Seminar Hall'),
  ('Conference Room');

-- Insert Amenities
INSERT INTO amenities (name) VALUES
  ('Projector'),
  ('AC'),
  ('Whiteboard');


-- Insert Rooms
INSERT INTO rooms (annex, name, type_id, capacity) VALUES
  ('Annex E', 'E-101', 1, 30),
  ('Annex E', 'E-102', 1, 35),
  ('Annex E', 'E-103', 2, 60),
  ('Annex G', 'G-101', 1, 25),
  ('Annex G', 'G-102', 3, 20),
  ('Annex H', 'H-104', 2, 50),
  ('Annex J', 'J-108', 1, 40),
  ('Annex K', 'K-105', 3, 100),
  ('Annex L', 'L-109', 1, 30),
  ('Annex M', 'Green Cafeteria', 2, 80);

-- Map Rooms to Amenities (room_amenities)
INSERT INTO room_amenities (room_id, amenity_id) VALUES
  (1, 1), (1, 2),
  (2, 2), (2, 3),
  (3, 1), (3, 3),
  (4, 2), (4, 3);

-- Insert Bookings (simulate conflicts)
-- Example: E-101 is booked on 2025-04-20 from 10:00 to 12:00
-- G-101 is booked on 2025-04-21 from 09:00 to 11:00
INSERT INTO bookings (room_id, start_time, end_time) VALUES
  (1, '2025-04-20 10:00:00', '2025-04-20 12:00:00'),
  (2, '2025-04-20 14:00:00', '2025-04-20 16:00:00'),
  (3, '2025-04-21 09:00:00', '2025-04-21 11:00:00');
