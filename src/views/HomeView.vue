<template>
  <main>
    <TheWelcome />

    <section class="search-filters">
      <input
        v-model="searchQuery.q"
        placeholder="Nach Name suchen (q)"
        @keyup.enter="performSearch"
      >

      <input
        v-model="searchQuery.ingredient"
        placeholder="Nach Zutat suchen"
        @keyup.enter="performSearch"
      >

      <select v-model="searchQuery.category" @change="performSearch">
        <option value="">Alle Kategorien</option>
        <option value="Hauptspeise">Hauptspeise</option>
        <option value="Dessert">Dessert</option>
      </select>

      <button @click="performSearch">Suchen & Filtern</button>
      <button @click="resetSearch">Zurücksetzen</button>
    </section>

    <h2>Rezepte ({{ recipes.length }})</h2>
    <ul>
      <li v-for="recipe in recipes" :key="recipe.id">
        <strong>[{{ recipe.category }}] {{ recipe.name }}</strong>
        <p>Zutaten: {{ recipe.ingredients }}</p>
        <p>Anleitung: {{ recipe.instructions }}</p>

        <button class="delete-button" @click="deleteRecipeHandler(recipe.id)">Löschen</button>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, onMounted } from 'vue'
// Importiere deleteRecipe ZUSÄTZLICH zu getRecipes
import { getRecipes, deleteRecipe } from '../api'

// ANPASSUNG: Füge 'id' hinzu, da wir sie zum Löschen und Bearbeiten benötigen!
interface Recipe {
  id: number
  name: string
  category: string
  ingredients: string
  instructions: string
}

const recipes = ref<Recipe[]>([])

// NEU: State für die Such- und Filterparameter
const searchQuery = ref({
  q: '',
  category: '',
  ingredient: '',
})


function normalize(item: any): Recipe {
  // Wichtig: ID muss vom Backend kommen!
  const id = item?.id ?? -1
  const name = item?.name ?? item?.title ?? ''
  // ANPASSUNG: Backend gibt Category oft als Objekt zurück
  const category = item?.category?.name ?? item?.category ?? ''
  const ingredients = Array.isArray(item?.ingredients) ? item.ingredients.join(', ') : (item?.ingredients ?? '')
  const instructions = Array.isArray(item?.steps) ? item.steps.join(', ') : (item?.instructions ?? '')
  return { id, name, category, ingredients, instructions }
}

function loadFromLocalStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem('recipes') || '[]')
    if (Array.isArray(raw)) {
      // Füge Default-ID hinzu, falls sie aus localStorage geladen wird (Nicht ideal für Produktion, aber zum Testen okay)
      recipes.value = raw.map(item => normalize({ ...item, id: item.id ?? Math.random() }))
      console.log('Rezepte geladen (localStorage):', recipes.value)
    }
  } catch (err) {
    console.warn('Fehler beim Lesen von localStorage', err)
  }
}

// Zentrale Funktion zum Laden von Rezepten, verwendet Such- & Filterparameter
async function loadRecipes() {
  try {
    // Rufe API mit den aktuellen Suchparametern auf
    const data = await getRecipes(searchQuery.value)

    // Die flexible Behandlung des Rückgabewerts muss beibehalten werden, falls axios oder wrapper verwendet wird
    let resultData: any = data
    if (data && typeof data === 'object' && 'data' in (data as any)) {
      resultData = (data as any).data
    }

    if (Array.isArray(resultData)) {
      recipes.value = resultData.map(normalize)
      console.log('Rezepte geladen (Backend):', recipes.value)
      return
    }
    // Wenn das Backend fehlschlägt oder das Format falsch ist
    console.warn('Unerwartetes Backend-Format/Fehler, lade localStorage')
  } catch (err) {
    console.warn('Backend nicht erreichbar oder Fehler bei Suche/Filter.', err)
  }
  loadFromLocalStorage()
}

// Löst die Suche aus (bei Klick oder Enter)
function performSearch() {
  loadRecipes()
}

// Setzt alle Suchfelder zurück
function resetSearch() {
  searchQuery.value.q = ''
  searchQuery.value.category = ''
  searchQuery.value.ingredient = ''
  loadRecipes()
}

// Handler für den Löschen-Button
async function deleteRecipeHandler(id: number) {
  if (!confirm(`Soll das Rezept mit der ID ${id} wirklich gelöscht werden?`)) return

  try {
    await deleteRecipe(id)
    console.log(`Rezept ${id} erfolgreich gelöscht.`)
    // Lade die Liste neu, um den aktuellen Zustand zu sehen
    await loadRecipes()
  } catch (err) {
    console.error('Fehler beim Löschen des Rezepts:', err)
    alert('Fehler beim Löschen des Rezepts.')
  }
}

onMounted(() => {
  // Lade Rezepte beim ersten Mounten
  loadRecipes()
})
</script>

<style scoped>
/* Füge hier Styles für .search-filters und .delete-button hinzu, um die UI zu verbessern */
h2 {
  margin-left: 10%;
}
.search-filters {
  margin: 20px 10%;
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-filters input, .search-filters select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
ul {
  list-style: none;
  padding: 0 10%;
}
li {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
}
.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  float: right;
}
</style>
