import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000', // Replace with your API URL
  // baseURL: 'https://magicweekends-api.onrender.com',
  // baseURL: 'https://nbsapi.noviusrailtech.com/', // Replace with your API URL
});

// Function to check if the token is expired  
const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token); // Decode the token
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds, rounded to the nearest second

    // Check if token is expired (adding a small buffer for edge cases)
    return decodedToken.exp <= currentTime; // If expired or about to expire
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume token is invalid if decoding fails
  }
};

// Interceptor to add the token to the headers for every request
// Function to add token to headers and check expiration
const addTokenAndCheckExpiration = (config) => {
  const token = localStorage.getItem("token"); // Get the token from localStorage

  if (token) {
    // Check if the token is expired
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Redirect to login page
      return Promise.reject(new Error("Token expired")); // Reject the request
    }

    config.headers["Authorization"] = `Bearer ${token}`; // Attach the token to the header
  }

  return config;
};

// Interceptor to add the token to the headers for every request
api.interceptors.request.use(
  (config) => {
    // Here navigate will be passed, but it can be used only inside a functional component
    return addTokenAndCheckExpiration(config); // Handle token check and navigation
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to make a POST request
export const postRequest = async (url, data) => {
  try {
    const response = await api.post(url, data); // Send POST request with data
    return response; // Return the response data
  } catch (error) {
    console.error("Error in POST request", error.response || error);
    throw error; // Throw error to be handled in the component or caller
  }
};

// Function to make a PUT request
export const putRequest = async (url, data) => {
  try {
    const response = await api.put(url, data); // Send PUT request with data
    return response.data; // Return the response data
  } catch (error) {
    console.error("Error in PUT request", error.response || error);
    throw error; // Throw error to be handled in the component or caller
  }
};

// Function to make a DELETE request
export const deleteRequest = async (url, data) => {
  try {
    const response = await api.delete(url, data); // Send DELETE request
    return response.data; // Return the response data
  } catch (error) {
    console.error("Error in DELETE request", error.response || error);
    throw error; // Throw error to be handled in the component or caller
  }
};

export default api;
