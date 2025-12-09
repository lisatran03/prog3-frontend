import { createRouter, createWebHistory } from 'vue-router'

// ⭐ Rezept-Übersicht (zeigt alle Rezepte aus der DB)
import RecipeCard from '../components/RecipeCard.vue'

// ⭐ Seite zum Erstellen von Rezepten
import RezepteErstellenView from '../views/RezepteErstellen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'rezepte-liste',
      component: RecipeCard      // <-- wird angezeigt, wenn man die Seite öffnet
    },
    {
      path: '/neu',
      name: 'rezepte-erstellen',
      component: RezepteErstellenView
    }
  ],
})

export default router
