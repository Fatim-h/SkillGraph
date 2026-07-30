// storage.js
// Basic local storage: persists skills + rules to a JSON file on disk so
// data survives server restarts (previously everything lived only in an
// in-memory array and was lost every time the server closed).

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data", "skillgraph-data.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Loads persisted data from disk.
 * @returns {{skills: Array, rules: Array}|null} null if no file exists yet
 */
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    if (!raw.trim()) return null;

    const parsed = JSON.parse(raw);

    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      rules: Array.isArray(parsed.rules) ? parsed.rules : []
    };
  } catch (err) {
    console.error("Failed to load local storage, starting fresh:", err.message);
    return null;
  }
}

/**
 * Persists skills + rules to disk. Called after every mutation.
 */
function saveData(skills, rules) {
  try {
    ensureDataDir();
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ skills, rules }, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Failed to save local storage:", err.message);
  }
}

module.exports = { loadData, saveData, DATA_FILE };
