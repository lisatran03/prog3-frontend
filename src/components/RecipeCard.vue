<template>
  <section class="cards">
    <article class="card" v-for="r in recipes" :key="r.id">
      <div class="card__media-wrap">
        <img class="card__media" :src="r.image" :alt="r.title" @click="$emit('open', r)" />
        <span class="pill" :class="pillClass(r)">{{ r.category }}</span>
      </div>

      <div class="card__body">
        <h3 class="card__title">{{ r.title }}</h3>
        <p class="card__meta"><span>{{ r.time }}</span> • <span>{{ r.level }}</span></p>
        <button class="btn btn-ghost" @click="$emit('open', r)" aria-haspopup="dialog">Ansehen</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Recipe } from '../data/recipes'

const props = defineProps<{ recipes: Recipe[] }>()
const emit = defineEmits<(e: 'open', payload: Recipe) => void>()

function pillClass(r: Recipe) {
  return {
    'pill--starter': r.category === 'Vorspeise',
    'pill--main': r.category === 'Hauptgericht',
    'pill--dessert': r.category === 'Dessert',
    'pill--vegan': r.category === 'Vegan'
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
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
}
.card__media-wrap { position: relative; cursor: pointer; }
.card__media { width: 100%; height: 140px; object-fit: cover; display: block; }
.pill { position: absolute; top: 8px; left: 8px; padding: 4px 8px; border-radius: 999px; color:#fff; font-size:0.75rem; }
.pill--starter { background:#f97316; }
.pill--main { background:#2563eb; }
.pill--dessert { background:#db2777; }
.pill--vegan { background:#16a34a; }
.card__body { padding: 0.75rem; display:flex; flex-direction:column; gap:0.5rem; }
.card__title { margin:0; font-size:1rem; }
.card__meta { color:#6b7280; font-size:0.875rem; }
.btn { align-self:flex-start; padding:0.4rem 0.6rem; border: none; background: transparent; cursor:pointer; color:#374151; }
</style>
