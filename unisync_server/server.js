// Express.js backend (app.js or routes/rooms.js)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'unisync',
};

// GET room types
app.get('/api/room-types', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM room_types');
  res.json(rows);
});

// GET amenities
app.get('/api/amenities', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM amenities');
  res.json(rows);
});

// POST to filter available rooms
app.post('/api/filterRooms', async (req, res) => {
  const { date, startTime, endTime, roomType, amenities } = req.body;

  const conn = await mysql.createConnection(dbConfig);

  // Get available rooms that are NOT booked for given time and date
  const [rooms] = await conn.execute(`
    SELECT r.id, r.name, r.annex, r.capacity
    FROM rooms r
    JOIN room_types rt ON rt.id = r.type_id
    WHERE rt.name = ? AND r.id NOT IN (
      SELECT room_id FROM bookings
      WHERE date = ? AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    )
  `, [roomType, date, endTime, endTime, startTime, startTime, startTime, endTime]);

  // Check if each room includes all selected amenities
  const filteredRooms = [];
  for (const room of rooms) {
    const [roomAmenities] = await conn.execute(
      'SELECT a.name FROM room_amenities ra JOIN amenities a ON ra.amenity_id = a.id WHERE ra.room_id = ?',
      [room.id]
    );
    const roomAmenityNames = roomAmenities.map(a => a.name);
    const allAmenitiesMatch = amenities.every(am => roomAmenityNames.includes(am));
    if (allAmenitiesMatch) filteredRooms.push(room);
  }

  res.json(filteredRooms);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
