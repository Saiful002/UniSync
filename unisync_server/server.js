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
const allowedOrigins = [
  'http://localhost:3000',
  'https://uni-sync-client-seven.vercel.app',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Explicit fallback for preflight OPTIONS requests across all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});






app.use(express.json());

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.cookie) {
    try {
      const parsed = cookie.parse(req.headers.cookie);
      if (parsed.token) return parsed.token;
    } catch (e) {}
  }
  return null;
};

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

// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '1234',
//   database: 'unisync',
// });




const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});




async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection();
    console.log('TiDB connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testDatabaseConnection();






const SECRET_KEY = process.env.SECRET_KEY || 'unisync_secret_key_2026';

// Auto Database Schema Migration for Role Column & Notifications Table
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

    // Auto-create notifications table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // If notifications table is empty, seed from current bookings and requests
    const [[{ noteCount }]] = await db.query('SELECT COUNT(*) AS noteCount FROM notifications');
    if (noteCount === 0) {
      const [allBookings] = await db.query(`
        SELECT b.user_email, r.name AS room_name, DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS date, b.start_time, b.end_time 
        FROM bookings b 
        LEFT JOIN rooms r ON b.room_id = r.id
      `);
      for (const b of allBookings) {
        if (b.user_email) {
          await db.query(
            'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
            [
              b.user_email,
              'Booking Confirmed',
              `Your reservation for ${b.room_name || 'Room'} on ${b.date} (${b.start_time} - ${b.end_time}) is approved and active.`,
              'success',
              false,
            ]
          );
        }
      }

      const [allRequests] = await db.query(`
        SELECT rr.user_email, r.name AS room_name, DATE_FORMAT(rr.selected_date, '%Y-%m-%d') AS date, rr.start_time, rr.end_time 
        FROM room_request rr 
        LEFT JOIN rooms r ON rr.room_id = r.id
      `);
      for (const req of allRequests) {
        if (req.user_email) {
          await db.query(
            'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
            [
              req.user_email,
              'Pending Approval',
              `Your booking request for ${req.room_name || 'Room ' + req.room_id} on ${req.date} (${req.start_time} - ${req.end_time}) has been received and is waiting for administrator approval.`,
              'warning',
              false,
            ]
          );
        }
      }
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

    // res.setHeader(
    //   'Set-Cookie',
    //   cookie.serialize('token', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'lax',
    //     maxAge: 2 * 60 * 60,
    //     path: '/',
    //   })
    // );



    const isProd = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https' || req.secure;

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 2 * 60 * 60,
        path: '/',
      })
    );

    res.json({ message: 'Login successful', role: dbRole, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/me', (req, res) => {
  try {
    const token = getToken(req);

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
  const token = getToken(req);
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
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { roomId, selectedDate, startTime, endingTime } = req.body;

    const [roomRows] = await db.query('SELECT name FROM rooms WHERE id = ?', [roomId]);
    const roomName = roomRows.length > 0 ? roomRows[0].name : `Room ${roomId}`;

    await db.query(
      'INSERT INTO room_request (user_email, room_id, selected_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [decoded.email, roomId, selectedDate, startTime, endingTime]
    );

    // Notify user of submitted request
    await db.query(
      'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
      [
        decoded.email,
        'Pending Approval',
        `Your reservation request for ${roomName} on ${selectedDate} (${startTime} - ${endingTime}) has been submitted and is pending administrator approval.`,
        'warning',
        false,
      ]
    );

    res.json({ message: 'Room requested successfully' });
  } catch (err) {
    console.error('Room request error:', err);
    res.status(500).json({ message: 'Failed to request room' });
  }
});

