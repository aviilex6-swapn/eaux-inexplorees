# 🗺️ Guide du Capitaine — Eaux Inexplorees

> **Ce guide est pour Nils.** Pas besoin de toucher au code. Tout se fait depuis le Google Sheet.

---

## Le principe en 30 secondes

L'app lit le Google Sheet toutes les 60 secondes.  
Tu mets à jour le Sheet → l'app se met à jour automatiquement.  
C'est tout.

---

## Le lundi matin — mise à jour hebdomadaire

Voici ce que tu fais chaque lundi (dans l'ordre) :

### 1. Mettre à jour la semaine et l'île en cours

Ouvre l'onglet **Dashboard** du Sheet.

Cherche les lignes avec ces clés et modifie la colonne `valeur` :

| Clé | Ce que tu changes |
|---|---|
| `semaine` | Le numéro de la semaine (ex. 7) |
| `ile_en_cours_id` | L'identifiant de l'île actuelle (ex. `ile-tempete`) |
| `ile_en_cours_nom` | Le nom complet de l'île |
| `ile_en_cours_emoji` | L'emoji de l'île (ex. ⚡) |
| `score_actuel` | Le score total de l'équipage cette semaine |
| `seuil_passage` | Le score à atteindre pour passer à l'île suivante |
| `date_maree` | La date du prochain "Jour de Marée" au format `AAAA-MM-JJ` (ex. `2026-05-04`) |

### 2. Mettre à jour les scores de ressources

Ouvre l'onglet **Scores**.

Modifie les valeurs de `vent`, `or`, `bois`, `boussole` selon ce que l'équipage a gagné cette semaine.

### 3. Mettre à jour les quêtes

Ouvre l'onglet **Quêtes**.

Pour chaque quête :
- `statut` : mets `active`, `accomplie` ou `echouee`
- `valeur_actuelle` : la progression actuelle (ex. 11 si 11 posts publiés sur 15)
- `valeur_max` : l'objectif total (ex. 15)

### 4. Ajouter une entrée au journal

Ouvre l'onglet **Journal**.

Ajoute une nouvelle ligne en haut avec :
- `date` : la date du jour (format `AAAA-MM-JJ`)
- `auteur` : ton prénom
- `contenu` : ton message, 1-2 phrases max
- `visible` : `true`

Le journal n'affiche que les 5 dernières entrées visibles.

### 5. Mettre à jour les XP de l'équipage (facultatif)

Ouvre l'onglet **Config Équipage**.

Pour chaque membre, tu peux modifier :
- `xp` : les points d'expérience accumulés
- `niveau` : le niveau actuel

---

## Changer la carte quand l'équipage avance vers une nouvelle île

Quand l'équipage conclut une île et passe à la suivante, tu veux afficher une nouvelle version de la carte.

**Étapes :**
1. Prépare ta nouvelle image de carte (format JPG, idéalement 1200×800px)
2. Nomme le fichier `map-state-1-depart.jpg` (ou le nom qui correspond à l'île actuelle — tu peux en créer plusieurs)
3. Remplace le fichier dans le dossier `/public/images/` sur ton ordi
4. Fais un `git push` pour mettre à jour sur Vercel

> **Note pour plus tard :** On peut prévoir plusieurs fichiers de carte et changer automatiquement en fonction de l'île en cours. Dis-le à ton développeur.

---

## Activer ou masquer un panneau du dashboard

Tu contrôles la visibilité de chaque panneau depuis l'onglet **Modules** du Sheet.

| Module | Ce qu'il affiche |
|---|---|
| Quêtes | Le panneau des quêtes actives |
| Journal de bord | Les dernières entrées du journal |
| Événements en mer | L'événement actuel (tempête, découverte...) |
| Badges | Les badges débloqués |
| Ressources | Les barres de ressources (Vent, Or, Bois, Boussole) |

Pour masquer un panneau : mets `false` dans la colonne `visible`.  
Pour le réafficher : mets `true`.

L'app se met à jour dans la minute.

---

## Débloquer un badge

Ouvre l'onglet **Badges**.

Pour le badge à débloquer :
- Mets `true` dans la colonne `debloque`
- Ajoute la date dans `date_deblocage` (format `AAAA-MM-JJ`)

Le badge apparaît sur la page Équipage dans la section "Badges débloqués".

---

## Ajouter un événement en mer

Ouvre l'onglet **Événements**.

Ajoute une nouvelle ligne avec :
- `titre` : ex. "Vent Favorable"
- `description` : 1-2 phrases de description narrative
- `type` : un des types suivants — `tempete`, `decouverte`, `commerce`, `danger`, `bonus`
- `date_debut` : la date de début (format `AAAA-MM-JJ`)
- `date_fin` : laisser vide si l'événement est encore actif
- `actif` : `true`

Pour terminer un événement : mets la date dans `date_fin` et `actif` à `false`.

---

## L'app ne se met pas à jour — que faire ?

### Étape 1 — Attendre 60 secondes

L'app se revalide toutes les 60 secondes. Si tu viens de modifier le Sheet, patiente un peu.

### Étape 2 — Vérifier la connexion au Sheet

Va sur l'URL de ton app en ajoutant `/api/test-sheet` à la fin :  
→ `https://ton-app.vercel.app/api/test-sheet`

Tu verras pour chaque onglet si la connexion fonctionne (CSV ✓, HTML ✓, ou MOCK ⚠️).

- **CSV ✓ ou HTML ✓** = les données sont lues depuis le vrai Sheet
- **MOCK ⚠️** = le Sheet n'est pas accessible, l'app affiche les données de secours

### Étape 3 — Vérifier que le Sheet est bien publié

Dans Google Sheets :  
`Fichier → Partager → Publier sur le Web → vérifier que chaque onglet est publié`

### Étape 4 — Forcer un redéploiement Vercel

Si tout le reste échoue, un nouveau déploiement vide le cache :  
1. Va sur [vercel.com](https://vercel.com) → ton projet → "Deployments"
2. Clique sur les "..." du dernier déploiement → "Redeploy"

### Étape 5 — Appelle ton développeur 😅

Si rien ne marche, le problème est probablement côté Google Workspace (restriction admin sur la publication externe). Un admin Google doit autoriser la publication des Sheets en dehors de l'organisation.

---

## Les identifiants des îles

Pour remplir `ile_en_cours_id` dans le Dashboard, utilise exactement ces valeurs :

| Île | ID à utiliser |
|---|---|
| Port de l'Éveil | `ile-depart` |
| Île des Brumes | `ile-brume` |
| Cap de la Tempête | `ile-tempete` |
| Île du Trésor | `ile-tresor` |
| Récif des Sirènes | `ile-sirenes` |
| L'Île de l'Horizon | `ile-horizon` |

---

## Accès rapide

| Lien | Utilisation |
|---|---|
| `/` | Vue Carte principale |
| `/equipage` | Page équipage détaillée |
| `/ile/ile-tempete` | Page d'une île spécifique |
| `/debug` | Voir toutes les données chargées |
| `/api/test-sheet` | Diagnostic Google Sheets |

---

*Bonne navigation, Capitaine. Les mers vous appartiennent. ⚓*
