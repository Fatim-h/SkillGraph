// update-skill.js

function updateSkill(updatedSkill, skillsArr) {
  try {
    if (!updatedSkill?.id) {
      return { success: false, message: "Missing skill id" };
    }

    const existing = skillsArr.find(s => s.id === updatedSkill.id);

    if (!existing) {
      return { success: false, message: "Skill not found" };
    }

    // 1️⃣ Update basic fields (only overwrite a field if the caller actually
    // sent it, so a partial update like { id, addLink } doesn't wipe out
    // description/notes that weren't included in the payload).
    if (updatedSkill.name !== undefined) existing.name = updatedSkill.name || existing.name;
    if (updatedSkill.description !== undefined) existing.description = updatedSkill.description;
    if (updatedSkill.notes !== undefined) existing.notes = updatedSkill.notes;

    // 2️⃣ Links: support explicit add/remove of a single link, as well as
    // a full-array replace (existing.links was already replaced wholesale
    // before; this just also allows targeted single-link edits).
    existing.links = existing.links || [];

    if (Array.isArray(updatedSkill.links)) {
      // Full replace (e.g. the edit form sends the whole edited list back)
      existing.links = updatedSkill.links;
    }

    if (updatedSkill.addLink) {
      if (!existing.links.includes(updatedSkill.addLink)) {
        existing.links.push(updatedSkill.addLink);
      }
    }

    if (updatedSkill.removeLink !== undefined && updatedSkill.removeLink !== null) {
      existing.links = existing.links.filter(
        (link, idx) => link !== updatedSkill.removeLink && idx !== updatedSkill.removeLink
      );
    }

    // 3️⃣ OPTIONAL: Update relations (safe replace)
    if (updatedSkill.relations) {
      existing.relations = updatedSkill.relations;
    }

    return {
      success: true,
      message: "Skill updated",
      skill: existing
    };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Update failed", error: err.message };
  }
}

module.exports = { updateSkill };