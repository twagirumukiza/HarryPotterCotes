# ⚡ HarryPotterCotes

**Application de suivi de cote des mini-figurines Kinder Joy Harry Potter — automatique, sans connexion.**

Compatible **GitHub Pages**. Les utilisateurs n’ont **jamais** besoin de se connecter.

![Licence MIT](https://img.shields.io/badge/licence-MIT-green)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)
![Auto](https://img.shields.io/badge/cotes-automatiques-orange)

---

## ✨ Fonctionnalités

- **50 figurines & accessoires** (liste complète de ton site)
- **Cotes automatiques** chargées depuis `data/cotes.json`
- Mise à jour quotidienne via **GitHub Actions** (aucune intervention)
- Aucune inscription / connexion pour les visiteurs
- Bouton « Vérifier » → ouvre eBay / Vinted / Leboncoin
- Correction manuelle optionnelle (stockée localement)
- Filtres : Standard / Gold / Accessoires / Séries
- Mode clair / sombre
- Export JSON

---

## 🚀 Installation sur GitHub (3 minutes)

1. Crée un dépôt public `HarryPotterCotes`
2. Pousse le contenu de ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Initial commit – HarryPotterCotes auto"
   git branch -M main
   git remote add origin https://github.com/TON-USERNAME/HarryPotterCotes.git
   git push -u origin main
   ```
3. Active **GitHub Pages** : Settings → Pages → Source = `main` / `/ (root)`
4. (Optionnel) Active les Actions : Settings → Actions → Allow all actions

Ton app sera en ligne :
```
https://TON-USERNAME.github.io/HarryPotterCotes/
```

---

## 🔄 Mise à jour automatique des cotes

Un workflow GitHub Actions tourne **tous les jours à 6h UTC** et met à jour `data/cotes.json`.

Tu peux aussi le lancer manuellement :
- Onglet **Actions** → **Update Cotes Automatiques** → **Run workflow**

> Les visiteurs de ton site n’ont rien à faire : ils voient toujours la dernière cote disponible.

---

## 📂 Structure

```
HarryPotterCotes/
├── index.html
├── css/style.css
├── js/
│   ├── figures.js      # 50 items
│   └── app.js          # Logique auto
├── data/
│   └── cotes.json      # ← source de vérité (auto-update)
├── scripts/
│   └── update-cotes.js # Script exécuté par Actions
└── .github/workflows/
    └── update-cotes.yml
```

---

## 🪄 Comment ça marche pour l’utilisateur final

1. Ouvre le site → les **50 cotes s’affichent immédiatement**
2. Clique sur **🔍 Vérifier** si tu veux confirmer sur eBay/Vinted
3. (Optionnel) Clique sur **✏️ Corriger** pour forcer un prix personnel
4. C’est tout. Aucun compte, aucune connexion.

---

## 📜 Licence

MIT
