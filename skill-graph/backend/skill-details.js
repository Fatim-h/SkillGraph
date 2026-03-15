const fetch = global.fetch

async function queryWikidata(sparql) {
  const response = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/json",
      "User-Agent": "SkillGraph/1.0"
    },
    body: sparql
  });

  if (!response.ok) {
    throw new Error(`Wikidata HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.bindings;
}

// Helper to format SPARQL results into simple {id, name}
function formatResults(results) {
  return results
    .map(r => ({
      id: r.item.value.split("/").pop(),
      name: r.itemLabel.value
    }))
    // optional: filter out unnamed Qxxxx nodes
    .filter(r => !/^Q\d+$/.test(r.name));
}

/**
 * Main exported function
 * @param {string} qid - Wikidata entity QID
 * @returns {object} Skill object with relations
 */
async function getSkillDetails(qid) {
  if (!qid) throw new Error("Missing QID");

  // 1️⃣ Fetch entity details
  const entityRes = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
  );
  const entityData = await entityRes.json();
  const entity = entityData.entities[qid];

  if (!entity) throw new Error("Entity not found");

  const label = entity.labels?.en?.value || "";
  const description = entity.descriptions?.en?.value || "";

  // 2️⃣ Parent classes (P279 + P31)
  const parentQuery = `
  SELECT ?item ?itemLabel
  WHERE {
    wd:${qid} wdt:P279|wdt:P31 ?item .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 3️⃣ Subclasses / children (reverse P279 + P31)
  const childQuery = `
  SELECT ?item ?itemLabel
  WHERE {
    {
      ?item wdt:P279 wd:${qid} .
    }
    UNION
    {
      ?item wdt:P31 wd:${qid} .
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 4️⃣ Associations (P361 + P527)
  const associationQuery = `
  SELECT ?item ?itemLabel
  WHERE {
    wd:${qid} wdt:P361|wdt:P527 ?item .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  // 5️⃣ Run queries in parallel
  const [parents, children, associations] = await Promise.all([
    queryWikidata(parentQuery),
    queryWikidata(childQuery),
    queryWikidata(associationQuery)
  ]);

  // 6️⃣ Build final object
  return {
    id: qid,
    name: label,
    description,
    relations: {
      parentclasses: formatResults(parents),
      subclasses: formatResults(children),
      associations: formatResults(associations)
    }
  };
}

module.exports = { getSkillDetails };