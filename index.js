const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
const PORT = 3001;
const dbPath = path.join(__dirname, "phonebook.json");

let phonebook = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Utility to generate new ID
const generateId = () => {
  const existingIds = phonebook?.map((n) => Number(n.id));
  //Assuming less than 100 entries, using 1 - 9999.  ;(
  let isUnique = false;
  let newId = "";
  while (!isUnique) {
    newId = Math.floor(Math.random() * 9999) + 1;
    if (!existingIds.includes(newId)) {
      isUnique = true;
    }
  }
  return `${newId}`;
};

// GET ALL PEOPLE
app.get("/api/persons", (request, response) => {
  response.json(phonebook);
});

// GET PHONEBOOK STATUS
app.get("/info", (request, response) => {
  response.send(
    `<div><p>Phonebook has info for ${
      phonebook?.length
    } people</p><p>${new Date().toString()}</p></div>`
  );
});

// GET PERSON BY ID
app.get("/api/persons/:id", (request, response) => {
  const id = request.params?.id || "";
  const person = phonebook?.find((phone) => phone?.id == id);
  if (person) {
    response.json(person);
  } else {
    response.status(404);
    response.send("Could not find resource");
  }
});

// DELETE PERSON BY ID
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  phonebook = phonebook?.filter((phone) => phone?.id !== id);
  response.status(204).end();
});

// POST NEW PERSON NUMBER
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body?.name || !body?.number) {
    return response.status(400).json({
      error: "The name or number is missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  const isExistingPerson = phonebook?.find(
    (phone) => phone?.name == person?.name
  );
  if (isExistingPerson) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  person.id = generateId();
  phonebook = [...phonebook, person];
  response.json(person);
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
