# DAL Dashboard - Guide de Style

## 🎨 Palette de Couleurs

### Couleurs Principales
```css
/* Couleurs Tezos */
--tezos-blue: #0F61FF
--tezos-blue-dark: #003EE0
--tezos-blue-light: #408DFF
--tezos-blue-lighter: #7CB3FF
--tezos-blue-lightest: #BEDFFF
--tezos-purple: #9F329F

/* Couleurs Neutres */
--stealth: #1D2227
--stealth-dark: #030405
--stealth-light: #4A4E52
--stealth-lighter: #787D82
--stealth-lightest: #9FA4A9

/* Couleurs Slate */
--slate: #616F82
--slate-dark: #263042
--slate-light: #818C9B
--slate-lighter: #9BA6B5
--slate-lightest: #B9C2CF

/* Couleurs Steel */
--steel: #838893
--steel-dark: #505561
--steel-light: #AEB1B9
--steel-lighter: #E3E4E5
--steel-lightest: #F6F8FA

/* Couleurs de Base */
--white: #FFFFFF
--black: #000000
```

### Couleurs Fonctionnelles
```css
/* États et Actions */
--success: #10b981 (vert)
--warning: #f59e0b (orange)
--error: #ef4444 (rouge)
--info: #3B82F6 (bleu)

/* Arrière-plans */
--bg-primary: #000000
--bg-secondary: #2a2d34
--bg-card: #23272f
--bg-gradient: linear-gradient(90deg, #0F61FF 0%, #9F329F 100%)
```

## 🎯 Typographie

### Hiérarchie des Titres
```css
/* Titre Principal */
h1 {
  font-size: 1.5rem; /* 24px */
  font-weight: 700;
  color: var(--white);
  text-align: center;
  margin-bottom: 2rem;
}

/* Titre Secondaire */
h2 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  color: var(--white);
  text-align: center;
  margin-bottom: 1rem;
}

/* Texte de Corps */
body {
  font-family: 'Open Sans', Arial, sans-serif;
  font-size: 1rem; /* 16px */
  color: var(--white);
  line-height: 1.5;
}

/* Texte Petit */
.text-sm {
  font-size: 0.875rem; /* 14px */
}

/* Texte Très Petit */
.text-xs {
  font-size: 0.75rem; /* 12px */
}
```

## 🧩 Composants

### Cartes (Cards)
```css
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--steel-dark);
  border-radius: 0.5rem; /* 8px */
  padding: 1.5rem; /* 24px */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  background-color: var(--stealth-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### Gauges (Indicateurs)
```css
/* Gauge Principal */
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  position: relative;
}

.gauge-svg {
  width: 120px;
  height: 90px;
}

/* Arc de Fond */
.gauge-background {
  fill: none;
  stroke: var(--bg-secondary);
  stroke-width: 8;
  stroke-linecap: round;
}

/* Arc de Progression */
.gauge-progress {
  fill: none;
  stroke: var(--info);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

/* Indicateur de Seuil */
.gauge-threshold {
  stroke: var(--white);
  stroke-width: 1.5;
  stroke-dasharray: 4, 3;
  opacity: 0.6;
}
```

### Boutons
```css
.btn-primary {
  background-color: var(--info);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--tezos-blue-dark);
}

.btn-secondary {
  background-color: transparent;
  color: var(--white);
  border: 1px solid var(--steel);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--steel);
  border-color: var(--steel-light);
}
```

### Tooltips
```css
.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-secondary);
  color: var(--white);
  padding: 1rem;
  border-radius: 0.25rem;
  width: 300px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 0.5rem;
  white-space: pre-line;
  line-height: 1.5;
  font-size: 14px;
}

.tooltip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--white);
  font-size: 11px;
  font-weight: bold;
  margin-left: 8px;
  cursor: help;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}
```

## 📱 Layout et Responsive Design

### Grille Flexbox
```css
/* Container Principal */
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: var(--bg-gradient);
}

/* Grille des Gauges */
.gauge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}

.gauge-item {
  width: 100%;
  flex: 1 1 300px;
  max-width: 400px;
}

/* Responsive Breakpoints */
@media (min-width: 640px) {
  .gauge-item {
    width: calc(50% - 1rem);
  }
}

