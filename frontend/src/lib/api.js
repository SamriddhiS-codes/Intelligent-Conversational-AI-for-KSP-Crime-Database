import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const client = axios.create({ baseURL: BASE_URL });

// Attach the JWT to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ksp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Any 401 means the token is gone/expired — force back to login.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("ksp_token");
      localStorage.removeItem("ksp_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const login = (username, password) =>
  client.post("/api/auth/login", { username, password }).then((r) => r.data);

export const register = (username, email, password, role = "investigator") =>
  client.post("/api/auth/register", { username, email, password, role }).then((r) => r.data);

// ---- Query (the core NL -> SQL pipeline) ----
export const runQuery = (question, conversation_history = []) =>
  client.post("/query/", { question, conversation_history }).then((r) => r.data);

// ---- Analytics ----
export const getHotspots = (limit = 10) =>
  client.get("/analytics/hotspots", { params: { limit } }).then((r) => r.data);

export const getTrends = (district) =>
  client.get("/analytics/trends", { params: district ? { district } : {} }).then((r) => r.data);

export const getByDistrict = () => client.get("/analytics/by-district").then((r) => r.data);

export const getCrimeTypes = () => client.get("/analytics/crime-types").then((r) => r.data);

export const getNetwork = (crime_type, district) =>
  client
    .get("/analytics/network", { params: { crime_type, district } })
    .then((r) => r.data);

// ---- Export ----
export const exportPdf = (conversation, query_results) =>
  client
    .post(
      "/export/pdf",
      { conversation, query_results },
      { responseType: "blob" }
    )
    .then((r) => r.data);

// ---- Stats / health ----
export const getStats = () => client.get("/stats").then((r) => r.data);
export const getHealth = () => client.get("/health").then((r) => r.data);