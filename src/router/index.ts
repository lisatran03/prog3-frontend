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
      // Wir verwenden HomeView als Container für die gesamte Liste
      name: 'home',
      component: HomeView
    },

    // 2. ERSTELLEN-ANSICHT
    {
      path: '/neu',
      name: 'rezepte-erstellen',
      component: RezepteErstellenView
    },

    // 3. DETAILANSICHT (DER ZWECK DER LETZTEN SCHRITTE)
    {
      // :id ist der Platzhalter für die ID (z.B. /recipe/123)
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: RecipeDetailView,
      // props: ID als Prop in RecipeDetailView ankommt
      props: true
    }
  ],
})

export default router