@media (min-width: 1024px) {
  .gauge-item {
    width: calc(25% - 1.5rem);
  }
}
```

### Espacements
```css
/* Système d'Espacement */
.space-xs { margin: 0.25rem; }  /* 4px */
.space-sm { margin: 0.5rem; }   /* 8px */
.space-md { margin: 1rem; }     /* 16px */
.space-lg { margin: 1.5rem; }   /* 24px */
.space-xl { margin: 2rem; }     /* 32px */
.space-2xl { margin: 3rem; }    /* 48px */

/* Padding */
.p-xs { padding: 0.25rem; }
.p-sm { padding: 0.5rem; }
.p-md { padding: 1rem; }
.p-lg { padding: 1.5rem; }
.p-xl { padding: 2rem; }
```

## 🎭 États et Animations

### Animations CSS
```css
/* Animation Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions */
.transition-all {
  transition: all 0.2s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}
```

### États des Composants
```css
/* États de Chargement */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: var(--white);
  font-size: 1.5rem;
}

/* États d'Erreur */
.error {
  color: var(--error);
  text-align: center;
  padding: 1rem;
}

/* États de Succès */
.success {
  color: var(--success);
}

/* États Actifs/Inactifs */
.status-active {
  color: var(--success);
  animation: pulse 2s infinite;
}

.status-inactive {
  color: var(--steel);
  opacity: 0.5;
}
```

## 📊 Tableaux

### Style de Tableau
```css
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  color: var(--white);
}

.table th {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--steel-dark);
  font-weight: 600;
}

.table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--steel);
}

.table tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}
```

## 🎨 Classes Utilitaires Tailwind

### Couleurs Personnalisées
```css
/* Ajouter dans tailwind.config.js */
colors: {
  tezos: {
    blue: '#0F61FF',
    blueDark: '#003EE0',
    blueLight: '#408DFF',
    blueLighter: '#7CB3FF',
    blueLightest: '#BEDFFF',
    purple: '#9F329F',
  },
  stealth: {
    DEFAULT: '#1D2227',
    dark: '#030405',
    light: '#4A4E52',
    lighter: '#787D82',
    lightest: '#9FA4A9',
  },
  slate: {
    DEFAULT: '#616F82',
    dark: '#263042',
    light: '#818C9B',
    lighter: '#9BA6B5',
    lightest: '#B9C2CF',
  },
  steel: {
    DEFAULT: '#838893',
    dark: '#505561',
    light: '#AEB1B9',
    lighter: '#E3E4E5',
    lightest: '#F6F8FA',
  }
}
```

### Classes Utilitaires Recommandées
```css
/* Layout */
.flex-center { @apply flex items-center justify-center; }
.flex-col-center { @apply flex flex-col items-center; }
.grid-responsive { @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4; }

/* Espacement */
.section-padding { @apply px-4 py-8 sm:px-8 sm:py-16; }
.card-padding { @apply p-4 sm:p-6; }

/* Couleurs */
.text-primary { @apply text-white; }
.text-secondary { @apply text-steel-light; }
.bg-card { @apply bg-stealth; }
.bg-gradient { @apply bg-gradient-to-r from-tezos-blue to-tezos-purple; }

/* Bordures */
.border-card { @apply border border-steel-dark rounded-lg; }
.border-subtle { @apply border border-white/10; }
```

## 🚀 Bonnes Pratiques

### Structure des Composants
1. **Props Interface** : Définir clairement les types TypeScript
2. **Responsive First** : Commencer par mobile, puis desktop
3. **Accessibilité** : Utiliser des contrastes appropriés et des labels
4. **Performance** : Optimiser les animations et transitions

### Organisation des Fichiers
```
components/
  ├── ui/           # Composants de base réutilisables
  ├── layout/       # Composants de mise en page
  └── features/     # Composants spécifiques aux fonctionnalités

styles/
  ├── globals.css   # Styles globaux
  ├── components.css # Styles des composants
  └── utilities.css # Classes utilitaires
```

### Variables CSS Recommandées
```css
:root {
  /* Couleurs */
  --color-primary: #0F61FF;
  --color-secondary: #9F329F;
  --color-background: #000000;
  --color-surface: #1D2227;
  --color-text: #FFFFFF;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Bordures */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  
  /* Ombres */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

## 📝 Notes d'Utilisation

Ce guide de style peut être réutilisé pour d'autres projets en :
1. Copiant les variables CSS dans votre projet
2. Adaptant les couleurs selon votre marque
3. Réutilisant les patterns de composants
4. Gardant la même structure responsive
