import React from "react";
import "../../resources/dashboard/news-card.css";

const newsItems = [
  {
    id: 1,
    title: "Auctor arcu nullam tellus",
    description: "Lorem ipsum dolor sit amet consectetur. Et vitae luctus tincidunt turpis semper consequat mauris eget malesuada.",
    tags: ["Events", "Hey News"],
    time: "1 week ago"
  },
  {
    id: 2,
    title: "Tempor quis proin",
    description: "Lorem ipsum dolor sit amet consectetur. Et faucibus vestibulum hendrerit volutpat magna fermentum varius.",
    tags: ["Updates"],
    time: "2 weeks ago"
  }
];

export function NewsCard() {
  return (
    <div className="card news-card">
      <div className="news-header">
        <h2 className="news-title">News</h2>
        <a href="#" className="see-all">See All</a>
      </div>

      <div className="news-list">
        {newsItems.map((item) => (
          <div key={item.id} className="news-item">
            <h3 className="news-item-title">{item.title}</h3>
            <p className="news-item-description">{item.description}</p>
            <div className="news-item-footer">
              <div className="tags">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`tag ${
                      tag === "Events" ? "tag-events" : "tag-news"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="news-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

