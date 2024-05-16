require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const person = require("./models/person");

const PORT = process.env.PORT;
const app = express();

// middleware functions

const unknownRoute = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

morgan.token("post", function (req, res) {
  return req.method === "POST" ? JSON.stringify(req.body, null, 2) : " ";
});

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "CastError") {
    res.status(400).send({ error: "malformatted id" });
  }

  next(err);
};

// server

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post")
);

app.get("/info", (req, res) => {
  Person.countDocuments({}).then((len) => {
    const date = Date();
    res.send(
      `<h1>Info</h1><p>Phonebook has info for ${len} people</p><p>${date}</p>`
    );
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  const newPerson = new Person({
    name: name,
    number: number,
  });

  newPerson.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((personToDelete) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number missing",
    });
  }

  const person = {
    name: name,
    number: number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

app.use(unknownRoute);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
