import React, { useState } from "react";

export default function ListSidebar({ nodes = [], onSelectNode, onClose }) {

  const [search,setSearch] = useState("");

  const filtered = nodes
    .filter(n => n.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => (a.name||"").localeCompare(b.name||""));

  return (
    <div
      style={{
        position:"absolute",
        top:0,
        left:0,
        height:"100%",
        width:"280px",
        backgroundColor:"rgba(255,255,255,0.95)",
        boxShadow:"2px 0 10px rgba(0,0,0,0.2)",
        display:"flex",
        flexDirection:"column",
        zIndex:500
      }}
    >

      <div style={{padding:"12px",borderBottom:"1px solid #ddd"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <h3 style={{margin:0}}>All Nodes</h3>
          <button
            onClick={onClose}
            style={{
              background:"none",
              border:"none",
              cursor:"pointer",
              fontSize:"16px"
            }}
          >
            x
          </button>
        </div>

        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={{
            width:"100%",
            padding:"6px",
            border:"1px solid #ccc",
            borderRadius:"6px",
            boxSizing:"border-box"
          }}
        />

      </div>

      <div style={{overflowY:"auto",flex:1}}>

        {filtered.length===0 && (
          <p style={{padding:"12px",fontSize:"13px",color:"#777"}}>No nodes found.</p>
        )}

        {filtered.map(node=>(
          <div
            key={node.id}
            onClick={()=>onSelectNode(node)}
            style={{
              padding:"8px 12px",
              borderBottom:"1px solid #eee",
              cursor:"pointer",
              display:"flex",
              alignItems:"center"
            }}
            onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="#f3f4f6"}
            onMouseLeave={(e)=>e.currentTarget.style.backgroundColor="transparent"}
          >
            <span
              style={{
                display:"inline-block",
                width:"10px",
                height:"10px",
                borderRadius:"50%",
                backgroundColor:node.color || "#4F46E5",
                marginRight:"8px",
                flexShrink:0
              }}
            />
            <span style={{fontSize:"14px"}}>{node.name}</span>
          </div>
        ))}

      </div>

    </div>
  );
}
