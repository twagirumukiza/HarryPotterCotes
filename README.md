# ⚡ HarryPotterCotes

**Application dédiée au suivi de la cote (prix de marché) des mini-figurines Kinder Joy Harry Potter Quidditch.**

Compatible **GitHub Pages** – aucune installation serveur nécessaire.

![Licence MIT](https://img.shields.io/badge/licence-MIT-green)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)

---

## ✨ Fonctionnalités

- Liste complète des 14 figurines principales (codes VT / VD)
- Recherche instantanée + filtres (Standard / Gold)
- Bouton **« Chercher »** → ouvre automatiquement eBay (ventes terminées), Vinted et Leboncoin
- Saisie manuelle des prix observés → calcul de la **médiane**
- Stockage local (persistant dans le navigateur)
- Export JSON des cotes
- Mode clair / sombre
- Design inspiré de l’univers Harry Potter

---

## 🚀 Installation sur GitHub (3 minutes)

### 1. Créer le dépôt

```bash
# Sur ta machine
git clone https://github.com/TON-USERNAME/HarryPotterCotes.git
# ou crée un nouveau repo vide sur GitHub puis :
```

1. Va sur [github.com/new](https://github.com/new)
2. Nomme le dépôt `HarryPotterCotes` (ou ce que tu veux)
3. Laisse-le **public**
4. Ne coche **pas** “Add a README”

### 2. Pousser le code

```bash
cd HarryPotterCotes          # le dossier que tu as téléchargé
git init
git add .
git commit -m "Initial commit – HarryPotterCotes"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/HarryPotterCotes.git
git push -u origin main
```

### 3. Activer GitHub Pages

1. Dans ton dépôt → **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : `main` / folder : `/ (root)`
4. Clique sur **Save**

Après 1-2 minutes ton application sera en ligne :

```
https://TON-USERNAME.github.io/HarryPotterCotes/
```

---

## 📂 Structure du projet

```
HarryPotterCotes/
├── index.html              # Page principale
├── css/
│   └── style.css           # Styles (clair + sombre)
├── js/
│   ├── figures.js          # Liste des 14 figurines + codes
│   └── app.js              # Logique (recherche, saisie, stockage)
├── data/
│   └── cotes.example.json  # Exemple de fichier de cotes
└── README.md
```

---

## 🪄 Utilisation

1. Clique sur **🔍 Chercher** d’une figurine  
   → 3 onglets s’ouvrent (eBay sold, Vinted, Leboncoin)
2. Note les prix que tu vois
3. Clique sur **✏️ Saisir** et entre 1 à 5 prix
4. L’application calcule automatiquement la **médiane**
5. Les cotes restent sauvegardées dans ton navigateur
6. Tu peux **exporter** le fichier JSON à tout moment

---

## 🔄 Mettre à jour les figurines

Édite simplement `js/figures.js` :

```js
{
  id: "15",
  name: "Nouvelle figurine",
  code: "VT999",
  rarity: "standard",   // ou "gold"
  searchTerms: ["terme1", "terme2"]
}
```

Puis commit + push.

---

## 🛠️ Améliorations possibles (optionnel)

- GitHub Action qui scrape eBay tous les jours et met à jour un `data/cotes.json`
- Import d’un fichier JSON de cotes
- Graphiques d’historique (Chart.js)
- Mode “collection” (cocher ce que tu possèdes)

---

## 📜 Licence

MIT – libre d’utilisation, modification et redistribution.

---

Fait avec ⚡ pour les collectionneurs de la série **Kinder Joy × Harry Potter Quidditch**.
