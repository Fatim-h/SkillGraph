import React, { useState } from "react";

export default function AddSkillDialog({ onClose, onSkillAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedQid, setSelectedQid] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
  
    try {
      setLoading(true);
  
      const res = await fetch(
        `http://localhost:4000/search-skill?name=${encodeURIComponent(query)}`
      );
  
      if (!res.ok) {
        throw new Error("Search failed");
      }
  
      const data = await res.json();
  
      if (Array.isArray(data)) {
        setResults(data);
        setSelectedQid(data[0]?.qid || null);
      } else {
        setResults([]);
        console.error("Unexpected response:", data);
      }
  
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedQid) return;

    const res = await fetch("http://localhost:4000/add-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qid: selectedQid }),
    });

    const newSkill = await res.json();
    onSkillAdded(newSkill);
    onClose();
  };

  return (
     // FULL SCREEN OVERLAY
    <div
      onClick={onClose} // clicking outside closes modal
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)", // dark semi-transparent overlay
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: "24px",
          borderRadius: "12px",
          width: "420px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>Add New Skill</h2>

        <div style={{ display: "flex", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="Enter skill name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginRight: "8px"
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "8px 12px",
              backgroundColor: "#374151",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </div>

        {loading && <p>Searching...</p>}

        {Array.isArray(results) && results.map((item) => (
          <div
            key={item.qid}
            onClick={() => setSelectedQid(item.qid)}
            style={{
              padding: "8px",
              marginBottom: "6px",
              borderRadius: "6px",
              border:
                selectedQid === item.qid
                  ? "2px solid #4F46E5"
                  : "1px solid #ddd",
              cursor: "pointer"
            }}
          >
            <strong>{item.label}</strong>
            <div style={{ fontSize: "14px", color: "#555" }}>
              {item.description}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            onClick={onClose}
            style={{
              marginRight: "8px",
              padding: "6px 12px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedQid}
            style={{
              padding: "6px 12px",
              backgroundColor: "#374151",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}