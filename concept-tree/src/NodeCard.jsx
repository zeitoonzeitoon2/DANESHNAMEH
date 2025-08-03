import { useState } from "react";

export default function NodeCard({ title, description }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ margin: "20px", textAlign: "right" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          padding: "10px",
          background: "#cce5ff",
          borderRadius: "8px",
          width: "150px",
        }}
      >
        {title}
      </div>

      {open && (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            width: "250px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}
