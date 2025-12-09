<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRecipes } from '../api'

interface Category {
  name: string
}

interface Recipe {
  id: number
  name: string
  time?: number
  difficulty?: string
  image?: string
  isVegan?: boolean
  notes?: string
  ingredients: string[]
  instructions: string
  category?: Category
  // falls ihr tags habt:
  tags?: string[]
}

const recipes = ref<Recipe[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Hilfsfunktion: Anweisungen in einzelne Schritte aufteilen
function instructionsToSteps(instructions: string | undefined) {
  if (!instructions) return []
  return instructions
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

async function loadRecipes() {
  loading.value = true
  error.value = null
  try {
    const response = await getRecipes()
    recipes.value = response.data
  } catch (e) {
    console.error(e)
    error.value = 'Fehler beim Laden der Rezepte.'
  } finally {
    loading.value = false
  }
}

onMounted(loadRecipes)
</script>


<template>
  <main class="page">
    <h1>Alle Rezepte</h1>

    <p v-if="loading">Lade Rezepte...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <section v-else class="recipes-grid">
      <article
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-card"
      >
        <!-- Bild -->
        <div v-if="recipe.image" class="recipe-image-wrapper">
          <img
            :src="recipe.image"
            :alt="recipe.name"
            class="recipe-image"
          />
        </div>

        <!-- Stammdaten -->
        <header class="recipe-header">
          <h2>{{ recipe.name }}</h2>
          <p class="recipe-meta">
            <span v-if="recipe.category">Kategorie: {{ recipe.category.name }}</span>
            <span v-if="recipe.time"> · Zeit: {{ recipe.time }} min</span>
            <span v-if="recipe.difficulty"> · Schwierigkeit: {{ recipe.difficulty }}</span>
            <span v-if="recipe.isVegan"> · 🌱 vegan</span>
          </p>
        </header>

        <!-- Zutaten -->
        <section class="recipe-section">
          <h3>Zutaten</h3>
          <ul>
            <li v-for="(ing, idx) in recipe.ingredients" :key="idx">
              {{ ing }}
            </li>
          </ul>
        </section>

        <!-- Schritte -->
        <section class="recipe-section">
          <h3>Anweisungen</h3>
          <ol>
            <li
              v-for="(step, idx) in instructionsToSteps(recipe.instructions)"
              :key="idx"
            >
              {{ step }}
            </li>
          </ol>
        </section>

        <!-- Tags + Notizen -->
        <section class="recipe-section" v-if="(recipe.tags && recipe.tags.length) || recipe.notes">
          <div v-if="recipe.tags && recipe.tags.length" class="tags">
            <span
              v-for="(tag, idx) in recipe.tags"
              :key="idx"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
          <p v-if="recipe.notes" class="notes">
            <strong>Notizen:</strong> {{ recipe.notes }}
          </p>
        </section>
      </article>
    </section>
  </main>
</template>



<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.recipe-header h2 {
  margin: 0;
}

.recipe-meta {
  font-size: 0.9rem;
  color: #6b7280;
}

.recipe-section {
  margin-top: 0.75rem;
}

.recipe-section h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.recipe-image-wrapper {
  margin: -1rem -1.25rem 0.75rem;
}

.recipe-image {
  width: 100%;
  display: block;
  border-radius: 12px 12px 0 0;
  object-fit: cover;
  max-height: 200px;
}

.tags {
  margin-bottom: 0.25rem;
}

.tag {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.8rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
}

.notes {
  font-size: 0.9rem;
}

.error {
  color: #b91c1c;
}
</style>
