import React, { useState } from "react";
import "../../resources/dashboard/timebit-card.css";

export function TimebitCard() {
  const [workLocation, setWorkLocation] = useState("remote");

  return (
    <div className="card card-blue timebit-card">
      <h2 className="timebit-title">Timebit</h2>

      <div className="toggle-container">
        <div className="timebit-toggle">
          <div
            className="toggle-slider"
            style={{
              transform: workLocation === "remote" ? "translateX(0)" : "translateX(100%)",
            }}
          ></div>
          <button
            className={`toggle-option ${workLocation === "remote" ? "active" : ""}`}
            onClick={() => setWorkLocation("remote")}
          >
            Remote
          </button>
          <button
            className={`toggle-option ${workLocation === "office" ? "active" : ""}`}
            onClick={() => setWorkLocation("office")}
          >
            Office
          </button>
        </div>
      </div>

      <button className="start-button">Start Work</button>
    </div>
  );
}
