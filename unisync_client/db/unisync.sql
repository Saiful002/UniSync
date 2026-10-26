-- Active: 1789798676715@@localhost@3306@unisync
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
    FOREIGN KEY (type_id) REFERENCES room_types (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS room_amenities (
    room_id INT,
    amenity_id INT,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_email VARCHAR(255),
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS room_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    room_id INT,
    selected_date DATE,
    start_time VARCHAR(10),
    end_time VARCHAR(10)
);

select * from room_request;

SELECT rr.id, rr.user_email, rr.room_id, rr.selected_date, rr.start_time, rr.end_time, r.name AS room_name
FROM room_request rr
    JOIN rooms r ON rr.room_id = r.id;

-- Ensure role column exists in users table for existing databases
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Insert static Admin and User entries
INSERT INTO
    users (email, password, role)
VALUES (
        'admin@unisync.com',
        'admin123',
        'admin'
    ),
    (
        'saiful@gmail.com',
        '1234',
        'user'
    )
ON DUPLICATE KEY UPDATE
    role = VALUES(role);

SELECT * from users;

-- Insert room types
INSERT INTO
    room_types (name)
VALUES ('Classroom'),
    ('Seminar Hall'),
    ('Conference Room'),
    ('Lab Room');

-- Insert amenities
INSERT INTO
    amenities (name)
VALUES ('Projector'),
    ('PC'),
    ('Whiteboard');

-- Insert rooms
INSERT INTO
    rooms (name, annex, type_id)
VALUES ('E-101', 'Annex E', 1),
    ('E-102', 'Annex E', 1),
    ('G-101', 'Annex G', 4);

-- Link room amenities
INSERT INTO
    room_amenities (room_id, amenity_id)
VALUES (1, 1), -- E-101 has Projector
    (1, 2), -- E-101 has PC
    (2, 3), -- E-102 has Whiteboard
    (3, 2), -- G-101 has PC
    (3, 1);
-- G-101 has Projector

-- Bookings (already booked times)
INSERT INTO
    bookings (
        room_id,
        booking_date,
        start_time,
        end_time
    )
VALUES (
        1,
        '2025-04-20',
        '10:00',
        '12:00'
    ),
    (
        2,
        '2025-04-20',
        '09:00',
        '11:00'
    ),
    (
        3,
        '2025-04-21',
        '13:00',
        '15:00'
    );

SELECT * from bookings;

SELECT * from users;

-- Notifications Table for User-Specific Realtime Alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Notifications
INSERT INTO notifications (user_email, title, message, type, is_read)
VALUES 
    ('saifulkabirchowdhury@gmail.com', 'Booking Confirmed', 'Your reservation for E-101 on 2026-10-27 (11:03:00 - 00:03:00) is approved and active.', 'success', false),
    ('saifulkabirchowdhury@gmail.com', 'Pending Approval', 'Your booking request for G-101 on 2026-10-29 (11:15 - 15:17) has been received and is waiting for administrator approval.', 'warning', false)
-- User Roles Queries and Verification
-- Ensure users table has role column with default 'user'
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

SELECT id, email, role FROM users;

-- Example: Updating user role directly if needed
-- UPDATE users SET role = 'admin' WHERE email = 'admin@unisync.com';
-- UPDATE users SET role = 'user' WHERE email = 'saiful@gmail.com';

SELECT * FROM notifications;