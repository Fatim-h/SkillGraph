const express = require("express");
const cors = require("cors");
const { getSkillDetails } = require("./skill-details.js");
const { addSkill } = require("./add-skills.js");
const { deleteSkill } = require("./delete-skills.js");
const { updateSkill } = require("./update-skills.js");
const { loadData, saveData } = require("./storage.js");
const { addRule, deleteRule, applyRulesToAllSkills } = require("./rules.js");
const { getRelationInfo } = require("./relation-info.js");
const { findLink } = require("./find-link.js");

const app = express();
app.use(cors());
// Default Express/body-parser JSON limit is 100kb, which is easily exceeded by
// skills with lots of relations (parentclasses/subclasses/associations pulled
// from Wikidata). Raise it so those skills don't get silently rejected with a 413.
app.use(express.json({ limit: "10mb" }));

const WIKIDATA_SEARCH_URL = "https://www.wikidata.org/w/api.php";

const seedSkills = [
  {
    id: "Q9143",
    name: "Programming",
    description: "Designing software.",
    notes: "",
    links: ["https://www.wikidata.org/wiki/Q1"],
    color: "#4F46E5",
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
    color: "#4F46E5",
    relations: {
      subclasses: [],
      parentclasses: [{ id: "Q9143", name: "Programming", color: "#4F46E5" }],
      associations: []
    }
  }
];

// Basic local storage: load whatever was persisted last time, falling back
// to the seed data on first run (previously all data lived only in memory
// and was lost every time the server restarted).
const persisted = loadData();
const skills = persisted ? persisted.skills : seedSkills;
const rules = persisted ? persisted.rules : [];

function persist() {
  saveData(skills, rules);
}

// Save the seed data on first run so the file exists right away.
if (!persisted) persist();

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

app.post("/add-skill", (req, res) => {
  const skill = req.body;

  const result = addSkill(skill, skills, rules);

  if (result.success) {
    persist();
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

app.get("/skill-details", async (req, res) => {
  const { qid } = req.query;

  if (!qid) return res.status(400).json({ error: "Missing qid" });

  try {
    const skill = await getSkillDetails(qid);
    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch skill details" });
  }
});

app.delete("/delete-skill/:id", (req, res) => {
  const { id } = req.params;

  const result = deleteSkill(id, skills);

  if (result.success) {
    persist();
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

app.put("/update-skill/:id", (req, res) => {
  const updatedSkill = req.body;

  const result = updateSkill(updatedSkill, skills);

  if (result.success) {
    persist();
    res.json(result.skill);
  } else {
    res.status(400).json(result);
  }
});

// RULES: users can define their own equivalence groups, e.g.
// "calculus = differentiation = integration", and those terms will be
// treated as related when building the graph.

app.get("/rules", (req, res) => {
  res.json(rules);
});

app.post("/add-rule", (req, res) => {
  const { rule } = req.body;

  const result = addRule(rule, rules);

  if (!result.success) {
    return res.status(400).json(result);
  }

  // Retroactively link any already-added skills that match the new rule.
  applyRulesToAllSkills(skills, rules);
  persist();

  res.json(result);
});

app.delete("/delete-rule/:id", (req, res) => {
  const { id } = req.params;

  const result = deleteRule(id, rules);

  if (result.success) {
    persist();
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// INFO: explains what the P-code relations and link colors mean.
app.get("/relation-info", (req, res) => {
  res.json(getRelationInfo());
});

// FIND LINK: SPARQL lookup of how two chosen nodes are directly related.
app.get("/find-link/:from/:to", async (req, res) => {
  const { from, to } = req.params;

  try {
    const result = await findLink(from, to);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Find link failed", error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});