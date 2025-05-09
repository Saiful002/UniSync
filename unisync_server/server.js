// Express.js backend (app.js or routes/rooms.js)

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const router = express.Router();
const app = express();
const cookie = require("cookie");
const dotenv=require("dotenv")
const cookieParser=require("cookie-parser"); // if using ES modules
const { OpenAI } = require("openai");
require("dotenv").config();



app.use(cookieParser());
dotenv.config();
app.use(cors({
  origin: "http://localhost:3000", // or "*", if testing
  credentials: true,
}));
app.use(express.json());




//Database Configuration
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234", // your MySQL password
  database: "unisync",
});

//OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env
});



const SECRET_KEY = process.env.SECRET_KEY; // Keep it secure in production

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


// API to login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "2h",
    });

    // Set cookie with token
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60,
        path: "/",
      })
    );

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// API to get current logged-in user
app.get("/api/me", (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, SECRET_KEY); // same secret as in login route
    return res.json({ email: decoded.email, id: decoded.id });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});



app.post("/api/request-room", async (req, res) => {
  const token = req.cookies.token; // ✅ Get token from cookies

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;
    const { roomId, selectedDate, startTime, endingTime } = req.body;


    await db.query(
      `INSERT INTO room_request (user_email, room_id, selected_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [email, roomId, selectedDate, startTime, endingTime]
    );

    res.json({ message: "Room requested successfully" });
  } catch (error) {
    console.error("Room request error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
});



// Get all room requests (Admin only)
app.get("/api/room-requests", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const [requests] = await db.query(
      `SELECT rr.id, rr.room_id, rr.selected_date, rr.start_time, rr.end_time, rr.user_email, r.name AS room_name
       FROM room_request rr
       JOIN rooms r ON rr.room_id = r.id
       ORDER BY rr.selected_date DESC`
    );

    res.json(requests);
  } catch (error) {
    console.error("Error fetching room requests:", error);
    res.status(500).json({ message: "Failed to fetch room requests" });
  }
});



app.post("/api/room-requests/:id/:decision", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  const { id, decision } = req.params;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userEmail = decoded.email;

    if (decision === "accept") {
      // Fetch the room request first
      const [requestRows] = await db.query(
        `SELECT * FROM room_request WHERE id = ?`,
        [id]
      );

      if (requestRows.length === 0) {
        return res.status(404).json({ message: "Request not found" });
      }

      const request = requestRows[0];

      // Insert into bookings with user email
      await db.query(
        `INSERT INTO bookings (room_id, booking_date, start_time, end_time, user_email)
         VALUES (?, ?, ?, ?, ?)`,
        [request.room_id, request.selected_date, request.start_time, request.end_time, request.user_email]
      );

      // Delete the request after approving
      await db.query(`DELETE FROM room_request WHERE id = ?`, [id]);

      return res.json({ message: "Request accepted and room booked" });
    } else if (decision === "reject") {
      // Just delete the request
      await db.query(`DELETE FROM room_request WHERE id = ?`, [id]);
      return res.json({ message: "Request rejected" });
    } else {
      return res.status(400).json({ message: "Invalid decision" });
    }
  } catch (error) {
    console.error("Decision error:", error);
    return res.status(500).json({ message: "Failed to process request" });
  }
});




// GET /api/my-bookings
app.get("/api/my-bookings", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    // 1. Fetch all room requests by user
    const [roomRequests] = await db.query(
      `SELECT rr.id, rr.room_id, r.name AS room, rr.selected_date AS date, rr.start_time, rr.end_time
       FROM room_request rr
       JOIN rooms r ON rr.room_id = r.id
       WHERE rr.user_email = ?`,
      [email]
    );

    // 2. Fetch all bookings by user
    const [bookings] = await db.query(
      `SELECT b.room_id, r.name AS room, b.booking_date AS date, b.start_time, b.end_time
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_email = ?`,
      [email]
    );

    // 3. Format Approved bookings
    const approved = bookings.map((b, i) => ({
      id: `booking-${i}`,
      room: b.room,
      date: b.date,
      time: `${b.start_time} - ${b.end_time}`,
      status: "Approved",
    }));

    // 4. Filter room requests that aren't approved → Pending
    const pending = roomRequests
      .filter((req) => {
        return !bookings.some(
          (b) =>
            b.room_id === req.room_id &&
            b.date.toISOString().slice(0, 10) === req.date.toISOString().slice(0, 10) &&
            b.start_time === req.start_time &&
            b.end_time === req.end_time
        );
      })
      .map((req) => ({
        id: req.id,
        room: req.room,
        date: req.date,
        time: `${req.start_time} - ${req.end_time}`,
        status: "Pending",
      }));

    // 5. Combine and send response
    const result = [...approved, ...pending];
    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Cancel Request Functionality
app.delete("/api/room-requests/:id", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized - No token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Optional: check if the request belongs to the user (security)
    const [rows] = await db.query(`SELECT * FROM room_request WHERE id = ?`, [req.params.id]);
    const request = rows[0];

    if (!request) return res.status(404).json({ message: "Request not found" });

    // Optional ownership check (if table has user_email or user_id)
    // if (request.user_email !== decoded.email) return res.status(403).json({ message: "Forbidden" });

    await db.query(`DELETE FROM room_request WHERE id = ?`, [req.params.id]);

    return res.json({ message: "Room request cancelled" });
  } catch (error) {
    console.error("Cancel error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// GET all rooms
app.get("/api/rooms", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM rooms");
  res.json(rows);
});

// CREATE a room
app.post("/api/rooms", async (req, res) => {
  const { name, annex, type_id } = req.body;
  await db.query("INSERT INTO rooms (name, annex, type_id) VALUES (?, ?, ?)", [name, annex, type_id || null]);
  res.json({ message: "Room created" });
});

// UPDATE a room
app.put("/api/rooms/:id", async (req, res) => {
  const { name, annex, type_id } = req.body;
  await db.query("UPDATE rooms SET name = ?, annex = ?, type_id = ? WHERE id = ?", [name, annex, type_id || null, req.params.id]);
  res.json({ message: "Room updated" });
});

// DELETE a room
app.delete("/api/rooms/:id", async (req, res) => {
  await db.query("DELETE FROM rooms WHERE id = ?", [req.params.id]);
  res.json({ message: "Room deleted" });
});





app.post("/api/users", async (req, res) => {
  const { email, password } = req.body;

  try {
    await db.query(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, password]
    );
    res.json({ message: "User added successfully" });
  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({ message: "Failed to add user" });
  }
});




app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, email FROM users`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});



// Helper: Extract intent
const extractIntent = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes("availability") || lower.includes("available")) return "check_availability";
  if (lower.includes("book") || lower.includes("reserve")) return "book_room";
  return "unknown";
};

