# Setup ConformIA — étapes pour démarrer

## 1. Créer le projet Supabase (à faire par Adem)

1. Aller sur [supabase.com](https://supabase.com) → **New project**.
2. Choisir une organisation, un nom (`conformia`), un mot de passe de base de
   données (le noter), et une **région UE** (ex. `West EU (Paris)` / `Frankfurt`)
   — important pour l'hébergement des données de PME françaises.
3. Attendre ~2 min que le projet soit provisionné.

## 2. Récupérer les clés

Dans le projet Supabase → **Project Settings → API** :

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ garder secrète)

Copier `.env.local.example` en `.env.local` et coller les trois valeurs.

```bash
cp .env.local.example .env.local
```

## 3. Appliquer le schéma de base de données

Deux options :

**Option A — via l'éditeur SQL (le plus simple pour démarrer)**
Ouvrir **SQL Editor** dans Supabase, coller le contenu de
`supabase/migrations/0001_initial_schema.sql`, puis **Run**.

**Option B — via la CLI Supabase (recommandé à terme)**

```bash
npx supabase login
npx supabase link --project-ref <ref-du-projet>
npx supabase db push
```

## 4. Configurer l'authentification

Dans Supabase → **Authentication → Providers** : garder **Email** activé.
Pour le développement, **Authentication → Sign In / Providers → Email** →
désactiver « Confirm email » (sinon il faut cliquer un lien à chaque signup en local).
À réactiver avant la mise en production.

## 5. Lancer l'app

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

Une fois ces étapes faites et `.env.local` rempli, préviens Claude Code : on
enchaîne sur l'**authentification** (signup dirigeant → création société → login),
étape 4 de la feuille de route.
