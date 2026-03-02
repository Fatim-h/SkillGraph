// /components/SkillNode.js
export default class SkillNode {
  constructor({ id, name, description, notes, links = [], relations = {} }) {
    this.id = id;
    this.name = name;
    this.description = description || "";
    this.notes = notes || "";
    this.links = links;
    this.relations = {
      parentclasses: relations.parentclasses || [],
      subclasses: relations.subclasses || [],
      associations: relations.associations || [],
    };
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}