import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

export function getRecipes() {
  return api.get("/recipes");
}

export function getCategories() {
  return api.get("/categories");
}
