import React from "react";

export default function NodeSidebar({ node, onClose }) {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a node to view details
      </div>
    );
  }

  const {
    name,
    description,
    notes,
    links = [],
    relations = {},
  } = node;

  const {
    parentclasses = [],
    subclasses = [],
    associations = [],
  } = relations;

  return (
    <div className="h-full p-6 overflow-y-auto">
      <button
        onClick={onClose}
        className="mb-4 text-sm text-gray-500 hover:text-black"
      >
        Close
      </button>

      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="mb-4 text-gray-600">{description}</p>

      {notes && <p className="mb-4">{notes}</p>}

      {links.length > 0 && (
        <>
          <h3 className="font-semibold mt-4">Links</h3>
          <ul className="list-disc ml-5">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {subclasses.length > 0 && (
        <>
          <h3 className="font-semibold mt-4">Subclasses</h3>
          <ul className="list-disc ml-5">
            {subclasses.map((sub) => (
              <li key={sub.id}>{sub.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}