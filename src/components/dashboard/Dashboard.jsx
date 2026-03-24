import React from "react";
import { WelcomeCard } from "./WelcomeCard";
import { TimebitCard } from "./TimebitCard";
import { TodoList } from "./TodoList";
import { DocumentsCard } from "./DocumentsCard";
import { NewsCard } from "./NewsCard";
import { EventCard } from "./EventCard";
import "../../resources/dashboard/dashboard.css";
import NotificationSnackbar from "../../utils/NotificationSnackbar";
import { useNotification } from "../../context/NotificationContext";
import useAuth from "../../hooks/useAuth";
import { PageLoader } from "../common/LoadingSpinner";


export default function Dashboard() {
  const { notification, closeNotification } = useNotification();
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }


  return (
    <div className="dashboard-container">
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      <div className="dashboard-grid">
        <div className="dashboard-left-column">
          <WelcomeCard user={user} />
          <div className="sub-grid">
            <div className="space-y-6">
              <TodoList />
              <EventCard />
            </div>
            <DocumentsCard />
          </div>
        </div>
        <div className="dashboard-right-column">
          <TimebitCard />
          <NewsCard />
        </div>
      </div>
    </div>
  );
}