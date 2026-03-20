# SkillGraph
SkillGraph is an experimental tool for building dynamic skill graphs that automatically connect concepts using ontology and inference.

Instead of manually linking skills, the system uses structured knowledge from Wikidata and custom inference logic to generate relationships between skills

## Version 1:

### Features:
- Search and add skills using Wikidata
- Automatically generate relationships using selected properties
- Visualize skills as an interactive graph (2D/3D)
- Human-in-the-loop correction for refining connections

### Knowledge Model (P-values used):
```
const RELATION_TYPES = {
  parentclasses: ["P279", "P31", "P361"],
  subclasses: ["P527"], // + reverse P279
  associations: ["P2283", "P277", "P366", "P2578", "P737", "P738"]
};
```

These are used to construct: hierarchical relationships, compositional structures and semantic associations.

### Tech Stack:
- Wikidata KG(SPARQL queries + SearchAPI)
- React(UI)
- react-force-graph-3d + react-force-graph-2d (visualization)
- Node.js(API layer)
- Neo4j backend(graph persistence - not implemented yet)

### Weakness:
- Heavily dependent on Wikidata structure (can miss practical relationships)
- Limited inference (mostly first-level relationships)
- Some connections require manual correction

[Research Sources](https://github.com/Fatim-h/SkillGraph/blob/main/researchsources.md)

## Version 2:
Include an inference layer(deciding between rule-based, NLP, ML or hybrid). expected inclusion of python.(To come)

## How to Run ?
### Prerequisites:
- Node.js (v18+ recommended)
- npm

### 1. Clone repository
```
git clone https://github.com/Fatim-h/SkillGraph
cd SkillGraph
```

### 2. Install dependencies:
   #### Frontend:
   ```
   cd skill-graph
   npm install
   ```
   #### Backend:
   ```
   cd skill-graph
   cd backend
   npm install
   ```

### 3. Run the Backend:
   ```
   node index.js
   ```
### 4. Run the Frontend:
   ```
   npm run dev
   ```

### 5. Use the App =D
   - Open the app in browser
   - Add the skill you want with the + icon
   - Add more, and more, and more...
   - See the relationships made
   - Update the skill nodes as you like
   - Delete the skills as you like

#### Notes: no backend integration yet(server closes->data gone!), internet is required.
