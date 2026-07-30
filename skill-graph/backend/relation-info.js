// relation-info.js
// Single source of truth for which Wikidata properties (P-codes) feed into
// which relation bucket, and what each property actually means. Used by
// skill-details.js when querying Wikidata, and exposed via GET
// /relation-info so the frontend can show an explanatory info dialog.

const PROPERTY_MEANINGS = {
  P279: "subclass of",
  P31: "instance of",
  P361: "part of",
  P527: "has part",
  P2283: "uses",
  P277: "programming language",
  P366: "use",
  P2578: "studies",
  P737: "influenced by",
  P738: "influenced"
};

const RELATION_TYPES = {
  parentclasses: ["P279", "P31", "P361"],
  subclasses: ["P527"], // reverse P279 / reverse P31 are also pulled in via SPARQL UNION
  associations: ["P2283", "P277", "P366", "P2578", "P737", "P738"]
};

const LINK_COLORS = [
  {
    color: "#FF4500",
    label: "Parent → Subclass",
    meaning: "Hierarchy relation: the source node is a parent/broader concept of the target node."
  },
  {
    color: "#1E90FF",
    label: "Association",
    meaning: "The two nodes are related (used together, influenced one another, etc.) without one being a parent of the other."
  }
];

function categoryFor(propertyId) {
  if (RELATION_TYPES.parentclasses.includes(propertyId)) return "parentclasses";
  if (RELATION_TYPES.subclasses.includes(propertyId)) return "subclasses";
  if (RELATION_TYPES.associations.includes(propertyId)) return "associations";
  return "unknown";
}

/**
 * Returns everything the frontend needs to render the "what does this all
 * mean" info dialog: every P-code in use, its plain-English meaning, which
 * relation bucket it belongs to, plus what each link color means in the graph.
 */
function getRelationInfo() {
  return {
    relationTypes: RELATION_TYPES,
    properties: Object.entries(PROPERTY_MEANINGS).map(([id, meaning]) => ({
      id,
      meaning,
      category: categoryFor(id)
    })),
    linkColors: LINK_COLORS
  };
}

module.exports = { PROPERTY_MEANINGS, RELATION_TYPES, LINK_COLORS, getRelationInfo };
