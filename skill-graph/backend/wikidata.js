import axios from "axios";

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

export async function fetchSkillFromWikidata(qid) {
  const query = `
    SELECT ?item ?itemLabel ?description WHERE {
      wd:${qid} wdt:P279* ?item.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
  `;

  const res = await axios.get(SPARQL_ENDPOINT, {
    params: { query, format: "json" },
  });

  const results = res.data.results.bindings.map((b) => ({
    id: b.item.value.split("/").pop(),
    name: b.itemLabel.value,
    description: b.description ? b.description.value : "",
  }));

  return results;
}