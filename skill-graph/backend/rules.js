// rules.js
// Lets users define relationships between skill *names* using simple
// operators, so they can help shape how the graph gets built:
//
//   a == b                  -> MERGE: treat a and b as literally the same node
//   a < b < c ...            -> PARENT CHAIN: a is parent of b, b is parent of c, ...
//   a = b = c ...            -> ASSOCIATION: link all terms to one another
//
// Rules are matched case-insensitively against skill names. "==" is checked
// before "=" so a merge rule never gets misread as an association rule.

function detectOperator(ruleText) {
  if (ruleText.includes("==")) return "==";
  if (ruleText.includes("<")) return "<";
  if (ruleText.includes("=")) return "=";
  return null;
}

function operatorToType(operator) {
  if (operator === "==") return "merge";
  if (operator === "<") return "parent";
  if (operator === "=") return "association";
  return null;
}

/**
 * Parses raw rule text into a typed, normalized rule.
 * @param {string} ruleText
 * @returns {{type: string|null, terms: string[]}}
 */
function parseRule(ruleText) {
  if (!ruleText || typeof ruleText !== "string") {
    return { type: null, terms: [] };
  }

  const operator = detectOperator(ruleText);
  if (!operator) return { type: null, terms: [] };

  const terms = ruleText
    .split(operator)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  return { type: operatorToType(operator), terms: [...new Set(terms)] };
}

/**
 * Adds a new rule to the rules array.
 * @returns {object} { success, message, rule? }
 */
function addRule(ruleText, rulesArr) {
  const { type, terms } = parseRule(ruleText);

  if (!type) {
    return {
      success: false,
      message:
        "Use '==' to merge nodes (a == b), '<' for parent chains (a < b < c), " +
        "or '=' for associations (a = b = c)."
    };
  }

  if (terms.length < 2) {
    return { success: false, message: "A rule needs at least two terms" };
  }

  const rule = { id: `rule-${Date.now()}`, type, terms, raw: ruleText.trim() };
  rulesArr.push(rule);

  return { success: true, message: "Rule added", rule };
}

function deleteRule(ruleId, rulesArr) {
  const index = rulesArr.findIndex(r => r.id === ruleId);

  if (index === -1) {
    return { success: false, message: "Rule not found" };
  }

  const removed = rulesArr.splice(index, 1)[0];
  return { success: true, message: "Rule deleted", rule: removed };
}

function findRulesForName(name, rulesArr) {
  if (!name) return [];
  const normalized = name.trim().toLowerCase();
  return rulesArr.filter(r => r.terms.includes(normalized));
}

// ---- relation helpers -------------------------------------------------

function ensureRelations(skill) {
  skill.relations = skill.relations || {};
  skill.relations.parentclasses = skill.relations.parentclasses || [];
  skill.relations.subclasses = skill.relations.subclasses || [];
  skill.relations.associations = skill.relations.associations || [];
}

function addUnique(list, entry) {
  if (!list.some(x => x.id === entry.id)) list.push(entry);
}

function linkAssociation(a, b) {
  ensureRelations(a);
  ensureRelations(b);
  addUnique(a.relations.associations, { id: b.id, name: b.name });
  addUnique(b.relations.associations, { id: a.id, name: a.name });
}

function linkParentChild(parent, child) {
  ensureRelations(parent);
  ensureRelations(child);
  addUnique(parent.relations.subclasses, { id: child.id, name: child.name });
  addUnique(child.relations.parentclasses, { id: parent.id, name: parent.name });
}

function nameOf(skill) {
  return (skill.name || "").trim().toLowerCase();
}

// ---- association / parent rules (non-destructive) ----------------------

/**
 * Applies association + parent rules for a single skill against the
 * existing skills array. Does not touch merge rules (those can remove
 * nodes, so they're handled separately).
 */
function applyNonMergeRulesToSkill(skill, skillsArr, rulesArr) {
  ensureRelations(skill);

  const matchingRules = findRulesForName(skill.name, rulesArr);

  matchingRules.forEach(rule => {
    if (rule.type === "association") {
      skillsArr.forEach(other => {
        if (other.id === skill.id) return;
        if (rule.terms.includes(nameOf(other))) linkAssociation(skill, other);
      });
    }

    if (rule.type === "parent") {
      const skillName = nameOf(skill);

      rule.terms.forEach((term, i) => {
        if (term !== skillName) return;

        // skill is the parent of the next term in the chain
        if (i < rule.terms.length - 1) {
          const childTerm = rule.terms[i + 1];
          skillsArr.forEach(other => {
            if (other.id === skill.id) return;
            if (nameOf(other) === childTerm) linkParentChild(skill, other);
          });
        }

        // skill is the child of the previous term in the chain
        if (i > 0) {
          const parentTerm = rule.terms[i - 1];
          skillsArr.forEach(other => {
            if (other.id === skill.id) return;
            if (nameOf(other) === parentTerm) linkParentChild(other, skill);
          });
        }
      });
    }
  });
}

