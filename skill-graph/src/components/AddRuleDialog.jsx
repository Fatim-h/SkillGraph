import React, { useState, useEffect } from "react";

export default function AddRuleDialog({ onClose }) {

  const [rules,setRules] = useState([]);
  const [ruleText,setRuleText] = useState("");
  const [loading,setLoading] = useState(false);

  const loadRules = async () => {
    try{
      const res = await fetch("http://localhost:4000/rules");
      const data = await res.json();
      setRules(Array.isArray(data)?data:[]);
    }catch(err){
      console.error(err);
    }
  };

  useEffect(()=>{
    loadRules();
  },[]);

  const handleAddRule = async () => {

    if(!ruleText.trim()) return;

    try{
      setLoading(true);

      const res = await fetch(
        "http://localhost:4000/add-rule",
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ rule: ruleText })
        }
      );

      const data = await res.json().catch(()=>({}));

      if(!res.ok){
        alert(data.message || "Rule not added");
        return;
      }

      setRuleText("");
      await loadRules();

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    try{
      const res = await fetch(
        `http://localhost:4000/delete-rule/${id}`,
        { method:"DELETE" }
      );

      if(!res.ok) return;

      await loadRules();

    }catch(err){
      console.error(err);
    }
  };

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
          backgroundColor:"rgba(255,255,255,0.9)",
          padding:"24px",
          borderRadius:"12px",
          width:"420px",
          maxHeight:"80vh",
          overflowY:"auto",
          boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
        }}
      >

        <h2 style={{marginBottom:"12px"}}>Custom Rules</h2>

        <p style={{fontSize:"13px",color:"#555",marginBottom:"6px"}}>
          Define how terms relate to each other:
        </p>
        <ul style={{fontSize:"12px",color:"#555",marginBottom:"12px",paddingLeft:"18px"}}>
          <li><code>a == b</code> — merge into one node (same skill)</li>
          <li><code>a &lt; b &lt; c</code> — parent chain (a is parent of b, b is parent of c)</li>
          <li><code>a = b = c</code> — association (all terms linked to each other)</li>
        </ul>

        <div style={{display:"flex",marginBottom:"12px"}}>

          <input
            type="text"
            placeholder="e.g. calculus = differentiation = integration"
            value={ruleText}
            onChange={(e)=>setRuleText(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") handleAddRule();
            }}
            style={{
              flex:1,
              padding:"8px",
              border:"1px solid #ccc",
              borderRadius:"6px",
              marginRight:"8px"
            }}
          />

          <button
            onClick={handleAddRule}
            disabled={loading}
            style={{
              padding:"8px 12px",
              backgroundColor:"#374151",
              color:"white",
              border:"none",
              borderRadius:"6px",
              cursor:"pointer"
            }}
          >
            Add
          </button>

        </div>

        <p style={{fontWeight:"600",marginTop:"10px"}}>Existing Rules</p>

        {rules.length===0 && (
          <p style={{fontSize:"13px",color:"#777"}}>No rules yet.</p>
        )}

        {rules.map(r=>(
          <div
            key={r.id}
            style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              padding:"6px 8px",
              marginBottom:"6px",
              border:"1px solid #ddd",
              borderRadius:"6px"
            }}
          >
            <span style={{fontSize:"14px"}}>
              {r.raw || r.terms.join(" = ")}
              {r.type && (
                <span style={{marginLeft:"6px",fontSize:"11px",color:"#888"}}>
                  ({r.type})
                </span>
              )}
            </span>

            <button
              onClick={()=>handleDeleteRule(r.id)}
              style={{
                marginLeft:"8px",
                background:"none",
                border:"none",
                cursor:"pointer",
                color:"#b91c1c"
              }}
            >
              x
            </button>
          </div>
        ))}

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
