const bufferModule = require('buffer');
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const cookie = require('cookie');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cookieParser());
dotenv.config();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'unisync',
});

const SECRET_KEY = process.env.SECRET_KEY || 'unisync_secret_key_2026';

// Auto Database Schema Migration for Role Column
async function initDb() {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (columns.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
      console.log("Successfully added 'role' column to users table.");
    }
    // Seed static Admin user if not present
    const [adminUser] = await db.query("SELECT * FROM users WHERE email = 'admin@unisync.com'");
    if (adminUser.length === 0) {
      await db.query("INSERT INTO users (email, password, role) VALUES ('admin@unisync.com', 'admin123', 'admin')");
      console.log("Static Admin user seeded: admin@unisync.com");
    } else {
      await db.query("UPDATE users SET role = 'admin' WHERE email = 'admin@unisync.com'");
    }
  } catch (err) {
    console.error("Database initialization notice:", err.message);
  }
}
initDb();

app.post('/api/available-rooms', async (req, res) => {
  const { type, amenities, date, time } = req.body;

  if (!type || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [rooms] = await db.query(
      'SELECT r.id, r.name, r.annex FROM rooms r JOIN room_types rt ON r.type_id = rt.id WHERE rt.name = ? AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_id = r.id AND b.booking_date = ? AND (? < b.end_time AND ? > b.start_time))',
      [type, date, time, time]
    );

    let filteredRooms = rooms;

    if (amenities && amenities.length > 0) {
      const placeholders = amenities.map(() => '?').join(',');
      const [results] = await db.query(
        'SELECT ra.room_id FROM room_amenities ra JOIN amenities a ON ra.amenity_id = a.id WHERE a.name IN (' + placeholders + ') GROUP BY ra.room_id HAVING COUNT(DISTINCT a.name) = ?',
        [...amenities, amenities.length]
      );

      const matchedRoomIds = results.map((r) => r.room_id);
      filteredRooms = rooms.filter((room) => matchedRoomIds.includes(room.id));
    }

    res.json(filteredRooms);
  } catch (err) {
    console.error('Query Error:', err);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

app.get('/api/RoomDetails/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid room ID' });
  }

  try {
    const [rows] = await db.query(
      'SELECT r.id, r.name, r.annex, rt.name as type FROM rooms r JOIN room_types rt ON r.type_id = rt.id WHERE r.id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ message: 'Error fetching room details' });
  }
});

// STRICT 1-TO-1 PORTAL ROLE ENFORCEMENT LOGIN API
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and portal role selection are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const dbRole = (user.role ? user.role : (user.email.includes('admin') ? 'admin' : 'user')).toLowerCase();
    const requestedRole = role.toLowerCase();

    // STRICT CHECK 1: Admin account attempting to log in via User Portal
    if (requestedRole === 'user' && dbRole === 'admin') {
      return res.status(403).json({ 
        message: 'This is an Administrator account. Please select the "Admin Portal" tab to log in.' 
      });
    }

    // STRICT CHECK 2: Regular user attempting to log in via Admin Portal
    if (requestedRole === 'admin' && dbRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Access Denied: Only Administrator accounts can log in via the Admin Portal.' 
      });
    }

    // STRICT ROLE MATCH
    if (dbRole !== requestedRole) {
      return res.status(403).json({ 
        message: `Role mismatch. Your account is registered as ${dbRole.toUpperCase()}, but you selected ${requestedRole.toUpperCase()} PORTAL.` 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: dbRole },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60,
        path: '/',
      })
    );

    res.json({ message: 'Login successful', role: dbRole });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/me', (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token found' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    return res.json({ email: decoded.email, id: decoded.id, role: decoded.role || 'user' });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.post('/api/admin/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No account registered with this email in database' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({
      message: 'Reset code generated successfully',
      resetCode: resetCode,
      email: email,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error handling password reset' });
  }
});

