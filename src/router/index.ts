// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'

// Korrigierte Imports (RecipeCard wird hier nicht als View gebraucht)
import HomeView from '../views/HomeView.vue'
import RecipeDetailView from '../views/RezeptDetail.vue'
import RezepteErstellenView from '../views/RezepteErstellen.vue' // Seite zum Erstellen von Rezepten

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. HAUPTANSICHT (STARTSEITE)
    {
      path: '/',
      name: 'home',
      component: HomeView
    },

    // 2. ERSTELLEN-ANSICHT
    {
      path: '/neu/:id?',
      name: 'rezepte-erstellen',
      component: RezepteErstellenView,
      props: true
    },

    // 3. DETAILANSICHT
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: RecipeDetailView,
      props: true
    },
    // 4. BEARBEITEN-ANSICHT
    {
      path: '/neu/:id?',
      name: 'rezepte-bearbeiten',
      component: RezepteErstellenView,
      props: true
    }
  ],
})

export default router
