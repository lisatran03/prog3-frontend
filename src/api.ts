import axios from "axios";

// Definiert die Basis-URL des Backends aus den Umgebungsvariablen
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

interface RecipeSearchParams {
  q?: string; // Suche nach Name
  category?: string; // Filtern nach Kategorie
  ingredient?: string; // Suche nach Zutat
}

// Interface für ein Rezept-Objekt, das wir senden/empfangen
interface RecipeData {
  name: string;
  instructions: string;
  ingredients: string;
  category: {
    name: string;
  };
  time?: number;
  difficulty?: string;
  imageUrl?: string;
}
export function getRecipes(params: RecipeSearchParams = {}) {
  return axios.get(`${BASE_URL}/recipes`, {
    params: params
  });
}
export function getRecipeById(id: number) {
  return axios.get(`${BASE_URL}/recipes/${id}`);
}

export function getCategories() {
  return axios.get(`${BASE_URL}/categories`);
}

//  Rezept erstellen (POST)
export function createRecipe(recipe: RecipeData) {
  return axios.post(`${BASE_URL}/recipes`, recipe);
}

// Rezept bearbeiten (PUT)
export function updateRecipe(id: number, recipe: RecipeData) {
  // Das Backend erwartet die ID in der URL und das geänderte Objekt im Body
  return axios.put(`${BASE_URL}/recipes/${id}`, recipe);
}

// Rezept löschen (DELETE)
export function deleteRecipe(id: number) {
  return axios.delete(`${BASE_URL}/recipes/${id}`);
}