// POST /api/chat route
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
console.log(req.body)
  // Get token from cookie and verify
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized: No token found" });

  let user_email;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    user_email = decoded.email;
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }

  if (!message) return res.status(400).json({ error: "Message is required." });

  const intent = extractIntent(message);

  try {
    if (intent === "check_availability" || intent === "book_room") {
      const regex = /room (\d+) on (\d{4}-\d{2}-\d{2}) from (\d{2}:\d{2}) to (\d{2}:\d{2})/i;
      const match = message.match(regex);

      if (!match) {
        return res.json({ reply: "Please specify the room ID, date, and time range properly." });
      }

      const [, room_id, selected_date, start_time, end_time] = match;

      const [conflict] = await db.query(
        `SELECT * FROM room_request WHERE room_id = ? AND selected_date = ? 
         AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`,
        [room_id, selected_date, end_time, end_time, start_time, start_time]
      );

      if (intent === "check_availability") {
        if (conflict.length > 0) {
          return res.json({ reply: `Room ${room_id} is NOT available on ${selected_date} from ${start_time} to ${end_time}.` });
        } else {
          return res.json({ reply: `Room ${room_id} IS available on ${selected_date} from ${start_time} to ${end_time}.` });
        }
      }

      if (intent === "book_room") {
        if (conflict.length > 0) {
          return res.json({ reply: `Sorry, Room ${room_id} is already booked on ${selected_date} during that time.` });
        }

        await db.query(
          `INSERT INTO room_request (user_email, room_id, selected_date, start_time, end_time)
           VALUES (?, ?, ?, ?, ?)`,
          [user_email, room_id, selected_date, start_time, end_time]
        );

        return res.json({ reply: `✅ Booking request for Room ${room_id} on ${selected_date} from ${start_time} to ${end_time} has been submitted.` });
      }
    } else {
      // Fallback to GPT
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });

      const aiResponse = completion.choices[0].message.content;
      return res.json({ reply: aiResponse });
    }
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});




app.listen(5000, () => console.log("Server running on http://localhost:5000"));