require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(express.static("dist"));

const PORT = process.env.PORT;
const Person = require("./models/person");

const {
  logCallback,
  reqBodyCallback,
  errorHandler,
  unknownEndpoint,
} = require("./helpers");

// GET ALL PEOPLE IN PHONEBOOK
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// GET PHONEBOOK STATUS
app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(
        `<div><p>Phonebook has info for ${
          persons?.length || 0
        } people</p><p>${new Date().toString()}</p></div>`
      );
    })
    .catch((error) => next(error));
});

// GET PERSON BY ID
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params?.id || "";
  Person.findById(id)
    .then((item) => {
      if (item) {
        response.json(item);
      } else {
        response.status(404);
        response.send({ error: "Could not find resource" });
      }
    })
    .catch((error) => next(error));
});

// DELETE PERSON BY ID
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      if (!result) {
        response.status(404);
        response.send({ error: "Could not find resource" });
      } else {
        response.status(204).end();
      }
    })
    .catch((error) => next(error));
});

// UPDATE PERSON BY ID
app.put("/api/persons/:id", (request, response, next) => {
  const { name = "", number = "" } = request.body;
  const id = request.params?.id || "";
  Person.updateOne({ _id: id }, { name, number }, { runValidators: true })
    .then((result) => {
      if (result.matchedCount === 0) {
        return response.status(404).json({ error: "Person not found" });
      }

      if (result.modifiedCount === 0) {
        return response.json({ message: "No changes made" });
      }
      response.json({ message: `${name} updated successfully` });
    })
    .catch((error) => next(error));
});

morgan.token("req-body", reqBodyCallback);
app.use(morgan(logCallback));

// POST NEW PERSON NUMBER
app.post("/api/persons", (request, response, next) => {
  const { name = "", number = "" } = request.body;
  Person.find({ name })
    .then((persons) => {
      if (persons?.length) {
        return response.status(400).send({
          error: "Name must be unique",
        });
      }
      const person = new Person({
        name,
        number,
      });

      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
