// Deprecated: Utility to generate new ID
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

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  response.status(500).json({ error: error });
};

const unknownEndpoint = (request, response) => {
  console.log("kjdhkjdhfkjdshfkjdshfkjhdskj728");
  response.status(404).json({ error: "No routes matching this request" });
};

// Deprecated: Local phonebook object
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

module.exports = {
  generateId,
  logCallback,
  reqBodyCallback,
  errorHandler,
  unknownEndpoint,
  phonebook,
};