// ---- merge rules (destructive: can remove nodes) ------------------------

/**
 * If the incoming skill's name matches a merge ("==") rule that an
 * *existing* skill already satisfies, returns that existing skill so the
 * caller can merge into it instead of adding a brand new node.
 */
function findMergeTarget(skill, skillsArr, rulesArr) {
  const mergeRules = rulesArr.filter(r => r.type === "merge");
  const skillName = nameOf(skill);

  for (const rule of mergeRules) {
    if (!rule.terms.includes(skillName)) continue;

    const existing = skillsArr.find(s => rule.terms.includes(nameOf(s)));
    if (existing) return existing;
  }

  return null;
}

/**
 * Merges `incoming` into `survivor` in place: combines description, notes,
 * links, aliases, and relations. `survivor` is what remains; `incoming`
 * should be discarded by the caller (not pushed, or removed from the array).
 */
function mergeSkills(survivor, incoming) {
  ensureRelations(survivor);
  ensureRelations(incoming);

  survivor.description = survivor.description || incoming.description || "";
  survivor.notes = [survivor.notes, incoming.notes].filter(Boolean).join(" | ");
  survivor.links = [...new Set([...(survivor.links || []), ...(incoming.links || [])])];
  survivor.aliases = [...new Set([...(survivor.aliases || []), incoming.name])];

  ["parentclasses", "subclasses", "associations"].forEach(key => {
    (incoming.relations[key] || []).forEach(rel => {
      if (rel.id === survivor.id) return; // don't self-link
      addUnique(survivor.relations[key], rel);
    });
  });

  return survivor;
}

/**
 * Scans the whole skills array for merge rules and combines any existing
 * skills that match the same merge group, rewriting every other skill's
 * relation references from the removed id(s) to the survivor's id.
 * Mutates skillsArr in place (may shrink it).
 */
function retroactivelyMergeSkills(skillsArr, rulesArr) {
  const mergeRules = rulesArr.filter(r => r.type === "merge");

  mergeRules.forEach(rule => {
    const matches = skillsArr.filter(s => rule.terms.includes(nameOf(s)));
    if (matches.length < 2) return;

    const [survivor, ...duplicates] = matches;

    duplicates.forEach(dup => {
      mergeSkills(survivor, dup);

      // Rewrite any relation reference to the removed duplicate so it
      // points at the survivor instead.
      skillsArr.forEach(s => {
        ["parentclasses", "subclasses", "associations"].forEach(key => {
          ensureRelations(s);
          s.relations[key] = s.relations[key]
            .map(rel =>
              rel.id === dup.id ? { ...rel, id: survivor.id, name: survivor.name } : rel
            )
            .filter(rel => rel.id !== s.id); // no self-loops
        });
      });

      const idx = skillsArr.indexOf(dup);
      if (idx !== -1) skillsArr.splice(idx, 1);
    });

    // De-dupe survivor's relation lists after the id rewrite above.
    ["parentclasses", "subclasses", "associations"].forEach(key => {
      const seen = new Set();
      survivor.relations[key] = survivor.relations[key].filter(rel => {
        if (seen.has(rel.id)) return false;
        seen.add(rel.id);
        return true;
      });
    });
  });
}

// ---- public entry points -------------------------------------------------

/**
 * Applies association + parent rules to a single (already-added) skill.
 * Call findMergeTarget() separately before adding, since merges need to
 * happen instead of a plain add rather than after it.
 */
function applyRulesToSkill(skill, skillsArr, rulesArr) {
  applyNonMergeRulesToSkill(skill, skillsArr, rulesArr);
}

/**
 * Re-scans every existing skill against every rule (merge, parent,
 * association) and applies matches. Used after a new rule is added, so
 * pre-existing skills that match get connected/merged retroactively.
 */
function applyRulesToAllSkills(skillsArr, rulesArr) {
  retroactivelyMergeSkills(skillsArr, rulesArr);
  skillsArr.forEach(skill => applyNonMergeRulesToSkill(skill, skillsArr, rulesArr));
}

module.exports = {
  parseRule,
  addRule,
  deleteRule,
  findRulesForName,
  findMergeTarget,
  mergeSkills,
  applyRulesToSkill,
  applyRulesToAllSkills
};