app.get('/api/room-requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        rr.id,
        rr.user_email,
        rr.room_id,
        DATE_FORMAT(rr.selected_date, '%Y-%m-%d') AS selected_date,
        rr.start_time,
        rr.end_time,
        COALESCE(r.name, CONCAT('Room ', rr.room_id)) AS room_name,
        r.annex
      FROM room_request rr
      LEFT JOIN rooms r ON rr.room_id = r.id
      ORDER BY rr.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

app.post('/api/room-requests/:id/accept', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rr.*, r.name AS room_name, DATE_FORMAT(rr.selected_date, '%Y-%m-%d') AS formatted_date 
      FROM room_request rr 
      LEFT JOIN rooms r ON rr.room_id = r.id 
      WHERE rr.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const request = rows[0];
    await db.query(
      'INSERT INTO bookings (room_id, booking_date, start_time, end_time, user_email) VALUES (?, ?, ?, ?, ?)',
      [request.room_id, request.selected_date, request.start_time, request.end_time, request.user_email]
    );

    // Create confirmation notification for user
    await db.query(
      'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
      [
        request.user_email,
        'Booking Confirmed',
        `Great news! Your booking request for ${request.room_name || 'Room ' + request.room_id} on ${request.formatted_date} (${request.start_time} - ${request.end_time}) has been APPROVED by the administrator.`,
        'success',
        false,
      ]
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
    const [rows] = await db.query(`
      SELECT rr.*, r.name AS room_name, DATE_FORMAT(rr.selected_date, '%Y-%m-%d') AS formatted_date 
      FROM room_request rr 
      LEFT JOIN rooms r ON rr.room_id = r.id 
      WHERE rr.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const request = rows[0];

    // Create rejection notification for user
    await db.query(
      'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
      [
        request.user_email,
        'Booking Rejected',
        `Your reservation request for ${request.room_name || 'Room ' + request.room_id} on ${request.formatted_date} (${request.start_time} - ${request.end_time}) was declined by administration.`,
        'error',
        false,
      ]
    );

    await db.query('DELETE FROM room_request WHERE id = ?', [req.params.id]);
    res.json({ message: 'Room request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting request' });
  }
});

app.get('/api/my-bookings', async (req, res) => {
  let user_email = null;
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      user_email = decoded.email;
    } catch (e) {}
  }
  if (!user_email && req.query.email) {
    user_email = req.query.email;
  }

  if (!user_email) return res.status(401).json({ message: 'Unauthorized' });

  try {
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
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const [rows] = await db.query(`
      SELECT rr.*, r.name AS room_name 
      FROM room_request rr 
      LEFT JOIN rooms r ON rr.room_id = r.id 
      WHERE rr.id = ?
    `, [req.params.id]);

    if (rows.length > 0) {
      const request = rows[0];
      await db.query(
        'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [
          request.user_email,
          'Booking Cancelled',
          `You have cancelled your pending request for ${request.room_name || 'Room ' + request.room_id}.`,
          'info',
          false,
        ]
      );
    }

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
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin' && !decoded.email.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Only administrators can create new users' });
    }

    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const assignedRole = (role && role.toLowerCase() === 'admin') ? 'admin' : 'user';

    await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, assignedRole]
    );

    res.json({ 
      message: `User created successfully as ${assignedRole === 'admin' ? 'Administrator' : 'Regular User'}`,
      role: assignedRole,
      email 
    });
  } catch (error) {
    console.error('Add user error:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({ message: 'A user with this email address already exists.' });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.put('/api/users/:id/role', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin' && !decoded.email.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Only administrators can update user roles' });
    }

    const { role } = req.body;
    const targetRole = (role && role.toLowerCase() === 'admin') ? 'admin' : 'user';

    await db.query('UPDATE users SET role = ? WHERE id = ?', [targetRole, req.params.id]);

    res.json({ 
      message: `User role updated to ${targetRole === 'admin' ? 'Administrator' : 'Regular User'} successfully`,
      role: targetRole 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, role FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.get('/api/me', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const [rows] = await db.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    const role = (user.role || (user.email.includes('admin') ? 'admin' : 'user')).toLowerCase();
    res.json({ id: user.id, email: user.email, role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin' && !decoded.email.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Only administrators can delete users' });
    }

    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// User Specific Realtime Notifications APIs
app.get('/api/notifications', async (req, res) => {
  let userEmail = null;
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userEmail = decoded.email;
    } catch (e) {}
  }
  if (!userEmail && req.query.email) {
    userEmail = req.query.email;
  }

  if (!userEmail) {
    return res.json([]);
  }

  try {
    const [rows] = await db.query(
      "SELECT id, user_email, title, message, type, is_read, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS time FROM notifications WHERE user_email = ? ORDER BY id DESC LIMIT 50",
      [userEmail]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.json([]);
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  let userEmail = null;
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userEmail = decoded.email;
    } catch (e) {}
  }
  if (!userEmail && req.query.email) userEmail = req.query.email;
  if (!userEmail && req.body && req.body.email) userEmail = req.body.email;

  try {
    if (userEmail) {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE user_email = ?', [userEmail]);
    } else {
      await db.query('UPDATE notifications SET is_read = TRUE');
    }
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications read' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Admin Bookings & Reservations Management APIs (Date-wise with Cancel Option)
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { date } = req.query;

    let query = `
      SELECT 
        b.id,
        b.room_id,
        b.user_email,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        b.start_time,
        b.end_time,
        COALESCE(r.name, CONCAT('Room ', b.room_id)) AS room_name,
        r.annex,
        CASE 
          WHEN b.booking_date = CURDATE() THEN 'Booked Today'
          WHEN b.booking_date > CURDATE() THEN 'Upcoming'
          ELSE 'Completed'
        END AS live_status
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (date && date.trim() !== '') {
      query += ' AND b.booking_date = ?';
      params.push(date.trim());
    }

    query += ' ORDER BY b.booking_date DESC, b.start_time ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admin bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
  try {
    const [bookingRows] = await db.query(
      'SELECT b.*, r.name AS room_name, DATE_FORMAT(b.booking_date, "%Y-%m-%d") AS formatted_date FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id WHERE b.id = ?',
      [req.params.id]
    );

    if (bookingRows.length > 0) {
      const booking = bookingRows[0];
      await db.query(
        'INSERT INTO notifications (user_email, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [
          booking.user_email,
          'Reservation Cancelled',
          `Your reservation for ${booking.room_name || 'Room ' + booking.room_id} on ${booking.formatted_date} (${booking.start_time} - ${booking.end_time}) was cancelled by administration.`,
          'error',
          false,
        ]
      );
    }

    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reservation cancelled successfully from database', id: req.params.id });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

const getRoomStatsHandler = async (req, res) => {
  try {
    const { date, time } = req.query;
    const [[{ totalRooms }]] = await db.query('SELECT COUNT(*) AS totalRooms FROM rooms');

    let bookedCountQuery = '';
    let params = [];

    if (date && time) {
      bookedCountQuery = `
        SELECT COUNT(DISTINCT room_id) AS bookedRooms 
        FROM bookings 
        WHERE booking_date = ? 
          AND ? >= start_time AND ? < end_time
      `;
      params = [date, time, time];
    } else if (date) {
      bookedCountQuery = `
        SELECT COUNT(DISTINCT room_id) AS bookedRooms 
        FROM bookings 
        WHERE booking_date = ?
      `;
      params = [date];
    } else {
      // Realtime Available Now: checks rooms booked currently today
      bookedCountQuery = `
        SELECT COUNT(DISTINCT room_id) AS bookedRooms 
        FROM bookings 
        WHERE booking_date = CURDATE() 
          AND CURTIME() >= start_time AND CURTIME() < end_time
      `;
    }

    const [[{ bookedRooms }]] = await db.query(bookedCountQuery, params);
    const availableRooms = Math.max(0, totalRooms - (bookedRooms || 0));

    res.json({ totalRooms, availableRooms, bookedRooms: bookedRooms || 0 });
  } catch (err) {
    console.error('Error fetching room stats:', err);
    res.status(500).json({ error: 'Failed to fetch room statistics' });
  }
};

app.get('/room-stats', getRoomStatsHandler);
app.get('/api/room-stats', getRoomStatsHandler);

// app.listen(5000, () => console.log('Server running on http://localhost:5000'));

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
