import React from "react";
import "../../resources/dashboard/todo-list.css";

const todoItems = [
  { id: 1, text: "Meeting with Aaron", completed: false },
  { id: 2, text: "Auctor ac nullam tellus", completed: false },
  { id: 3, text: "Tempor quis proin quis interdum", completed: false },
  { id: 4, text: "Lorem ipsum", completed: false },
];

export function TodoList() {
  return (
    <div className="card card-blue todo-list">
      <h2 className="todo-title">To Do List</h2>
      
      <div className="todo-items">
        {todoItems.map((item) => (
          <div key={item.id} className="todo-item">
            <input
              type="checkbox"
              id={`todo-${item.id}`}
              className="todo-checkbox"
            />
            <label htmlFor={`todo-${item.id}`} className="todo-label">
              {item.text}
            </label>
          </div>
        ))}
      </div>

      <button className="more-button">
        More
      </button>
    </div>
  );
}

