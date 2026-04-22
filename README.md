# ⚓ Eaux Inexplorees — Tableau de Bord

Tableau de bord gamifié maritime pour le challenge marketing de l'équipe.  
Construit avec **Next.js 14**, **TypeScript**, **Tailwind CSS** et des données Google Sheets en temps réel.

---

## Lancer en local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

> **Note :** Les données sont lues depuis Google Sheets (publiés en accès public).  
> Si les feuilles ne sont pas accessibles, l'app utilise automatiquement les données mock.

---

## Mettre à jour les données (Google Sheet)

Toutes les données viennent du Google Sheet partagé. Chaque onglet correspond à une section :

| Onglet Sheet | Ce que ça contrôle |
|---|---|
| `Config Équipage` | Noms, rôles, niveaux, XP, périmètre |
| `Îles` | Positions, récompenses, thèmes, défis |
| `Quêtes` | Quêtes actives, progression, responsables |
| `Dashboard` | Île en cours, semaine, date de marée |
| `Scores` | Ressources cumulées (Vent, Or, Bois, Boussole) |
| `KPIs` | Indicateurs de performance |
| `Journal` | Entrées du journal de bord |
| `Badges` | Badges débloqués ou verrouillés |
| `Modules` | Activer/masquer des panneaux du dashboard |
| `Événements` | Événements en mer (tempêtes, découvertes…) |

Après modification du Sheet, l'app se met à jour **automatiquement dans les 60 secondes** (revalidation ISR).

---

## Changer les images

Les images sont dans `/public/images/` :

| Fichier | Utilisation |
|---|---|
| `map-state-1-depart.jpg` | Carte principale (Vue Carte) |
| `ship-crew.jpg` | Photo de l'équipage (page Équipage) |

Pour remplacer une image :
1. Nommer le nouveau fichier exactement pareil (ex. `map-state-1-depart.jpg`)
2. Le déposer dans `/public/images/`
3. L'app l'affiche immédiatement (pas besoin de redéployer si déjà en prod — mais un redéploiement est recommandé)

> Pour changer l'image de carte quand l'équipage avance vers une nouvelle île, remplacez `map-state-1-depart.jpg` par la version mise à jour.

---

## Structure du projet

```
app/
  page.tsx          → Page principale (Vue Carte)
  equipage/         → Page équipage détaillée
  ile/[id]/         → Page de chaque île
  layout.tsx        → Layout global (fonts, metadata)
  globals.css       → Styles et animations

components/
  Header.tsx        → En-tête avec semaine et navigation
  MapView.tsx       → Carte interactive avec hotspots
  ResourcePanel.tsx → Barres de ressources
  ShipPanel.tsx     → Panneau navire + équipage
  QuestPanel.tsx    → Quêtes actives
  JournalPanel.tsx  → Journal de bord
  Countdown.tsx     → Compte à rebours Jour de Marée
  ...

lib/
  config.ts         → URLs Google Sheets, constantes
  sheet.ts          → Lecture des données (CSV → HTML → Mock)
  types.ts          → Types TypeScript
  htmlParser.ts     → Parser HTML de secours
```

---

## Déployer sur Vercel

### Première fois

1. Pousser le code sur GitHub (voir section ci-dessous)
2. Aller sur [vercel.com](https://vercel.com) → "Add New Project"
3. Importer le repo GitHub `aviilex6-swapn/eaux-inexplorees`
4. Paramètres (déjà détectés automatiquement) :
   - **Framework** : Next.js
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
5. Cliquer "Deploy" — le premier déploiement prend ~2 min

### Mises à jour suivantes

```bash
git add .
git commit -m "Description de la mise à jour"
git push
```

Vercel redéploie automatiquement à chaque push sur `main`.

### Vérifier que le déploiement a réussi

1. Dans le dashboard Vercel, vérifier que le build est "✓ Ready"
2. Cliquer sur l'URL de déploiement (ex. `eaux-inexplorees.vercel.app`)
3. Vérifier `/api/test-sheet` pour voir si les Google Sheets répondent
4. Vérifier `/debug` pour inspecter toutes les données chargées

---

## Variables d'environnement

Aucune variable d'environnement n'est requise pour fonctionner.  
Les URLs Google Sheets sont dans `lib/config.ts`.

---

## Technologies

- [Next.js 14](https://nextjs.org/) — App Router, ISR, Server Components
- [Tailwind CSS](https://tailwindcss.com/) — Styles utilitaires
- [PapaParse](https://www.papaparse.com/) — Lecture CSV
- [Vercel](https://vercel.com/) — Hébergement et déploiement
