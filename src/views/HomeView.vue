<template>
  <div>
    <!-- HERO / Suche -->
    <header class="hero">
      <div class="container hero__inner">
        <div class="branding">
          <h1>Digitales Kochbuch</h1>
          <p>Suche in deinen Rezepten aus der Datenbank.</p>
        </div>

        <div class="search-panel">
          <div class="field">
            <label for="q">Suche</label>
            <input
              id="q"
              type="search"
              class="input"
              placeholder="Titel, Zutat, Kategorie"
              v-model="searchTerm"
            />
          </div>

          <div class="field">
            <label for="course">Kategorie</label>
            <select id="course" class="select" v-model="selectedCategory">
              <option value="">Alle Kategorien</option>
              <option>Vorspeisen</option>
              <option>Hauptgerichte</option>
              <option>Desserts</option>
              <option>Vegetarisch</option>
            </select>
          </div>
        </div>

        <!-- Debug / Status -->
        <p class="debug" v-if="loading">Lade Rezepte…</p>
        <p class="debug err" v-else-if="error">{{ error }}</p>
        <p class="debug" v-else>Rezepte geladen: {{ recipes.length }}</p>
      </div>
    </header>

    <main class="container main">
      <RecipeCards :recipes="filteredRecipes" @open="openRecipe" />

      <p v-if="!loading && !error && filteredRecipes.length === 0" class="debug">
        Keine Treffer für deine Suche/Filter.
      </p>
    </main>

    <!-- Dialog (optional) -->
    <dialog id="recipe-dialog" class="dialog" aria-modal="true">
      <form method="dialog">
        <header class="dialog__header">
          <h3 class="dialog__title">{{ selected?.name }}</h3>
        </header>
        <div class="dialog__body" v-if="selected">
          <p><strong>Kategorie:</strong> {{ selected.category }}</p>
          <p><strong>Zutaten:</strong> {{ selected.ingredients.join(', ') }}</p>
          <p><strong>Anleitung:</strong> {{ selected.instructions }}</p>
        </div>
        <footer class="dialog__footer">
          <button class="btn btn-ghost" value="cancel" type="submit">Schließen</button>
        </footer>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RecipeCards from '../components/RecipeCard.vue'
import { getRecipes } from '../api'

type RecipeUI = {
  id: number
  name: string
  category: string
  ingredients: string[]
  instructions: string
  imageUrl?: string
  time?: number
  difficulty?: string
}

const recipes = ref<RecipeUI[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const searchTerm = ref('')
const selectedCategory = ref('')

const selected = ref<RecipeUI | null>(null)
function openRecipe(r: RecipeUI) {
  selected.value = r
  ;(document.getElementById('recipe-dialog') as HTMLDialogElement | null)?.showModal()
}

/** Robustes Normalize: egal ob Backend ingredients String oder Array liefert */
function normalize(item: any): RecipeUI {
  const id = Number(item?.id ?? -1)

  const name = item?.name ?? item?.title ?? ''
  const category = item?.category?.name ?? item?.category ?? ''

  const ingredientsArr =
    Array.isArray(item?.ingredients)
      ? item.ingredients
      : typeof item?.ingredients === 'string'
        ? item.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

  const instructions = item?.instructions ?? item?.steps ?? ''

  return {
    id,
    name,
    category,
    ingredients: ingredientsArr,
    instructions,
    imageUrl: item?.imageUrl ?? item?.image,
    time: item?.time,
    difficulty: item?.difficulty
  }
}

async function loadRecipes() {
  loading.value = true
  error.value = null
  try {
    const res = await getRecipes() // nutzt VITE_BACKEND_BASE_URL
    const data = (res as any)?.data

    if (!Array.isArray(data)) {
      throw new Error('Backend liefert kein Array. Prüfe /recipes Response.')
    }

    recipes.value = data.map(normalize)
  } catch (e: any) {
    console.error(e)
    error.value =
      'Konnte Rezepte nicht laden. Prüfe VITE_BACKEND_BASE_URL und ob Backend läuft.'
  } finally {
    loading.value = false
  }
}

const filteredRecipes = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const cat = selectedCategory.value

  return recipes.value.filter(r => {
    const matchesCategory = !cat || r.category === cat

    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.ingredients.some(i => i.toLowerCase().includes(term)) ||
      r.instructions.toLowerCase().includes(term)

    return matchesCategory && matchesSearch
  })
})

onMounted(loadRecipes)
</script>

<style scoped>
.debug { margin-top: .75rem; color:#475569; }
.err { color:#b91c1c; }
</style>
