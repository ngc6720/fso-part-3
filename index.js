const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// data

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const getPersonFromId = (id) => {
  if (typeof id === "string") id = Number(id);
  return persons.find((p) => p.id === id);
};

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

// middleware functions

const unknownRoute = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

morgan.token("post", function (req, res) {
  return req.method === "POST" ? JSON.stringify(req.body, null, 2) : " ";
});

// server
app.use(cors());
app.use(express.json());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post")
);

app.get("/info", (req, res) => {
  const entries = persons.length;
  const date = Date();
  res.send(
    `<h1>Info</h1><p>Phonebook has info for ${entries} people</p><p>${date}</p>`
  );
});

app.get("/api/persons", (req, res) => {
  console.log("HAHAHAHA");
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = getPersonFromId(req.params.id);
  if (!person) {
    res.status(404).end();
    return;
  }
  res.json(person);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  if (persons.some((p) => p.name === name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    id: generateId(),
    name: name,
    number: number,
  };

  persons = [...persons, newPerson];
  res.json(newPerson);
});

app.delete("/api/persons/:id", (req, res) => {
  const personToDelete = getPersonFromId(req.params.id);

  if (!personToDelete) {
    res.status(404).end();
    return;
  }
  persons = persons.filter((p) => p.id !== personToDelete.id);
  res.status(204).end();
});

app.use(unknownRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
