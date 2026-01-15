
<template>
  <div class="app">
    <div class="theme-switch">
      <label class="switch">
        <input type="checkbox"
               :checked="isDarkMode"
               @change="toggleTheme">
        <span class="slider"></span>
      </label>
    </div>

    <a href="/neu" class="side-cta">
      ＋ Neue Rezepte
    </a>
    <router-view />
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      isDarkMode: false
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      // Theme direkt auf dem root-Element setzen
      document.documentElement.setAttribute(
        'data-theme',
        this.isDarkMode ? 'dark' : 'light'
      );
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme');

    const themeToApply = savedTheme ?? 'light'; // <-- default light

    this.isDarkMode = themeToApply === 'dark';
    document.documentElement.setAttribute('data-theme', themeToApply);
  }
}
</script>
