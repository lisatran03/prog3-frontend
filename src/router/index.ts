import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RezepteErstellenView from '../views/RezepteErstellen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/neu', name: 'rezepte-erstellen', component: RezepteErstellenView, },
  ],
})

export default router
