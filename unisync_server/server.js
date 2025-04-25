// Express.js backend (app.js or routes/rooms.js)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234", // your MySQL password
  database: "unisync",
});

// GET room types
app.post("/api/available-rooms", async (req, res) => {
  const { type, amenities, date, time } = req.body;

  // console.log("Incoming request body:", req.body); // Debug

  if (!type || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [rooms] = await db.query(
      `SELECT r.id, r.name, r.annex
       FROM rooms r
       JOIN room_types rt ON r.type_id = rt.id
       WHERE rt.name = ?
       AND NOT EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.room_id = r.id
         AND b.booking_date = ?
         AND (? < b.end_time AND ? > b.start_time)
       )`,
      [type, date, time, time]
    );

    const roomIds = rooms.map((room) => room.id);
    let filteredRooms = rooms;

    if (amenities.length > 0) {
      const placeholders = amenities.map(() => "?").join(",");
      const [results] = await db.query(
        `SELECT ra.room_id
         FROM room_amenities ra
         JOIN amenities a ON ra.amenity_id = a.id
         WHERE a.name IN (${placeholders})
         GROUP BY ra.room_id
         HAVING COUNT(DISTINCT a.name) = ?`,
        [...amenities, amenities.length]
      );

      const matchedRoomIds = results.map((r) => r.room_id);
      filteredRooms = rooms.filter((room) => matchedRoomIds.includes(room.id));
    }

    res.json(filteredRooms);
  } catch (err) {
    console.error("Query Error:", err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Express.js
app.get("/api/RoomDetails/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid room ID" });
  }

  try {
    const [rows] = await db.query(
      `SELECT r.id, r.name, r.annex, rt.name as type
       FROM rooms r
       JOIN room_types rt ON r.type_id = rt.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("DB Error:", err); // helpful for debugging
    res.status(500).json({ message: "Error fetching room details" });
  }
});




app.listen(5000, () => console.log("Server running on http://localhost:5000"));