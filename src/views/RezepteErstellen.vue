<template>
  <!--
    Seite: Neues Rezept erstellen – reine Frontend-Version
    - Keine Server-Requests
    - Einfache Validierung im Browser
    - Vorschau des JSONs
    - (Optional) temporäres Speichern in localStorage
  -->
  <section class="container page" aria-labelledby="title-neues-rezept">
    <h1 id="title-neues-rezept">Neues Rezept erstellen</h1>
    <p class="muted">
      Fülle die Felder aus. Beim Speichern wird das Rezept lokal geprüft und darunter als JSON angezeigt.
    </p>

    <!-- Formular – wir verhindern das echte Submit und rufen handleSubmit auf -->
    <form class="form" @submit.prevent="handleSubmit">
      <!-- STAMMDATEN -->
      <fieldset class="box">
        <legend>Stammdaten</legend>

        <label class="field">
          <span class="label">Titel *</span>
          <input
            v-model.trim="form.title"
            type="text"
            required
            placeholder="z. B. Linsen-Dal"
            :class="{ 'is-invalid': errors.title }"
          />
          <small v-if="errors.title" class="err">{{ errors.title }}</small>
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
            v-model.trim="form.image"
            type="url"
            placeholder="https://…/foto.jpg"
            inputmode="url"
          />
          <small class="hint">Optional – du kannst später auch Upload einbauen.</small>
        </label>
      </fieldset>

      <!-- ZUTATEN & SCHRITTE -->
      <fieldset class="box">
        <legend>Zutaten & Schritte</legend>

        <label class="field">
          <span class="label">Zutaten (eine pro Zeile) *</span>
          <textarea
            v-model.trim="ingredientsText"
            rows="6"
            required
            placeholder="200 g Linsen
1 Zwiebel
2 EL Öl"
            :class="{ 'is-invalid': errors.ingredients }"
          ></textarea>
          <small v-if="errors.ingredients" class="err">{{ errors.ingredients }}</small>
        </label>

        <label class="field">
          <span class="label">Schritte (eine pro Zeile) *</span>
          <textarea
            v-model.trim="stepsText"
            rows="8"
            required
            placeholder="Zwiebel schneiden
Öl erhitzen
Linsen kochen …"
            :class="{ 'is-invalid': errors.steps }"
          ></textarea>
          <small v-if="errors.steps" class="err">{{ errors.steps }}</small>
        </label>

        <label class="field">
          <span class="label">Tags (kommagetrennt)</span>
          <input v-model.trim="tagsText" type="text" placeholder="scharf, schnell, ohne-Ofen" />
          <small class="hint">Optional – helfen später bei der Suche.</small>
        </label>

        <label class="field">
          <span class="label">Notizen</span>
          <textarea v-model.trim="form.notes" rows="3" placeholder="z. B. Gut einfrierbar."></textarea>
        </label>
      </fieldset>

      <!-- AKTIONEN -->
      <div class="actions">
        <button class="btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Speichere…' : 'Rezept speichern' }}
        </button>
        <button class="btn btn--ghost" type="button" @click="resetForm">Zurücksetzen</button>
        <span v-if="saved" class="ok">✔ Gespeichert (localStorage)</span>
        <span v-if="submitError" class="err">{{ submitError }}</span>
      </div>
    </form>


  </section>
</template>

<script setup lang="ts">
/**
 * Reines Frontend (kein Backend):
 * - Wir halten Form-Daten in `form` + Textfelder für Zutaten/Schritte/Tags
 * - Beim Speichern parsen wir in Arrays und zeigen das Ergebnis als JSON
 * - Optional: legen es in localStorage ab (damit man „persistentes“ Feedback hat)
 */
import { reactive, ref } from 'vue'

type Difficulty = 'easy' | 'medium' | 'hard'

type Recipe = {
  title: string
  category: string
  time: number
  difficulty: Difficulty
  image?: string
  isVegan: boolean
  ingredients: string[]
  steps: string[]
  tags: string[]
  notes?: string
}

// Formular-Objekt
const form = reactive<Recipe>({
  title: '',
  category: '',
  time: 1,
  difficulty: 'easy',
  image: '',
  isVegan: false,
  ingredients: [],
  steps: [],
  tags: [],
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

// Fehler je Feld
const errors = reactive<Record<string, string>>({})

// Text → Arrays
const splitLines = (txt: string) =>
  txt.split('\n').map(s => s.trim()).filter(Boolean)

const splitTags = (txt: string) =>
  txt.split(',').map(s => s.trim()).filter(Boolean)

// einfache Frontend-Validierung
function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.title.trim()) errors.title = 'Bitte Titel angeben.'
  if (!form.category) errors.category = 'Bitte Kategorie wählen.'
  if (!form.time || form.time < 1) errors.time = 'Zeit muss ≥ 1 Minute sein.'

  const ing = splitLines(ingredientsText.value)
  const stp = splitLines(stepsText.value)
  if (ing.length === 0) errors.ingredients = 'Mindestens 1 Zutat angeben.'
  if (stp.length === 0) errors.steps = 'Mindestens 1 Schritt angeben.'

  return Object.keys(errors).length === 0
}

// Formular absenden → Daten an Spring-Backend schicken
async function handleSubmit() {
  submitError.value = ''
  saved.value = false

  if (!validate()) return

  submitting.value = true
  try {
    // Objekt so aufbereiten, wie es das Backend erwartet
    const recipe: Recipe = {
      ...form,
      ingredients: splitLines(ingredientsText.value),
      steps: splitLines(stepsText.value),
      tags: splitTags(tagsText.value)
    }

    const res = await fetch('http://localhost:8080/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    })

    if (!res.ok) {
      throw new Error('Backend hat einen Fehler zurückgegeben.')
    }

    saved.value = true
  } catch (e: unknown) {
    if (e instanceof Error) {
      submitError.value = e.message
    } else {
      submitError.value = String(e)
    }
  } finally {
    submitting.value = false
  }
}

// Formular leeren
function resetForm() {
  form.title = ''
  form.category = ''
  form.time = 1
  form.difficulty = 'easy'
  form.image = ''
  form.isVegan = false
  form.notes = ''
  form.ingredients = []
  form.steps = []
  form.tags = []

  ingredientsText.value = ''
  stepsText.value = ''
  tagsText.value = ''

  Object.keys(errors).forEach(k => delete errors[k])
  saved.value = false
  submitError.value = ''
}
</script>


<style scoped>
/* Kleine, gut lesbare Standard-Styles – ohne Abhängigkeit zu deiner Hauptseite */

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
.inline { display: inline-flex; align-items: center; gap: .5rem; margin-top: .3rem; }

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
.preview { margin-top: 1rem; }
pre {
  background: #0b1020;
  color: #e6f0ff;
  padding: .75rem;
  border-radius: .6rem;
  overflow: auto;
}

/* Responsiv: auf schmalen Screens die zwei Spalten untereinander */
@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; }
}
</style>
