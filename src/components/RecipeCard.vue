<template>
  <section class="cards">
    <article class="card" v-for="r in recipes" :key="r.id">
      <div class="card__media-wrap">
        <img
          v-if="r.imageUrl"
          class="card__media"
          :src="r.imageUrl"
          :alt="r.name"
        />
        <div v-else class="card__media placeholder">Kein Bild</div>

        <span class="pill" :class="pillClass(r)">{{ r.category }}</span>
      </div>

      <div class="card__body">
        <h3 class="card__title">{{ r.name }}</h3>
        <p class="card__meta">
          <span v-if="r.time">{{ r.time }} min</span>
          <span v-if="r.time && r.difficulty"> • </span>
          <span v-if="r.difficulty">{{ r.difficulty }}</span>
        </p>

        <button class="btn btn-ghost" type="button" @click="$emit('open', r)">
          Ansehen
        </button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
type RecipeCard = {
  id: number
  name: string
  category: string
  ingredients: string[]
  instructions: string
  imageUrl?: string
  time?: number
  difficulty?: string
}

defineProps<{ recipes: RecipeCard[] }>()

defineEmits<{
  (e: 'open', payload: RecipeCard): void
}>()

function pillClass(r: RecipeCard) {
  const c = (r.category || '').toLowerCase()
  return {
    'pill--starter': c.includes('vorspeis'),
    'pill--main': c.includes('haupt'),
    'pill--dessert': c.includes('dessert'),
    'pill--vegetarian': c.includes('vegetar')
  }
}
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #49ad71;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
}
.card__media-wrap { position: relative; }
.card__media { width: 100%; height: 140px; object-fit: cover; display: block; background: #ffffff; }
.placeholder { display:flex; align-items:center; justify-content:center; color:#6b7280; font-size:.9rem; }
.pill { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 999px; color: #ffffff; font-size:0.75rem; font-weight:700; }
.pill--starter { background: #d6712a; }
.pill--main { background:#2563eb; }
.pill--dessert { background:#db2777; }
.pill--vegetarian { background: #42e2e8; }
.card__body { padding: 0.9rem; display:flex; flex-direction:column; gap:0.5rem; }
.card__title { margin:0; font-size:1rem; }
.card__meta { color: #ffffff; font-size:0.875rem; margin:0; }
.btn { align-self:flex-start; padding:0.45rem 0.7rem; border: 1px solid #49ad71; background: transparent; border-radius: 10px; cursor:pointer; color:#374151; }
.btn:hover { border-color:#7c3aed; }
</style>
