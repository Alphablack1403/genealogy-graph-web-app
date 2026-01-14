import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let persons = [];

app.get("/persons", (req, res) => {
  res.json(persons);
});

app.post("/persons", (req, res) => {
  const person = { id: crypto.randomUUID(), ...req.body };
  persons.push(person);
  res.status(201).json(person);
});

app.listen(3000, () => {
  console.log("API corriendo en http://localhost:3000");
});
