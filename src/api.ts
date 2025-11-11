import axios from "axios";

export function getRecipes() {
  return axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/recipes`);
}

