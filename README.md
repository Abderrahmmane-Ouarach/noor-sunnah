# نور السنة — Noor Al Sunnah

> **Encyclopédie web des Hadiths Prophétiques**  
> Application fullstack déployée sur Railway, alimentée par une API REST hébergée sur AWS EC2.

🌐 **Live** : [noor-al-sunnah-production.up.railway.app](https://noor-al-sunnah-production.up.railway.app)

---

## 📌 Description

**Noor Al Sunnah** est une application web qui permet de consulter, rechercher et sauvegarder des hadiths prophétiques authentifiés, classés par thème, narrateur et degré d'authenticité.

Les données proviennent de l'API open-source **dorar-hadith-api** qui s'interface avec la base [Dorar Al-Saniyya](https://dorar.net) — l'une des plus grandes encyclopédies islamiques en ligne.

---

## 🏗️ Architecture

```
Utilisateur (navigateur)
        │  HTTPS
        ▼
┌───────────────────┐
│     Railway       │  ← Application web (frontend + backend léger)
│  (noor-al-sunnah) │    Déployée automatiquement depuis GitHub
└────────┬──────────┘
         │  REST API / JSON
         ▼
┌───────────────────┐
│    AWS EC2        │  ← Instance t2.micro (Ubuntu)
│ dorar-hadith-api  │    API Node.js exposée sur le port 3000
└────────┬──────────┘
         │  scraping interne
         ▼
┌───────────────────┐
│  Dorar Al-Saniyya │  ← Source de données (hadiths arabes)
│   (dorar.net)     │
└───────────────────┘
```

---

## ⚙️ L'API : `dorar-hadith-api`

**Repo** : [github.com/AhmedElTabarani/dorar-hadith-api](https://github.com/AhmedElTabarani/dorar-hadith-api)

API intermédiaire (Node.js) développée par Ahmed El Tabarani. Elle expose les données de Dorar Al-Saniyya via des endpoints REST clairs.

### Endpoints principaux utilisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/v1/api/hadith/search?value={terme}` | Recherche de hadiths par mot-clé |
| `GET` | `/v1/api/hadith/search?value={terme}&d[]=1` | Filtrer par grade (sahih=1, hasan=2, da'if=3) |
| `GET` | `/v1/api/hadith/search?value={terme}&m[]=261` | Filtrer par narrateur (261 = Imam Muslim) |
| `GET` | `/v1/api/hadith/search?value={terme}&s[]=6216` | Filtrer par livre source (6216 = Sahih Bukhari) |

### Exemple de réponse JSON

```json
{
  "status": "success",
  "metadata": {
    "numberOfHadith": 10,
    "totalOfHadith": 142,
    "page": 1,
    "numberOfPages": 15
  },
  "data": [
    {
      "hadith": "نص الحديث...",
      "rawi": "عبدالله بن عمر",
      "mohdith": "مسلم",
      "book": "صحيح مسلم",
      "numberOrPage": "2850",
      "grade": "صحيح",
      "explanation": "..."
    }
  ]
}
```

---

## ☁️ Déploiement

### 1. API sur AWS EC2

```bash
# Se connecter à l'instance
ssh -i key.pem ubuntu@<EC2-PUBLIC-IP>

# Cloner l'API
git clone https://github.com/AhmedElTabarani/dorar-hadith-api.git
cd dorar-hadith-api
npm install

# Lancer avec PM2 (process manager)
npm install -g pm2
pm2 start index.js --name dorar-api
pm2 save && pm2 startup
```

> L'API tourne en continu sur le port `3000`. Le Security Group EC2 autorise le trafic entrant sur ce port.

### 2. Application sur Railway

```bash
# Depuis le dashboard Railway :
# 1. New Project → Deploy from GitHub repo
# 2. Ajouter la variable d'environnement :
DORAR_API_URL=http://<EC2-PUBLIC-IP>:3000

# Railway détecte automatiquement le framework et déploie
```

> Chaque `git push` sur `main` déclenche un redéploiement automatique sur Railway.

---

## 🗂️ Structure du projet

```
noor-al-sunnah/
├── src/
│   ├── components/       # Composants UI (HadithCard, TopicBar, ...)
│   ├── pages/            # Pages principales
│   └── services/
│       └── api.js        # Appels vers l'API EC2
├── public/
├── .env.example          # Variables d'environnement requises
├── package.json
└── README.md
```

---

## 🔑 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DORAR_API_URL` | URL de l'API hébergée sur EC2 | `http://12.34.56.78:3000` |
| `PORT` | Port de l'application | `8080` |

---

## ✨ Fonctionnalités

- 📖 **Hadith du jour** — affiché aléatoirement à chaque visite
- 🔍 **Recherche** par mot-clé avec filtres (grade, narrateur, source)
- 🏷️ **Navigation par thème** (Prière, Jeûne, Miséricorde, Honnêteté...)
- ❤️ **Mémorisation** — sauvegarder ses hadiths favoris
- 🌙 **Mode sombre** natif

---

## 📄 Licence

Ce projet utilise l'API [dorar-hadith-api](https://github.com/AhmedElTabarani/dorar-hadith-api) sous licence open-source.  
Les textes de hadiths appartiennent au domaine public islamique.

---

*Projet académique — Mars 2026*
