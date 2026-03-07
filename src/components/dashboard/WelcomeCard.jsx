import React from "react";
import "../../resources/dashboard/welcome-card.css";
import team from "../../assets/dashboard/team.jpg";

export function WelcomeCard({ user }) {
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const date = today.getDate();
  const month = today.toLocaleDateString("en-US", { month: "long" });

  // Function to determine the correct ordinal suffix for any date
  const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return "th"; // 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st"; // 1st, 21st, 31st
      case 2:
        return "nd"; // 2nd, 22nd
      case 3:
        return "rd"; // 3rd, 23rd
      default:
        return "th"; // 4th, 5th, ..., 20th, etc.
    }
  };

  const ordinalSuffix = getOrdinalSuffix(date);

  return (
    <div className="card welcome-card">
      <div className="welcome-content">
        <h1 className="welcome-day">{dayName}</h1>
        <p className="welcome-date">{date}{ordinalSuffix} {month}</p>
        <h2 className="welcome-greeting">Hello, {user.username}!</h2>
        <p className="welcome-message">Have a nice day!</p>
      </div>
      <img src={team} alt="Welcome" className="welcome-image" />
    </div>
  );
}