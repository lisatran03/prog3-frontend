<template>
  <section class="container page" aria-labelledby="title-neues-rezept">
    <h1 id="title-neues-rezept">Neues Rezept erstellen</h1>
    <p class="muted">
      Fülle die Felder aus.
    </p>

    <form class="form" @submit.prevent="handleSubmit">
      <fieldset class="box">
        <legend>Stammdaten</legend>

        <label class="field">
          <span class="label">Titel (Rezeptname) *</span>
          <input
            v-model.trim="form.name"
            type="text"
            required
            placeholder="z. B. Linsen-Dal"
            :class="{ 'is-invalid': errors.name }"
          />
          <small v-if="errors.name" class="err">{{ errors.name }}</small>
        </label>

        <label class="field">
          <span class="label">Kategorie *</span>
          <select
            v-model="form.category"
            required
            :class="{ 'is-invalid': errors.category }"
          >
            <option value="">Bitte wählen…</option>
            <option>Vorspeisen</option>
            <option>Hauptgerichte</option>
            <option>Desserts</option>
            <option>Vegan</option>
            <option>Vegetarisch</option>
            <option>Glutenfrei</option>
          </select>
          <small v-if="errors.category" class="err">{{ errors.category }}</small>
        </label>

        <div class="row">
          <label class="field">
            <span class="label">Zeit (Minuten) *</span>
            <input
              v-model.number="form.time"
              type="number"
              min="1"
              required
              placeholder="30"
              :class="{ 'is-invalid': errors.time }"
            />
            <small v-if="errors.time" class="err">{{ errors.time }}</small>
          </label>

          <label class="field">
            <span class="label">Schwierigkeit *</span>
            <select v-model="form.difficulty" required>
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>
          </label>
        </div>

        <label class="field">
          <span class="label">Bild-URL</span>
          <input
            v-model.trim="form.imageUrl"
            type="url"
            placeholder="https://…/foto.jpg"
            inputmode="url"
          />
          <small class="hint">Optional.</small>
        </label>
      </fieldset>

      <fieldset class="box">
        <legend>Zutaten & Schritte</legend>

        <label class="field">
          <span class="label">Zutaten (eine pro Zeile) *</span>
          <textarea
            v-model.trim="ingredientsText"
            rows="6"
            required
            placeholder="200 g Linsen"
            :class="{ 'is-invalid': errors.ingredients }"
          ></textarea>
          <small v-if="errors.ingredients" class="err">{{ errors.ingredients }}</small>
        </label>

        <label class="field">
          <span class="label">Anweisungen (eine pro Zeile) *</span>
          <textarea
            v-model.trim="stepsText"
            rows="8"
            required
            placeholder="Zwiebel schneiden"
            :class="{ 'is-invalid': errors.steps }"
          ></textarea>
          <small v-if="errors.steps" class="err">{{ errors.steps }}</small>
        </label>

        <label class="field">
          <span class="label">Tags (kommagetrennt)</span>
          <input v-model.trim="tagsText" type="text" placeholder="scharf, schnell" />
        </label>

        <label class="field">
          <span class="label">Notizen</span>
          <textarea v-model.trim="form.notes" rows="3" placeholder="z. B. Gut einfrierbar."></textarea>
        </label>
      </fieldset>

      <div class="actions">
        <button class="btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Speichere…' : 'Rezept speichern' }}
        </button>
        <button class="btn btn--ghost" type="button" @click="resetForm">Zurücksetzen</button>
        <span v-if="saved" class="ok">✔ Rezept erfolgreich gespeichert!</span>
        <span v-if="submitError" class="err">Fehler: {{ submitError }}</span>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createRecipe, getRecipeById, updateRecipe } from '../api'


const router = useRouter()
// ID als Prop empfangen
const props = defineProps<{
  id?: string
}>()
const isEditing = computed(() => Boolean(props.id))

type Difficulty = 'easy' | 'medium' | 'hard'

// Interface für die Formular-Daten
type RecipeForm = {
  name: string
  category: string
  time: number
  difficulty: Difficulty
  imageUrl?: string
  isVegan: boolean
  notes?: string
}

// Formular-Objekt
const form = reactive<RecipeForm>({
  name: '',
  category: '',
  time: 1,
  difficulty: 'easy',
  imageUrl: '',
  isVegan: false,
  notes: ''
})

// Text-Eingaben für Zutaten/Schritte/Tags
const ingredientsText = ref('')
const stepsText = ref('')
const tagsText = ref('')

// UI-Status
const submitting = ref(false)
const saved = ref(false)
const submitError = ref('')

// Fehler je Feld (KORRIGIERT: Verwenden konsistente Namen wie 'name')
const errors = reactive<Record<string, string>>({})

// Text → Arrays Helfer
const splitLines = (txt: string) =>
  txt.split('\n').map(s => s.trim()).filter(Boolean)

const splitTags = (txt: string) =>
  txt.split(',').map(s => s.trim()).filter(Boolean)

