-- Active: 1726242650294@@127.0.0.1@3306@unisync
CREATE DATABASE IF NOT EXISTS unisync;
USE unisync;

CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  annex VARCHAR(50),
  type_id INT,
  FOREIGN KEY (type_id) REFERENCES room_types(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS room_amenities (
  room_id INT,
  amenity_id INT,
  PRIMARY KEY (room_id, amenity_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

ALTER TABLE bookings ADD COLUMN user_email VARCHAR(255);




CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE room_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255),
  room_id INT,
  selected_date DATE,
  start_time VARCHAR(10),
  end_time VARCHAR(10)
);


select * from room_request

SELECT rr.id, rr.user_email, rr.room_id, rr.selected_date, rr.start_time, rr.end_time, r.name AS room_name
FROM room_request rr
JOIN rooms r ON rr.room_id = r.id;



-- Insert a sample user
INSERT INTO users (email, password)
VALUES ("saiful@gmail.com", "1234");


SELECT * from users


-- Insert room types
INSERT INTO room_types (name) VALUES ('Classroom'), ('Seminar Hall'), ('Conference Room'), ('Lab Room');

-- Insert amenities
INSERT INTO amenities (name) VALUES ('Projector'), ('PC'), ('Whiteboard');

-- Insert rooms
INSERT INTO rooms (name, annex, type_id)
VALUES 
  ('E-101', 'Annex E', 1),
  ('E-102', 'Annex E', 1),
  ('G-101', 'Annex G', 4);

-- Link room amenities
INSERT INTO room_amenities (room_id, amenity_id)
VALUES 
  (1, 1), -- E-101 has Projector
  (1, 2), -- E-101 has PC
  (2, 3), -- E-102 has Whiteboard
  (3, 2), -- G-101 has PC
  (3, 1); -- G-101 has Projector

-- Bookings (already booked times)
INSERT INTO bookings (room_id, booking_date, start_time, end_time)
VALUES 
  (1, '2025-04-20', '10:00', '12:00'),
  (2, '2025-04-20', '09:00', '11:00'),
  (3, '2025-04-21', '13:00', '15:00');


SELECT * from bookings

drop table bookings