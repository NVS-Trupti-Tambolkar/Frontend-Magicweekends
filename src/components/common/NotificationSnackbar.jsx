import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const NotificationSnackbar = ({ message, type, open, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom", // Vertical position
        horizontal: "right", // Horizontal position
      }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
