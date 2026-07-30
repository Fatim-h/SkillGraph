// find-link.js
// Runs a SPARQL query against Wikidata to find how two entities are
// directly related to one another (in either direction).

const fetch = global.fetch;

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

/**
 * Finds every direct Wikidata property connecting qidA and qidB, in either
 * direction.
 * @param {string} qidA
 * @param {string} qidB
 * @returns {Promise<{from: string, to: string, found: boolean, links: Array}>}
 */
async function findLink(qidA, qidB) {
  if (!qidA || !qidB) throw new Error("Both node ids are required");

  const sparql = `
  SELECT ?prop ?propLabel ?direction WHERE {
    {
      wd:${qidA} ?p wd:${qidB} .
      BIND("forward" AS ?direction)
    }
    UNION
    {
      wd:${qidB} ?p wd:${qidA} .
      BIND("reverse" AS ?direction)
    }
    ?prop wikibase:directClaim ?p .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  const bindings = await queryWikidata(sparql);

  const links = bindings.map(b => ({
    property: b.prop.value.split("/").pop(),
    label: b.propLabel.value,
    // "forward" = qidA -> qidB, "reverse" = qidB -> qidA
    direction: b.direction.value
  }));

  return {
    from: qidA,
    to: qidB,
    found: links.length > 0,
    links
  };
}

module.exports = { findLink };
