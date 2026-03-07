import React from "react";
import { HiDownload } from "react-icons/hi";
import "../../resources/dashboard/documents-card.css";

const documents = [
  {
    id: 1,
    name: "lorem-ipsum.pdf",
    size: "138 KB",
    addedBy: "John",
    addedTime: "3 hours ago",
  },
];

export function DocumentsCard() {
  return (
    <div className="card documents-card">
      <h2 className="documents-title">Documents</h2>

      <div className="documents-tabs">
        <button className="tab-button active">New (32)</button>
        <button className="tab-button">Trending</button>
        <button className="tab-button">My docs</button>
      </div>

      <div className="documents-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-header">
              <span className="document-name">{doc.name}</span>
              <span className="document-size">{doc.size}</span>
            </div>
            <div className="document-footer">
              <span className="document-info">
                Added {doc.addedTime} by {doc.addedBy}
              </span>
              <button className="download-button">
                <HiDownload className="download-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
