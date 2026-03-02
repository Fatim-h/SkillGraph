import React from "react";

export default function NodeDialog({ node, onClose }) {
  if (!node) return null;

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
      {/* MODAL BOX */}
      <div
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)", // solid modal background
          color: "#000000", // dark text
          padding: "1.5rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          width: "24rem",
          maxHeight: "80vh",
          overflowY: "auto",
          opacity:""
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          {node.name}
        </h2>

        {node.description && <p style={{ marginBottom: "0.5rem" }}>{node.description}</p>}
        {node.notes && <p style={{ marginBottom: "0.5rem" }}>Notes: {node.notes}</p>}

        {node.links?.length > 0 && (
          <div style={{ marginBottom: "0.5rem" }}>
            <p style={{ fontWeight: 600 }}>Links:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem" }}>
              {node.links.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3b82f6", textDecoration: "underline" }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#374151",
            color: "#ffffff",
            borderRadius: "0.25rem",
            cursor: "pointer",
            border: "none",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
        >
          Close
        </button>
      </div>
    </div>
  );
}