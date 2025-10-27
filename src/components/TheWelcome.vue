<script setup lang="ts">
const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
const items = [
  {
    recipe: 'Oatmeal',
    category: 'breakfast',
  },
  {
    recipe: 'Salad',
    category: 'lunch',
  },
  {
    recipe: 'Steak and smashed potatoes',
    category: 'dinner',
  },
]
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>recipe</th>
        <th>category</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.recipe">
        <td>{{ item.recipe }}</td>
        <td>{{ item.category }}</td>
      </tr>
    </tbody>
  </table>
</template>
