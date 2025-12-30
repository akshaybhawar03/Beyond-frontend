import axios from "axios";

function normalizeBaseUrl(value) {
  const raw = (value || "").toString().trim();
  return raw.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    "https://beyond-backend-6.onrender.com/api"
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && !error.response) {
      return Promise.reject(new Error(`Cannot reach backend at ${API_BASE_URL}`));
    }
    return Promise.reject(error);
  }
);

export async function fetchArticles({ page = 1, limit = 10, search = "" } = {}) {
  const res = await api.get("/articles", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });
  return res.data;
}

export async function fetchArticleById(id) {
  const res = await api.get(`/articles/${id}`);
  return res.data;
}

export async function fetchArticleBySlug(slug) {
  const res = await api.get(`/articles/slug/${encodeURIComponent(slug)}`);
  return res.data;
}

export default api;
