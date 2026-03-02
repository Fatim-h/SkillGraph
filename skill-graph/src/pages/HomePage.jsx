import React, { useState, useEffect } from "react";
import Graph from "../Graph";

export default function HomePage() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/skills")
      .then(res => res.json())
      .then(data => {
        console.log("Fetched skills:", data);
        setSkills(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <div className="w-full h-full">
        <Graph skills={skills} />
      </div>
    </div>
  );
}