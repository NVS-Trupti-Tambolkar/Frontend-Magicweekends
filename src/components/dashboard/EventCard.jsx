import React from "react";
import "../../resources/dashboard/event-card.css";

export function EventCard() {
  return (
    <div className="event-card">
      <div className="event-tag">Event</div>
      <h3 className="event-title">Ut arcu viverra tincidunt</h3>
      <p className="event-description">
        Lorem ipsum dolor sit amet consectetur. Ut arcu viverra tincidunt cursus.
      </p>
      <div className="event-footer">
        <span className="event-author">Martha Clark</span>
        <span className="event-time">1 week ago</span>
      </div>
    </div>
  );
}