app.post('/api/admin/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password required' });
  }

  try {
    await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
    res.json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

app.post('/api/user/change-password', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, decoded.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Error changing password' });
  }
});

app.post('/api/request-room', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { roomId, selectedDate, startTime, endingTime } = req.body;

    await db.query(
      'INSERT INTO room_request (user_email, room_id, selected_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [decoded.email, roomId, selectedDate, startTime, endingTime]
    );

    res.json({ message: 'Room requested successfully' });
  } catch (err) {
    console.error('Room request error:', err);
    res.status(500).json({ message: 'Failed to request room' });
  }
});

app.get('/api/room-requests', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM room_request');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

app.post('/api/room-requests/:id/accept', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM room_request WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const request = rows[0];
    await db.query(
      'INSERT INTO bookings (room_id, booking_date, start_time, end_time, user_email) VALUES (?, ?, ?, ?, ?)',
      [request.room_id, request.selected_date, request.start_time, request.end_time, request.user_email]
    );

    await db.query('DELETE FROM room_request WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room request accepted and booked' });
  } catch (err) {
    console.error('Accept error:', err);
    res.status(500).json({ message: 'Error accepting request' });
  }
});

app.post('/api/room-requests/:id/reject', async (req, res) => {
  try {
    await db.query('DELETE FROM room_request WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting request' });
  }
});

app.get('/api/my-bookings', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_email = decoded.email;

    const [approvedRows] = await db.query(
      "SELECT b.id, r.name AS room, DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS date, b.start_time, b.end_time FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.user_email = ?",
      [user_email]
    );

    const approved = approvedRows.map((b) => ({
      id: b.id,
      room: b.room,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      status: 'Approved',
    }));

    const [pendingRows] = await db.query(
      "SELECT rr.id, r.name AS room, DATE_FORMAT(rr.selected_date, '%Y-%m-%d') AS date, rr.start_time, rr.end_time FROM room_request rr JOIN rooms r ON rr.room_id = r.id WHERE rr.user_email = ?",
      [user_email]
    );

    const pending = pendingRows.map((req) => ({
      id: req.id,
      room: req.room,
      date: req.date,
      start_time: req.start_time,
      end_time: req.end_time,
      status: 'Pending',
    }));

    res.json([...approved, ...pending]);
  } catch (err) {
    console.error('Error fetching my-bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/room-requests/:id', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await db.query('DELETE FROM room_request WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/rooms', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM rooms');
  res.json(rows);
});

app.post('/api/rooms', async (req, res) => {
  const { name, annex, type_id } = req.body;
  await db.query('INSERT INTO rooms (name, annex, type_id) VALUES (?, ?, ?)', [name, annex, type_id || null]);
  res.json({ message: 'Room created' });
});

app.put('/api/rooms/:id', async (req, res) => {
  const { name, annex, type_id } = req.body;
  await db.query('UPDATE rooms SET name = ?, annex = ?, type_id = ? WHERE id = ?', [name, annex, type_id || null, req.params.id]);
  res.json({ message: 'Room updated' });
});

app.delete('/api/rooms/:id', async (req, res) => {
  await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
  res.json({ message: 'Room deleted' });
});

app.post('/api/users', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin' && !decoded.email.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Only administrators can create new users' });
    }

    const { email, password, role } = req.body;
    await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, role || 'user']
    );
    res.json({ message: 'User created successfully by Administrator' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, role FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.get('/room-stats', async (req, res) => {
  try {
    const [[{ totalRooms }]] = await db.query('SELECT COUNT(*) AS totalRooms FROM rooms');
    const [[{ bookedRooms }]] = await db.query(
      'SELECT COUNT(DISTINCT room_id) AS bookedRooms FROM bookings'
    );

    const availableRooms = totalRooms - bookedRooms;
    res.json({ totalRooms, availableRooms });
  } catch (err) {
    console.error('Error fetching room stats:', err);
    res.status(500).json({ error: 'Failed to fetch room statistics' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
