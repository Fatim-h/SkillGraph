import React, { useState } from "react";

export default function FindLinkDialog({ nodes = [], onClose }) {

  const [fromId,setFromId] = useState("");
  const [toId,setToId] = useState("");
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState(null);
  const [error,setError] = useState(null);

  const sorted = [...nodes].sort((a,b)=>(a.name||"").localeCompare(b.name||""));

  const handleFind = async () => {
    if(!fromId || !toId){
      setError("Pick two nodes first");
      return;
    }
    if(fromId === toId){
      setError("Pick two different nodes");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try{
      const res = await fetch(`http://localhost:4000/find-link/${fromId}/${toId}`);
      const data = await res.json().catch(()=>({}));

      if(!res.ok){
        setError(data.message || "Find link failed");
        return;
      }

      setResult(data);

    }catch(err){
      console.error(err);
      setError("Find link failed");
    }finally{
      setLoading(false);
    }
  };

  const nameOf = (id) => nodes.find(n=>n.id===id)?.name || id;

  return (

    <div
      onClick={onClose}
      style={{
        position:"fixed",
        top:0,
        left:0,
        width:"100vw",
        height:"100vh",
        backgroundColor:"rgba(0,0,0,0.5)",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        zIndex:9999,
        backdropFilter:"blur(3px)"
      }}
    >

      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          backgroundColor:"rgba(255,255,255,0.95)",
          padding:"24px",
          borderRadius:"12px",
          width:"420px",
          maxHeight:"80vh",
          overflowY:"auto",
          boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
        }}
      >

        <h2 style={{marginBottom:"12px"}}>Find Link Between Nodes</h2>

        <p style={{fontSize:"12px",color:"#666",marginBottom:"12px"}}>
          Runs a SPARQL query against Wikidata to find any direct property
          connecting the two chosen nodes.
        </p>

        <label style={{fontSize:"12px",color:"#555"}}>From</label>
        <select
          value={fromId}
          onChange={(e)=>setFromId(e.target.value)}
          style={{width:"100%",padding:"6px",marginBottom:"10px",borderRadius:"6px",border:"1px solid #ccc"}}
        >
          <option value="">Select a node...</option>
          {sorted.map(n=>(
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>

        <label style={{fontSize:"12px",color:"#555"}}>To</label>
        <select
          value={toId}
          onChange={(e)=>setToId(e.target.value)}
          style={{width:"100%",padding:"6px",marginBottom:"14px",borderRadius:"6px",border:"1px solid #ccc"}}
        >
          <option value="">Select a node...</option>
          {sorted.map(n=>(
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>

        <button
          onClick={handleFind}
          disabled={loading}
          style={{
            padding:"8px 14px",
            backgroundColor:"#374151",
            color:"white",
            border:"none",
            borderRadius:"6px",
            cursor:"pointer",
            marginBottom:"12px"
          }}
        >
          {loading ? "Searching..." : "Find Link"}
        </button>

        {error && <p style={{color:"#b91c1c",fontSize:"13px"}}>{error}</p>}

        {result && (
          <div style={{marginTop:"8px"}}>
            {!result.found && (
              <p style={{fontSize:"13px",color:"#555"}}>
                No direct Wikidata relation found between{" "}
                <b>{nameOf(result.from)}</b> and <b>{nameOf(result.to)}</b>.
              </p>
            )}

            {result.found && result.links.map((l,i)=>(
              <div
                key={i}
                style={{
                  padding:"6px 8px",
                  marginBottom:"6px",
                  border:"1px solid #ddd",
                  borderRadius:"6px",
                  fontSize:"13px"
                }}
              >
                {l.direction === "forward" ? (
                  <span><b>{nameOf(result.from)}</b> → {l.label} ({l.property}) → <b>{nameOf(result.to)}</b></span>
                ) : (
                  <span><b>{nameOf(result.to)}</b> → {l.label} ({l.property}) → <b>{nameOf(result.from)}</b></span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:"12px"}}>
          <button
            onClick={onClose}
            style={{
              padding:"6px 12px",
              backgroundColor:"#ccc",
              border:"none",
              borderRadius:"4px"
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
