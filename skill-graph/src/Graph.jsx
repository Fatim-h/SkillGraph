import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SkillNode from "./components/SkillNode";
import NodeDialog from "./components/NodeDialog";

export default function Graph({ skills }) {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // local selection

  useEffect(() => {
    if (!skills || skills.length === 0) return;

    const nodes = skills.map(skill => new SkillNode({
      id: skill.id,
      name: skill.name,
      description: skill.description || "",
      notes: skill.notes || "",
      links: skill.links || [],
      relations: skill.relations || {},
      color: skill.color || "#4F46E5"
    }));

    const links = [];
    nodes.forEach(node => {
      node.relations.subclasses?.forEach(sub => {
        links.push({ source: node.id, target: sub.id, color: "#FF4500", width: 2, arrowLength: 6, arrowRelPos: 1 });
      });
      node.relations.associations?.forEach(assoc => {
        links.push({ source: node.id, target: assoc.id, color: "#1E90FF", width: 2, arrowLength: 0, arrowRelPos: 0 });
      });
    });

    setGraphData({ nodes, links });
  }, [skills]);

  const focusNode = useCallback((node) => {
    if (!node || !fgRef.current) return;
    const distance = 120;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      1000
    );
  }, []);

  const handleNodeClick = (node) => {
    focusNode(node);
    setSelectedNode(node); // open dialog
  };

  const nodeColor = (node) => (node === hoverNode ? "#374151" : node.color || "#4F46E5");

  return (
    <div className="w-full h-full relative bg-white">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={nodeColor}
        nodeOpacity={0.9}
        linkColor={link => link.color}
        linkWidth={link => link.width}
        linkDirectionalArrowLength={link => link.arrowLength}
        linkDirectionalArrowRelPos={link => link.arrowRelPos}
        linkOpacity={0.8}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
      />

      {selectedNode && (
        <NodeDialog
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}