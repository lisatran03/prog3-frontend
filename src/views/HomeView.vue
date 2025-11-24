<template>
  <main>
    <TheWelcome />
    <h2>Rezepte</h2>
    <ul>
      <li v-for="recipe in recipes" :key="recipe.name">
        {{ recipe.name }} - {{ recipe.ingredients }} - {{ recipe.instructions }}
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, onMounted } from 'vue'
import { getRecipes } from '../api'

interface Recipe {
  name: string
  category: string
  ingredients: string
  instructions: string
}

const recipes = ref<Recipe[]>([])

function normalize(item: any): Recipe {
  const name = item?.name ?? item?.title ?? ''
  const category = item?.category ?? ''
  const ingredients = Array.isArray(item?.ingredients) ? item.ingredients.join(', ') : (item?.ingredients ?? '')
  const instructions = Array.isArray(item?.steps) ? item.steps.join(', ') : (item?.instructions ?? '')
  return { name, category, ingredients, instructions }
}

function loadFromLocalStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem('recipes') || '[]')
    if (Array.isArray(raw)) {
      recipes.value = raw.map(normalize)
      console.log('Rezepte geladen (localStorage):', recipes.value)
    }
  } catch (err) {
    console.warn('Fehler beim Lesen von localStorage', err)
  }
}

onMounted(() => {
  // Versuch Backend; flexible Behandlung des Rückgabewerts (axios vs. fetch)
  getRecipes()
    .then((response: unknown) => {
      // mögliche Formen: Array, { data: Array }, Response-like
      let data: any = response
      if (response && typeof response === 'object' && 'data' in (response as any)) {
        data = (response as any).data
      }
      if (Array.isArray(data)) {
        recipes.value = data.map(normalize)
        console.log('Rezepte geladen (Backend):', recipes.value)
      } else {
        // unerwartete Form -> fallback
        console.warn('Unerwartetes Backend-Format, lade localStorage')
        loadFromLocalStorage()
      }
    })
    .catch((err) => {
      console.warn('Backend nicht erreichbar, lade localStorage.', err)
      loadFromLocalStorage()
    })
})
</script>

<style scoped>
h2{
  margin-left: 10%;
}
</style>
