const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: { origin: '*' }});

app.use(cors());
app.use(express.json());

const db = mysql.createConnection
({
  host: 'localhost',
  user: 'root',
  password: '2002',
  database: 'visitor_db'
});

db.connect
(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

app.get
('/tracker.js', (req, res) => {
    res.sendFile(__dirname + '/tracker.js');
});

app.get
('/get-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.json({ ip });
});

app.get
('/get-geo/:ip', async (req, res) => {
  const ip = req.params.ip;
  try 
  {
    const geo = await axios.get(`http://ip-api.com/json/${ip}`);
    res.json(geo.data);
  } catch {
    res.json({ country: 'Unknown', regionName: 'Unknown', city: 'Unknown' });
  }
});

app.post
('/save-visit', (req, res) => {
  const { ip, country, region, city, userAgent } = req.body;
  const visit_time = new Date();
  const query = `INSERT INTO visitors (ip_address, country, region, city, visit_time, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [ip, country, region, city, visit_time, userAgent];

  db.query
  (query, values, (err) => {
    if (err) return res.status(500).send('Database Error');
    io.emit('new-visitor', { ip, country, region, city, visit_time });
    res.sendStatus(200);
  });
});

app.get('/visitors', (req, res) => {
  db.query('SELECT * FROM visitors ORDER BY visit_time DESC', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