// Einfache Frontend-Validierung
function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.name.trim()) errors.name = 'Bitte Titel/Namen angeben.'
  if (!form.category) errors.category = 'Bitte Kategorie wählen.'
  if (!form.time || form.time < 1) errors.time = 'Zeit muss ≥ 1 Minute sein.'

  const ing = splitLines(ingredientsText.value)
  const stp = splitLines(stepsText.value)
  if (ing.length === 0) errors.ingredients = 'Mindestens 1 Zutat angeben.'
  if (stp.length === 0) errors.steps = 'Mindestens 1 Anweisung angeben.'

  return Object.keys(errors).length === 0
}

// Formular absenden → Daten an Spring-Backend schicken
async function handleSubmit() {
  submitError.value = ''
  saved.value = false

  if (!validate()) return

  submitting.value = true
  try {
    // 1. Strings aus Textareas vorbereiten
    const ingredientsString = splitLines(ingredientsText.value).join('\n')
    // KORRIGIERT: Schritte werden zu Anweisungen (instructions)
    const instructionsString = splitLines(stepsText.value).join('\n')

    async function loadRecipeForEditing() {
      if (!props.id) return;

      try {
        const response = await getRecipeById(Number(props.id));
        const recipe = response.data;

        // Das 'form'-Objekt mit den existierenden Daten füllen
        form.name = recipe.name;
        form.category = recipe.category;
        form.time = recipe.time;
        form.difficulty = recipe.difficulty;
        form.imageUrl = recipe.imageUrl || '';

        // Die Textareas für Zutaten und Schritte füllen
        ingredientsText.value = recipe.ingredients; // Backend liefert String mit Umbrüchen
        stepsText.value = recipe.instructions;
      } catch (error) {
        submitError.value = 'Rezept konnte nicht geladen werden.';
      }
    }

    // 2. Erstellen des Objekts, wie es das BACKEND erwartet
    const recipeForBackend: any = {
      name: form.name,
      ingredients: ingredientsString,
      instructions: instructionsString,
      category: form.category,
      time: form.time,
      difficulty: form.difficulty,
      imageUrl: form.imageUrl || null
    }


    saved.value = true
    alert(`Rezept "${form.name}" erfolgreich erstellt!`)

    // Weiterleitung zur Rezeptliste
    router.push('/')

  } catch (e: unknown) {
    let errorMessage = 'Unbekannter Fehler beim Speichern.';
    if (e && typeof e === 'object' && 'message' in e) {
      errorMessage = String(e.message);
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }

    submitError.value = errorMessage;
  } finally {
    submitting.value = false
  }
}

// Formular leeren
function resetForm() {
  form.name = ''
  form.category = ''
  form.time = 1
  form.difficulty = 'easy'
  form.imageUrl = ''
  form.isVegan = false
  form.notes = ''

  ingredientsText.value = ''
  stepsText.value = ''
  tagsText.value = ''

  Object.keys(errors).forEach(k => delete errors[k])
  saved.value = false
  submitError.value = ''
}
// Laden des zu bearbeitenden Rezepts
async function loadRecipeForEditing() {
  if (!props.id) return

  try {
    const response = await getRecipeById(Number(props.id))
    const recipe = response.data

    // Formular mit den Daten füllen
    form.name = recipe.name || recipe.title
    form.category = recipe.category?.name || recipe.category
    form.time = recipe.time
    form.difficulty = recipe.difficulty || recipe.level
    form.imageUrl = recipe.imageUrl || ''
    form.isVegan = false // falls Sie diese Option haben

    // Zutaten und Anweisungen in Textareas einfügen
    ingredientsText.value = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join('\n')
      : recipe.ingredients

    stepsText.value = recipe.instructions || recipe.description
  } catch (error) {
    console.error('Fehler beim Laden des Rezepts:', error)
    submitError.value = 'Rezept konnte nicht geladen werden.'
  }
}

// Komponente initialisieren
onMounted(() => {
  if (props.id) {
    loadRecipeForEditing()
  }
})

</script>

<style scoped>
/* ... (deine bestehenden Styles) ... */

.page { padding: 1rem 0 2rem; }
.muted { color: #64748b; margin: .25rem 0 1rem; }
.form { display: grid; gap: 1rem; }
.box { border: 1px solid #e5e7eb; border-radius: .75rem; padding: 1rem; }
legend { padding: 0 .3rem; font-weight: 700; color: #334155; }
.field { display: grid; gap: .35rem; }
.label { font-size: .92rem; color: #334155; font-weight: 600; }
input, select, textarea {
  padding: .6rem .7rem;
  border: 1px solid #cfd3e1;
  border-radius: .6rem;
  background: #fff;
  font: inherit;
}
input.is-invalid, textarea.is-invalid, select.is-invalid { border-color: #dc2626; }
.err { color: #b91c1c; font-size: .9rem; }
.hint { color: #6b7280; font-size: .85rem; }
.row { display: grid; gap: .75rem; grid-template-columns: 1fr 1fr; }
.actions { display: flex; gap: .6rem; align-items: center; }
.btn {
  padding: .6rem .9rem;
  border-radius: .6rem;
  border: 1px solid #334155;
  background: #334155;
  color: #fff;
  cursor: pointer;
}
.btn:disabled { opacity: .65; cursor: default; }
.btn--ghost { background: #fff; color: #334155; }
.ok { color: #166534; }
@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; }
}
</style>
