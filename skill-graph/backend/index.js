const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// Full skill objects with relations and links
const skills = [
  {
    id: "Q1",
    name: "Programming",
    description: "Designing software.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q1"],
    relations: {
      subclasses: [{ id: "Q2", name: "JavaScript", color: "#FBBF24" }],
      parentclasses: [],
      associations: []
    }
  },
  {
    id: "Q2",
    name: "JavaScript",
    description: "JS language.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q2"],
    relations: {
      subclasses: [],
      parentclasses: [{ id: "Q1", name: "Programming", color: "#4F46E5" }],
      associations: []
    }
  }
];

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Return full skills JSON for frontend
app.get("/skills", (req, res) => {
  res.json(skills);
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});