import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const NodeSidebar = ({ node, onClose, onNavigate }) => {
  const [expanded, setExpanded] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!node); // update visibility whenever node changes
  }, [node]);

  const toggle = (section) => setExpanded(expanded === section ? null : section);

  const RelationSection = ({ title, items, sectionKey }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-4">
        <button
          onClick={() => toggle(sectionKey)}
          className="flex justify-between w-full text-left font-semibold text-gray-700 hover:text-gray-900 transition"
        >
          <span>{title} ({items.length})</span>
          <span>{expanded === sectionKey ? "−" : "+"}</span>
        </button>
        {expanded === sectionKey && (
          <ul className="mt-2 pl-4 border-l border-gray-300 space-y-1">
            {items.map((rel) => (
              <li
                key={rel.id}
                onClick={() => onNavigate && onNavigate(rel)}
                className="cursor-pointer text-gray-600 hover:text-gray-900 transition"
              >
                • {rel.name} {rel.color && <span className="inline-block w-2 h-2 rounded-full ml-1" style={{ backgroundColor: rel.color }} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (!node) return null;

  const { id, name, description, notes, links = [], relations = {} } = node;
  const { parentclasses = [], subclasses = [], associations = [] } = relations;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-500 hover:text-gray-800 font-bold text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 text-gray-700">
          <div className="mb-4"><span className="font-semibold">ID:</span> {id}</div>
          <div className="mb-4">
            <span className="font-semibold">Description:</span>
            <p className="mt-1">{description || "No description available."}</p>
          </div>

          <RelationSection title="Parent Classes" items={parentclasses} sectionKey="parents" />
          <RelationSection title="Subclasses" items={subclasses} sectionKey="subclasses" />
          <RelationSection title="Associations" items={associations} sectionKey="associations" />

          {links.length > 0 && (
            <div className="mt-6">
              <span className="font-semibold text-gray-800">Links</span>
              <ul className="mt-2 space-y-1">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all transition">
                      {link.includes("wikidata") ? "Wikidata Page" : link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {notes && (
            <div className="mt-6 p-3 border border-gray-200 rounded-md bg-gray-50">
              <span className="font-semibold text-gray-800">Notes</span>
              <p className="mt-1 text-gray-700">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

NodeSidebar.propTypes = {
  node: PropTypes.object,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
};

export default NodeSidebar;