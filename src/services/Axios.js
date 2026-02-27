import axios from "axios";
import { jwtDecode } from "jwt-decode";

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // ⭐ VERY IMPORTANT for Netlify -> Render
  timeout: 30000
});

/* =========================================================
   TOKEN EXPIRY CHECK
   ========================================================= */

const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedToken.exp <= currentTime;
  } catch (error) {
    console.error("Token decode error:", error);
    return true;
  }
};

/* =========================================================
   REQUEST INTERCEPTOR (ATTACH TOKEN)
   ========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // redirect to login
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }

      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Accept"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   GENERIC REQUEST FUNCTIONS
   ========================================================= */

// ---------- POST ----------
export const postRequest = async (url, data) => {
  try {
    const config = {};

    // ⭐ IMPORTANT: allow image upload (FormData)
    if (data instanceof FormData) {
      // DO NOT manually set Content-Type
      // axios will set multipart boundary automatically
      config.headers = {};
    }

    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error("POST request error:", error.response || error);
    throw error;
  }
};

// ---------- PUT ----------
export const putRequest = async (url, data) => {
  try {
    const config = {};

    if (data instanceof FormData) {
      config.headers = {};
    }

    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error("PUT request error:", error.response || error);
    throw error;
  }
};

// ---------- DELETE ----------
export const deleteRequest = async (url, data = {}) => {
  try {
    const response = await api.delete(url, { data });
    return response.data;
  } catch (error) {
    console.error("DELETE request error:", error.response || error);
    throw error;
  }
};

// ---------- GET ----------
export const getRequest = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("GET request error:", error.response || error);
    throw error;
  }
};

export default api;