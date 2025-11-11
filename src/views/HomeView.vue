<template>
  <main>
    <TheWelcome />
    <h2>Rezepte</h2>
    <ul>
      <li v-for="recipe in recipes" :key="recipe.name">
        {{ recipe.name }} - {{ recipe.type }}
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue';
import { ref, onMounted } from "vue";
import { getRecipes } from "../api";

interface Recipe {
  name: string;
  type: string;
  ingredients: string;
  instructions: string;
}

const recipes = ref<Recipe[]>([]);

onMounted(() => {
  getRecipes()
    .then(response => {
      recipes.value = response.data;
      console.log("Rezepte geladen:", recipes.value);
    })
    .catch(error => {
      console.error("Fehler beim Laden:", error);
    });
});
</script>

