// skills.js
import { session } from "./db.js";

export async function createSkill(skill) {
  const { id, name, description } = skill;
  const result = await session.run(
    `
    MERGE (s:Skill {id: $id})
    SET s.name = $name, s.description = $description
    RETURN s
    `,
    { id, name, description }
  );
  return result.records[0]?.get("s").properties;
}

export async function getSkills() {
  const result = await session.run(`MATCH (s:Skill) RETURN s`);
  return result.records.map((r) => r.get("s").properties);
}

export async function getSkillById(id) {
  const result = await session.run(
    `MATCH (s:Skill {id: $id}) RETURN s`,
    { id }
  );
  return result.records[0]?.get("s").properties;
}

export async function createRelation(parentId, childId) {
  await session.run(
    `
    MATCH (p:Skill {id: $parentId}), (c:Skill {id: $childId})
    MERGE (p)-[:HAS_SUBCLASS]->(c)
    `,
    { parentId, childId }
  );
}