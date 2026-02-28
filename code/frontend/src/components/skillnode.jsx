import * as THREE from "three";
import SpriteText from "three-spritetext";

export function createSkillNode(node, allNodes) {
  const group = new THREE.Group();

  // Determine parent colors
  const parentColors = (node.parentClasses || [])
    .map(parentId => allNodes.find(n => n.id === parentId))
    .filter(Boolean)
    .map(p => p.color || p.baseColor);

  let finalColor;

  if (node.baseColor) {
    finalColor = node.baseColor;
  } else if (parentColors.length === 1) {
    finalColor = parentColors[0];
  } else if (parentColors.length > 1) {
    finalColor = blendColors(parentColors);
  } else {
    finalColor = "#888888";
  }

  // Shade up if relation or prereq
  if (node.isRelation || node.isPrereq) {
    finalColor = lightenColor(finalColor, 30);
  }

  node.color = finalColor;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 24, 24),
    new THREE.MeshStandardMaterial({
      color: finalColor,
      roughness: 0.4,
      metalness: 0.3
    })
  );

  const label = new SpriteText(node.name);
  label.textHeight = 3;
  label.color = "white";
  label.position.set(0, 8, 0);

  group.add(sphere);
  group.add(label);

  return group;
}