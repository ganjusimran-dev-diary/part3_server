const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

const PORT = process.env.PORT || 3001;

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

const logCallback = (tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, "content-length"),
    "-",
    tokens["response-time"](request, response),
    "ms",
    tokens["req-body"](request, response),
  ].join(" ");
};

const reqBodyCallback = (request, response) => {
  return JSON.stringify(request?.body || {});
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

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  if (!body?.name || !body?.number) {
    return response.status(400).json({
      error: "The name or number is missing",
    });
  }
  const id = request.params?.id || "";
  const phoneEntry = phonebook?.find((phone) => phone?.id == id);
  const person = {
    name: body.name,
    number: body.number,
    id,
  };

  if (phoneEntry?.name != person.name) {
    return response.status(400).json({
      error: "The name should match existing name",
    });
  }
  phonebook = phonebook?.map((phone) => {
    if (phone?.id !== id) return phone;
    return person;
  });
  response.json(person);
});

morgan.token("req-body", reqBodyCallback);
app.use(morgan(logCallback));

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

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "No routes matching this request" });
};

app.use(unknownEndpoint);

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
