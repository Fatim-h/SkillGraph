import React, { useState, useEffect } from "react";

export default function InfoDialog({ onClose }) {

  const [info,setInfo] = useState(null);
  const [error,setError] = useState(null);

  useEffect(()=>{
    fetch("http://localhost:4000/relation-info")
      .then(res=>res.json())
      .then(setInfo)
      .catch(err=>{
        console.error(err);
        setError("Could not load relation info");
      });
  },[]);

  const categoryLabel = {
    parentclasses: "Parent",
    subclasses: "Subclass",
    associations: "Association"
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
          backgroundColor:"rgba(255,255,255,0.95)",
          padding:"24px",
          borderRadius:"12px",
          width:"460px",
          maxHeight:"80vh",
          overflowY:"auto",
          boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
        }}
      >

        <h2 style={{marginBottom:"12px"}}>Graph Legend</h2>

        {error && <p style={{color:"#b91c1c"}}>{error}</p>}

        {!info && !error && <p>Loading...</p>}

        {info && (
          <>
            <p style={{fontWeight:"600",marginBottom:"6px"}}>Link Colors</p>

            {info.linkColors.map(lc=>(
              <div
                key={lc.color}
                style={{display:"flex",alignItems:"center",marginBottom:"6px"}}
              >
                <span
                  style={{
                    display:"inline-block",
                    width:"14px",
                    height:"14px",
                    borderRadius:"50%",
                    backgroundColor:lc.color,
                    marginRight:"8px",
                    flexShrink:0
                  }}
                />
                <span style={{fontSize:"13px"}}>
                  <b>{lc.label}:</b> {lc.meaning}
                </span>
              </div>
            ))}

            <p style={{fontWeight:"600",marginTop:"16px",marginBottom:"6px"}}>
              Wikidata Relations (P-codes)
            </p>

            <p style={{fontSize:"12px",color:"#666",marginBottom:"8px"}}>
              These are the Wikidata properties used to automatically build
              relations when you add a skill.
            </p>

            <table style={{width:"100%",fontSize:"13px",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{textAlign:"left",borderBottom:"1px solid #ccc"}}>
                  <th style={{padding:"4px"}}>Code</th>
                  <th style={{padding:"4px"}}>Meaning</th>
                  <th style={{padding:"4px"}}>Category</th>
                </tr>
              </thead>
              <tbody>
                {info.properties.map(p=>(
                  <tr key={p.id} style={{borderBottom:"1px solid #eee"}}>
                    <td style={{padding:"4px",fontFamily:"monospace"}}>{p.id}</td>
                    <td style={{padding:"4px"}}>{p.meaning}</td>
                    <td style={{padding:"4px",color:"#555"}}>
                      {categoryLabel[p.category] || p.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:"14px"}}>
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
