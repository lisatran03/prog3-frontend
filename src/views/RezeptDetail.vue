<template>
  <main class="recipe-detail-container">
    <div v-if="isLoading" class="loading-state">
      Lade Rezeptdetails... ⏳
    </div>

    <div v-else-if="error" class="error-state">
      Fehler beim Laden: {{ error }}
    </div>

    <div v-else-if="recipe" class="recipe-content">
      <header class="recipe-header">
        <h1>{{ recipe.name }}</h1>
        <span class="category-badge">Kategorie: {{ recipe.category }}</span>
      </header>

      <section class="recipe-section ingredients-section">
        <h2>Zutaten</h2>
        <ul class="ingredient-list">
          <li v-for="(item, index) in formattedIngredients" :key="index">
            {{ item }}
          </li>
        </ul>
      </section>

      <section class="recipe-section instructions-section">
        <h2>Zubereitung</h2>
        <ol class="instructions-list">
          <li v-for="(step, index) in formattedInstructions" :key="index">
            {{ step }}
          </li>
        </ol>
      </section>

      <div class="actions">
        <router-link to="/" class="back-button">
          &larr; Zurück zur Übersicht
        </router-link>
      </div>
    </div>

    <div v-else class="not-found-state">
      Rezept nicht gefunden.
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
// Stellen Sie sicher, dass Sie getRecipeById in api.ts exportiert haben!
import { getRecipeById } from '../api'

// 1. PROPS DEFINIEREN
const props = defineProps<{
  id: string
}>()

// 2. TYPES
interface Recipe {
  id: number
  name: string
  category: string | { name: string } // Kann String oder Objekt sein
  ingredients: string // Oder String[] je nach Backend
  instructions: string // Oder String[]
}

// 3. REACTIVE STATES
const recipe = ref<Recipe | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// 4. COMPUTED PROPERTIES FÜR DIE FORMATIERUNG
const formattedIngredients = computed(() => {
  if (!recipe.value?.ingredients) return []
  return recipe.value.ingredients.split(/, |; ?/).filter(i => i.trim().length > 0)
})

const formattedInstructions = computed(() => {
  if (!recipe.value?.instructions) return []
  // Für die saubere Darstellung im Frontend: Splitten am Punkt gefolgt von Leerzeichen.
  // Dies erfordert, dass die Anweisungen im Backend gut formatiert sind.
  return recipe.value.instructions.split(/\.\s+/).filter(i => i.trim().length > 0)
})


// 5. DATENABRUF LOGIK
async function fetchRecipe() {
  const recipeId = parseInt(props.id)

  if (isNaN(recipeId)) {
    error.value = 'Ungültige Rezept-ID.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null
  recipe.value = null

  try {
    const response = await getRecipeById(recipeId)
    const recipeData = response.data; // <--- HIER SIND DIE REZEPTDATEN

    const normalizedData = {
      ...recipeData,
      category: typeof recipeData.category === 'object' && recipeData.category !== null
        ? recipeData.category.name
        : recipeData.category
    }

    recipe.value = normalizedData as Recipe
  } catch (err) {
    error.value = 'Rezept mit dieser ID konnte nicht gefunden werden.'
    console.error('Fehler beim Abrufen des Rezepts:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.id, fetchRecipe, { immediate: true })

onMounted(() => {
})
</script>

<style scoped>
/* --- STYLES FÜR DIE DETAILANSICHT --- */

.recipe-detail-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.loading-state, .error-state, .not-found-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
  color: #6c757d;
}

.error-state {
  color: #dc3545;
  border: 1px solid #dc3545;
  background-color: #f8d7da;
  border-radius: 8px;
}

.recipe-header {
  border-bottom: 2px solid #007bff;
  padding-bottom: 15px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-header h1 {
  color: #333;
  margin: 0;
  font-size: 2.5em;
}

.category-badge {
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.recipe-section {
  margin-bottom: 30px;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.recipe-section h2 {
  color: #333;
  font-size: 1.8em;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

/* Zutatenliste */
.ingredient-list {
  list-style: none;
  padding: 0;
  columns: 2;
  column-gap: 40px;
}

.ingredient-list li {
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.ingredient-list li::before {
  content: '→';
  color: #28a745;
  position: absolute;
  left: 0;
}

.instructions-list {
  padding-left: 20px;
}

.instructions-list li {
  margin-bottom: 15px;
  line-height: 1.6;
}

.actions {
  text-align: center;
  margin-top: 40px;
}

.back-button {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5a6268;
}
</style>
