import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const db = new Database(process.env.DATABASE_URL || "database.db");

app.use(cors());
app.use(express.json());

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nombres TEXT NOT NULL,
    apellidoPaterno TEXT,
    apellidoMaterno TEXT,
    padreId TEXT,
    madreId TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const stmt = db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)");
    stmt.run(userId, username, hashedPassword);

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.json({ token, username: user.username });
});

// Persons routes (Protected)
app.get("/persons", authenticateToken, (req, res) => {
  const persons = db.prepare("SELECT * FROM persons WHERE user_id = ?").all(req.user.id);
  res.json(persons);
});

app.post("/persons", authenticateToken, (req, res) => {
  const { nombres, apellidoPaterno, apellidoMaterno, padreId, madreId } = req.body;
  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO persons (id, user_id, nombres, apellidoPaterno, apellidoMaterno, padreId, madreId) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, req.user.id, nombres, apellidoPaterno, apellidoMaterno, padreId, madreId);

  const saved = db.prepare("SELECT * FROM persons WHERE id = ?").get(id);
  res.status(201).json(saved);
});

app.put("/persons/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombres, apellidoPaterno, apellidoMaterno, padreId, madreId } = req.body;

  const stmt = db.prepare(`
    UPDATE persons 
    SET nombres = ?, apellidoPaterno = ?, apellidoMaterno = ?, padreId = ?, madreId = ? 
    WHERE id = ? AND user_id = ?
  `);

  const info = stmt.run(nombres, apellidoPaterno, apellidoMaterno, padreId, madreId, id, req.user.id);

  if (info.changes === 0) return res.status(404).json({ message: "Person not found" });

  const updated = db.prepare("SELECT * FROM persons WHERE id = ?").get(id);
  res.json(updated);
});

app.delete("/persons/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM persons WHERE id = ? AND user_id = ?");
  const info = stmt.run(id, req.user.id);

  if (info.changes === 0) return res.status(404).json({ message: "Person not found" });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
