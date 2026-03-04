const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php";
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

app.get("/skills", (req, res) => {
  res.json(skills);
});

app.get("/search-skill", async (req, res) => {
  const { name } = req.query;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Missing name" });
  }

  try {
    console.log("Searching for:", name);

    const url = `${WIKIDATA_SEARCH_URL}?action=wbsearchentities&search=${encodeURIComponent(
      name.trim()
    )}&language=en&format=json&limit=5`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SkillGraphApp/1.0",
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    // Debug check
    if (text.startsWith("<!DOCTYPE")) {
      console.error("Wikidata returned HTML instead of JSON");
      return res.status(500).json({ error: "Wikidata returned HTML" });
    }

    const data = JSON.parse(text);

    if (!data.search) return res.json([]);

    const results = data.search.map(item => ({
      qid: item.id,
      label: item.label,
      description: item.description || ""
    }));

    res.json(results);

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post("/add-skill", async (req, res) => {
  const { qid } = req.body;

  if (!qid) {
    return res.status(400).json({ error: "Missing qid" });
  }

  try {
    // Prevent duplicates
    const existing = skills.find(skill => skill.id === qid);
    if (existing) {
      return res.json(existing);
    }

    // Fetch entity details from Wikidata
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;

    const response = await fetch(url);
    const data = await response.json();

    const entity = data.entities[qid];

    const label =
      entity.labels?.en?.value || "No label";

    const description =
      entity.descriptions?.en?.value || "";

    const newSkill = {
      id: qid,
      name: label,
      description: description,
      notes: "",
      links: [`https://www.wikidata.org/wiki/${qid}`],
      relations: {
        subclasses: [],
        parentclasses: [],
        associations: []
      }
    };

    skills.push(newSkill);

    res.json(newSkill);

  } catch (err) {
    console.error("Add skill error:", err);
    res.status(500).json({ error: "Failed to add skill" });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});