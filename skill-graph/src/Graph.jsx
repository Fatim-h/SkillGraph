import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import NodeSidebar from "./components/NodeSidebar";

export default function Graph() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    // Mock data with default positions
    setGraphData({
      nodes: [
        {
          id: "Q1",
          name: "Programming",
          color: "#4F46E5",
          description: "Designing software.",
          links: ["https://www.wikidata.org/wiki/Q1"],
          relations: { subclasses: [{ id: "Q2", name: "JavaScript", color: "#FBBF24" }] },
          x: 0, y: 0, z: 0
        },
        {
          id: "Q2",
          name: "JavaScript",
          color: "#FBBF24",
          description: "JS language.",
          links: ["https://www.wikidata.org/wiki/Q2"],
          relations: { parentclasses: [{ id: "Q1", name: "Programming" }] },
          x: 50, y: 0, z: 0
        }
      ],
      links: [{ source: "Q1", target: "Q2" }]
    });
  }, []);

  const focusNode = useCallback((node) => {
    if (!node) return;
    const distance = 120;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      1000
    );
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    focusNode(node);
  };

  const handleNavigate = (relNode) => {
    const targetNode = graphData.nodes.find((n) => n.id === relNode.id);
    if (targetNode) {
      setSelectedNode(targetNode);
      focusNode(targetNode);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100 relative">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        backgroundColor="#f9fafb"
        nodeColor={(node) =>
          node === selectedNode ? "#1F2937" : node === hoverNode ? "#374151" : node.color
        }
        nodeOpacity={0.9}
        linkColor={() => "#9CA3AF"}
        linkOpacity={0.6}
        linkWidth={1.5}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoverNode}
      />
      {selectedNode && (
        <NodeSidebar
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onNavigate={handleNavigate}
          theme="light"
        />
      )}
    </div>
  );
}