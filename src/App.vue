<template>
  <!--
    WRAPPER der gesamten App. Wir stylen alles in main.css
    bewusst unter dem Namensraum ".app", damit nichts ausläuft.
  -->
  <div class="app">

    <!--
      FESTER SEITEN-BUTTON (rechts außen):
      - führt später zu einer Seite/Route "/neu" (Platzhalter)
      - bleibt am Rand sichtbar, unabhängig vom Scrollen
    -->
    <a href="/neu" class="side-cta" aria-label="Neue Rezepte hinzufügen">
      <span>＋ Neue Rezepte</span>
    </a>

    <!--
      HERO-BEREICH (bunt, aber kompakt):
      - oben mit Titel & kurzer Beschreibung
      - darunter die Such-/Filterzeile (Suche + Dropdown)
      - am unteren Rand eine SVG-Welle als visueller Abschluss
    -->
    <header class="hero">
      <div class="container hero__inner">
        <!-- Titelbereich -->
        <div class="branding">
          <h1>Digitales Kochbuch</h1>
          <p>Finde leckere Ideen und stöbere durch Kategorien.</p>
        </div>

        <!-- Such- und Filterzeile (2 Spalten: Suche | Kategorie) -->
        <div class="search-panel">
          <!-- SUCHFELD: links, flexibel breit -->
          <div class="field">
            <label for="q">Suche</label>
            <input id="q" type="search" class="input" placeholder="Suche nach Titel, Zutat oder Tag" />
          </div>

          <!-- DROPDOWN: rechts, fixe Breite -->
          <div class="field">
            <label for="course">Kategorie</label>
            <select id="course" class="select">
              <option value="">Alle Kategorien</option>
              <option>Vorspeisen</option>
              <option>Hauptgerichte</option>
              <option>Desserts</option>
              <option>Vegan</option>
              <option>Vegetarisch</option>
              <option>Glutenfrei</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Wellen-SVG (rein dekorativ) -->
      <svg class="hero__wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,48L60,48C120,48,240,48,360,44C480,40,600,32,720,44C840,56,960,78,1080,78C1200,78,1320,56,1380,44L1440,32V80H0Z"></path>
      </svg>
    </header>

    <router-view />


    <!--
      HAUPT-INHALT: direkt unter dem Hero (kleiner negativer Rand in CSS)
      - ein responsives Grid aus Rezeptkarten


      DETAIL-DIALOG (Pop-up):
      - Struktur steht, Logik (Öffnen/Schließen + Inhalte setzen) folgt später
    -->
    <dialog id="recipe-dialog" class="dialog" aria-labelledby="dialog-title" aria-modal="true">
      <form method="dialog">
        <header class="dialog__header">
          <h3 id="dialog-title" class="dialog__title">Rezepttitel</h3>
        </header>
        <div class="dialog__body">
          <div class="two-col">
            <figure class="figure">
              <img src="" alt="" class="figure__img" />
              <figcaption class="meta">
                <span class="badge">Zeit: –</span>
                <span class="badge">Level: –</span>
                <span class="badge">Kategorie: –</span>
              </figcaption>
            </figure>
            <div>
              <h4>Zutaten</h4>
              <ul class="list"></ul>

              <h4>Schritte</h4>
              <ol class="list"></ol>
            </div>
          </div>
        </div>
        <footer class="dialog__footer">
          <button class="btn btn-ghost" value="cancel" type="submit">Schließen</button>
        </footer>
      </form>
    </dialog>
  </div>
</template>
